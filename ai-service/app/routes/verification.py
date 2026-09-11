from app.schemas.synthetic_media import SyntheticMediaResponse
from app.services.synthetic_media_service import analyze_synthetic_video
from app.services.capture_service import resolve_evidence
from app.services.listing_completeness_service import parse_listing_metadata
from app.schemas.product_video import ProductVideoResponse
from app.services.product_video_service import inspect_product_video
from app.schemas.hand import VideoHandEvidenceResponse
from app.services.hand_evidence_service import analyze_hand_evidence
from app.services.hand_detection_service import HandLoadingError, HandInferenceError
from app.schemas.craft import CraftVerificationResponse
from app.services.craft_service import analyze_craft
from app.services.evidence_scoring_service import EvidenceScoringError
from app.schemas.process_evidence import VideoProcessEvidenceResponse
from app.services.process_evidence_service import analyze_process_evidence
from app.services.object_detection_service import DetectorLoadingError, DetectionInferenceError
from app.schemas.video_product_match import VideoProductMatchResponse
from app.services.video_product_match_service import match_video_product
from app.schemas.video import VideoVerificationResponse
from app.services.video_service import analyze_video
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.verification import ImageVerificationResponse, ImageSimilarityResponse
from app.services.similarity_service import compare_images, SimilarityComputationError
from app.services.image_verification import inspect_image
from app.services.embedding_service import ModelLoadingError, EmbeddingInferenceError

router = APIRouter(prefix="/verify", tags=["verification"])


@router.post("/image", response_model=ImageVerificationResponse)
def verify_image(file: UploadFile = File(...)) -> ImageVerificationResponse:
    try:
        return inspect_image(file)
    except ModelLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except EmbeddingInferenceError as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        file.file.close()


@router.post("/image-similarity", response_model=ImageSimilarityResponse)
def verify_image_similarity(
    reference_image: UploadFile = File(...),
    product_image: UploadFile = File(...),
) -> ImageSimilarityResponse:
    try:
        return compare_images(reference_image, product_image)
    except ModelLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except (EmbeddingInferenceError, SimilarityComputationError) as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        reference_image.file.close()
        product_image.file.close()


@router.post("/video", response_model=VideoVerificationResponse)
def verify_video(video: UploadFile = File(...)) -> VideoVerificationResponse:
    try:
        return analyze_video(video)
    except ModelLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except (EmbeddingInferenceError, SimilarityComputationError) as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        video.file.close()


@router.post("/video-product-match", response_model=VideoProductMatchResponse)
def verify_video_product_match(
    video: UploadFile = File(...), product_image: UploadFile = File(...),
) -> VideoProductMatchResponse:
    try:
        return match_video_product(video, product_image)
    except ModelLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except (EmbeddingInferenceError, SimilarityComputationError) as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        video.file.close()
        product_image.file.close()


@router.post("/video-process-evidence", response_model=VideoProcessEvidenceResponse)
def verify_video_process_evidence(video: UploadFile = File(...)) -> VideoProcessEvidenceResponse:
    try:
        return analyze_process_evidence(video)
    except DetectorLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except DetectionInferenceError as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        video.file.close()


@router.post("/craft", response_model=CraftVerificationResponse)
def verify_craft(video: UploadFile | None = File(None), product_image: UploadFile | None = File(None),
    product_video: UploadFile | None = File(None), process_video: UploadFile | None = File(None),
    listing_metadata: str | None = Form(None), capture_receipt_token: str | None = Form(None)) -> CraftVerificationResponse:
    try:
        if video is not None and process_video is not None:
            raise HTTPException(422, "Use either video or process_video, not both.")
        process = video if video is not None else process_video
        provenance = resolve_evidence(capture_receipt_token, process)
        result = analyze_craft(process, product_image, product_video,
            listing_metadata=parse_listing_metadata(listing_metadata))
        result.live_capture_evidence = provenance
        result.synthetic_media_risk.context.karigar_live_capture = provenance.verified_capture_session
        return result
    except (ModelLoadingError, DetectorLoadingError) as exc:
        raise HTTPException(503, str(exc)) from None
    except (EmbeddingInferenceError, DetectionInferenceError, SimilarityComputationError, EvidenceScoringError) as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        for upload in (video, process_video, product_video, product_image):
            if upload is not None:
                upload.file.close()


@router.post("/video-hand-evidence", response_model=VideoHandEvidenceResponse)
def verify_video_hand_evidence(video: UploadFile = File(...)) -> VideoHandEvidenceResponse:
    try:
        return analyze_hand_evidence(video)
    except HandLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except HandInferenceError as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        video.file.close()


@router.post("/product-video", response_model=ProductVideoResponse)
def verify_product_video(product_video: UploadFile = File(...), product_image: UploadFile | None = File(None)) -> ProductVideoResponse:
    try:
        return inspect_product_video(product_video, product_image)
    except ModelLoadingError as exc:
        raise HTTPException(503, str(exc)) from None
    except (EmbeddingInferenceError, SimilarityComputationError, EvidenceScoringError) as exc:
        raise HTTPException(500, str(exc)) from None
    finally:
        product_video.file.close()
        if product_image is not None:
            product_image.file.close()


@router.post("/synthetic-media-risk", response_model=SyntheticMediaResponse)
def verify_synthetic_media_risk(video: UploadFile = File(...), capture_receipt_token: str | None = Form(None)):
    try:
        provenance = resolve_evidence(capture_receipt_token, video)
        result = analyze_synthetic_video(video)
        result.synthetic_media_risk.context.karigar_live_capture = provenance.verified_capture_session
        return result
    finally:
        video.file.close()
