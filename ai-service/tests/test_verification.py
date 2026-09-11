from io import BytesIO
import unittest
from unittest.mock import patch
from types import SimpleNamespace

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.image_verification import MAX_UPLOAD_BYTES
from app.services.embedding_service import ModelLoadingError, EmbeddingInferenceError


class VerificationTests(unittest.TestCase):
    def setUp(self):
        self.embedding_patch = patch("app.services.image_verification.embed_image")
        self.embed = self.embedding_patch.start()
        self.addCleanup(self.embedding_patch.stop)
        self.embed.return_value = SimpleNamespace(
            model="facebook/dinov2-small", inference_device="cpu",
            vector=SimpleNamespace(numel=lambda: 384),
        )
        self.client = TestClient(app)
        buffer = BytesIO()
        Image.new("RGB", (24, 16), "red").save(buffer, format="PNG")
        self.png = buffer.getvalue()

    def tearDown(self):
        self.client.close()

    def upload(self, data, content_type="image/png"):
        return self.client.post(
            "/verify/image", files={"file": ("product.png", data, content_type)}
        )

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_valid_image(self):
        response = self.upload(self.png)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertGreaterEqual(body.pop("processing_time_ms"), 0)
        self.assertEqual(body, {
            "filename": "product.png", "width": 24, "height": 16, "format": "PNG",
            "model": "facebook/dinov2-small", "embedding_dimension": 384,
            "inference_device": "cpu",
        })

    def test_embedding_errors(self):
        for error, status in ((ModelLoadingError("Model unavailable"), 503),
                              (EmbeddingInferenceError("Inference failed"), 500)):
            with self.subTest(status=status):
                self.embed.side_effect = error
                response = self.upload(self.png)
                self.assertEqual(response.status_code, status)
                self.assertEqual(response.json()["detail"], str(error))

    def test_jpeg_detected_from_content(self):
        buffer = BytesIO()
        Image.new("RGB", (10, 12)).save(buffer, format="JPEG")
        response = self.upload(buffer.getvalue(), "image/jpeg")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["format"], "JPEG")

    def test_invalid_images(self):
        for data in (b"", b"not an image", self.png[:40], self.png[:-15]):
            with self.subTest(data=data):
                self.assertEqual(self.upload(data).status_code, 400)
        self.embed.assert_not_called()

    def test_wrong_content_type(self):
        self.assertEqual(self.upload(self.png, "text/plain").status_code, 415)

    def test_missing_file(self):
        self.assertEqual(self.client.post("/verify/image").status_code, 422)

    def test_upload_limit(self):
        self.assertEqual(self.upload(b"x" * (MAX_UPLOAD_BYTES + 1)).status_code, 413)

    def test_pixel_limit(self):
        for height, expected in ((5000, 200), (5001, 413)):
            with self.subTest(height=height):
                buffer = BytesIO()
                with Image.new("L", (10000, height)) as image:
                    image.save(buffer, format="PNG")
                response = self.upload(buffer.getvalue())
                self.assertEqual(response.status_code, expected)
                if expected == 200:
                    self.assertEqual(response.json()["width"], 10000)
                    self.assertEqual(response.json()["height"], 5000)
                else:
                    self.assertEqual(response.json()["detail"],
                                     "Image exceeds the 50 megapixel limit.")

    def test_bomb_warning(self):
        with patch("app.services.image_verification.Image.open",
                   side_effect=Image.DecompressionBombWarning("oversized")):
            self.assertEqual(self.upload(self.png).status_code, 413)

    def test_cors(self):
        for origin, expected in (("http://localhost:5173", 200),
                                 ("https://example.com", 400)):
            response = self.client.options("/verify/image", headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            })
            self.assertEqual(response.status_code, expected)
            if expected == 200:
                self.assertEqual(response.headers["access-control-allow-origin"], origin)
            else:
                self.assertNotIn("access-control-allow-origin", response.headers)


if __name__ == "__main__":
    unittest.main()
