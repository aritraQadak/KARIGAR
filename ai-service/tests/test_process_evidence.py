from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

import numpy as np
import torch
from fastapi.testclient import TestClient

from app.main import app
from app.services.object_detection_service import (
    ObjectDetectionService, Detection, DetectionResult, DetectorLoadingError, DetectionInferenceError,
)
from app.services.process_evidence_service import summarize_detections


def result(detections):
    return DetectionResult(detections, "yolo11n.pt", "cpu")


def detection(name, confidence):
    return Detection(name, confidence, (0, 0, 10, 10))


class DetectorTests(unittest.TestCase):
    def setUp(self):
        self.service = ObjectDetectionService()
        self.model = MagicMock()
        self.prediction = SimpleNamespace(names={0: "person", 56: "chair"}, boxes=SimpleNamespace(
            xyxy=torch.tensor([[0, 0, 10, 10]] * 3), cls=torch.tensor([0, 0, 56]),
            conf=torch.tensor([0.9, 0.2, 0.8]),
        ))
        self.model.predict.return_value = [self.prediction]
        patcher = patch("app.services.object_detection_service.load_yolo", return_value=self.model)
        self.loader = patcher.start()
        self.addCleanup(patcher.stop)
        patcher = patch("app.services.object_detection_service.torch.cuda.is_available", return_value=False)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.frame = np.zeros((24, 32, 3), dtype=np.uint8)

    def test_lazy_single_load_and_prediction_parsing(self):
        self.loader.assert_not_called()
        for _ in range(2):
            output = self.service.detect(self.frame)
        self.loader.assert_called_once()
        self.model.to.assert_called_once_with("cpu")
        self.assertEqual(output.inference_device, "cpu")
        self.assertEqual([d.class_name for d in output.detections], ["person", "chair"])
        self.assertEqual(output.detections[0].xyxy, (0, 0, 10, 10))
        self.assertEqual(self.model.predict.call_args.kwargs["conf"], 0.35)
        self.assertFalse(self.model.predict.call_args.kwargs["save"])

    def test_concurrent_single_load(self):
        with ThreadPoolExecutor(max_workers=3) as pool:
            list(pool.map(self.service.detect, [self.frame] * 3))
        self.loader.assert_called_once()

    def test_cuda_selection(self):
        with patch("app.services.object_detection_service.torch.cuda.is_available", return_value=True):
            output = self.service.detect(self.frame)
        self.model.to.assert_called_once_with("cuda")
        self.assertEqual(output.inference_device, "cuda")
        self.assertEqual(self.model.predict.call_args.kwargs["device"], "cuda")

    def test_loading_failure_cached(self):
        self.loader.side_effect = OSError("private detail")
        for _ in range(2):
            with self.assertRaises(DetectorLoadingError) as caught:
                self.service.detect(self.frame)
            self.assertNotIn("private", str(caught.exception))
        self.loader.assert_called_once()

    def test_inference_mode_and_failure(self):
        def predict(**kwargs):
            self.assertTrue(torch.is_inference_mode_enabled())
            raise RuntimeError("private detail")
        self.model.predict.side_effect = predict
        with self.assertRaises(DetectionInferenceError) as caught:
            self.service.detect(self.frame)
        self.assertNotIn("private", str(caught.exception))

    def test_empty_boxes(self):
        self.prediction.boxes = None
        self.assertEqual(self.service.detect(self.frame).detections, [])


class EvidenceTests(unittest.TestCase):
    def test_multiple_people_and_class_aggregation(self):
        outputs = [result([detection("person", .9), detection("person", .7), detection("chair", .8)]),
                   result([detection("chair", .6)]), result([detection("person", .8)])]
        person, frames, summary = summarize_detections([1, 2, 3], outputs)
        self.assertEqual(person.frames_with_person, 2)
        self.assertEqual(person.person_presence_ratio, 2 / 3)
        self.assertAlmostEqual(person.average_person_confidence, .8)
        self.assertEqual(person.maximum_person_confidence, .9)
        self.assertEqual(frames[0].person_count, 2)
        self.assertEqual(frames[0].highest_person_confidence, .9)
        self.assertEqual([s.model_dump() for s in summary], [
            {"class_name": "chair", "frames_detected": 2, "max_confidence": .8},
            {"class_name": "person", "frames_detected": 2, "max_confidence": .9}])

    def test_zero_people(self):
        person, frames, summary = summarize_detections([1, 2], [result([]), result([])])
        self.assertEqual(person.person_presence_ratio, 0)
        self.assertIsNone(person.average_person_confidence)
        self.assertIsNone(person.maximum_person_confidence)
        self.assertEqual(frames[0].person_count, 0)
        self.assertIsNone(frames[0].highest_person_confidence)
        self.assertEqual(summary, [])

    def test_endpoint(self):
        released = []
        @contextmanager
        def video_context(upload):
            try:
                yield MagicMock(), SimpleNamespace(total_frames=300, fps=30)
            finally:
                released.append(True)
        with TestClient(app) as client, \
                patch("app.services.process_evidence_service.validated_video", video_context), \
                patch("app.services.process_evidence_service.sampled_frames", return_value=[np.zeros((24, 32, 3), dtype=np.uint8)] * 8), \
                patch("app.services.process_evidence_service.detect_objects", return_value=result([detection("person", .9)])) as detect:
            response = client.post("/verify/video-process-evidence", files={"video": ("craft.mp4", b"mock", "video/mp4")})
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["frames_analyzed"], 8)
        self.assertEqual(len(body["frame_results"]), 8)
        self.assertEqual(body["person_analysis"]["person_presence_ratio"], 1)
        self.assertEqual(detect.call_count, 8)
        self.assertEqual(released, [True])
        self.assertEqual(set(body), {"filename", "frames_analyzed", "timestamps_seconds", "detector",
            "inference_device", "person_analysis", "frame_results", "detected_classes_summary", "processing_time_ms"})

    def test_endpoint_errors(self):
        with TestClient(app) as client:
            response = client.post("/verify/video-process-evidence", files={"video": ("bad.txt", b"x", "text/plain")})
            self.assertEqual(response.status_code, 415)
            for error, status in ((DetectorLoadingError("Unavailable"), 503),
                                  (DetectionInferenceError("Inference failed"), 500)):
                with patch("app.routes.verification.analyze_process_evidence", side_effect=error):
                    response = client.post("/verify/video-process-evidence", files={"video": ("craft.mp4", b"x", "video/mp4")})
                    self.assertEqual(response.status_code, status)


if __name__ == "__main__":
    unittest.main()
