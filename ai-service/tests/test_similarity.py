from io import BytesIO
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image
import torch

from app.main import app
from app.services.embedding_service import EmbeddingResult, EmbeddingInferenceError, ModelLoadingError
from app.services.similarity_service import interpret_similarity, cosine_similarity


class SimilarityTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.addCleanup(self.client.close)
        buffer = BytesIO()
        with Image.new("RGB", (24, 16), "red") as image:
            image.save(buffer, format="PNG")
        self.png = buffer.getvalue()
        self.unit = torch.zeros(384)
        self.unit[0] = 1
        patcher = patch("app.services.similarity_service.embed_image")
        self.embed = patcher.start()
        self.addCleanup(patcher.stop)
        self.embed.return_value = self.result(self.unit)

    def result(self, vector):
        return EmbeddingResult(vector, "facebook/dinov2-small", "cpu")

    def upload(self, reference=None, product=None, content_type="image/png"):
        return self.client.post("/verify/image-similarity", files={
            "reference_image": ("reference.png", self.png if reference is None else reference, content_type),
            "product_image": ("product.png", self.png if product is None else product, content_type),
        })

    def test_valid_identical(self):
        response = self.upload()
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertGreaterEqual(body.pop("processing_time_ms"), 0)
        self.assertEqual(body, {
            "reference_image": {"filename": "reference.png", "width": 24, "height": 16},
            "product_image": {"filename": "product.png", "width": 24, "height": 16},
            "model": "facebook/dinov2-small", "embedding_dimension": 384,
            "inference_device": "cpu", "cosine_similarity": 1.0,
            "similarity_percent": 100.0, "interpretation": "high_visual_similarity",
        })
        self.assertEqual(self.embed.call_count, 2)

    def test_invalid_reference(self):
        response = self.upload(reference=b"invalid")
        self.assertEqual(response.status_code, 400)
        self.assertIn("reference_image", response.json()["detail"])
        self.embed.assert_not_called()

    def test_invalid_product(self):
        response = self.upload(product=b"invalid")
        self.assertEqual(response.status_code, 400)
        self.assertIn("product_image", response.json()["detail"])
        self.embed.assert_not_called()

    def test_missing_image(self):
        response = self.client.post("/verify/image-similarity", files={
            "reference_image": ("reference.png", self.png, "image/png")})
        self.assertEqual(response.status_code, 422)

    def test_non_image_content_type(self):
        self.assertEqual(self.upload(content_type="text/plain").status_code, 415)
        self.embed.assert_not_called()

    def test_similar_and_different_embeddings(self):
        for score, interpretation in ((0.9, "high_visual_similarity"),
                                      (0.7, "moderate_visual_similarity"),
                                      (0.0, "low_visual_similarity"),
                                      (-1.0, "low_visual_similarity")):
            with self.subTest(score=score):
                other = torch.zeros(384)
                other[0], other[1] = score, (1 - score ** 2) ** 0.5
                self.embed.side_effect = [self.result(self.unit), self.result(other)]
                response = self.upload()
                self.assertEqual(response.status_code, 200)
                body = response.json()
                self.assertAlmostEqual(body["cosine_similarity"], score, places=6)
                self.assertEqual(body["similarity_percent"], body["cosine_similarity"] * 100)
                self.assertEqual(body["interpretation"], interpretation)

    def test_interpretation_boundaries(self):
        for score, expected in ((0.80, "high_visual_similarity"),
                                (0.799999, "moderate_visual_similarity"),
                                (0.60, "moderate_visual_similarity"),
                                (0.599999, "low_visual_similarity")):
            self.assertEqual(interpret_similarity(score), expected)

    def test_clamp_rounding_overshoot(self):
        for raw, expected in ((1.0000001, 1.0), (-1.0000001, -1.0)):
            with patch("app.services.similarity_service.torch.dot", return_value=torch.tensor(raw)):
                self.assertEqual(cosine_similarity(self.unit, self.unit), expected)

    def test_embedding_errors(self):
        for error, status in ((ModelLoadingError("Model unavailable"), 503),
                              (EmbeddingInferenceError("Inference failed"), 500)):
            for index in (0, 1):
                with self.subTest(status=status, index=index):
                    self.embed.side_effect = [self.result(self.unit)] * index + [error]
                    response = self.upload()
                    self.assertEqual(response.status_code, status)

    def test_similarity_failure(self):
        for vector in (torch.zeros(384), torch.ones(10), torch.full((384,), float("nan"))):
            self.embed.side_effect = [self.result(self.unit), self.result(vector)]
            response = self.upload()
            self.assertEqual(response.status_code, 500)
            self.assertEqual(response.json()["detail"], "Image similarity computation failed.")

    def test_dot_failure(self):
        with patch("app.services.similarity_service.torch.dot", side_effect=RuntimeError("private")):
            response = self.upload()
        self.assertEqual(response.status_code, 500)
        self.assertNotIn("private", response.text)


if __name__ == "__main__":
    unittest.main()
