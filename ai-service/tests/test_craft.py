from contextlib import contextmanager
from dataclasses import asdict
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import numpy as np
import torch
from fastapi.testclient import TestClient

from app.main import app
from app.services.hand_detection_service import Hand, HandLoadingError
from app.services.embedding_service import EmbeddingResult, ModelLoadingError
from app.services.object_detection_service import Detection, DetectionResult
from app.services.evidence_scoring_service import (
    EvidenceWeights, DEFAULT_WEIGHTS, clamp_score, temporal_change_score,
    weighted_evidence, interpret_evidence, EvidenceScoringError,
)
from app.services.synthetic_media_service import neighbor_pairs
from app.services.video_service import sample_frame_indices
from app.services.video_product_match_service import final_frame_indices


class ScoringTests(unittest.TestCase):
    def test_weights_and_calculation(self):
        self.assertEqual(sum(asdict(DEFAULT_WEIGHTS).values()), 1)
        self.assertAlmostEqual(weighted_evidence(.9, .75, .5), .775)
        for kwargs in ({"product_match": .6}, {"product_match": -.5, "human_presence": 1.3},
                       {"product_match": float("nan")}):
            with self.assertRaises(ValueError):
                EvidenceWeights(**kwargs)

    def test_clamp(self):
        self.assertEqual(clamp_score(-1), 0)
        self.assertEqual(clamp_score(2), 1)
        self.assertEqual(weighted_evidence(2, 2, 2), 1)
        self.assertEqual(weighted_evidence(-1, -1, -1), 0)
        with self.assertRaises(EvidenceScoringError):
            clamp_score(float("nan"))

    def test_interpretation(self):
        for score, label in ((.8, "strong_supporting_evidence"), (.799, "moderate_supporting_evidence"),
                             (.6, "moderate_supporting_evidence"), (.599, "limited_supporting_evidence")):
            self.assertEqual(interpret_evidence(score), label)

    def test_temporal_curve(self):
        for change, expected in ((0, 0), (.02, 0), (.085, .5), (.15, 1), (.35, 1),
                                 (.575, .5), (.8, 0), (2, 0)):
            self.assertAlmostEqual(temporal_change_score(change), expected)

    def test_unbalanced_components(self):
        self.assertAlmostEqual(weighted_evidence(1, 0, 0), .5)
        self.assertAlmostEqual(weighted_evidence(0, 1, 0), .3)
        self.assertAlmostEqual(weighted_evidence(1, 0, 1), .7)


class CraftEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.addCleanup(self.client.close)
        self.closed = []
        self.extracted = []
        @contextmanager
        def image_context(upload):
            try:
                yield {"filename": "listing.png", "width": 32, "height": 24}, object()
            finally:
                self.closed.append("image")
        @contextmanager
        def video_context(upload):
            try:
                yield object(), SimpleNamespace(total_frames=300, fps=30, duration_seconds=10)
            finally:
                self.closed.append("video")
        def frames(capture, indices):
            self.extracted.extend(indices)
            for _ in indices:
                yield np.zeros((24, 32, 3), dtype=np.uint8)
        unit = torch.zeros(384)
        unit[0] = 1
        embedding = EmbeddingResult(unit, "facebook/dinov2-small", "cpu")
        self.mocks = {}
        for name, kwargs in {
            "validated_image": {"side_effect": image_context}, "validated_video": {"side_effect": video_context},
            "sampled_frames": {"side_effect": frames}, "embed_image": {"return_value": embedding},
            "frame_embedding": {"return_value": embedding},
            "detect_hands": {"return_value": []},
            "detect_objects": {"return_value": DetectionResult([Detection("person", .9, (0, 0, 1, 1))], "yolo11n.pt", "cpu")},
        }.items():
            patcher = patch("app.services.craft_service." + name, **kwargs)
            self.mocks[name] = patcher.start()
            self.addCleanup(patcher.stop)

    def upload(self):
        return self.client.post("/verify/craft", files={
            "video": ("craft.mp4", b"mock", "video/mp4"),
            "product_image": ("listing.png", b"mock", "image/png"),
        })

    def test_integration_and_no_duplicate_inference(self):
        response = self.upload()
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        union = sorted(set(sample_frame_indices(300)) | set(final_frame_indices(300)))
        self.assertEqual(self.extracted, sorted(set(union) | {b for _,b in neighbor_pairs(sample_frame_indices(300), SimpleNamespace(fps=30,total_frames=300))}))
        self.mocks["validated_video"].assert_called_once()
        self.mocks["embed_image"].assert_called_once()
        self.assertEqual(self.mocks["frame_embedding"].call_count, len(union))
        self.assertEqual(self.mocks["detect_objects"].call_count, 8)
        self.assertEqual(self.mocks["detect_hands"].call_count, 8)
        self.assertEqual(body["evidence"]["product_match"]["score"], 1)
        self.assertEqual(body["evidence"]["human_presence"]["score"], 1)
        self.assertEqual(body["evidence"]["temporal_change"]["score"], 0)
        self.assertAlmostEqual(body["craft_evidence_score"], .8)
        self.assertEqual(body["craft_evidence_percent"], body["craft_evidence_score"] * 100)
        self.assertEqual(body["interpretation"], "strong_supporting_evidence")
        self.assertEqual(self.closed, ["video", "image"])
        self.assertEqual(set(body), {"synthetic_media_risk", "live_capture_evidence", "video", "product_image", "models", "inference_device", "evidence",
            "weights", "craft_evidence_score", "craft_evidence_percent", "interpretation", "processing_time_ms", "trust_score", "technical_signals"})

    def test_no_person(self):
        self.mocks["detect_objects"].return_value = DetectionResult([], "yolo11n.pt", "cpu")
        body = self.upload().json()
        self.assertEqual(body["evidence"]["human_presence"]["score"], 0)
        self.assertIsNone(body["evidence"]["human_presence"]["average_person_confidence"])
        self.assertEqual(body["craft_evidence_score"], .5)

    def test_loading_error_cleanup(self):
        self.mocks["frame_embedding"].side_effect = ModelLoadingError("Model unavailable")
        self.assertEqual(self.upload().status_code, 503)
        self.assertEqual(self.closed, ["video", "image"])

    def test_hand_unavailable(self):
        self.mocks["detect_hands"].side_effect = HandLoadingError("MediaPipe unavailable")
        response = self.upload()
        self.assertEqual(response.status_code, 200)
        signals = response.json()["technical_signals"]
        self.assertFalse(signals["hand_evidence_available"])
        self.assertIsNone(signals["hand_presence_ratio"])
        self.mocks["detect_hands"].assert_called_once()

    def test_no_person_with_hands(self):
        self.mocks["detect_objects"].return_value = DetectionResult([], "yolo11n.pt", "cpu")
        self.mocks["detect_hands"].return_value = [Hand("Left", ())]
        body = self.upload().json()
        self.assertEqual(body["technical_signals"]["hand_presence_ratio"], 1)
        categories = body["trust_score"]["categories"]
        self.assertEqual(categories["artisan_visibility"]["score"], 0)
        self.assertEqual(categories["craft_process_evidence"]["components"]["hand_presence"]["score"], 8)

    def test_process_alias_without_image(self):
        response=self.client.post("/verify/craft",files={"process_video":("craft.mp4",b"mock","video/mp4")})
        self.assertEqual(response.status_code,200,response.text)
        body=response.json()
        self.assertIsNone(body["product_image"])
        self.assertFalse(body["trust_score"]["categories"]["product_process_match"]["available"])
        self.assertFalse(body["trust_score"]["categories"]["product_video_evidence"]["available"])
        self.assertEqual(self.mocks["frame_embedding"].call_count,8)
        self.mocks["embed_image"].assert_not_called()

    def test_photo_only(self):
        response = self.client.post("/verify/craft", files={"product_image": ("listing.png", b"mock", "image/png")})
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["trust_score"]["score"], 35)
        self.assertIsNone(body["video"])
        self.assertIsNone(body["craft_evidence_score"])
        self.mocks["validated_video"].assert_not_called()
        self.mocks["detect_objects"].assert_not_called()
        self.mocks["embed_image"].assert_called_once()
        self.assertEqual(self.closed, ["image"])

    def test_missing_fields(self):
        self.assertEqual(self.client.post("/verify/craft").status_code, 422)


if __name__ == "__main__":
    unittest.main()
