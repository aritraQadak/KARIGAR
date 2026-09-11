"""Visual similarity only; development thresholds do not establish authenticity."""
from contextlib import ExitStack
import math
from time import perf_counter

from fastapi import HTTPException, UploadFile
import torch

from app.schemas.verification import ImageSimilarityResponse, SimilarityImageMetadata
from app.services.embedding_service import embed_image, EMBEDDING_DIMENSION
from app.services.image_verification import validated_image

HIGH_SIMILARITY_THRESHOLD = 0.80
MODERATE_SIMILARITY_THRESHOLD = 0.60


class SimilarityComputationError(RuntimeError):
    """Embeddings could not be safely compared."""


def interpret_similarity(score: float) -> str:
    if score >= HIGH_SIMILARITY_THRESHOLD:
        return "high_visual_similarity"
    if score >= MODERATE_SIMILARITY_THRESHOLD:
        return "moderate_visual_similarity"
    return "low_visual_similarity"


def cosine_similarity(reference: torch.Tensor, product: torch.Tensor) -> float:
    """Dot product of unit vectors, bounded against floating-point overshoot."""
    try:
        for vector in (reference, product):
            if (vector.shape != (EMBEDDING_DIMENSION,)
                    or not torch.isfinite(vector).all().item()
                    or not math.isclose(vector.norm().item(), 1.0, rel_tol=1e-5, abs_tol=1e-5)):
                raise ValueError("Expected a finite normalized DINOv2 embedding")
        score = torch.dot(reference, product).item()
        if not math.isfinite(score):
            raise ValueError("Non-finite similarity")
        return max(-1.0, min(1.0, score))
    except Exception:
        raise SimilarityComputationError("Image similarity computation failed.") from None


def compare_images(reference_image: UploadFile, product_image: UploadFile) -> ImageSimilarityResponse:
    started = perf_counter()
    with ExitStack() as stack:
        validated = []
        for field, upload in (("reference_image", reference_image), ("product_image", product_image)):
            try:
                validated.append(stack.enter_context(validated_image(upload)))
            except HTTPException as exc:
                raise HTTPException(exc.status_code, f"{field}: {exc.detail}") from None
        # Validate both uploads before any model loading or inference.
        reference = embed_image(validated[0][1])
        product = embed_image(validated[1][1])
        if (reference.model != product.model
                or reference.inference_device != product.inference_device):
            raise SimilarityComputationError("Image embeddings are incompatible.")
        score = cosine_similarity(reference.vector, product.vector)
        return ImageSimilarityResponse(
            reference_image=SimilarityImageMetadata(**validated[0][0]),
            product_image=SimilarityImageMetadata(**validated[1][0]),
            model=reference.model,
            embedding_dimension=reference.vector.numel(),
            inference_device=reference.inference_device,
            cosine_similarity=score,
            similarity_percent=score * 100,
            interpretation=interpret_similarity(score),
            processing_time_ms=round((perf_counter() - started) * 1000, 3),
        )
