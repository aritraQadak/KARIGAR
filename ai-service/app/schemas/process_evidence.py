from pydantic import BaseModel, Field


class PersonFrameResult(BaseModel):
    timestamp_seconds: float
    person_detected: bool
    person_count: int
    highest_person_confidence: float | None


class PersonAnalysis(BaseModel):
    frames_with_person: int
    person_presence_ratio: float
    average_person_confidence: float | None
    maximum_person_confidence: float | None


class DetectedClassSummary(BaseModel):
    class_name: str
    frames_detected: int
    max_confidence: float


class VideoProcessEvidenceResponse(BaseModel):
    filename: str
    frames_analyzed: int
    timestamps_seconds: list[float]
    detector: str
    inference_device: str
    person_analysis: PersonAnalysis
    frame_results: list[PersonFrameResult]
    detected_classes_summary: list[DetectedClassSummary]
    processing_time_ms: float = Field(ge=0)
