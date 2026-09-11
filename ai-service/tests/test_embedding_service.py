from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModel

from app.services.embedding_service import (
    EmbeddingService, ModelLoadingError, EmbeddingInferenceError,
)


class EmbeddingTests(unittest.TestCase):
    def setUp(self):
        self.service = EmbeddingService()
        self.image = Image.new("L", (32, 24))
        self.addCleanup(self.image.close)
        self.processor = MagicMock(return_value={"pixel_values": torch.ones(1, 3, 2, 2)})
        self.model = MagicMock()
        self.output = torch.full((1, 2, 384), 99.0)
        self.output[0, 0] = 0
        self.output[0, 0, :2] = torch.tensor([3.0, 4.0])
        self.modes = []

        def forward(**inputs):
            self.modes.append(torch.is_inference_mode_enabled())
            return SimpleNamespace(last_hidden_state=self.output)

        self.model.side_effect = forward
        for target, attribute, value in (
            (AutoImageProcessor, "from_pretrained", self.processor),
            (AutoModel, "from_pretrained", self.model),
        ):
            mocker = patch.object(target, attribute, return_value=value)
            mocked = mocker.start()
            self.addCleanup(mocker.stop)
            if target is AutoModel:
                self.model_loader = mocked
            else:
                self.processor_loader = mocked
        for target in ("app.services.embedding_service.CACHE_DIR",
                       "app.services.embedding_service.torch.cuda.is_available"):
            mocker = patch(target, return_value=False)
            mocker.start()
            self.addCleanup(mocker.stop)

    def test_cls_pooling_normalization_rgb_and_inference_mode(self):
        result = self.service.embed(self.image)
        self.assertEqual(result.vector.shape, (384,))
        self.assertTrue(torch.allclose(result.vector[:2], torch.tensor([0.6, 0.8])))
        self.assertAlmostEqual(result.vector.norm().item(), 1.0, places=6)
        self.assertEqual(result.vector[2:].count_nonzero().item(), 0)
        self.assertEqual(result.inference_device, "cpu")
        self.assertEqual(result.vector.device.type, "cpu")
        self.assertFalse(result.vector.requires_grad)
        self.assertEqual(self.modes, [True])
        self.assertEqual(self.processor.call_args.kwargs["images"].mode, "RGB")
        self.assertEqual(self.image.mode, "L")
        self.model.eval.assert_called_once()
        self.model.to.assert_called_once_with(torch.device("cpu"))

    def test_concurrent_calls_load_once(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: self.service.embed(self.image), range(4)))
        self.assertEqual(len(results), 4)
        self.processor_loader.assert_called_once()
        self.model_loader.assert_called_once()
        self.assertEqual(self.model.call_count, 4)

    def test_loading_failure_is_cached(self):
        self.model_loader.side_effect = OSError("private internal details")
        for _ in range(2):
            with self.assertRaises(ModelLoadingError) as caught:
                self.service.embed(self.image)
            self.assertNotIn("private", str(caught.exception))
        self.model_loader.assert_called_once()

    def test_inference_failure(self):
        self.model.side_effect = RuntimeError("private internal details")
        with self.assertRaises(EmbeddingInferenceError) as caught:
            self.service.embed(self.image)
        self.assertNotIn("private", str(caught.exception))

    def test_invalid_vectors(self):
        for value in (0.0, float("nan"), float("inf")):
            with self.subTest(value=value):
                self.output.fill_(value)
                with self.assertRaises(EmbeddingInferenceError):
                    self.service.embed(self.image)

    def test_real_transformers_forward_without_download(self):
        from transformers import Dinov2Config, Dinov2Model, BitImageProcessor

        self.model_loader.return_value = Dinov2Model(Dinov2Config(
            hidden_size=384, num_hidden_layers=1, num_attention_heads=6,
            image_size=28, patch_size=14,
        ))
        self.processor_loader.return_value = BitImageProcessor(
            size={"shortest_edge": 28}, crop_size={"height": 28, "width": 28},
        )
        result = self.service.embed(self.image)
        self.assertEqual(result.vector.shape, (384,))
        self.assertAlmostEqual(result.vector.norm().item(), 1.0, places=5)

    def test_cuda_selection(self):
        # Test selection and model placement without requiring real CUDA hardware.
        with patch("app.services.embedding_service.torch.cuda.is_available", return_value=True):
            with self.service._lock:
                self.service._load()
        self.model.to.assert_called_once_with(torch.device("cuda"))
        self.assertEqual(self.service._device.type, "cuda")


if __name__ == "__main__":
    unittest.main()
