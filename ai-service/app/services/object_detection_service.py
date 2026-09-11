"""Lazy COCO detector. Labels describe visible objects, not craft activity."""
from dataclasses import dataclass
import logging
import math
import os
from pathlib import Path
from threading import Lock

import torch

DETECTOR = "yolo11n.pt"
DETECTION_CONFIDENCE = 0.35
MAX_DETECTIONS = 100
CACHE_ROOT = Path(__file__).resolve().parents[2] / ".cache" / "ultralytics"
logger = logging.getLogger(__name__)


class DetectorLoadingError(RuntimeError):
    pass


class DetectionInferenceError(RuntimeError):
    pass


@dataclass(frozen=True)
class Detection:
    class_name: str
    confidence: float
    # Pixel xyxy coordinates relative to the resized analysis frame.
    xyxy: tuple[float, float, float, float]


@dataclass(frozen=True)
class DetectionResult:
    detections: list[Detection]
    detector: str
    inference_device: str


def load_yolo():
    # Configure before lazy import: no settings writes outside this service and
    # no Ultralytics-triggered dependency installation into the existing venv.
    CACHE_ROOT.mkdir(parents=True, exist_ok=True)
    os.environ["YOLO_CONFIG_DIR"] = str(CACHE_ROOT / "config")
    os.environ["YOLO_AUTOINSTALL"] = "false"
    from ultralytics import YOLO
    from ultralytics import utils
    utils.AUTOINSTALL = False
    return YOLO(str(CACHE_ROOT / DETECTOR), task="detect")


class ObjectDetectionService:
    def __init__(self):
        self._lock = Lock()
        self._model = None
        self._device = None
        self._load_failed = False

    def _load(self):
        if self._load_failed:
            raise DetectorLoadingError("YOLO is unavailable; restart the service to retry loading.")
        if self._model is not None:
            return
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            if device == "cpu":
                logger.warning("CUDA is unavailable; YOLO will use CPU inference.")
            model = load_yolo()
            model.to(device)
            self._model, self._device = model, device
        except Exception as exc:
            self._load_failed = True
            logger.error("YOLO loading failed (%s).", type(exc).__name__)
            raise DetectorLoadingError(
                "YOLO could not load. Check weights, network access, and device support; restart to retry."
            ) from None

    def detect(self, bgr_frame) -> DetectionResult:
        with self._lock:
            self._load()
            try:
                with torch.inference_mode():
                    results = self._model.predict(
                        source=bgr_frame, device=self._device, conf=DETECTION_CONFIDENCE,
                        max_det=MAX_DETECTIONS, imgsz=640, verbose=False,
                        save=False, save_txt=False, save_crop=False, stream=False,
                    )
                    if len(results) != 1:
                        raise ValueError("Expected one frame result")
                    result = results[0]
                    detections = []
                    if result.boxes is not None:
                        boxes = result.boxes
                        rows = boxes.xyxy.cpu().tolist()
                        classes = boxes.cls.cpu().tolist()
                        confidences = boxes.conf.cpu().tolist()
                        if not len(rows) == len(classes) == len(confidences):
                            raise ValueError("Invalid detection output")
                        for box, class_id, confidence in zip(rows, classes, confidences):
                            if (not math.isfinite(confidence) or not 0 <= confidence <= 1
                                    or len(box) != 4 or not all(math.isfinite(v) for v in box)
                                    or not math.isfinite(class_id) or class_id != int(class_id)):
                                raise ValueError("Invalid detection values")
                            if confidence >= DETECTION_CONFIDENCE:
                                detections.append(Detection(result.names[int(class_id)], confidence, tuple(box)))
                return DetectionResult(detections, DETECTOR, self._device)
            except Exception as exc:
                logger.error("YOLO inference failed (%s).", type(exc).__name__)
                raise DetectionInferenceError("YOLO inference failed. Check available memory and device support.") from None


object_detection_service = ObjectDetectionService()


def detect_objects(bgr_frame) -> DetectionResult:
    return object_detection_service.detect(bgr_frame)
