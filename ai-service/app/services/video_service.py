"""Sampled temporal visual features, without authenticity classification."""
from contextlib import contextmanager
from dataclasses import dataclass
import math
import logging
from pathlib import Path
from tempfile import TemporaryDirectory
from time import perf_counter

import cv2
from fastapi import HTTPException, UploadFile
from PIL import Image

from app.schemas.video import VideoMetadata, TemporalAnalysis, VideoVerificationResponse
from app.services.embedding_service import embed_image
from app.services.similarity_service import cosine_similarity, SimilarityComputationError


@dataclass(frozen=True)
class VideoLimits:
    max_bytes: int = 100 * 1024 * 1024
    max_duration: float = 60.0
    analysis_width: int = 1920
    analysis_height: int = 1080
    max_source_pixels: int = 50_000_000
    max_fps: float = 240.0
    max_frames: int = 14400
    sampled_frames: int = 8


logger = logging.getLogger("uvicorn.error.video")
DEFAULT_LIMITS = VideoLimits()
TEMP_ROOT = Path(__file__).resolve().parents[2] / ".cache" / "video-uploads"
VIDEO_TYPES = {
    ".mp4": {"video/mp4"}, ".mov": {"video/quicktime"},
    ".avi": {"video/x-msvideo", "video/avi", "video/msvideo"},
    ".webm": {"video/webm"},
}


def sample_frame_indices(total_frames: int, count: int = 8) -> list[int]:
    if total_frames < 2 or count < 2:
        raise ValueError("Temporal analysis requires at least two frames and samples.")
    count = min(count, total_frames)
    return sorted({round((total_frames - 1) * (0.05 + 0.90 * i / (count - 1)))
                   for i in range(count)})


def extract_metadata(capture, limits: VideoLimits) -> VideoMetadata:
    values = [capture.get(prop) for prop in (
        cv2.CAP_PROP_FPS, cv2.CAP_PROP_FRAME_COUNT,
        cv2.CAP_PROP_FRAME_WIDTH, cv2.CAP_PROP_FRAME_HEIGHT)]
    if any(not math.isfinite(v) or v <= 0 for v in values):
        raise HTTPException(400, "Video metadata is missing or invalid.")
    fps, count, width, height = values
    if count != int(count) or width != int(width) or height != int(height) or count < 2:
        raise HTTPException(400, "Video requires valid dimensions and at least two frames.")
    duration = count / fps
    if duration > limits.max_duration:
        raise HTTPException(413, f"Video exceeds the {limits.max_duration:g} second duration limit.")
    if fps > limits.max_fps or count > limits.max_frames or width * height > limits.max_source_pixels:
        raise HTTPException(413, "Video exceeds source resolution, FPS, or frame-count safety limits.")
    return VideoMetadata(duration_seconds=duration, fps=fps, total_frames=int(count),
                         width=int(width), height=int(height))


def streaming_webm_metadata(capture, limits):
    """Browser WebM may omit Duration/Cues. Count bounded decoded frames, never trust a client duration."""
    width, height = capture.get(cv2.CAP_PROP_FRAME_WIDTH), capture.get(cv2.CAP_PROP_FRAME_HEIGHT)
    if any(not math.isfinite(v) or v <= 0 or v != int(v) for v in (width, height)):
        raise HTTPException(400, "Recorded WebM has invalid dimensions.")
    if width * height > limits.max_source_pixels:
        raise HTTPException(413, "Recorded WebM exceeds source safety limits.")
    count = 0
    first_timestamp = None
    last_timestamp = 0.0
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        if frame is None or frame.size == 0:
            raise HTTPException(400, "Recorded WebM decoding failed.")
        analysis_frame(frame, limits)
        count += 1
        timestamp = capture.get(cv2.CAP_PROP_POS_MSEC) / 1000
        if not math.isfinite(timestamp) or timestamp < last_timestamp:
            raise HTTPException(400, "Recorded WebM has invalid timestamps.")
        if first_timestamp is None:
            first_timestamp = timestamp
        last_timestamp = timestamp
        if count > limits.max_frames or timestamp - first_timestamp > limits.max_duration:
            raise HTTPException(413, "Recorded WebM exceeds duration or frame-count safety limits.")
    if count < 2 or last_timestamp <= first_timestamp:
        raise HTTPException(400, "Recorded WebM requires at least two frames with valid timestamps.")
    # Missing WebM timing headers can make OpenCV report the 1000 Hz container
    # timebase as FPS. Use decoded presentation timestamps, not that placeholder.
    fps = (count - 1) / (last_timestamp - first_timestamp)
    duration = count / fps
    if fps > limits.max_fps or duration > limits.max_duration:
        raise HTTPException(413, "Recorded WebM exceeds duration or FPS safety limits.")
    return VideoMetadata(duration_seconds=duration, fps=fps,
        total_frames=count, width=int(width), height=int(height))


class SequentialVideoCapture:
    """Fresh decoder for streaming WebM whose missing index makes random seeks unreliable."""
    def __init__(self, capture):
        self.capture = capture
        self.position = 0

    def release(self):
        self.capture.release()

    def frame_at(self, index):
        if index < self.position:
            raise HTTPException(400, "Streaming video samples must be read in ascending order.")
        while self.position <= index:
            ok, frame = self.capture.read()
            self.position += 1
            if not ok or frame is None or frame.size == 0:
                raise HTTPException(400, "Video frame extraction failed.")
        return frame


def analysis_frame(frame, limits: VideoLimits = DEFAULT_LIMITS):
    """Apply shared source-pixel limits and aspect-preserving analysis resize."""
    height, width = frame.shape[:2]
    if width * height > limits.max_source_pixels:
        raise HTTPException(413, "Decoded video frame exceeds source resolution limit.")
    scale = min(1.0, limits.analysis_width / width, limits.analysis_height / height)
    if scale < 1:
        frame = cv2.resize(frame, (max(1, int(width * scale)), max(1, int(height * scale))),
                           interpolation=cv2.INTER_AREA)
    return frame


def frame_embedding(frame, limits: VideoLimits):
    frame = analysis_frame(frame, limits)
    with Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)) as image:
        return embed_image(image)


def temporal_metrics(embeddings) -> TemporalAnalysis:
    if len(embeddings) < 2:
        raise SimilarityComputationError("Temporal analysis requires at least two embeddings.")
    similarities = [cosine_similarity(a.vector, b.vector)
                    for a, b in zip(embeddings, embeddings[1:])]
    changes = [1 - score for score in similarities]
    return TemporalAnalysis(
        consecutive_similarities=similarities,
        average_consecutive_similarity=sum(similarities) / len(similarities),
        minimum_consecutive_similarity=min(similarities),
        maximum_consecutive_similarity=max(similarities),
        average_visual_change=sum(changes) / len(changes),
        maximum_visual_change=max(changes),
    )


@contextmanager
def validated_video(video: UploadFile, limits: VideoLimits = DEFAULT_LIMITS):
    """Own temporary storage and capture lifetime for all video consumers."""
    suffix = Path(video.filename or "").suffix.lower()
    mime = (video.content_type or "").split(";", 1)[0].strip().lower()
    if suffix not in VIDEO_TYPES or mime not in VIDEO_TYPES[suffix] | {"application/octet-stream", ""}:
        raise HTTPException(415, "Unsupported video format. Use MP4, MOV, AVI, or WebM with a matching MIME type.")
    try:
        TEMP_ROOT.mkdir(parents=True, exist_ok=True)
        with TemporaryDirectory(prefix="video-", dir=TEMP_ROOT) as directory:
            path = Path(directory) / ("upload" + suffix)
            size = 0
            with path.open("wb") as output:
                while True:
                    chunk = video.file.read(min(1024 * 1024, limits.max_bytes - size + 1))
                    if not chunk:
                        break
                    size += len(chunk)
                    if size > limits.max_bytes:
                        raise HTTPException(413, "Video exceeds the upload file-size limit.")
                    output.write(chunk)
            if not size:
                raise HTTPException(400, "Video is empty.")
            with path.open("rb") as source:
                header = source.read(12)
            container = "EBML (WebM/Matroska)" if header.startswith(b"\x1a\x45\xdf\xa3") else "ISO BMFF (MP4/MOV)" if header[4:8] == b"ftyp" else "unknown"
            logger.info("Container signature: %s", container)
            logger.info("Video received: filename=%r content_type=%r bytes=%d expected_container=%s",
                video.filename, video.content_type, size, suffix)
            capture = cv2.VideoCapture(str(path))
            try:
                if not capture.isOpened():
                    raise HTTPException(400, "Video is corrupt or its codec is unsupported.")
                count = capture.get(cv2.CAP_PROP_FRAME_COUNT)
                if suffix == ".webm" and (not math.isfinite(count) or count < 2 or count > limits.max_frames):
                    logger.info("Streaming WebM metadata: reported_fps=%s reported_frames=%s",
                        capture.get(cv2.CAP_PROP_FPS), count)
                    metadata = streaming_webm_metadata(capture, limits)
                    capture.release()
                    capture = cv2.VideoCapture(str(path))
                    if not capture.isOpened():
                        raise HTTPException(400, "Recorded WebM could not be reopened for sampling.")
                    capture = SequentialVideoCapture(capture)
                else:
                    metadata = extract_metadata(capture, limits)
                yield capture, metadata
            finally:
                capture.release()
    except HTTPException as exc:
        logger.warning("Video validation failed: filename=%r content_type=%r status=%s detail=%s",
            video.filename, video.content_type, exc.status_code, exc.detail)
        raise
    except cv2.error:
        logger.exception("OpenCV video decoding failed: filename=%r", video.filename)
        raise HTTPException(400, "Video decoding or frame extraction failed.") from None
    except OSError:
        raise HTTPException(500, "Temporary video storage failed.") from None


def sampled_frames(capture, indices):
    """Yield decoded BGR samples for either embedding or object detection."""
    for index in indices:
        if isinstance(capture, SequentialVideoCapture):
            yield capture.frame_at(index)
            continue
        if not capture.set(cv2.CAP_PROP_POS_FRAMES, index):
            raise HTTPException(400, "Video frame seeking failed.")
        ok, frame = capture.read()
        if not ok or frame is None or frame.size == 0:
            raise HTTPException(400, "Video frame extraction failed.")
        yield frame


def sampled_embeddings(capture, indices, limits: VideoLimits = DEFAULT_LIMITS):
    for frame in sampled_frames(capture, indices):
        yield frame_embedding(frame, limits)


def analyze_video(video: UploadFile, limits: VideoLimits = DEFAULT_LIMITS) -> VideoVerificationResponse:
    started = perf_counter()
    with validated_video(video, limits) as (capture, metadata):
        indices = sample_frame_indices(metadata.total_frames, limits.sampled_frames)
        embeddings = list(sampled_embeddings(capture, indices, limits))
        first = embeddings[0]
        if any(e.model != first.model or e.inference_device != first.inference_device for e in embeddings):
            raise SimilarityComputationError("Video frame embeddings are incompatible.")
        metrics = temporal_metrics(embeddings)
    return VideoVerificationResponse(
        filename=video.filename or "upload", video_metadata=metadata,
        frames_analyzed=len(indices), timestamps_seconds=[i / metadata.fps for i in indices],
        model=first.model, embedding_dimension=first.vector.numel(),
        inference_device=first.inference_device, temporal_analysis=metrics,
        processing_time_ms=round((perf_counter() - started) * 1000, 3),
    )
