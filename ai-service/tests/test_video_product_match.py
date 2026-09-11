from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import MagicMock, patch

import cv2
import numpy as np
from PIL import Image
import torch
from fastapi.testclient import TestClient

from app.main import app
from app.services.embedding_service import EmbeddingResult, EmbeddingInferenceError
from app.services.video_product_match_service import final_frame_indices, interpret_match


class VideoProductMatchTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.addCleanup(self.client.close)
        temp = TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        buffer = BytesIO()
        with Image.new("RGB", (32, 24)) as image:
            image.save(buffer, format="PNG")
        self.png = buffer.getvalue()
        self.capture = MagicMock()
        self.capture.isOpened.return_value = True
        self.capture.set.return_value = True
        self.capture.read.return_value = (True, np.zeros((24, 32, 3), dtype=np.uint8))
        self.capture.get.side_effect = {cv2.CAP_PROP_FPS: 30, cv2.CAP_PROP_FRAME_COUNT: 300,
            cv2.CAP_PROP_FRAME_WIDTH: 32, cv2.CAP_PROP_FRAME_HEIGHT: 24}.get
        targets = {
            "app.services.video_service.TEMP_ROOT": {"new": self.root},
            "app.services.video_service.cv2.VideoCapture": {"return_value": self.capture},
            "app.services.video_product_match_service.embed_image": {"return_value": self.embedding(1)},
            "app.services.video_service.embed_image": {"side_effect": [self.embedding(s) for s in (0.2, 0.7, 0.9, 0.8)]},
        }
        for target, kwargs in targets.items():
            patcher = patch(target, **kwargs)
            mocked = patcher.start()
            self.addCleanup(patcher.stop)
            if target == "app.services.video_service.embed_image":
                self.frame_embed = mocked
            elif target.endswith(".embed_image"):
                self.product_embed = mocked

    def embedding(self, score):
        vector = torch.zeros(384)
        vector[0], vector[1] = score, (1 - score * score) ** 0.5
        return EmbeddingResult(vector, "facebook/dinov2-small", "cpu")

    def upload(self, product=None, video_name="craft.mp4"):
        return self.client.post("/verify/video-product-match", files={
            "video": (video_name, b"mock video", "video/mp4"),
            "product_image": ("listing.png", self.png if product is None else product, "image/png"),
        })

    def test_valid_best_average_and_timestamp(self):
        response = self.upload()
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["video"], {"filename": "craft.mp4", "duration_seconds": 10})
        self.assertEqual(body["product_image"], {"filename": "listing.png", "width": 32, "height": 24})
        self.assertEqual(body["final_frames_analyzed"], 4)
        self.assertAlmostEqual(body["best_similarity"], 0.9, places=6)
        self.assertAlmostEqual(body["average_similarity"], 0.65, places=6)
        self.assertEqual(body["best_matching_timestamp"], 269 / 30)
        self.assertEqual(body["interpretation"], "high_visual_match")
        self.assertEqual([x["timestamp_seconds"] for x in body["frame_product_similarities"]],
                         [i / 30 for i in (209, 239, 269, 284)])
        self.assertEqual(set(body), {"video", "product_image", "model", "embedding_dimension",
            "inference_device", "final_frames_analyzed", "frame_product_similarities",
            "best_similarity", "average_similarity", "best_matching_timestamp",
            "interpretation", "processing_time_ms"})
        self.product_embed.assert_called_once()
        self.assertEqual(self.frame_embed.call_count, 4)
        self.capture.release.assert_called_once()
        self.assertEqual(list(self.root.iterdir()), [])

    def test_invalid_product(self):
        response = self.upload(product=b"invalid")
        self.assertEqual(response.status_code, 400)
        self.assertIn("product_image", response.json()["detail"])
        self.product_embed.assert_not_called()
        self.assertEqual(list(self.root.iterdir()), [])

    def test_invalid_video(self):
        response = self.upload(video_name="bad.txt")
        self.assertEqual(response.status_code, 415)
        self.assertIn("video", response.json()["detail"])
        self.product_embed.assert_not_called()

    def test_corrupt_video_cleanup(self):
        self.capture.isOpened.return_value = False
        self.assertEqual(self.upload().status_code, 400)
        self.capture.release.assert_called_once()
        self.assertEqual(list(self.root.iterdir()), [])

    def test_inference_failure_cleanup(self):
        self.frame_embed.side_effect = EmbeddingInferenceError("Inference failed")
        self.assertEqual(self.upload().status_code, 500)
        self.capture.release.assert_called_once()
        self.assertEqual(list(self.root.iterdir()), [])

    def test_missing_field(self):
        self.assertEqual(self.client.post("/verify/video-product-match").status_code, 422)

    def test_final_positions(self):
        self.assertEqual(final_frame_indices(300), [209, 239, 269, 284])
        self.assertEqual(final_frame_indices(2), [1])
        self.assertEqual(final_frame_indices(101, (0.5, 0.9)), [50, 90])

    def test_threshold_boundaries(self):
        for score, label in ((0.8, "high_visual_match"), (0.799, "moderate_visual_match"),
                             (0.6, "moderate_visual_match"), (0.599, "low_visual_match")):
            self.assertEqual(interpret_match(score), label)

    def test_tie_uses_earliest(self):
        self.frame_embed.side_effect = [self.embedding(1)] * 4
        body = self.upload().json()
        self.assertEqual(body["best_matching_timestamp"], 209 / 30)
        self.assertEqual(body["best_similarity"], 1)


if __name__ == "__main__":
    unittest.main()
