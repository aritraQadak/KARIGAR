from app.services.synthetic_media_service import SyntheticAnalysis
from app.services.video_service import SequentialVideoCapture
"""Shared sampled analysis for an explicitly heuristic evidence report."""
from contextlib import ExitStack
from dataclasses import asdict, replace
from time import perf_counter

from fastapi import HTTPException, UploadFile

from app.schemas.craft import CraftVerificationResponse
from app.services.listing_completeness_service import listing_completeness
from app.services.product_video_service import analyze_product_video
from app.services.hand_detection_service import detect_hands, HandLoadingError, HandInferenceError
from app.services.hand_evidence_service import summarize_hands
from app.services.trust_score_service import TrustInputs, calculate_trust
from app.services.image_verification import validated_image
from app.services.video_service import (
    validated_video, sample_frame_indices, sampled_frames, analysis_frame,
    frame_embedding, temporal_metrics, DEFAULT_LIMITS,
)
from app.services.video_product_match_service import final_frame_indices, compare_product_embeddings
from app.services.embedding_service import embed_image
from app.services.object_detection_service import detect_objects, DetectionInferenceError
from app.services.process_evidence_service import summarize_detections
from app.services.similarity_service import SimilarityComputationError
from app.services.evidence_scoring_service import (
    DEFAULT_WEIGHTS, clamp_score, temporal_change_score, weighted_evidence, interpret_evidence,
)


def analyze_craft(video: UploadFile | None, product_image: UploadFile | None, product_video: UploadFile | None = None, listing_metadata: dict | None = None) -> CraftVerificationResponse:
    started = perf_counter()
    if video is None and product_image is None and product_video is None:
        raise HTTPException(422, "Provide at least one product_image, product_video, or process video.")
    inputs = TrustInputs(listing_report=listing_completeness(listing_metadata))
    payload = {"technical_signals": {}, "models": {"visual_model": "facebook/dinov2-small", "detector": None}}
    product = None
    image_metadata = None
    with ExitStack() as stack:
        if product_image is not None:
            try:
                image_metadata, image = stack.enter_context(validated_image(product_image))
            except HTTPException as exc:
                raise HTTPException(exc.status_code, f"product_image: {exc.detail}") from None
        if video is not None:
            try:
                capture, metadata = stack.enter_context(validated_video(video))
            except HTTPException as exc:
                raise HTTPException(exc.status_code, f"video: {exc.detail}") from None
        if image_metadata is not None:
            product = embed_image(image)
            inputs = replace(inputs, photo_decoded=True, photo_embedded=True)
            payload["product_image"] = {key: image_metadata[key] for key in ("filename", "width", "height")}
            payload["models"]["visual_model"] = product.model
            payload["inference_device"] = product.inference_device
        if video is not None:
            representative = sample_frame_indices(metadata.total_frames, DEFAULT_LIMITS.sampled_frames)
            final = final_frame_indices(metadata.total_frames) if product is not None else []
            model_indices = sorted(set(representative) | set(final))
            forensic = SyntheticAnalysis(metadata, representative, video.filename, isinstance(capture, SequentialVideoCapture))
            indices = sorted(set(model_indices) | set(forensic.indices))
            embeddings, detections, hand_results = {}, {}, {}
            hand_error = None
            visual = product
            for index, raw_frame in zip(indices, sampled_frames(capture, indices)):
                frame = analysis_frame(raw_frame)
                forensic.observe(index, frame)
                if index not in model_indices:
                    continue
                embedding = frame_embedding(frame, DEFAULT_LIMITS)
                visual = visual or embedding
                if embedding.model != visual.model or embedding.inference_device != visual.inference_device:
                    raise SimilarityComputationError("Inconsistent visual embeddings.")
                embeddings[index] = embedding
                if index in representative:
                    detections[index] = detect_objects(frame)
                    if hand_error is None:
                        try:
                            hand_results[index] = detect_hands(frame)
                        except (HandLoadingError, HandInferenceError) as exc:
                            hand_error = str(exc)
                            hand_results.clear()
            if len(embeddings) != len(model_indices):
                raise SimilarityComputationError("Sampled analysis did not complete.")
            payload["synthetic_media_risk"] = forensic.finish(embeddings, hand_results if hand_error is None else None,
                visual.inference_device)
            detector = detections[representative[0]]
            if any(d.detector != detector.detector or d.inference_device != visual.inference_device for d in detections.values()):
                raise DetectionInferenceError("Inconsistent detector device or model.")
            temporal = temporal_metrics([embeddings[i] for i in representative])
            person, _, _ = summarize_detections([i / metadata.fps for i in representative], [detections[i] for i in representative])
            hands, hand_frames = None, None
            if hand_error is None:
                hands, hand_frames = summarize_hands([i / metadata.fps for i in representative], [hand_results[i] for i in representative])
            inputs = replace(inputs, process_analyzed=True, hand_presence_ratio=hands.hand_presence_ratio if hands else None,
                frames_with_hands=hands.frames_with_hands if hands else 0, average_visual_change=temporal.average_visual_change,
                frames_analyzed=len(representative), duration_seconds=metadata.duration_seconds,
                person_presence_ratio=person.person_presence_ratio, frames_with_person=person.frames_with_person,
                average_person_confidence=person.average_person_confidence, maximum_person_confidence=person.maximum_person_confidence)
            payload["video"] = {"filename":video.filename or "upload", "duration_seconds":metadata.duration_seconds}
            payload["models"] = {"visual_model":visual.model, "detector":detector.detector}
            payload["inference_device"] = visual.inference_device
            payload["technical_signals"].update(hand_evidence_available=hands is not None,
                hand_presence_ratio=hands.hand_presence_ratio if hands else None, hand_analysis=hands,
                hand_frame_results=hand_frames, hand_evidence_error=hand_error, hand_inference_device="cpu" if hands else None,
                person_presence_ratio=person.person_presence_ratio, temporal_analysis=temporal)
            if product is not None:
                comparisons = compare_product_embeddings(final, [embeddings[i] for i in final], product, metadata.fps)
                best = max(comparisons, key=lambda item: item.cosine_similarity)
                average = sum(item.cosine_similarity for item in comparisons) / len(comparisons)
                inputs = replace(inputs, best_similarity=best.cosine_similarity, average_similarity=average)
                match_score, human_score = clamp_score(best.cosine_similarity), clamp_score(person.person_presence_ratio)
                change_score = temporal_change_score(temporal.average_visual_change)
                score = weighted_evidence(match_score, human_score, change_score, DEFAULT_WEIGHTS)
                payload["technical_signals"].update(best_similarity=best.cosine_similarity, average_similarity=average)
                payload.update(evidence={
                    "product_match":{"score":match_score,"best_matching_timestamp":best.timestamp_seconds},
                    "human_presence":{"score":human_score,"frames_with_person":person.frames_with_person,
                        "frames_analyzed":len(representative),"average_person_confidence":person.average_person_confidence},
                    "temporal_change":{"score":change_score,"average_visual_change":temporal.average_visual_change}},
                    weights=asdict(DEFAULT_WEIGHTS),craft_evidence_score=score,craft_evidence_percent=score*100,interpretation=interpret_evidence(score))
        if product_video is not None:
            try:
                showcase = analyze_product_video(product_video, product)
            except HTTPException as exc:
                raise HTTPException(exc.status_code, f"product_video: {exc.detail}") from None
            if "inference_device" in payload and payload["inference_device"] != showcase.inference_device:
                raise SimilarityComputationError("Inconsistent showcase inference device.")
            payload["technical_signals"]["product_video_analysis"] = showcase
            payload["inference_device"] = showcase.inference_device
            payload["models"]["visual_model"] = showcase.model
            inputs = replace(inputs, product_video_analyzed=True,
                product_video_average_similarity=showcase.product_image_consistency.average_similarity,
                product_video_best_similarity=showcase.product_image_consistency.best_similarity,
                product_video_diversity=showcase.showcase_analysis.view_diversity_score,
                product_video_valid_frame_ratio=showcase.showcase_analysis.valid_frame_ratio)
    return CraftVerificationResponse(**payload, trust_score=calculate_trust(inputs), processing_time_ms=round((perf_counter()-started)*1000,3))
