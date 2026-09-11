"""Information coverage only; never verifies the seller's claims."""
import json
import math
from fastapi import HTTPException
from app.schemas.trust import ListingCompletenessCategory

CORE_FIELD_WEIGHTS = {"title": .5, "description": 1.0, "category": .5, "materials": .75, "price": .75}
TRANSPARENCY_FIELD_WEIGHTS = {"region": .5, "dimensions": .4, "craft_technique": .6}
FIELD_WEIGHTS = {**CORE_FIELD_WEIGHTS, **TRANSPARENCY_FIELD_WEIGHTS}
MAX_METADATA_BYTES = 64 * 1024
MAX_LISTING_POINTS = 5.0


def parse_listing_metadata(raw: str | None):
    if raw is None:
        return None
    if len(raw.encode("utf-8")) > MAX_METADATA_BYTES:
        raise HTTPException(422, "listing_metadata exceeds the 64 KiB limit.")
    try:
        def invalid_constant(value):
            raise ValueError("Nonstandard JSON number")
        value = json.loads(raw, parse_constant=invalid_constant)
    except (ValueError, RecursionError):
        raise HTTPException(422, "listing_metadata must contain valid JSON.") from None
    if not isinstance(value, dict):
        raise HTTPException(422, "listing_metadata must be a JSON object.")
    return value


def meaningful_value(name, value):
    if name == "price":
        try:
            return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and value > 0
        except OverflowError:
            return False
    if name == "materials":
        return isinstance(value, list) and any(isinstance(item, str) and bool(item.strip()) for item in value)
    return isinstance(value, str) and bool(value.strip())


def listing_completeness(metadata: dict | None) -> ListingCompletenessCategory:
    if any(not math.isfinite(w) or w < 0 for w in FIELD_WEIGHTS.values()) or not math.isclose(sum(FIELD_WEIGHTS.values()), MAX_LISTING_POINTS):
        raise ValueError("Listing weights must be finite, nonnegative, and sum to 5.")
    completed = [name for name in FIELD_WEIGHTS if metadata is not None and meaningful_value(name, metadata.get(name))]
    missing = [name for name in FIELD_WEIGHTS if name not in completed]
    return ListingCompletenessCategory(
        score=round(sum(FIELD_WEIGHTS[name] for name in completed), 4), max_score=MAX_LISTING_POINTS,
        available=metadata is not None, completed_fields=completed, missing_fields=missing,
        completion_ratio=round(len(completed)/len(FIELD_WEIGHTS),4),
        reasons=([f"{len(completed)} of {len(FIELD_WEIGHTS)} listing fields contain meaningful values",
                  "Information presence only; seller claims were not verified"] if metadata is not None else
                 ["Listing metadata not provided to AI service"]),
        signals={"core_fields_completed":sum(name in completed for name in CORE_FIELD_WEIGHTS),
                 "core_fields_total":len(CORE_FIELD_WEIGHTS),
                 "recommended_fields_completed":sum(name in completed for name in TRANSPARENCY_FIELD_WEIGHTS),
                 "recommended_fields_total":len(TRANSPARENCY_FIELD_WEIGHTS)},
    )
