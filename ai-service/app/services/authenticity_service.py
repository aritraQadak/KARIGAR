"""Dedicated Sightengine detection; never reuse craft heuristics as probabilities."""
import hashlib
from contextlib import closing
import io
import json
import logging
import math
import os
import sqlite3
import threading
import time
import urllib.request
import urllib.error
import uuid
from pathlib import Path

from PIL import Image

CACHE_PATH = Path(__file__).resolve().parents[2] / '.cache' / 'authenticity.sqlite3'
LOCK = threading.Lock()
TTL = 86400
logger = logging.getLogger(__name__)


class DetectorError(ValueError):
    def __init__(self, message, category='provider_error', code=None):
        super().__init__(message)
        self.category = category
        self.code = code if type(code) is int else None


def provider_error(payload, status=None):
    error = payload.get('error', {}) if isinstance(payload, dict) else {}
    if not isinstance(error, dict):
        error = {}
    category = error.get('type')
    messages = {
        'plan_error': 'Sightengine account access does not allow this request. Check your plan and image detection access in the Sightengine dashboard.',
        'usage_limit': 'Sightengine API quota is exhausted. Check your usage or wait for the quota to reset before retrying.',
        'credentials_error': 'Sightengine rejected the credentials. Check the backend API user and secret, then restart the AI service.',
        'media_error': 'Sightengine could not process this video or image. Try exporting the video as an H.264 MP4 and uploading it again.',
        'argument_error': 'Sightengine rejected a request parameter. Check the detector configuration and report the error code.',
    }
    message = messages.get(category)
    if message is None:
        category = 'rate_limit' if status == 429 else 'provider_error'
        message = 'Sightengine is rate limiting requests. Wait before retrying.' if status == 429 else 'Sightengine could not complete detection. Try again later.'
    return DetectorError(message, category, error.get('code'))


def provider_request(data, mime, filename, params, timeout=90):
    boundary = uuid.uuid4().hex
    parts = []
    for name, value in params.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    # Generated filename avoids user-controlled multipart headers.
    suffix = Path(filename).suffix.lower()
    if suffix not in ('.mp4', '.mov', '.webm', '.avi', '.jpg', '.jpeg', '.png', '.webp'):
        suffix = '.jpg'
    parts.extend([f'--{boundary}\r\nContent-Disposition: form-data; name="media"; filename="media{suffix}"\r\nContent-Type: {mime}\r\n\r\n'.encode(), data,
                  f'\r\n--{boundary}--\r\n'.encode()])
    request = urllib.request.Request('https://api.sightengine.com/1.0/check.json',
        data=b''.join(parts), headers={'Content-Type':f'multipart/form-data; boundary={boundary}'}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.loads(response.read(2 * 1024 * 1024))
    except urllib.error.HTTPError as exc:
        try:
            payload = json.loads(exc.read(16000))
        except (ValueError, OSError):
            payload = {}
        finally:
            exc.close()
        raise provider_error(payload, exc.code) from None
    except (TimeoutError, urllib.error.URLError):
        raise DetectorError('Sightengine could not be reached or timed out. Check the AI server internet connection and retry.', 'connection_error') from None
    except ValueError:
        raise DetectorError('Sightengine returned an unreadable response. Try again later.', 'invalid_response') from None
    if not isinstance(payload, dict) or payload.get('status') != 'success':
        raise provider_error(payload)
    return payload


def configuration():
    names = ('SIGHTENGINE_API_USER', 'SIGHTENGINE_API_SECRET', 'SIGHTENGINE_DETECTOR_VERSION')
    path = Path(__file__).resolve().parents[3] / '.env'
    if path.is_file():
        for line in path.read_text(encoding='utf-8-sig').splitlines():
            key, sep, value = line.strip().partition('=')
            if sep and key.strip() in names:
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
    return [os.environ.get(name, '') for name in names]


def normalize(payload):
    if not isinstance(payload, dict) or payload.get('status') != 'success':
        raise provider_error(payload)
    score = payload.get('type', {}).get('ai_generated')
    if type(score) not in (float, int) or not math.isfinite(score) or not 0 <= score <= 1:
        raise ValueError('Invalid detector score')
    label = 'Likely AI-generated' if score >= .9 else 'Likely camera-captured' if score <= .1 else 'Inconclusive'
    return dict(status='success', label=label, ai_score=score, review_required=label != 'Likely camera-captured',
                scope='image', frames_analyzed=None)


VIDEO_POLICY = 'frames-v1:3-5-8:midpoints:jpeg90:max1280:unanimous-0.1-0.9'


def frame_indices(duration, total_frames):
    count = 3 if duration <= 15 else 5 if duration <= 30 else 8
    count = min(count, total_frames)
    return [min(total_frames - 1, int((i + .5) * total_frames / count)) for i in range(count)]


def extract_video_frames(data, mime, filename):
    import cv2
    from fastapi import UploadFile
    from starlette.datastructures import Headers
    from app.services.video_service import validated_video, sampled_frames
    with io.BytesIO(data) as stream:
        upload = UploadFile(stream, filename=filename, headers=Headers({'content-type': mime}))
        with validated_video(upload) as (capture, metadata):
            indices = frame_indices(metadata.duration_seconds, metadata.total_frames)
            frames = []
            for frame in sampled_frames(capture, indices):
                height, width = frame.shape[:2]
                scale = min(1, 1280 / max(height, width))
                if scale < 1:
                    frame = cv2.resize(frame, (max(1, round(width * scale)), max(1, round(height * scale))))
                ok, encoded = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                if not ok:
                    raise ValueError('Video frame encoding failed')
                frames.append(encoded.tobytes())
            return frames


def aggregate(scores, expected):
    complete = len(scores) == expected and expected > 0
    label = 'Inconclusive'
    if complete and all(s >= .9 for s in scores):
        label = 'Likely AI-generated'
    elif complete and all(s <= .1 for s in scores):
        label = 'Likely camera-captured'
    return dict(status='success', label=label, review_required=label != 'Likely camera-captured',
                scope='sampled_frames', retryable=not complete)


def cached_result(db, key):
    row = db.execute('SELECT result FROM results WHERE key = ? AND created >= ?', (key, time.time() - TTL)).fetchone()
    return json.loads(row[0]) if row else None


def save_result(db, key, result):
    db.execute('INSERT OR REPLACE INTO results VALUES (?, ?, ?)', (key, time.time(), json.dumps(result)))
    # Keep successful frame calls even if a later frame fails.
    db.commit()


def analyze_frames(db, frames, version, params):
    scores = []
    deadline = time.monotonic() + 95
    for frame in frames:
        key = version + ':frame:' + hashlib.sha256(frame).hexdigest()
        result = cached_result(db, key)
        if result is None:
            remaining = deadline - time.monotonic()
            if remaining <= 1:
                break
            try:
                result = normalize(provider_request(frame, 'image/jpeg', 'frame.jpg', params, timeout=min(25, remaining)))
                save_result(db, key, result)
            except (DetectorError, ValueError) as exc:
                # Stop this batch on any failure, including quota/credentials.
                # Retry resumes using successful frame cache entries.
                logger.warning('Frame detection stopped category=%s code=%s',
                               getattr(exc, 'category', 'invalid_response'), getattr(exc, 'code', None))
                break
        scores.append(result['ai_score'])
    result = aggregate(scores, len(frames))
    if result['retryable']:
        result['message'] = 'Analysis could not be completed. Please try again later.'
    return result


def detector_version(revision, video):
    return 'sightengine:genai:' + (revision or 'hosted') + (':' + VIDEO_POLICY if video else ':policy-v1:interval-5')


def publication_eligibility(files):
    # Read only: callers supply file hashes, never labels or detector policy.
    revision = configuration()[2]
    if not CACHE_PATH.is_file() or not files:
        return False
    with closing(sqlite3.connect(f'{CACHE_PATH.as_uri()}?mode=ro', uri=True)) as db:
        for item in files:
            video = item['kind'] == 'video'
            version = detector_version(revision, video)
            digest = item['sha256']
            result = cached_result(db, f'{version}:{video}:{digest}')
            if (not result or result.get('status') != 'success'
                    or result.get('label') != 'Likely camera-captured'
                    or result.get('retryable') or result.get('review_required') is not False
                    or result.get('sha256') != digest or result.get('detector_version') != version):
                return False
    return True


def analyze(data, mime, filename):
    user, secret, revision = configuration()
    if not user or not secret:
        return dict(status='unavailable', message='Detection unavailable: Sightengine credentials are not configured.', review_required=True)
    video = mime.startswith('video/') or Path(filename).suffix.lower() in ('.mp4', '.webm', '.mov', '.avi')
    version = detector_version(revision, video)
    digest = hashlib.sha256(data).hexdigest()
    key = f'{version}:{video}:{digest}'
    # One active batch per process, with no unbounded request queue.
    if not LOCK.acquire(blocking=False):
        return dict(status='error', message='Another analysis is running. Please retry shortly.', review_required=True)
    try:
        CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with closing(sqlite3.connect(CACHE_PATH)) as db:
            db.execute('CREATE TABLE IF NOT EXISTS results (key TEXT PRIMARY KEY, created REAL, result TEXT)')
            db.execute('DELETE FROM results WHERE created < ?', (time.time() - TTL,))
            db.commit()
            saved = cached_result(db, key)
            if saved:
                return {**saved, 'cached': True}
            params = dict(models='genai', api_user=user, api_secret=secret)
            if video:
                frames = extract_video_frames(data, mime, filename)
                result = analyze_frames(db, frames, version, params)
            else:
                with Image.open(io.BytesIO(data)) as img:
                    if img.format not in ('JPEG', 'PNG', 'WEBP') or img.width * img.height > 50_000_000:
                        raise ValueError('Unsupported image')
                    img.verify()
                result = normalize(provider_request(data, mime, filename, params))
            result.update(detector_version=version, sha256=digest, analyzed_at=time.time(), cached=False)
            if not result.get('retryable'):
                save_result(db, key, result)
            return result
    finally:
        LOCK.release()
