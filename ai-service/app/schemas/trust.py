from typing import Literal
from pydantic import BaseModel, Field, SerializeAsAny


class TrustComponent(BaseModel):
    score: float
    max_score: float
    available: bool


class TrustCategory(BaseModel):
    score: float = Field(ge=0)
    max_score: float = Field(ge=0)
    available: bool
    reasons: list[str]
    components: dict[str, TrustComponent] = Field(default_factory=dict)
    signals: dict[str, float | int | bool | None] = Field(default_factory=dict)


class ListingCompletenessCategory(TrustCategory):
    completed_fields: list[str] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    completion_ratio: float = Field(ge=0, le=1)


class TrustScore(BaseModel):
    score: float = Field(ge=0, le=100)
    max_score: float = 100
    level: Literal["low_evidence", "basic_evidence", "good_evidence", "high_evidence", "very_high_evidence"]
    principle: str = "Score reflects transparency and supporting evidence, not authenticity probability"
    categories: dict[str, SerializeAsAny[TrustCategory]]
