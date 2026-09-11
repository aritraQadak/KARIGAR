from dataclasses import replace
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

import cv2
import numpy as np
import torch
from fastapi.testclient import TestClient

from app.main import app
from app.services.embedding_service import EmbeddingInferenceError
from app.services.video_service import (DEFAULT_LIMITS, sample_frame_indices,
    temporal_metrics, frame_embedding)


class VideoTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.addCleanup(self.client.close)
        self.temp = TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.capture = MagicMock()
        self.capture.isOpened.return_value = True
        self.capture.set.return_value = True
        self.capture.read.return_value = (True, np.zeros((24, 32, 3), dtype=np.uint8))
        self.values = {cv2.CAP_PROP_FPS: 30, cv2.CAP_PROP_FRAME_COUNT: 300,
                       cv2.CAP_PROP_FRAME_WIDTH: 32, cv2.CAP_PROP_FRAME_HEIGHT: 24}
        self.capture.get.side_effect = self.values.get
        unit = torch.zeros(384)
        unit[0] = 1
        self.embedding = SimpleNamespace(vector=unit, model="facebook/dinov2-small", inference_device="cpu")
        for target, kwargs in (
            ("TEMP_ROOT", {"new": self.root}),
            ("cv2.VideoCapture", {"return_value": self.capture}),
            ("embed_image", {"return_value": self.embedding}),
        ):
            patcher = patch("app.services.video_service." + target, **kwargs)
            mocked = patcher.start()
            self.addCleanup(patcher.stop)
            if target == "embed_image":
                self.embed = mocked

    def upload(self, data=b"mock video", name="craft.mp4", mime="video/mp4"):
        return self.client.post("/verify/video", files={"video": (name, data, mime)})

    def assert_clean(self):
        self.assertEqual(list(self.root.iterdir()), [])

    def test_valid_metadata_and_cleanup(self):
        response = self.upload()
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["video_metadata"], {"duration_seconds": 10, "fps": 30,
            "total_frames": 300, "width": 32, "height": 24})
        self.assertEqual(body["frames_analyzed"], 8)
        self.assertEqual(len(body["timestamps_seconds"]), 8)
        self.assertEqual(body["temporal_analysis"]["consecutive_similarities"], [1.0] * 7)
        self.assertEqual(body["temporal_analysis"]["average_visual_change"], 0)
        self.assertEqual(self.embed.call_count, 8)
        self.assertEqual(set(body), {"filename", "video_metadata", "frames_analyzed",
            "timestamps_seconds", "model", "embedding_dimension", "inference_device",
            "temporal_analysis", "processing_time_ms"})
        self.capture.release.assert_called_once()
        self.assert_clean()

    def test_invalid_type(self):
        for name, mime in (("bad.txt", "text/plain"), ("bad.mp4", "image/png")):
            self.assertEqual(self.upload(name=name, mime=mime).status_code, 415)
        self.embed.assert_not_called()
        self.assert_clean()

    def test_empty(self):
        self.assertEqual(self.upload(data=b"").status_code, 400)
        self.assert_clean()

    def test_corrupt(self):
        self.capture.isOpened.return_value = False
        self.assertEqual(self.upload().status_code, 400)
        self.capture.release.assert_called_once()
        self.assert_clean()

    def test_duration_limit(self):
        self.values[cv2.CAP_PROP_FRAME_COUNT] = 1801
        self.assertEqual(self.upload().status_code, 413)
        self.embed.assert_not_called()
        self.assert_clean()

    def test_bad_metadata(self):
        for value in (0, float("nan"), float("inf")):
            self.values[cv2.CAP_PROP_FPS] = value
            self.assertEqual(self.upload().status_code, 400)
            self.assert_clean()

    def test_extraction_failure(self):
        self.capture.read.return_value = (False, None)
        self.assertEqual(self.upload().status_code, 400)
        self.capture.release.assert_called_once()
        self.assert_clean()

    def test_inference_failure_cleanup(self):
        self.embed.side_effect = EmbeddingInferenceError("Inference failed")
        self.assertEqual(self.upload().status_code, 500)
        self.capture.release.assert_called_once()
        self.assert_clean()

    def test_file_limit(self):
        from app.services.video_service import analyze_video
        from fastapi import UploadFile, HTTPException
        from starlette.datastructures import Headers
        from io import BytesIO
        upload = UploadFile(BytesIO(b"123456"), filename="craft.mp4", headers=Headers({"content-type": "video/mp4"}))
        try:
            with self.assertRaises(HTTPException) as caught:
                analyze_video(upload, replace(DEFAULT_LIMITS, max_bytes=5))
            self.assertEqual(caught.exception.status_code, 413)
            self.assert_clean()
        finally:
            upload.file.close()

    def test_sampling(self):
        indices = sample_frame_indices(300)
        self.assertEqual(len(indices), 8)
        self.assertEqual(indices[0], 15)
        self.assertEqual(indices[-1], 284)
        self.assertEqual(indices, sorted(set(indices)))
        self.assertEqual(sample_frame_indices(2), [0, 1])
        self.assertEqual(len(sample_frame_indices(300, 4)), 4)
        with self.assertRaises(ValueError):
            sample_frame_indices(1)

    def test_temporal_change(self):
        other = torch.zeros(384)
        other[1] = 1
        result = temporal_metrics([self.embedding, self.embedding,
            SimpleNamespace(vector=other)])
        self.assertEqual(result.consecutive_similarities, [1, 0])
        self.assertEqual(result.average_consecutive_similarity, 0.5)
        self.assertEqual(result.minimum_consecutive_similarity, 0)
        self.assertEqual(result.maximum_consecutive_similarity, 1)
        self.assertEqual(result.average_visual_change, 0.5)
        self.assertEqual(result.maximum_visual_change, 1)

    def test_resize_and_bgr_conversion(self):
        frame = np.zeros((120, 240, 3), dtype=np.uint8)
        frame[:, :, 2] = 255
        observed = []
        def embedding(image):
            observed.append((image.size, image.getpixel((0, 0))))
            return self.embedding
        self.embed.side_effect = embedding
        frame_embedding(frame, replace(DEFAULT_LIMITS, analysis_width=192, analysis_height=108))
        self.assertEqual(observed, [((192, 96), (255, 0, 0))])


if __name__ == "__main__":
    unittest.main()
