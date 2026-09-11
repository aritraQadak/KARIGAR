from pydantic import BaseModel, Field


class ImageVerificationResponse(BaseModel):
    filename: str
    width: int
    height: int
    format: str
    model: str
    embedding_dimension: int
    inference_device: str
    processing_time_ms: float = Field(ge=0)


class SimilarityImageMetadata(BaseModel):
    filename: str
    width: int
    height: int


class ImageSimilarityResponse(BaseModel):
    reference_image: SimilarityImageMetadata
    product_image: SimilarityImageMetadata
    model: str
    embedding_dimension: int
    inference_device: str
    cosine_similarity: float = Field(ge=-1, le=1)
    similarity_percent: float = Field(ge=-100, le=100)
    interpretation: str
    processing_time_ms: float = Field(ge=0)
