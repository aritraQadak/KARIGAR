"""Summarize sampled object detections without inferring craftsmanship."""
from time import perf_counter

from fastapi import UploadFile
from app.schemas.process_evidence import (
    VideoProcessEvidenceResponse, PersonFrameResult, PersonAnalysis, DetectedClassSummary,
)
from app.services.object_detection_service import detect_objects, DetectionInferenceError
from app.services.video_service import (
    validated_video, sample_frame_indices, sampled_frames, analysis_frame, DEFAULT_LIMITS,
)


def summarize_detections(timestamps, results):
    if not results or len(timestamps) != len(results):
        raise DetectionInferenceError("Detection evidence is incomplete.")
    frame_results, person_confidences = [], []
    classes = {}
    for timestamp, result in zip(timestamps, results):
        people = [d.confidence for d in result.detections if d.class_name == "person"]
        person_confidences.extend(people)
        frame_results.append(PersonFrameResult(
            timestamp_seconds=timestamp, person_detected=bool(people), person_count=len(people),
            highest_person_confidence=max(people) if people else None,
        ))
        seen = set()
        for detection in result.detections:
            name = detection.class_name
            entry = classes.setdefault(name, {"frames_detected": 0, "max_confidence": 0})
            entry["max_confidence"] = max(entry["max_confidence"], detection.confidence)
            if name not in seen:
                entry["frames_detected"] += 1
                seen.add(name)
    count = sum(frame.person_detected for frame in frame_results)
    person = PersonAnalysis(
        frames_with_person=count, person_presence_ratio=count / len(results),
        average_person_confidence=(sum(person_confidences) / len(person_confidences)) if person_confidences else None,
        maximum_person_confidence=max(person_confidences) if person_confidences else None,
    )
    summary = [DetectedClassSummary(class_name=name, **classes[name]) for name in sorted(classes)]
    return person, frame_results, summary


def analyze_process_evidence(video: UploadFile) -> VideoProcessEvidenceResponse:
    started = perf_counter()
    with validated_video(video) as (capture, metadata):
        indices = sample_frame_indices(metadata.total_frames, DEFAULT_LIMITS.sampled_frames)
        timestamps = [i / metadata.fps for i in indices]
        results = [detect_objects(analysis_frame(frame)) for frame in sampled_frames(capture, indices)]
        first = results[0]
        if any(r.detector != first.detector or r.inference_device != first.inference_device for r in results):
            raise DetectionInferenceError("Inconsistent detector results.")
        person, frames, summary = summarize_detections(timestamps, results)
    return VideoProcessEvidenceResponse(
        filename=video.filename or "upload", frames_analyzed=len(results), timestamps_seconds=timestamps,
        detector=first.detector, inference_device=first.inference_device,
        person_analysis=person, frame_results=frames, detected_classes_summary=summary,
        processing_time_ms=round((perf_counter() - started) * 1000, 3),
    )
