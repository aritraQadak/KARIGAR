"""CPU MediaPipe Tasks hand evidence; no tracking or identity inference."""
import atexit
from dataclasses import dataclass
import math
from pathlib import Path
from tempfile import NamedTemporaryFile
from threading import Lock
from urllib.request import urlopen

import cv2

MODEL_PATH = Path(__file__).resolve().parents[2] / ".cache" / "mediapipe" / "hand_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
MAX_MODEL_BYTES = 32 * 1024 * 1024
MAX_HANDS = 2
MIN_DETECTION_CONFIDENCE = 0.30
MIN_PRESENCE_CONFIDENCE = 0.30
MIN_HANDEDNESS_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.30  # Explicit for reproducibility; inactive in IMAGE mode.
HAND_LONG_EDGE = 1280
CROP_FALLBACK_ENABLED = True
# Normalized left/right/center regions. At most three extra detector calls.
CROP_REGIONS = ((0.0, 0.0, 0.6, 1.0), (0.4, 0.0, 1.0, 1.0), (0.2, 0.1, 0.8, 0.9))
DUPLICATE_LANDMARK_DISTANCE = 0.08


def hand_detection_config(frames_requested):
    return {"frames_requested": frames_requested, "num_hands": MAX_HANDS,
        "detection_threshold": MIN_DETECTION_CONFIDENCE, "presence_threshold": MIN_PRESENCE_CONFIDENCE,
        "tracking_threshold": MIN_TRACKING_CONFIDENCE, "running_mode": "IMAGE",
        "handedness_threshold": MIN_HANDEDNESS_CONFIDENCE, "long_edge": HAND_LONG_EDGE,
        "crop_fallback_enabled": CROP_FALLBACK_ENABLED, "maximum_crop_passes": len(CROP_REGIONS),
        "neighbor_retry_enabled": False}


def prepare_hand_frame(frame):
    height, width = frame.shape[:2]
    scale = min(1.0, HAND_LONG_EDGE / max(height, width))
    if scale < 1:
        return cv2.resize(frame, (max(1, round(width * scale)), max(1, round(height * scale))), interpolation=cv2.INTER_AREA)
    return frame.copy()


def merge_crop_hands(merged, hands, region):
    x0, y0, x1, y1 = region
    for hand in hands:
        points = tuple((x0 + x * (x1-x0), y0 + y * (y1-y0), z * (x1-x0)) for x,y,z in hand.landmarks)
        duplicate = any(sum(math.hypot(a[0]-b[0], a[1]-b[1]) for a,b in zip(points, old.landmarks)) / len(points)
                        <= DUPLICATE_LANDMARK_DISTANCE for old in merged)
        if not duplicate and len(merged) < MAX_HANDS:
            merged.append(Hand(hand.handedness, points, "crop_fallback"))
    return merged



class HandLoadingError(RuntimeError):
    pass


class HandInferenceError(RuntimeError):
    pass


@dataclass(frozen=True)
class Hand:
    handedness: str | None
    # Model image-normalized x/y and relative depth z, never public.
    landmarks: tuple[tuple[float, float, float], ...]
    detection_source: str = "full_frame"


def ensure_model():
    if MODEL_PATH.is_file():
        return
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    partial = None
    try:
        with NamedTemporaryFile(dir=MODEL_PATH.parent, suffix=".partial", delete=False) as output:
            partial = Path(output.name)
            with urlopen(MODEL_URL, timeout=30) as response:
                size = 0
                while chunk := response.read(1024 * 1024):
                    size += len(chunk)
                    if size > MAX_MODEL_BYTES:
                        raise ValueError("Hand model download exceeds safety limit")
                    output.write(chunk)
                if size == 0:
                    raise ValueError("Empty hand model")
        partial.replace(MODEL_PATH)
    finally:
        if partial is not None:
            partial.unlink(missing_ok=True)


def create_backend():
    try:
        import mediapipe as mp
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision
    except ImportError:
        raise HandLoadingError("MediaPipe Tasks is unavailable in this interpreter. No packages were installed; use a compatible runtime and restart.") from None
    ensure_model()
    options = vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(MODEL_PATH), delegate=python.BaseOptions.Delegate.CPU),
        running_mode=vision.RunningMode.IMAGE, num_hands=MAX_HANDS,
        min_hand_detection_confidence=MIN_DETECTION_CONFIDENCE,
        min_hand_presence_confidence=MIN_PRESENCE_CONFIDENCE,
        min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
    )
    return mp, vision.HandLandmarker.create_from_options(options)


def parse_hands(result):
    hands = []
    for index, landmarks in enumerate(result.hand_landmarks):
        if len(landmarks) != 21:
            raise ValueError("Invalid hand landmarks")
        coordinates = tuple((float(p.x), float(p.y), float(p.z)) for p in landmarks)
        if not all(math.isfinite(v) for point in coordinates for v in point):
            raise ValueError("Non-finite hand landmarks")
        label = None
        candidates = result.handedness[index] if index < len(result.handedness) else []
        if candidates:
            candidate = max(candidates, key=lambda c: c.score)
            if (candidate.category_name in ("Left", "Right") and math.isfinite(candidate.score)
                    and MIN_HANDEDNESS_CONFIDENCE <= candidate.score <= 1):
                label = candidate.category_name
        hands.append(Hand(label, coordinates))
    return hands


class HandDetectionService:
    def __init__(self):
        self._lock = Lock()
        self._backend = None
        self._module = None
        self._load_error = None

    def detect(self, bgr_frame):
        with self._lock:
            if self._load_error:
                raise HandLoadingError(self._load_error)
            if self._backend is None:
                try:
                    self._module, self._backend = create_backend()
                except Exception as exc:
                    self._load_error = str(exc) if isinstance(exc, HandLoadingError) else "Hand model loading failed. Check MediaPipe compatibility, network access, and cached model; restart to retry."
                    raise HandLoadingError(self._load_error) from None
            try:
                def run(frame):
                    rgb = cv2.cvtColor(prepare_hand_frame(frame), cv2.COLOR_BGR2RGB)
                    image = self._module.Image(image_format=self._module.ImageFormat.SRGB, data=rgb)
                    return parse_hands(self._backend.detect(image))
                hands = run(bgr_frame)
                if hands or not CROP_FALLBACK_ENABLED:
                    return hands[:MAX_HANDS]
                height, width = bgr_frame.shape[:2]
                merged = []
                for x0, y0, x1, y1 in CROP_REGIONS:
                    left, top = int(x0 * width), int(y0 * height)
                    right, bottom = int(x1 * width), int(y1 * height)
                    if right <= left or bottom <= top:
                        continue
                    crop = bgr_frame[top:bottom, left:right]
                    merge_crop_hands(merged, run(crop), (left/width, top/height, right/width, bottom/height))
                    if len(merged) >= MAX_HANDS:
                        break
                return merged
            except Exception:
                raise HandInferenceError("Hand inference failed; hand evidence is unavailable.") from None

    def close(self):
        with self._lock:
            if self._backend is not None:
                self._backend.close()
                self._backend = None


hand_detection_service = HandDetectionService()
atexit.register(hand_detection_service.close)


def detect_hands(bgr_frame):
    return hand_detection_service.detect(bgr_frame)
