from pydantic import BaseModel, Field


class VideoMetadata(BaseModel):
    duration_seconds: float
    fps: float
    total_frames: int
    width: int
    height: int


class TemporalAnalysis(BaseModel):
    consecutive_similarities: list[float]
    average_consecutive_similarity: float
    minimum_consecutive_similarity: float
    maximum_consecutive_similarity: float
    average_visual_change: float
    maximum_visual_change: float


class VideoVerificationResponse(BaseModel):
    filename: str
    video_metadata: VideoMetadata
    frames_analyzed: int
    timestamps_seconds: list[float]
    model: str
    embedding_dimension: int
    inference_device: str
    temporal_analysis: TemporalAnalysis
    processing_time_ms: float = Field(ge=0)
