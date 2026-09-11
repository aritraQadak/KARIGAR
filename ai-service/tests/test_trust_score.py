from dataclasses import replace
import unittest
from app.services.trust_score_service import TrustInputs, TrustMaxima, calculate_trust


class TrustScoreTests(unittest.TestCase):
    def setUp(self):
        self.full = TrustInputs(photo_decoded=True, photo_embedded=True,
            product_video_analyzed=True, product_video_average_similarity=.9, product_video_diversity=1, process_analyzed=True, average_visual_change=.2,
            frames_analyzed=8, duration_seconds=10, person_presence_ratio=1,
            frames_with_person=8, hand_presence_ratio=1, frames_with_hands=8, best_similarity=1, average_similarity=1, listing_completeness=1)

    def test_full_theoretical_and_bounds(self):
        report = calculate_trust(self.full)
        self.assertEqual(report.score, 98)
        self.assertEqual(report.level, "very_high_evidence")
        for category in report.categories.values():
            self.assertGreaterEqual(category.score, 0)
            self.assertLessEqual(category.score, category.max_score)
        self.assertEqual(report.score, sum(c.score for c in report.categories.values()))

    def test_empty_and_photo(self):
        self.assertEqual(calculate_trust(TrustInputs()).score, 0)
        self.assertEqual(calculate_trust(TrustInputs(photo_decoded=True)).score, 21)
        report = calculate_trust(TrustInputs(photo_decoded=True, photo_embedded=True))
        self.assertEqual(report.score, 35)
        self.assertFalse(report.categories["product_photo_evidence"].signals["multi_view_consistency_checked"])
        self.assertFalse(report.categories["craft_process_evidence"].signals["hand_evidence_available"])

    def test_no_video_or_listing(self):
        report = calculate_trust(replace(self.full, product_video_analyzed=False, listing_completeness=None))
        self.assertEqual(report.score, 78)
        for name in ("product_video_evidence", "listing_completeness"):
            self.assertFalse(report.categories[name].available)
            self.assertEqual(report.categories[name].score, 0)

    def test_visibility_only_bonus(self):
        full = calculate_trust(self.full)
        absent = calculate_trust(replace(self.full, person_presence_ratio=0, frames_with_person=0))
        self.assertEqual(absent.score, 83)
        self.assertEqual(absent.level, "high_evidence")
        self.assertEqual(absent.categories["artisan_visibility"].score, 0)
        self.assertEqual(full.categories["artisan_visibility"].score, 15)
        for name in full.categories:
            if name != "artisan_visibility":
                self.assertEqual(full.categories[name], absent.categories[name])

    def test_match_strength(self):
        for similarity, expected in ((-.5, 0), (.4, 0), (.65, 5), (.9, 10), (1, 10)):
            report = calculate_trust(replace(self.full, best_similarity=similarity, average_similarity=similarity))
            self.assertAlmostEqual(report.categories["product_process_match"].score, expected)

    def test_clamping_and_sum(self):
        for ratio in (-10, 0, .37, 1, 10):
            report = calculate_trust(replace(self.full, person_presence_ratio=ratio, listing_completeness=ratio))
            self.assertLessEqual(report.score, 100)
            self.assertEqual(report.score, sum(c.score for c in report.categories.values()))
            for category in report.categories.values():
                self.assertLessEqual(category.score, category.max_score)
                self.assertGreaterEqual(category.score, 0)

    def test_hand_points_are_separate(self):
        base = replace(self.full, average_visual_change=0, hand_presence_ratio=None)
        without = calculate_trust(base).categories["craft_process_evidence"]
        hands = calculate_trust(replace(base, hand_presence_ratio=.5)).categories["craft_process_evidence"]
        self.assertEqual(without.score, 4)
        self.assertFalse(without.signals["hand_evidence_available"])
        self.assertEqual(hands.score, 10)
        self.assertTrue(hands.signals["hand_evidence_available"])
        self.assertEqual(hands.components["hand_object_interaction"].score, 0)
        self.assertFalse(hands.components["hand_object_interaction"].available)
        self.assertEqual(hands.score, sum(c.score for c in hands.components.values()))

    def test_maxima_validation(self):
        with self.assertRaises(ValueError):
            TrustMaxima(product_photo_evidence=40)
        with self.assertRaises(ValueError):
            TrustMaxima(product_photo_evidence=float("nan"))

    def test_levels(self):
        # Current/full input combinations exercise all neutral bands.
        for inputs, level in (
            (TrustInputs(), "low_evidence"),
            (TrustInputs(photo_decoded=True, photo_embedded=True, product_video_analyzed=True, product_video_average_similarity=.9, product_video_diversity=1), "basic_evidence"),
            (replace(self.full, product_video_analyzed=False, listing_completeness=None, person_presence_ratio=0), "good_evidence"),
            (replace(self.full, product_video_analyzed=False), "high_evidence"),
            (self.full, "very_high_evidence"),
        ):
            self.assertEqual(calculate_trust(inputs).level, level)


if __name__ == "__main__":
    unittest.main()
