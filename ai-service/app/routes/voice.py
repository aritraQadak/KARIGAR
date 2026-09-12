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
            logger.error('Voice onboarding category=%s provider_http=%s', error.category, error.provider_status)
            messages = {
                'missing_api_key': 'Voice generation is unavailable because the Gemini API key is not configured. Contact support or fill the details manually.',
                'authentication_failure': 'Gemini could not authenticate voice generation. Contact support or fill the details manually.',
                'quota_rate_limit': 'Voice generation has reached its usage limit. Try later or fill the details manually.',
                'invalid_model': 'The voice generation model is unavailable. Contact support or fill the details manually.',
                'network_failure': 'The voice service could not reach Gemini. Try again shortly or fill the details manually.',
                'provider_timeout': 'Voice generation timed out. Try a shorter recording or fill the details manually.',
                'provider_unavailable': 'Gemini is temporarily unavailable. Please try Generate Product Details again shortly; you do not need to record again.',
                'unsupported_audio': 'Gemini could not read this recording. Record again or fill the details manually.',
            }
            raise HTTPException(error.status, messages.get(error.category,
                "We couldn't process that recording. Try again or fill the details manually.")) from None
        except Exception as error:
            # Do not log credentials, provider response bodies or private transcripts.
            logger.error('Voice onboarding failed (%s)', type(error).__name__)
            raise HTTPException(503, "We couldn't process that recording. Try again or fill the details manually.") from None
    finally:
        await audio.close()
