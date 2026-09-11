"""Bounded single-process development store. Replace with atomic Redis/DB operations.
Tokens are bearer capabilities: do not log them. No camera or identity attestation.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from threading import Lock
from typing import Protocol
from fastapi import HTTPException
from app.schemas.capture import CaptureSessionResponse, CaptureReceipt, CaptureSubmission, LiveCaptureEvidence
from app.services.video_service import DEFAULT_LIMITS, validated_video, sampled_frames, sample_frame_indices, analysis_frame

SESSION_TTL_SECONDS = 300
RECEIPT_TTL_SECONDS = 1800
MAX_RECORDS = 1000

def utcnow():
    return datetime.now(timezone.utc)

@dataclass
class Session:
    response: CaptureSessionResponse
    consumed: bool = False

class CaptureStore(Protocol):
    def create(self, purpose: str) -> CaptureSessionResponse: ...
    def check(self, session_id: str) -> None: ...
    def consume(self, session_id: str, digest: str, duration: float) -> CaptureSubmission: ...
    def resolve(self, token: str, digest: str) -> CaptureReceipt: ...

class MemoryCaptureStore:
    def __init__(self, clock=utcnow, session_ttl=SESSION_TTL_SECONDS, receipt_ttl=RECEIPT_TTL_SECONDS):
        self.clock, self.session_ttl, self.receipt_ttl = clock, session_ttl, receipt_ttl
        self.sessions, self.receipts = {}, {}
        self.lock = Lock()

    def _prune(self):
        now = self.clock()
        self.sessions = {k: v for k, v in self.sessions.items() if v.response.expires_at > now}
        self.receipts = {k: v for k, v in self.receipts.items() if v[1] > now}

    def create(self, purpose="process_video"):
        if purpose != "process_video":
            raise HTTPException(422, "Unsupported capture purpose.")
        with self.lock:
            self._prune()
            if len(self.sessions) >= MAX_RECORDS:
                raise HTTPException(503, "Capture capacity reached. Try again shortly.")
            now = self.clock()
            response = CaptureSessionResponse(capture_session_id=secrets.token_urlsafe(32),
                created_at=now, expires_at=now + timedelta(seconds=self.session_ttl), purpose=purpose,
                max_recording_seconds=DEFAULT_LIMITS.max_duration)
            self.sessions[response.capture_session_id] = Session(response)
            return response

    def _check(self, session_id):
        session = self.sessions.get(session_id)
        if session is None:
            raise HTTPException(404, "Capture session not found. Record again or use Upload Video.")
        if session.response.expires_at <= self.clock():
            raise HTTPException(410, "Capture session expired. Record again or use Upload Video.")
        if session.consumed:
            raise HTTPException(409, "Capture session has already been used.")
        if session.response.purpose != "process_video":
            raise HTTPException(422, "Capture session has the wrong purpose.")
        return session

    def check(self, session_id):
        with self.lock:
            self._check(session_id)

    def consume(self, session_id, digest, duration):
        with self.lock:
            session = self._check(session_id)
            self.receipts = {k: v for k, v in self.receipts.items() if v[1] > self.clock()}
            if len(self.receipts) >= MAX_RECORDS:
                raise HTTPException(503, "Capture receipt capacity reached. Try again shortly.")
            now = self.clock()
            receipt = CaptureReceipt(capture_session_id=session_id, created_at=session.response.created_at,
                submitted_at=now, duration_seconds=duration, sha256=digest)
            token = secrets.token_urlsafe(32)
            expiry = now + timedelta(seconds=self.receipt_ttl)
            self.receipts[token] = (receipt, expiry)
            session.consumed = True
            return CaptureSubmission(capture_session_id=session_id, received_at=now,
                video_sha256=digest, duration_seconds=duration, capture_receipt_token=token,
                receipt_expires_at=expiry)

    def resolve(self, token, digest):
        with self.lock:
            record = self.receipts.get(token)
            if record is None or record[1] <= self.clock():
                raise HTTPException(410, "Capture receipt is invalid or expired. Use ordinary upload or record again.")
            receipt = record[0]
            if not secrets.compare_digest(receipt.sha256, digest):
                raise HTTPException(422, "Capture receipt does not match this process video.")
            return receipt.model_copy(deep=True)

store: CaptureStore = MemoryCaptureStore()

def video_digest(upload):
    digest, size = hashlib.sha256(), 0
    upload.file.seek(0)
    try:
        while chunk := upload.file.read(1024 * 1024):
            size += len(chunk)
            if size > DEFAULT_LIMITS.max_bytes:
                raise HTTPException(413, "Video exceeds the upload file-size limit.")
            digest.update(chunk)
        return digest.hexdigest()
    finally:
        upload.file.seek(0)

def submit_capture(session_id, video):
    store.check(session_id)
    with validated_video(video) as (capture, metadata):
        for frame in sampled_frames(capture, sample_frame_indices(metadata.total_frames)):
            analysis_frame(frame)
    digest = video_digest(video)
    return store.consume(session_id, digest, metadata.duration_seconds)

def resolve_evidence(token, video):
    if token is None:
        return LiveCaptureEvidence()
    if video is None:
        raise HTTPException(422, "A capture receipt requires its process video.")
    receipt = store.resolve(token, video_digest(video))
    return LiveCaptureEvidence(available=True, verified_capture_session=True,
        capture_method=receipt.capture_method, suggested_score=10,
        capture_session_id=receipt.capture_session_id)
