from fastapi import APIRouter, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
import logging
from app.services.authenticity_service import analyze, DetectorError
from app.services.authenticity_service import publication_eligibility
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/verify', tags=['Media authenticity'])


class MediaHash(BaseModel):
    model_config = ConfigDict(extra='forbid')
    sha256: str = Field(pattern=r'^[a-f0-9]{64}$')
    kind: Literal['photo', 'video']


class EligibilityRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    files: list[MediaHash] = Field(min_length=1, max_length=7)


@router.post('/media-eligibility')
async def media_eligibility(request: EligibilityRequest):
    try:
        eligible = await run_in_threadpool(publication_eligibility, [item.model_dump() for item in request.files])
        return {'eligible': eligible}
    except Exception:
        raise HTTPException(503, 'Media eligibility could not be checked. Please retry later.') from None


@router.post('/media-authenticity')
async def media_authenticity(media: UploadFile = File(...)):
    try:
        mime = (media.content_type or '').split(';')[0].lower()
        if mime not in ('image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm',
                        'video/quicktime', 'video/avi', 'video/x-msvideo', 'video/msvideo', 'application/octet-stream', ''):
            return dict(status='unsupported', message='This file type is unsupported.', review_required=True)
        limit = (10 if mime.startswith('image/') else 100) * 1024 * 1024
        data = await media.read(limit + 1)
        if not data or len(data) > limit:
            raise HTTPException(413, 'File is empty or exceeds the upload limit.')
        return await run_in_threadpool(analyze, data, mime, media.filename or 'upload')
    except HTTPException:
        raise
    except DetectorError as exc:
        logger.warning('Media detector category=%s code=%s', exc.category, exc.code)
        return dict(status='error', message=str(exc), error_category=exc.category,
                    error_code=exc.code, review_required=True)
    except Exception as exc:
        # Never expose provider responses or credentials.
        logger.error('Media detector internal failure type=%s', type(exc).__name__)
        return dict(status='error', message='Detection failed. Check the file or try again later.', review_required=True)
    finally:
        await media.close()
