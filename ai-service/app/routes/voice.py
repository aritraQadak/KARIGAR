import logging
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from app.services import voice_service as service

router = APIRouter(prefix='/onboarding', tags=['Product onboarding'])
logger = logging.getLogger(__name__)


@router.post('/product-from-voice')
async def product_from_voice(
    audio: UploadFile = File(...),
    selected_language: Literal['bn', 'hi', 'en'] = Form(...),
    duration_seconds: float = Form(..., ge=1, le=service.MAX_RECORDING_SECONDS + 1),
):
    try:
        data = await audio.read(service.MAX_AUDIO_BYTES + 1)
        if len(data) > service.MAX_AUDIO_BYTES:
            raise HTTPException(413, 'Recording is too large. Record a shorter message.')
        mime = (audio.content_type or '').split(';')[0].lower()
        try:
            service.validate_audio(data, mime)
        except ValueError:
            raise HTTPException(415, 'Use a valid WebM, Ogg or MP4 audio recording.') from None
        try:
            return await run_in_threadpool(service.product_from_voice, data, mime, selected_language)
        except service.VoiceProviderError as error:
            logger.error('Voice onboarding category=%s detail=%s', error.category, error)
            raise HTTPException(error.status, "We couldn't process that recording. Try again or fill the details manually.") from None
        except Exception as error:
            # Do not log credentials, provider response bodies or private transcripts.
            logger.error('Voice onboarding failed (%s)', type(error).__name__)
            raise HTTPException(503, "We couldn't process that recording. Try again or fill the details manually.") from None
    finally:
        await audio.close()
