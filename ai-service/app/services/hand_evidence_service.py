from time import perf_counter
from fastapi import UploadFile
from app.schemas.hand import HandAnalysis, HandFrameResult, VideoHandEvidenceResponse
from app.services.hand_detection_service import detect_hands, HandInferenceError, hand_detection_config
from app.services.video_service import validated_video, sample_frame_indices, sampled_frames, analysis_frame, DEFAULT_LIMITS


def summarize_hands(timestamps, results):
    if not results or len(timestamps) != len(results):
        raise HandInferenceError("Hand sampling did not complete.")
    frames = [HandFrameResult(timestamp_seconds=t, hand_detected=bool(hands), hand_count=len(hands),
        left_hand_detected=any(h.handedness == "Left" for h in hands),
        right_hand_detected=any(h.handedness == "Right" for h in hands),
        unknown_handedness_count=sum(h.handedness is None for h in hands),
        detection_source=("crop_fallback" if any(h.detection_source == "crop_fallback" for h in hands) else "full_frame") if hands else "none")
        for t, hands in zip(timestamps, results)]
    count = sum(f.hand_detected for f in frames)
    return HandAnalysis(frames_analyzed=len(frames), frames_with_hands=count,
        hand_presence_ratio=count / len(frames), average_hand_count=sum(f.hand_count for f in frames) / len(frames),
        maximum_hand_count=max(f.hand_count for f in frames)), frames


def analyze_hand_evidence(video: UploadFile):
    started = perf_counter()
    with validated_video(video) as (capture, metadata):
        indices = sample_frame_indices(metadata.total_frames, DEFAULT_LIMITS.sampled_frames)
        timestamps = [i / metadata.fps for i in indices]
        results = [detect_hands(analysis_frame(frame)) for frame in sampled_frames(capture, indices)]
        analysis, frames = summarize_hands(timestamps, results)
    return VideoHandEvidenceResponse(filename=video.filename or "upload", frames_analyzed=len(frames),
        timestamps_seconds=timestamps, hand_detection_config=hand_detection_config(DEFAULT_LIMITS.sampled_frames), hand_analysis=analysis, frame_results=frames,
        processing_time_ms=round((perf_counter() - started) * 1000, 3))
