"""Uncalibrated risk diagnostics, separate from authenticity and trust points."""
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

LIMITATIONS = [
    "Synthetic-media risk is heuristic, not proof of AI generation or an authenticity probability.",
    "Compression, editing, camera motion, occlusion, poor lighting and blur can affect these signals.",
    "No learned deepfake classifier or audio analysis was used.",
    "Sparse sampling can miss manipulation; low risk does not establish authenticity.",
    "Hand observations are independent detections, not tracked identities; long sampling gaps limit comparison.",
    "Frame times use validated average FPS; variable-frame-rate timing is approximate.",
]

class RiskSignal(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    available: bool = False
    risk: float | None = Field(default=None, ge=0, le=1)
    coverage: float = Field(default=0, ge=0, le=1)
    reason: str
    raw_metrics: dict[str, float | int | bool | str | None | list[float]] = Field(default_factory=dict)

class RiskContext(BaseModel):
    karigar_live_capture: bool = False

class SyntheticMediaRisk(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    available: bool = False
    risk_score: float | None = Field(default=None, ge=0, le=1)
    risk_level: Literal["inconclusive", "low", "medium", "high"] = "inconclusive"
    coverage: float = Field(default=0, ge=0, le=1)
    signals: dict[str, RiskSignal] = Field(default_factory=dict)
    context: RiskContext = Field(default_factory=RiskContext)
    included_in_trust_score: Literal[False] = False
    interpretation: str = "Inconclusive: no process-video forensic analysis is available."
    limitations: list[str] = Field(default_factory=lambda: list(LIMITATIONS))
    processing_time_ms: float = Field(default=0, ge=0)
    frames_analyzed: int = 0
    inference_devices: dict[str, str | None] = Field(default_factory=dict)

class SyntheticMediaResponse(BaseModel):
    filename: str
    frames_analyzed: int
    duration_seconds: float
    synthetic_media_risk: SyntheticMediaRisk
    processing_time_ms: float
    inference_devices: dict[str, str | None]
