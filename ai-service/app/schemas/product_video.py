from pydantic import BaseModel
from app.schemas.video import VideoMetadata
from app.schemas.video_product_match import FrameProductSimilarity


class ProductImageConsistency(BaseModel):
    available: bool = False
    frame_similarities: list[FrameProductSimilarity] = []
    best_similarity: float | None = None
    average_similarity: float | None = None
    minimum_similarity: float | None = None
    similarity_spread: float | None = None


class ShowcaseAnalysis(BaseModel):
    frames_target: int
    frames_requested: int
    frames_successfully_analyzed: int
    valid_frame_ratio: float
    duration_seconds: float
    average_visual_change: float
    view_diversity_score: float


class ProductVideoResponse(BaseModel):
    filename: str
    video_metadata: VideoMetadata
    frames_analyzed: int
    timestamps_seconds: list[float]
    model: str
    inference_device: str
    product_image_consistency: ProductImageConsistency
    showcase_analysis: ShowcaseAnalysis
    processing_time_ms: float
