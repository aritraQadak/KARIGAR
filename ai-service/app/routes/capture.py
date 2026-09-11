from fastapi import APIRouter, File, Form, UploadFile
from app.schemas.capture import CaptureSessionRequest, CaptureSessionResponse, CaptureSubmission
from app.services import capture_service

router = APIRouter(prefix="/capture", tags=["capture provenance"])

@router.post("/session", response_model=CaptureSessionResponse)
def create_session(request: CaptureSessionRequest):
    return capture_service.store.create(request.purpose)

@router.post("/process-video", response_model=CaptureSubmission)
def submit_process_video(capture_session_id: str = Form(...), video: UploadFile = File(...)):
    try:
        return capture_service.submit_capture(capture_session_id, video)
    finally:
        video.file.close()
