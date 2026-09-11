"""Provisional, untrained evidence heuristics; not an authenticity classifier."""
from dataclasses import dataclass, asdict
import math

TEMPORAL_LOW = 0.02
TEMPORAL_PLATEAU_START = 0.15
TEMPORAL_PLATEAU_END = 0.35
TEMPORAL_HIGH = 0.80
STRONG_EVIDENCE_THRESHOLD = 0.80
MODERATE_EVIDENCE_THRESHOLD = 0.60


class EvidenceScoringError(RuntimeError):
    pass


@dataclass(frozen=True)
class EvidenceWeights:
    product_match: float = 0.50
    human_presence: float = 0.30
    temporal_change: float = 0.20

    def __post_init__(self):
        values = asdict(self).values()
        if any(not math.isfinite(v) or v < 0 for v in values) or not math.isclose(sum(values), 1.0, abs_tol=1e-9, rel_tol=0):
            raise ValueError("Evidence weights must be finite, nonnegative, and sum to 1.")


DEFAULT_WEIGHTS = EvidenceWeights()


def clamp_score(value: float) -> float:
    if not math.isfinite(value):
        raise EvidenceScoringError("Evidence calculation produced a non-finite value.")
    return max(0.0, min(1.0, value))


def temporal_change_score(change: float) -> float:
    if not math.isfinite(change):
        raise EvidenceScoringError("Temporal change must be finite.")
    if not 0 <= TEMPORAL_LOW < TEMPORAL_PLATEAU_START <= TEMPORAL_PLATEAU_END < TEMPORAL_HIGH:
        raise EvidenceScoringError("Temporal heuristic configuration is invalid.")
    if change <= TEMPORAL_LOW or change >= TEMPORAL_HIGH:
        return 0.0
    if change < TEMPORAL_PLATEAU_START:
        return clamp_score((change - TEMPORAL_LOW) / (TEMPORAL_PLATEAU_START - TEMPORAL_LOW))
    if change <= TEMPORAL_PLATEAU_END:
        return 1.0
    return clamp_score((TEMPORAL_HIGH - change) / (TEMPORAL_HIGH - TEMPORAL_PLATEAU_END))


def weighted_evidence(product_match, human_presence, temporal_change, weights=DEFAULT_WEIGHTS):
    return clamp_score(
        clamp_score(product_match) * weights.product_match
        + clamp_score(human_presence) * weights.human_presence
        + clamp_score(temporal_change) * weights.temporal_change
    )


def interpret_evidence(score: float) -> str:
    score = clamp_score(score)
    if score >= STRONG_EVIDENCE_THRESHOLD:
        return "strong_supporting_evidence"
    if score >= MODERATE_EVIDENCE_THRESHOLD:
        return "moderate_supporting_evidence"
    return "limited_supporting_evidence"
