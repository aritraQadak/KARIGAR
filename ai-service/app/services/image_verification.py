from contextlib import contextmanager, ExitStack
from io import BytesIO
from time import perf_counter
import warnings

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.schemas.verification import ImageVerificationResponse
from app.services.embedding_service import embed_image

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 50_000_000


@contextmanager
def validated_image(file: UploadFile):
    """Yield metadata and a decoded Pillow image; always release its resources."""
    if not file.content_type or not file.content_type.lower().startswith("image/"):
        raise HTTPException(415, "Upload must have an image content type.")

    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image exceeds the 10 MiB upload limit.")
    if not data:
        raise HTTPException(400, "Image is empty.")

    with ExitStack() as stack:
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                with Image.open(BytesIO(data)) as image:
                    width, height = image.size
                    image_format = image.format
                    if width * height > MAX_IMAGE_PIXELS:
                        raise HTTPException(413, "Image exceeds the 50 megapixel limit.")
                    image.verify()
                # Reopen after verify() and decode pixels to catch truncated data.
                image = stack.enter_context(Image.open(BytesIO(data)))
                image.load()
        except (Image.DecompressionBombError, Image.DecompressionBombWarning):
            raise HTTPException(413, "Image dimensions are too large.") from None
        except (UnidentifiedImageError, OSError, SyntaxError, ValueError, EOFError):
            raise HTTPException(400, "Invalid, corrupted, or unsupported image.") from None

        yield {
            "filename": file.filename or "upload", "width": width,
            "height": height, "format": image_format or "UNKNOWN",
        }, image


def inspect_image(file: UploadFile) -> ImageVerificationResponse:
    started = perf_counter()
    with validated_image(file) as (metadata, image):
        embedding = embed_image(image)

    return ImageVerificationResponse(
        **metadata,
        model=embedding.model,
        embedding_dimension=embedding.vector.numel(),
        inference_device=embedding.inference_device,
        processing_time_ms=round((perf_counter() - started) * 1000, 3),
    )
