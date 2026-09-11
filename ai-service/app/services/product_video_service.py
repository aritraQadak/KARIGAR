"""Independent finished-product showcase analysis, not process evidence."""
from dataclasses import replace
from time import perf_counter
from contextlib import ExitStack
from fastapi import UploadFile, HTTPException

from app.schemas.product_video import ProductVideoResponse, ProductImageConsistency
from app.services.video_service import DEFAULT_LIMITS, validated_video, sampled_embeddings, temporal_metrics
from app.services.video_product_match_service import final_frame_indices, compare_product_embeddings
from app.services.image_verification import validated_image
from app.services.embedding_service import embed_image
from app.services.evidence_scoring_service import temporal_change_score
from app.services.similarity_service import SimilarityComputationError

PRODUCT_VIDEO_MAX_DURATION = 30.0
PRODUCT_VIDEO_POSITIONS = (.10, .25, .40, .60, .75, .90)


def analyze_product_video(video: UploadFile, product=None):
    """Accept an optional precomputed image embedding to avoid repeated inference."""
    started = perf_counter()
    limits = replace(DEFAULT_LIMITS, max_duration=PRODUCT_VIDEO_MAX_DURATION)
    with validated_video(video, limits) as (capture, metadata):
        indices = final_frame_indices(metadata.total_frames, PRODUCT_VIDEO_POSITIONS)
        embeddings = list(sampled_embeddings(capture, indices, limits))
        if len(embeddings) != len(indices):
            raise SimilarityComputationError("Product video sampling did not complete.")
        first = embeddings[0]
        if any(e.model != first.model or e.inference_device != first.inference_device for e in embeddings):
            raise SimilarityComputationError("Inconsistent product video embeddings.")
        temporal = temporal_metrics(embeddings)
        consistency = ProductImageConsistency()
        if product is not None:
            comparisons = compare_product_embeddings(indices, embeddings, product, metadata.fps)
            scores = [c.cosine_similarity for c in comparisons]
            consistency = ProductImageConsistency(available=True, frame_similarities=comparisons,
                best_similarity=max(scores), average_similarity=sum(scores)/len(scores),
                minimum_similarity=min(scores), similarity_spread=max(scores)-min(scores))
    return ProductVideoResponse(filename=video.filename or "upload", video_metadata=metadata,
        frames_analyzed=len(embeddings), timestamps_seconds=[i/metadata.fps for i in indices],
        model=first.model, inference_device=first.inference_device, product_image_consistency=consistency,
        showcase_analysis={"frames_target":len(PRODUCT_VIDEO_POSITIONS), "frames_requested":len(indices),
            "frames_successfully_analyzed":len(embeddings), "valid_frame_ratio":len(embeddings)/len(indices),
            "duration_seconds":metadata.duration_seconds, "average_visual_change":temporal.average_visual_change,
            "view_diversity_score":temporal_change_score(temporal.average_visual_change)},
        processing_time_ms=round((perf_counter()-started)*1000,3))


def inspect_product_video(video: UploadFile, image: UploadFile | None = None):
    started = perf_counter()
    with ExitStack() as stack:
        product = None
        if image is not None:
            try:
                _, decoded = stack.enter_context(validated_image(image))
            except HTTPException as exc:
                raise HTTPException(exc.status_code, f"product_image: {exc.detail}") from None
            product = embed_image(decoded)
        response = analyze_product_video(video, product)
    response.processing_time_ms = round((perf_counter()-started)*1000,3)
    return response
