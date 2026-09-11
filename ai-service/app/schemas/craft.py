from app.schemas.synthetic_media import SyntheticMediaRisk
from app.schemas.capture import LiveCaptureEvidence
from typing import Literal
from app.schemas.trust import TrustScore
from app.schemas.product_video import ProductVideoResponse
from app.schemas.hand import HandAnalysis, HandFrameResult
from app.schemas.video import TemporalAnalysis
from pydantic import BaseModel, Field
from app.schemas.verification import SimilarityImageMetadata
from app.schemas.video_product_match import MatchVideoMetadata


class ModelsUsed(BaseModel):
    visual_model: str
    detector: str | None


class ProductMatchEvidence(BaseModel):
    score: float = Field(ge=0, le=1)
    best_matching_timestamp: float


class HumanPresenceEvidence(BaseModel):
    score: float = Field(ge=0, le=1)
    frames_with_person: int
    frames_analyzed: int
    average_person_confidence: float | None


class TemporalChangeEvidence(BaseModel):
    score: float = Field(ge=0, le=1)
    average_visual_change: float


class CraftEvidence(BaseModel):
    product_match: ProductMatchEvidence
    human_presence: HumanPresenceEvidence
    temporal_change: TemporalChangeEvidence


class CraftWeights(BaseModel):
    product_match: float
    human_presence: float
    temporal_change: float


class RawTechnicalSignals(BaseModel):
    product_video_analysis: ProductVideoResponse | None = None
    hand_evidence_available: bool = False
    hand_presence_ratio: float | None = None
    hand_analysis: HandAnalysis | None = None
    hand_frame_results: list[HandFrameResult] | None = None
    hand_evidence_error: str | None = None
    hand_inference_device: str | None = None
    best_similarity: float | None = None
    average_similarity: float | None = None
    person_presence_ratio: float | None = None
    temporal_analysis: TemporalAnalysis | None = None


class CraftVerificationResponse(BaseModel):
    synthetic_media_risk: SyntheticMediaRisk = Field(default_factory=SyntheticMediaRisk)
    live_capture_evidence: LiveCaptureEvidence = Field(default_factory=LiveCaptureEvidence)
    video: MatchVideoMetadata | None = None
    product_image: SimilarityImageMetadata | None = None
    models: ModelsUsed
    inference_device: str
    evidence: CraftEvidence | None = None
    weights: CraftWeights | None = None
    craft_evidence_score: float | None = Field(default=None, ge=0, le=1)
    craft_evidence_percent: float | None = Field(default=None, ge=0, le=100)
    interpretation: Literal["strong_supporting_evidence", "moderate_supporting_evidence", "limited_supporting_evidence"] | None = None
    processing_time_ms: float = Field(ge=0)
    trust_score: TrustScore
    technical_signals: RawTechnicalSignals
