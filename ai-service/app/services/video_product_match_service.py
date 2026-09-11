"""Compare whole-image visual features against selected late video frames."""
from contextlib import ExitStack
import math
from time import perf_counter

from fastapi import HTTPException, UploadFile

from app.schemas.video_product_match import VideoProductMatchResponse, FrameProductSimilarity
from app.services.image_verification import validated_image
from app.services.video_service import validated_video, sampled_embeddings
from app.services.embedding_service import embed_image
from app.services.similarity_service import cosine_similarity, SimilarityComputationError

FINAL_FRAME_POSITIONS = (0.70, 0.80, 0.90, 0.95)
HIGH_MATCH_THRESHOLD = 0.80
MODERATE_MATCH_THRESHOLD = 0.60


def final_frame_indices(total_frames: int, positions=None) -> list[int]:
    positions = FINAL_FRAME_POSITIONS if positions is None else positions
    if total_frames < 2 or not positions or any(not math.isfinite(p) or not 0 <= p < 1 for p in positions):
        raise ValueError("Final-frame sampling requires valid positions and at least two video frames.")
    return sorted({round((total_frames - 1) * p) for p in positions})


def interpret_match(score: float) -> str:
    if score >= HIGH_MATCH_THRESHOLD:
        return "high_visual_match"
    if score >= MODERATE_MATCH_THRESHOLD:
        return "moderate_visual_match"
    return "low_visual_match"


def match_video_product(video: UploadFile, product_image: UploadFile) -> VideoProductMatchResponse:
    started = perf_counter()
    with ExitStack() as stack:
        try:
            image_metadata, image = stack.enter_context(validated_image(product_image))
        except HTTPException as exc:
            raise HTTPException(exc.status_code, f"product_image: {exc.detail}") from None
        try:
            capture, metadata = stack.enter_context(validated_video(video))
        except HTTPException as exc:
            raise HTTPException(exc.status_code, f"video: {exc.detail}") from None
        indices = final_frame_indices(metadata.total_frames)
        product = embed_image(image)
        comparisons = compare_product_embeddings(indices, sampled_embeddings(capture, indices), product, metadata.fps)
        best = max(comparisons, key=lambda item: item.cosine_similarity)
    return VideoProductMatchResponse(
        video={"filename": video.filename or "upload", "duration_seconds": metadata.duration_seconds},
        product_image={key: image_metadata[key] for key in ("filename", "width", "height")},
        model=product.model, embedding_dimension=product.vector.numel(),
        inference_device=product.inference_device, final_frames_analyzed=len(comparisons),
        frame_product_similarities=comparisons,
        best_similarity=best.cosine_similarity,
        average_similarity=sum(item.cosine_similarity for item in comparisons) / len(comparisons),
        best_matching_timestamp=best.timestamp_seconds,
        interpretation=interpret_match(best.cosine_similarity),
        processing_time_ms=round((perf_counter() - started) * 1000, 3),
    )


def compare_product_embeddings(indices, embeddings, product, fps):
    comparisons = []
    for index, frame in zip(indices, embeddings):
        if frame.model != product.model or frame.inference_device != product.inference_device:
            raise SimilarityComputationError("Video and product embeddings are incompatible.")
        comparisons.append(FrameProductSimilarity(
            timestamp_seconds=index / fps,
            cosine_similarity=cosine_similarity(frame.vector, product.vector),
        ))
    if len(comparisons) != len(indices):
        raise SimilarityComputationError("Final-frame comparison did not complete.")
    return comparisons
