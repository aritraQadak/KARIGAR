from contextlib import contextmanager
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
import unittest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.hand_detection_service import (Hand, HandDetectionService, HandLoadingError, parse_hands,
    prepare_hand_frame, merge_crop_hands, hand_detection_config)
from app.services.hand_evidence_service import summarize_hands
from app.services.trust_score_service import TrustInputs, calculate_trust, hand_presence_points


class HandTests(unittest.TestCase):
    def test_recall_configuration(self):
        config = hand_detection_config(8)
        self.assertEqual(config["num_hands"], 2)
        for key in ("detection_threshold", "presence_threshold", "tracking_threshold"):
            self.assertEqual(config[key], .3)
        self.assertEqual(config["running_mode"], "IMAGE")
        self.assertTrue(config["crop_fallback_enabled"])

    def test_hand_only_resize(self):
        frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
        resized = prepare_hand_frame(frame)
        self.assertEqual(resized.shape, (720, 1280, 3))
        resized[:] = 255
        self.assertFalse(frame.any())

    def test_full_success_skips_crops_and_crop_failure_stays_empty(self):
        for predictions, expected_calls, source in (
            ([[Hand("Left", ((.5,.5,0),)*21)]], 1, "full_frame"),
            ([[], [], [], []], 4, "none"),
            ([[], [Hand("Left", ((.5,.5,0),)*21)], [], []], 4, "crop_fallback"),
        ):
            module, backend = MagicMock(), MagicMock()
            service = HandDetectionService()
            with patch("app.services.hand_detection_service.create_backend", return_value=(module,backend)), \
                    patch("app.services.hand_detection_service.parse_hands", side_effect=predictions):
                hands = service.detect(np.zeros((120,200,3),dtype=np.uint8))
            self.assertEqual(backend.detect.call_count, expected_calls)
            analysis, frames = summarize_hands([1], [hands])
            self.assertEqual(frames[0].detection_source, source)
            self.assertEqual(analysis.frames_with_hands, int(source != "none"))
            service.close()

    def test_overlapping_crops_do_not_double_count(self):
        merged = merge_crop_hands([], [Hand("Left", ((.5/.6,.5,0),)*21)], (0,0,.6,1))
        merge_crop_hands(merged, [Hand("Left", (((.5-.4)/.6,.5,0),)*21)], (.4,0,1,1))
        self.assertEqual(len(merged), 1)
        self.assertAlmostEqual(merged[0].landmarks[0][0], .5)
        analysis, _ = summarize_hands([1], [merged])
        self.assertEqual(analysis.hand_presence_ratio, 1)
        self.assertEqual(analysis.maximum_hand_count, 1)
        self.assertEqual(hand_presence_points(analysis.hand_presence_ratio), 8)

    def test_counts_and_handedness(self):
        for results, ratio, average, maximum in (([[], []], 0, 0, 0),
                ([[Hand("Left", ())], []], .5, .5, 1),
                ([[Hand("Left", ()), Hand("Right", ())]] * 2, 1, 2, 2)):
            analysis, frames = summarize_hands([1, 2], results)
            self.assertEqual(analysis.hand_presence_ratio, ratio)
            self.assertEqual(analysis.average_hand_count, average)
            self.assertEqual(analysis.maximum_hand_count, maximum)
            self.assertIsNone(analysis.hand_motion_score)
        self.assertTrue(frames[0].left_hand_detected)
        self.assertTrue(frames[0].right_hand_detected)

    def test_unknown_labels(self):
        landmarks = [SimpleNamespace(x=.1, y=.2, z=0)] * 21
        result = SimpleNamespace(hand_landmarks=[landmarks], handedness=[[SimpleNamespace(category_name="Left", score=.55)]])
        hands = parse_hands(result)
        self.assertIsNone(hands[0].handedness)
        self.assertEqual(len(hands[0].landmarks), 21)
        _, frames = summarize_hands([1], [hands])
        self.assertEqual(frames[0].unknown_handedness_count, 1)
        self.assertFalse(frames[0].left_hand_detected)

    def test_thresholds(self):
        for ratio, points in ((0,0),(.01,1),(.249,1),(.25,3),(.499,3),(.5,6),(.749,6),(.75,8),(1,8)):
            self.assertEqual(hand_presence_points(ratio), points)

    def test_no_person_high_hands_and_reverse(self):
        for people, hands, expected_process, expected_visibility in ((0,1,18,0),(1,0,10,15)):
            report = calculate_trust(TrustInputs(process_analyzed=True, average_visual_change=.2,
                hand_presence_ratio=hands, person_presence_ratio=people, frames_analyzed=8))
            self.assertEqual(report.categories["craft_process_evidence"].score, expected_process)
            self.assertEqual(report.categories["artisan_visibility"].score, expected_visibility)

    def test_lazy_backend_once_and_cleanup(self):
        module, backend = MagicMock(), MagicMock()
        backend.detect.return_value = SimpleNamespace(hand_landmarks=[], handedness=[])
        service = HandDetectionService()
        with patch("app.services.hand_detection_service.create_backend", return_value=(module,backend)) as loader:
            for _ in range(3):
                self.assertEqual(service.detect(np.zeros((24,32,3),dtype=np.uint8)), [])
            loader.assert_called_once()
        service.close()
        backend.close.assert_called_once()

    def test_missing_backend_cached(self):
        service = HandDetectionService()
        with patch("app.services.hand_detection_service.create_backend", side_effect=ImportError("private")) as loader:
            for _ in range(2):
                with self.assertRaises(HandLoadingError) as caught:
                    service.detect(None)
                self.assertNotIn("private",str(caught.exception))
            loader.assert_called_once()

    def test_mocked_endpoint(self):
        closed = []
        @contextmanager
        def video(upload):
            try:
                yield object(), SimpleNamespace(total_frames=300,fps=30)
            finally:
                closed.append(True)
        with TestClient(app) as client, patch("app.services.hand_evidence_service.validated_video",video), \
                patch("app.services.hand_evidence_service.sampled_frames",return_value=[np.zeros((24,32,3),dtype=np.uint8)]*8), \
                patch("app.services.hand_evidence_service.detect_hands",return_value=[Hand(None,())]):
            response=client.post("/verify/video-hand-evidence",files={"video":("craft.mp4",b"mock","video/mp4")})
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(response.json()["hand_analysis"]["hand_presence_ratio"],1)
        self.assertEqual(response.json()["frames_analyzed"],8)
        self.assertEqual(closed,[True])


if __name__ == "__main__":
    unittest.main()
