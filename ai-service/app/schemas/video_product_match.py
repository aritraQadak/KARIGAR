from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.verification import SimilarityImageMetadata


class MatchVideoMetadata(BaseModel):
    filename: str
    duration_seconds: float


class FrameProductSimilarity(BaseModel):
    timestamp_seconds: float
    cosine_similarity: float = Field(ge=-1, le=1)


class VideoProductMatchResponse(BaseModel):
    video: MatchVideoMetadata
    product_image: SimilarityImageMetadata
    model: str
    embedding_dimension: int
    inference_device: str
    final_frames_analyzed: int
    frame_product_similarities: list[FrameProductSimilarity]
    best_similarity: float = Field(ge=-1, le=1)
    average_similarity: float = Field(ge=-1, le=1)
    best_matching_timestamp: float
    interpretation: Literal["high_visual_match", "moderate_visual_match", "low_visual_match"]
    processing_time_ms: float = Field(ge=0)
