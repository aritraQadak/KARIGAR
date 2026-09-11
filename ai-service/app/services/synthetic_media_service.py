"""Bounded, explainable diagnostics. No classifier, authenticity decision or trust penalty.
Signal producers consume reusable analysis data and return RiskSignal; future evaluated
classifiers can implement that same interface and receive an explicitly configured weight.
"""
import logging
import math
from pathlib import Path
from time import perf_counter
import cv2
import numpy as np
from app.schemas.synthetic_media import RiskSignal, SyntheticMediaRisk, SyntheticMediaResponse
from app.services.video_service import (validated_video, sampled_frames, sample_frame_indices,
    analysis_frame, frame_embedding, DEFAULT_LIMITS, SequentialVideoCapture)
from app.services.hand_detection_service import detect_hands, HandLoadingError, HandInferenceError
from app.services.embedding_service import ModelLoadingError, EmbeddingInferenceError
from app.services.similarity_service import cosine_similarity, SimilarityComputationError

logger = logging.getLogger(__name__)
WEIGHTS = {"temporal_embedding_consistency": .35, "optical_flow_consistency": .40,
           "hand_temporal_consistency": .20, "media_metadata": .05}
MIN_COVERAGE = .35
MEDIUM_RISK = .30
HIGH_RISK = .60
MIN_GROUP_COVERAGE = .10
MIN_GROUPS = 2
MAX_EDGE = 256
NEIGHBOR_SECONDS = .10
MAX_NEARBY_SECONDS = .50
TARGET_PAIRS = 8
MIN_PAIRS = 3
MIN_HAND_OBSERVATIONS = 4
FULL_DURATION_SECONDS = 5
EMBEDDING_JUMP = .40
EMBEDDING_ISOLATED_JUMP = .30
FLOW_EXTREME_FRACTION = .03
FLOW_INSTABILITY_SCALE = .02
STATIC_PIXEL_CHANGE = .005
STATIC_COVERAGE_FACTOR = .20
MIN_CONTRAST = 24
MIN_SHARPNESS = 80
MIN_BRIGHTNESS = 30
FULL_RESOLUTION_SHORT_EDGE = 240
HAND_DISPLACEMENT = .20
HAND_WEIGHTS = (.30, .30, .25, .15)
TEMPORAL_RISK_WEIGHTS = (.5, .5)
FLOW_RISK_WEIGHTS = (.5, .5)
METADATA_DURATION_TOLERANCE = .10
METADATA_RECONSTRUCTED_COVERAGE = .5
FLOW_OPTIONS = dict(pyr_scale=.5, levels=2, winsize=15, iterations=2, poly_n=5, poly_sigma=1.1, flags=0)


def bounded(value):
    value = float(value)
    if not math.isfinite(value):
        raise ValueError("Risk metrics must be finite.")
    return max(0., min(1., value))


def available(risk, coverage, reason, **metrics):
    return RiskSignal(available=True, risk=bounded(risk), coverage=bounded(coverage), reason=reason, raw_metrics=metrics)


def unavailable(reason, **metrics):
    return RiskSignal(reason=reason, raw_metrics=metrics)


def ensemble(signals):
    """Unavailable signals have no numerical vote; they still reduce overall coverage."""
    if any(not math.isfinite(w) or w <= 0 for w in WEIGHTS.values()):
        raise ValueError("Forensic weights must be finite and positive.")
    votes = [(name, signal, WEIGHTS[name] * signal.coverage) for name, signal in signals.items()
             if name in WEIGHTS and signal.available and signal.risk is not None and signal.coverage > 0]
    denominator = sum(weight for _, _, weight in votes)
    coverage = bounded(denominator / sum(WEIGHTS.values()))
    risk = bounded(sum(signal.risk * weight for _, signal, weight in votes) / denominator) if denominator else None
    groups = [signal for name, signal, _ in votes if name != "media_metadata" and signal.coverage >= MIN_GROUP_COVERAGE]
    level = "inconclusive"
    if risk is not None and coverage >= MIN_COVERAGE and len(groups) >= MIN_GROUPS:
        level = "low" if risk < MEDIUM_RISK else "medium"
        if risk >= HIGH_RISK and sum(s.risk >= MEDIUM_RISK for s in groups) >= MIN_GROUPS:
            level = "high"
    interpretation = ("Inconclusive: insufficient usable or corroborating forensic evidence." if level == "inconclusive" else
        f"{level.capitalize()} synthetic-media risk based on uncalibrated forensic signals. This is not proof of AI generation or authenticity.")
    return SyntheticMediaRisk(available=bool(votes), risk_score=risk, risk_level=level,
        coverage=coverage, signals=signals, interpretation=interpretation)


def neighbor_pairs(representative, metadata):
    offset = max(1, round(metadata.fps * NEIGHBOR_SECONDS))
    return [(i, i + offset) for i in representative if i + offset < metadata.total_frames
            and offset / metadata.fps <= MAX_NEARBY_SECONDS]


def temporal_signal(indices, embeddings, metadata, quality):
    if any(i not in embeddings for i in indices) or len(indices) < MIN_PAIRS + 1:
        return unavailable("Insufficient valid DINOv2 observations.")
    changes = np.array([1 - cosine_similarity(embeddings[a].vector, embeddings[b].vector)
                        for a, b in zip(indices, indices[1:])])
    abrupt = float(np.mean(changes > EMBEDDING_JUMP))
    isolated = sum(changes[i] - max(changes[i-1], changes[i+1]) > EMBEDDING_ISOLATED_JUMP
                   for i in range(1, len(changes)-1)) / max(1, len(changes)-2)
    gap = float(np.median(np.diff(indices) / metadata.fps))
    coverage = quality * min(1, len(changes) / (TARGET_PAIRS-1)) * min(1, MAX_NEARBY_SECONDS / gap)
    return available(TEMPORAL_RISK_WEIGHTS[0] * abrupt + TEMPORAL_RISK_WEIGHTS[1] * isolated, coverage,
        "Embedding discontinuities can reflect ordinary cuts, movement, lighting or occlusion.",
        consecutive_similarity=[float(1-c) for c in changes], abrupt_fraction=abrupt,
        isolated_outlier_fraction=float(isolated), median_gap_seconds=gap,
        average_visual_change=float(changes.mean()), maximum_visual_change=float(changes.max()))


def hand_signal(indices, hands, metadata, quality):
    if hands is None or any(i not in hands for i in indices):
        return unavailable("Hand analysis unavailable; no zero-risk substitution.")
    observed = sum(bool(hands[i]) for i in indices)
    pairs = [(a,b) for a,b in zip(indices, indices[1:]) if (b-a)/metadata.fps <= MAX_NEARBY_SECONDS]
    matched = [(a,b) for a,b in pairs if len(hands[a]) == len(hands[b]) == 1
               and len(hands[a][0].landmarks) == len(hands[b][0].landmarks) == 21]
    if observed < MIN_HAND_OBSERVATIONS or len(matched) < MIN_PAIRS:
        return unavailable("Too few nearby unambiguous hand observations; gaps/occlusion reduce coverage.",
            observed_frames=observed, comparable_pairs=len(matched))
    flicker = sum(bool(hands[a]) != bool(hands[b]) for a,b in pairs) / len(pairs)
    counts = sum(len(hands[a]) != len(hands[b]) for a,b in pairs) / len(pairs)
    displacements = [float(np.linalg.norm(np.asarray(hands[a][0].landmarks)[:,:2] -
                         np.asarray(hands[b][0].landmarks)[:,:2], axis=1).mean()) for a,b in matched]
    if not all(math.isfinite(d) for d in displacements):
        return unavailable("Non-finite hand observations.")
    labeled = [(hands[a][0].handedness, hands[b][0].handedness) for a,b in matched
               if hands[a][0].handedness and hands[b][0].handedness]
    flips = sum(a != b for a,b in labeled) / len(labeled) if labeled else 0
    jumps = sum(d > HAND_DISPLACEMENT for d in displacements) / len(displacements)
    metrics = (flicker, counts, jumps, flips)
    usable_weights = HAND_WEIGHTS if labeled else HAND_WEIGHTS[:3]
    risk = sum(w*v for w,v in zip(usable_weights, metrics)) / sum(usable_weights)
    return available(risk, quality * observed / len(indices) * min(1,len(matched)/(TARGET_PAIRS-1)) * sum(usable_weights),
        "Independent hand detections may fluctuate during legitimate occlusion or fast movement; no identity tracking.",
        observed_frames=observed, comparable_pairs=len(matched), presence_toggle_fraction=flicker,
        count_change_fraction=counts, landmark_jump_fraction=jumps, handedness_flip_fraction=flips,
        labeled_pairs=len(labeled), mean_landmark_displacement=float(np.mean(displacements)))


def metadata_signal(metadata, filename, streaming):
    # Only internal consistency is considered. Missing optional headers are neutral.
    expected = metadata.total_frames / metadata.fps
    mismatch = abs(expected - metadata.duration_seconds) / max(expected, metadata.duration_seconds)
    return available(bounded(mismatch / METADATA_DURATION_TOLERANCE), METADATA_RECONSTRUCTED_COVERAGE if streaming else 1,
        "Validated metadata consistency only. Missing headers, re-encoding and browser WebM are not evidence of synthesis.",
        container_hint=Path(filename or "").suffix.lower(), codec=None,
        fps=metadata.fps, total_frames=metadata.total_frames, duration_seconds=metadata.duration_seconds,
        relative_duration_mismatch=mismatch, streaming_metadata_reconstructed=streaming)


class SyntheticAnalysis:
    """Retain at most sixteen small grayscale frames, never full-resolution images."""
    def __init__(self, metadata, representative, filename, streaming=False):
        self.metadata, self.representative, self.filename, self.streaming = metadata, representative, filename, streaming
        self.pairs = neighbor_pairs(representative, metadata)
        self.indices = sorted(set(representative) | {b for _,b in self.pairs})
        self.gray, self.qualities = {}, []
        self.elapsed = 0.
        self.frame_error = False

    def observe(self, index, frame):
        if index not in self.indices:
            return
        started = perf_counter()
        try:
            height,width = frame.shape[:2]
            scale = min(1,MAX_EDGE/max(height,width))
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.resize(gray,(max(1,round(width*scale)),max(1,round(height*scale))))
            contrast = bounded(float(gray.std()) / MIN_CONTRAST)
            sharpness = bounded(float(cv2.Laplacian(gray,cv2.CV_32F).var()) / MIN_SHARPNESS)
            brightness = min(bounded(float(gray.mean())/MIN_BRIGHTNESS),bounded((255-float(gray.mean()))/MIN_BRIGHTNESS))
            resolution = bounded(min(height,width)/FULL_RESOLUTION_SHORT_EDGE)
            self.qualities.append(min(contrast,sharpness,brightness,resolution))
            self.gray[index] = gray
        except (cv2.error, ValueError, TypeError):
            logger.exception("Forensic frame preparation failed")
            self.frame_error = True
        finally:
            self.elapsed += perf_counter()-started

    def finish(self, embeddings, hands, device=None):
        started = perf_counter()
        flow_metrics, pixel_changes = [], []
        for a,b in self.pairs:
            if a not in self.gray or b not in self.gray or self.gray[a].shape != self.gray[b].shape:
                continue
            prev, nxt = self.gray[a], self.gray[b]
            pixel_changes.append(float(np.mean(cv2.absdiff(prev,nxt))) / 255)
            try:
                flow = cv2.calcOpticalFlowFarneback(prev,nxt,None,**FLOW_OPTIONS)
                if not np.isfinite(flow).all():
                    continue
                diagonal = math.hypot(*prev.shape)
                magnitude = np.linalg.norm(flow,axis=2) / diagonal
                # Subtract global translation so handheld pans alone do not dominate risk.
                residual = np.linalg.norm(flow-np.median(flow,axis=(0,1)),axis=2)/diagonal
                flow_metrics.append((float(np.median(magnitude)), float(np.var(magnitude)),
                                     float(np.mean(residual > FLOW_EXTREME_FRACTION))))
            except cv2.error:
                logger.exception("Forensic optical flow unavailable for a sampled pair")
        low_information = bool(pixel_changes) and max(pixel_changes) < STATIC_PIXEL_CHANGE
        quality = float(np.mean(self.qualities)) if self.qualities else 0
        duration_factor = min(1,self.metadata.duration_seconds/FULL_DURATION_SECONDS)
        quality *= duration_factor * (STATIC_COVERAGE_FACTOR if low_information else 1)
        signals = {}
        try:
            signals["temporal_embedding_consistency"] = temporal_signal(self.representative, embeddings,self.metadata,quality)
        except (SimilarityComputationError, ValueError):
            signals["temporal_embedding_consistency"] = unavailable("Embedding comparison failed; no zero-risk substitution.")
        if len(flow_metrics) >= MIN_PAIRS:
            medians, variances, extremes = np.array(flow_metrics).T
            instability = bounded(float(np.median(np.abs(np.diff(medians))))/FLOW_INSTABILITY_SCALE)
            signals["optical_flow_consistency"] = available(FLOW_RISK_WEIGHTS[0]*float(extremes.mean())+FLOW_RISK_WEIGHTS[1]*instability,
                quality*min(1,len(flow_metrics)/TARGET_PAIRS),
                "Motion inconsistency is not an AI detector; camera motion, edits and occlusion can contribute.",
                pairs_analyzed=len(flow_metrics), median_flow_fraction=float(np.median(medians)),
                mean_spatial_variance=float(variances.mean()), extreme_motion_fraction=float(extremes.mean()),
                flow_instability=instability, maximum_flow_change=float(np.max(np.abs(np.diff(medians)))), low_information_content=low_information,
                mean_pixel_change=float(np.mean(pixel_changes)), quality_factor=quality)
        else:
            signals["optical_flow_consistency"] = unavailable("Too few valid nearby flow pairs.",pairs_analyzed=len(flow_metrics), low_information_content=low_information, quality_factor=quality)
        signals["hand_temporal_consistency"] = hand_signal(self.representative,hands,self.metadata,quality)
        signals["media_metadata"] = metadata_signal(self.metadata,self.filename,self.streaming)
        report = ensemble(signals)
        report.frames_analyzed = len(self.gray)
        report.processing_time_ms = round((self.elapsed+perf_counter()-started)*1000,3)
        report.inference_devices = {"optical_flow":"cpu", "embedding":device, "hands":"cpu" if hands is not None else None}
        return report


def analyze_synthetic_video(video):
    started = perf_counter()
    with validated_video(video) as (capture, metadata):
        representative = sample_frame_indices(metadata.total_frames,DEFAULT_LIMITS.sampled_frames)
        analysis = SyntheticAnalysis(metadata,representative,video.filename,isinstance(capture,SequentialVideoCapture))
        embeddings, hands = {}, {}
        embedding_failed = hand_failed = False
        device = None
        for index, raw in zip(analysis.indices,sampled_frames(capture,analysis.indices)):
            frame = analysis_frame(raw)
            analysis.observe(index,frame)
            if index in representative:
                if not embedding_failed:
                    try:
                        embeddings[index] = frame_embedding(frame,DEFAULT_LIMITS)
                        device = embeddings[index].inference_device
                    except (ModelLoadingError, EmbeddingInferenceError):
                        embeddings.clear(); embedding_failed = True; device = None
                if not hand_failed:
                    try:
                        hands[index] = detect_hands(frame)
                    except (HandLoadingError, HandInferenceError):
                        hands.clear(); hand_failed = True
        report = analysis.finish(embeddings,None if hand_failed else hands,device)
    return SyntheticMediaResponse(filename=video.filename or "upload",frames_analyzed=report.frames_analyzed,
        duration_seconds=metadata.duration_seconds,synthetic_media_risk=report,
        inference_devices=report.inference_devices,processing_time_ms=round((perf_counter()-started)*1000,3))
