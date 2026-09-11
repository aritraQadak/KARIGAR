"""Capture provenance is diagnostic only, never an authenticity claim."""
from datetime import datetime
from typing import Literal
from pydantic import BaseModel

class CaptureSessionRequest(BaseModel):
    purpose: Literal["process_video"] = "process_video"

class CaptureSessionResponse(BaseModel):
    capture_session_id: str
    created_at: datetime
    expires_at: datetime
    purpose: str
    max_recording_seconds: float = 60

class CaptureReceipt(BaseModel):
    capture_method: Literal["karigar_live_camera"] = "karigar_live_camera"
    capture_session_valid: bool = True
    capture_session_id: str
    purpose: Literal["process_video"] = "process_video"
    created_at: datetime
    submitted_at: datetime
    duration_seconds: float
    sha256: str
    single_use_session: bool = True

class CaptureSubmission(BaseModel):
    capture_session_id: str
    capture_method: str = "karigar_live_camera"
    purpose: str = "process_video"
    session_valid: bool = True
    received_at: datetime
    video_sha256: str
    duration_seconds: float
    capture_receipt_token: str
    receipt_expires_at: datetime

class LiveCaptureEvidence(BaseModel):
    available: bool = False
    verified_capture_session: bool = False
    capture_method: str = "ordinary_upload"
    purpose: str = "process_video"
    suggested_score: int = 0
    suggested_max_score: int = 10
    included_in_trust_score: Literal[False] = False
    capture_session_id: str | None = None
