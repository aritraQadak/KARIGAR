"""Reusable DINOv2 visual features; no authenticity or classification decision."""

from dataclasses import dataclass
import logging
from pathlib import Path
from threading import Lock

from PIL import Image
import torch

MODEL_ID = "facebook/dinov2-small"
EMBEDDING_DIMENSION = 384
CACHE_DIR = Path(__file__).resolve().parents[2] / ".cache" / "huggingface"
logger = logging.getLogger(__name__)


class ModelLoadingError(RuntimeError):
    """The pretrained processor or model could not be initialized."""


class EmbeddingInferenceError(RuntimeError):
    """Visual feature extraction failed."""


@dataclass(frozen=True)
class EmbeddingResult:
    # A normalized, one-dimensional CPU tensor, for reuse by later components.
    vector: torch.Tensor
    model: str
    inference_device: str


class EmbeddingService:
    def __init__(self):
        self._lock = Lock()
        self._processor = None
        self._model = None
        self._device = None
        self._load_failed = False

    def _load(self):
        # Called only under the lock. Cache failures too, avoiding download storms.
        if self._load_failed:
            raise ModelLoadingError("DINOv2 is unavailable; restart the service to retry loading.")
        if self._model is not None:
            return
        try:
            from transformers import AutoImageProcessor, AutoModel

            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            if device.type == "cpu":
                logger.warning("CUDA is unavailable; DINOv2 will use CPU inference.")
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            processor = AutoImageProcessor.from_pretrained(
                MODEL_ID, cache_dir=str(CACHE_DIR), use_fast=False,
                trust_remote_code=False,
            )
            model = AutoModel.from_pretrained(
                MODEL_ID, cache_dir=str(CACHE_DIR), use_safetensors=True,
                trust_remote_code=False,
            )
            model.to(device)
            model.eval()
            self._processor, self._model, self._device = processor, model, device
            logger.info("Loaded %s for inference on %s", MODEL_ID, device)
        except Exception as exc:
            self._load_failed = True
            logger.error("DINOv2 loading failed (%s).", type(exc).__name__)
            raise ModelLoadingError(
                "DINOv2 could not load. Check model cache, network access, and device support; "
                "restart the service to retry."
            ) from None

    def embed(self, image: Image.Image) -> EmbeddingResult:
        """Extract a unit-length CLS embedding without changing the caller's image.

        Serialize inference to bound concurrent GPU memory usage on laptops.
        Model initialization occurs once per service process, on first use.
        """
        with self._lock:
            self._load()
            try:
                with image.convert("RGB") as rgb, torch.inference_mode():
                    inputs = self._processor(images=rgb, return_tensors="pt")
                    inputs = {key: value.to(self._device) for key, value in inputs.items()}
                    outputs = self._model(**inputs)
                    vector = outputs.last_hidden_state[0, 0, :].float()
                    norm = torch.linalg.vector_norm(vector)
                    if (vector.shape != (EMBEDDING_DIMENSION,)
                            or not torch.isfinite(vector).all().item()
                            or not torch.isfinite(norm).item() or norm.item() <= 0):
                        raise ValueError("Invalid embedding output")
                    # CPU transfer waits for CUDA work, making endpoint timing meaningful.
                    vector = (vector / norm).cpu()
                return EmbeddingResult(vector, MODEL_ID, str(self._device))
            except Exception as exc:
                logger.error("DINOv2 inference failed (%s).", type(exc).__name__)
                raise EmbeddingInferenceError(
                    "DINOv2 inference failed. Check available memory and device support."
                ) from None


embedding_service = EmbeddingService()


def embed_image(image: Image.Image) -> EmbeddingResult:
    """Public reusable entry point for images and future video frames."""
    return embedding_service.embed(image)
