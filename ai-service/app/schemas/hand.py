from pydantic import BaseModel, Field


class HandFrameResult(BaseModel):
    timestamp_seconds: float
    hand_detected: bool
    hand_count: int
    left_hand_detected: bool
    right_hand_detected: bool
    unknown_handedness_count: int
    detection_source: str = "none"


class HandAnalysis(BaseModel):
    frames_analyzed: int
    frames_with_hands: int
    hand_presence_ratio: float
    average_hand_count: float
    maximum_hand_count: int
    hand_motion_score: float | None = None


class VideoHandEvidenceResponse(BaseModel):
    filename: str
    frames_analyzed: int
    timestamps_seconds: list[float]
    hand_detector: str = "mediapipe_hand_landmarker"
    hand_inference_device: str = "cpu"
    hand_detection_config: dict[str, int | float | bool | str] = Field(default_factory=dict)
    hand_analysis: HandAnalysis
    frame_results: list[HandFrameResult]
    processing_time_ms: float = Field(ge=0)
