"""Transparent provisional points. Inputs must come from validated analysis."""
from dataclasses import dataclass, asdict
import math

from app.schemas.trust import TrustCategory, TrustScore, TrustComponent, ListingCompletenessCategory
from app.services.evidence_scoring_service import clamp_score, temporal_change_score

PHOTO_DECODE_FRACTION = 0.60
PRODUCT_VIDEO_COMPONENT_MAXIMA = {"valid_product_video": 5, "product_consistency": 7, "view_diversity": 3}
PRODUCT_CONSISTENCY_BANDS = ((0.80, 7), (0.65, 5), (0.50, 2))
PROCESS_COMPONENT_MAXIMA = {"valid_process_video": 4, "temporal_progression": 6,
                            "hand_presence": 8, "hand_object_interaction": 2}
HAND_SCORE_BANDS = ((0.75, 8), (0.50, 6), (0.25, 3))
HAND_NONZERO_POINTS = 1


def hand_presence_points(ratio):
    ratio = clamp_score(ratio)
    return next((points for threshold, points in HAND_SCORE_BANDS if ratio >= threshold),
                HAND_NONZERO_POINTS if ratio > 0 else 0)

MATCH_BEST_FRACTION = 0.80
MATCH_LOW = 0.40
MATCH_HIGH = 0.90
LEVELS = ((90, "very_high_evidence"), (80, "high_evidence"), (60, "good_evidence"),
          (40, "basic_evidence"), (0, "low_evidence"))


@dataclass(frozen=True)
class TrustMaxima:
    product_photo_evidence: float = 35
    product_video_evidence: float = 15
    craft_process_evidence: float = 20
    artisan_visibility: float = 15
    product_process_match: float = 10
    listing_completeness: float = 5

    def __post_init__(self):
        values = list(asdict(self).values())
        if any(not math.isfinite(v) or v < 0 for v in values) or not math.isclose(sum(values), 100, abs_tol=1e-9, rel_tol=0):
            raise ValueError("Trust category maxima must be finite, nonnegative, and sum to 100.")


DEFAULT_MAXIMA = TrustMaxima()


@dataclass(frozen=True)
class TrustInputs:
    photo_decoded: bool = False
    photo_embedded: bool = False
    product_video_analyzed: bool = False
    product_video_average_similarity: float | None = None
    product_video_best_similarity: float | None = None
    product_video_diversity: float | None = None
    product_video_valid_frame_ratio: float | None = None
    process_analyzed: bool = False
    average_visual_change: float | None = None
    frames_analyzed: int = 0
    duration_seconds: float | None = None
    person_presence_ratio: float | None = None
    frames_with_person: int = 0
    average_person_confidence: float | None = None
    maximum_person_confidence: float | None = None
    best_similarity: float | None = None
    average_similarity: float | None = None
    listing_report: ListingCompletenessCategory | None = None
    listing_completeness: float | None = None  # Future validated fraction, not a claim of truth.
    hand_presence_ratio: float | None = None
    frames_with_hands: int = 0


def calculate_trust(inputs: TrustInputs, maxima: TrustMaxima = DEFAULT_MAXIMA) -> TrustScore:
    categories = {}
    def add(name, fraction, available, reasons, signals=None):
        maximum = getattr(maxima, name)
        categories[name] = TrustCategory(score=round(maximum * clamp_score(fraction), 4) if available else 0,
            max_score=maximum, available=available, reasons=reasons, signals=signals or {})

    photo = PHOTO_DECODE_FRACTION + (1 - PHOTO_DECODE_FRACTION) * inputs.photo_embedded
    add("product_photo_evidence", photo, inputs.photo_decoded,
        (["Product image validated and decoded", "DINOv2 extraction successful" if inputs.photo_embedded else "DINOv2 extraction unavailable",
          "Only one image assessed; multi-view consistency not checked"] if inputs.photo_decoded else ["No decoded product image available"]),
        {"image_decoded": inputs.photo_decoded, "embedding_successful": inputs.photo_decoded and inputs.photo_embedded,
         "multi_view_consistency_checked": False})
    if sum(PRODUCT_VIDEO_COMPONENT_MAXIMA.values()) != maxima.product_video_evidence:
        raise ValueError("Product video component maxima must sum to category maximum.")
    video_available = inputs.product_video_analyzed
    consistency_available = video_available and inputs.product_video_average_similarity is not None
    diversity_available = video_available and inputs.product_video_diversity is not None
    average = inputs.product_video_average_similarity
    if consistency_available:
        clamp_score(average)  # Reject nonfinite metrics; preserve signed cosine for band selection.
    video_components = {
        "valid_product_video": TrustComponent(score=PRODUCT_VIDEO_COMPONENT_MAXIMA["valid_product_video"] if video_available else 0, max_score=PRODUCT_VIDEO_COMPONENT_MAXIMA["valid_product_video"], available=video_available),
        "product_consistency": TrustComponent(score=next((points for threshold, points in PRODUCT_CONSISTENCY_BANDS if average >= threshold), 0) if consistency_available else 0,
            max_score=PRODUCT_VIDEO_COMPONENT_MAXIMA["product_consistency"], available=consistency_available),
        "view_diversity": TrustComponent(score=round(PRODUCT_VIDEO_COMPONENT_MAXIMA["view_diversity"] * clamp_score(inputs.product_video_diversity),4) if diversity_available else 0,
            max_score=PRODUCT_VIDEO_COMPONENT_MAXIMA["view_diversity"], available=diversity_available),
    }
    # Component maxima have a single source of truth.
    for name, component in video_components.items():
        component.max_score = PRODUCT_VIDEO_COMPONENT_MAXIMA[name]
    add("product_video_evidence", 0, video_available,
        (["Standalone product video successfully analyzed", "Consistency points use average image/video cosine" if consistency_available else "No image comparison available; consistency points are zero",
          "Diversity points use bounded visual change, not verified viewpoints"] if video_available else ["No standalone product video provided; process video is not counted here"]),
        {"average_similarity":average, "best_similarity":inputs.product_video_best_similarity,
         "view_diversity_score":inputs.product_video_diversity, "valid_frame_ratio":inputs.product_video_valid_frame_ratio})
    categories["product_video_evidence"].components = video_components
    categories["product_video_evidence"].score = sum(c.score for c in video_components.values())

    temporal = temporal_change_score(inputs.average_visual_change) if inputs.process_analyzed and inputs.average_visual_change is not None else None
    hand_available = inputs.process_analyzed and inputs.hand_presence_ratio is not None
    component_scores = {
        "valid_process_video": PROCESS_COMPONENT_MAXIMA["valid_process_video"] if inputs.process_analyzed else 0,
        "temporal_progression": PROCESS_COMPONENT_MAXIMA["temporal_progression"] * (temporal or 0),
        "hand_presence": hand_presence_points(inputs.hand_presence_ratio) if hand_available else 0,
        "hand_object_interaction": 0,
    }
    if sum(PROCESS_COMPONENT_MAXIMA.values()) != maxima.craft_process_evidence:
        raise ValueError("Process component maxima must sum to the category maximum.")
    components = {name: {"score": round(points, 4), "max_score": PROCESS_COMPONENT_MAXIMA[name],
        "available": (inputs.process_analyzed if name == "valid_process_video" else
            temporal is not None if name == "temporal_progression" else
            hand_available if name == "hand_presence" else False)} for name, points in component_scores.items()}
    process_points = sum(c["score"] for c in components.values())
    add("craft_process_evidence", process_points / maxima.craft_process_evidence, inputs.process_analyzed,
        (["Making-process video successfully analyzed", "Temporal points use a bounded visual-change heuristic",
          f"Hands detected in {inputs.frames_with_hands} of {inputs.frames_analyzed} sampled frames" if hand_available else "Hand evidence unavailable; no hand points awarded",
          "Hand-object interaction analysis not implemented yet"] if inputs.process_analyzed else ["No analyzed process video available"]),
        {"average_visual_change": inputs.average_visual_change, "frames_analyzed": inputs.frames_analyzed,
         "duration_seconds": inputs.duration_seconds, "temporal_progression_component": temporal,
         "hand_evidence_available": hand_available, "hand_presence_ratio": inputs.hand_presence_ratio if hand_available else None,
         "interaction_component": None})
    categories["craft_process_evidence"].components = {name: TrustComponent(**value) for name, value in components.items()}
    categories["craft_process_evidence"].score = process_points
    visible = inputs.process_analyzed and inputs.person_presence_ratio is not None
    add("artisan_visibility", inputs.person_presence_ratio or 0, visible,
        [f"Person detected in {inputs.frames_with_person} of {inputs.frames_analyzed} sampled frames",
         "Optional visibility bonus only; no face or identity analysis"] if visible else ["Person visibility evidence unavailable"],
        {"person_presence_ratio": inputs.person_presence_ratio, "average_person_confidence": inputs.average_person_confidence,
         "maximum_person_confidence": inputs.maximum_person_confidence})
    matched = inputs.process_analyzed and inputs.photo_embedded and inputs.best_similarity is not None and inputs.average_similarity is not None
    match = (MATCH_BEST_FRACTION * inputs.best_similarity + (1 - MATCH_BEST_FRACTION) * inputs.average_similarity) if matched else None
    add("product_process_match", (match - MATCH_LOW) / (MATCH_HIGH - MATCH_LOW) if matched else 0, matched,
        ["Points map best/average whole-image visual similarity; backgrounds may influence the match"] if matched else ["Product/process comparison unavailable"],
        {"best_similarity": inputs.best_similarity, "average_similarity": inputs.average_similarity, "combined_similarity": match})
    add("listing_completeness", inputs.listing_completeness or 0, inputs.listing_completeness is not None,
        ["Listing completeness fraction supplied by upstream validation" if inputs.listing_completeness is not None else "Listing metadata not provided to AI service"])
    if inputs.listing_report is not None:
        if inputs.listing_report.max_score != maxima.listing_completeness:
            raise ValueError("Listing field weights must match the category maximum.")
        categories["listing_completeness"] = inputs.listing_report
    # Sum the displayed points, with no hidden renormalization of missing categories.
    total = sum(category.score for category in categories.values())
    return TrustScore(score=total, level=next(label for threshold, label in LEVELS if total >= threshold), categories=categories)
