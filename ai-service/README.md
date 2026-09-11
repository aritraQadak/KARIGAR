# KARIGAR AI verification service - visual evidence

## Hand recall tuning: current configuration

The hand endpoint has now been reported functional in real testing. Earlier notes
about MediaPipe being absent describe the original implementation environment;
this update does not install or modify any packages.

Current detector settings: two hands, detection 0.30, presence 0.30, tracking 0.30,
IMAGE mode on CPU, and handedness classification threshold 0.70. The tracking
option is explicit but inactive in IMAGE mode. Restart the service to reload the
cached detector with these thresholds.

Each hand-only input copy preserves aspect ratio, is never upscaled, and is capped
at a 1280-pixel long edge (1920x1080 becomes 1280x720). DINOv2 and YOLO frames are
not modified. When full-frame detection finds no hands, fallback analyzes at most
three source-frame crops: left 60%, right 60%, and a centered 60%-width/80%-height
region. Crops are individually resized for detection and mapped back into shared
frame-normalized landmark coordinates. Detections whose mean 2D landmark distance
is <=0.08 of frame-normalized coordinates are conservatively merged. At most two
hands are returned; processing stops once two distinct hands have been collected.
Full-frame success skips all crop calls.

This merge is a development approximation: nearby distinct hands may be merged,
and unusual repeated predictions can still affect counts. Each sampled timestamp
counts only once toward presence, regardless of crop detections. The Trust Score
hand bands and all category/component maxima are unchanged (4+6+8+2 reserved).

Hand sampling remains eight representative frames, matching the previous test
and shared craft flow. No neighbor retries are used; reported timestamps therefore
remain those of the sampled frames. This isolates the detector change and bounds
cost to at most four MediaPipe calls per sample, without extra video decoding or
DINOv2/YOLO inference. All constants are in `hand_detection_service.py`.

`/verify/video-hand-evidence` now returns `hand_detection_config` and each frame
has `detection_source`: `full_frame`, `crop_fallback`, or `none`. The shared craft
hand-frame results expose the same source. No raw landmark arrays are exposed.
Lower thresholds and crop fallback may increase false positives and require
calibration on real craft videos; they do not establish craft activity.

### Retest the pottery video

Stop the old server with Ctrl+C, then run:

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/docs, expand **POST /verify/video-hand-evidence**, click
**Try it out**, select the same pottery video, and **Execute**. Confirm thresholds
0.30 and crop fallback enabled in `hand_detection_config`. Compare the new
`frames_analyzed`, `hand_analysis.frames_with_hands`, and `hand_presence_ratio`
with the baseline **8, 1, 0.125**. Review timestamps and `detection_source` to see
where fallback helped, and visually check positive frames for false detections.
No improvement percentage is claimed until this real-video comparison is run.

## Stage 9: original hand implementation notes

This section supersedes the older process scoring formula and ceilings below.
MediaPipe is currently **not installed** in the existing `.venv`. No packages were
installed or changed. The new implementation uses MediaPipe Tasks Hand Landmarker
in IMAGE mode, with the official version-1 `hand_landmarker.task` model. A compatible
runtime with MediaPipe is required for actual hand inference; requirements now
declare it, but do not install into the protected environment as part of this task.

The detector loads once per process and runs on CPU, separately from DINOv2/YOLO
CUDA execution. IMAGE mode avoids tracking state across sparse frames and videos.
First usable invocation downloads the model to `.cache/mediapipe`, using a bounded
download and temporary file followed by replacement. Loading failures are cached
until restart. Maximum hands is two; detection/presence thresholds are 0.5 and
handedness confidence threshold is 0.7. Uncertain handedness is counted as unknown,
not assigned a fabricated left/right label. Mirrored media and viewpoint can still
affect model handedness. Landmark coordinates stay internal.

`POST /verify/video-hand-evidence` accepts multipart field `video`, reuses the
existing validation, temporary-file cleanup and representative frame sampling,
and returns per-frame counts, left/right flags, unknown-handedness counts, and
aggregate hand metrics. `hand_presence_ratio` is sampled frames containing hands
divided by analyzed frames, not exact video-time coverage. Average hand count
includes zero-hand frames. `hand_motion_score` remains null: no fragile tracking,
motion, interaction, or identity inference is implemented.

`/verify/craft` reuses each already-decoded representative frame for hand analysis
once, without repeating video decoding, DINOv2 or YOLO inference. Inspect
`technical_signals.hand_evidence_available`, `hand_presence_ratio`, `hand_analysis`,
`hand_frame_results`, `hand_evidence_error`, and `hand_inference_device` (CPU).
Photo-only requests do not load the hand detector. If hand loading/inference fails,
craft keeps its other analyses, discards partial hand results, and reports hand
evidence unavailable with null ratio and zero hand points. The dedicated endpoint
returns 503 for loading/dependency failure and 500 for inference failure.

Current Craft Process Evidence components sum to a maximum of 20:

| Component | Maximum | Mapping |
| --- | --- | --- |
| Valid process video | 4 | Successful video analysis |
| Temporal progression | 6 | Six times the existing bounded temporal heuristic |
| Hand presence | 8 | Ratio bands below |
| Hand-object interaction | 2 | Unavailable, zero points |

Hand ratio >=0.75 earns 8 points; >=0.50 earns 6; >=0.25 earns 3; greater than zero
earns 1; zero or unavailable earns 0. Constants are in `trust_score_service.py`.
The response exposes each component's score, maximum, and availability. Their sum
is the process category score, and category scores sum to the Trust Score.

Person visibility scoring is unchanged and remains a separate optional bonus.
Hands without person detections can earn all eight hand points and up to 18 process
points; a visible person without hands earns no hand points. Hands alone do not
prove manual production or authenticity. Gloves, occlusion, tools, blur, lighting,
camera angle, and the two-hand cap can affect detection. Full person/face visibility
is optional. No facial recognition, biometric identity matching, age/gender or
emotion inference is performed. Hand-object interaction remains future work.

Current process ceiling is 18/20 (10/20 with hands unavailable). Current API Trust
Score ceiling is 78, or 63 without person visibility; with hands unavailable these
are 70 and 55. Reserved product-video and listing inputs are still unsupported.
Even theoretical future inputs cannot earn the reserved interaction points in this
stage, so the theoretical scoring ceiling is 98. Older formulas/examples below
are historical; the generated example JSON reflects the current components.

### Test in Swagger

Start from `D:\Karigar\KARIGAR\ai-service`:

```powershell
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

1. Open http://127.0.0.1:8000/docs.
2. Expand **POST /verify/video-hand-evidence**, click **Try it out**, select a short
   `video`, and **Execute**. The unchanged current environment returns a clear 503
   because MediaPipe is absent. With a compatible runtime, inspect hand counts,
   ratio, and per-frame handedness flags.
3. Test **POST /verify/craft** with `product_image` and `video`. Inspect hand
   availability/error first, then the hand signals and process `components`.
4. Compare the separate `artisan_visibility` category; hand points do not depend
   on YOLO person detections.

Tests mock hand inference and need no model download, webcam, CUDA, or large video.
Actual MediaPipe inference has not been validated in the protected environment.

Independent FastAPI service for image validation and DINOv2 visual embeddings.
These features do not establish authenticity or classify crafts. Sampled video
temporal analysis is also supported. No frontend integration, Node changes, database
access, or environment-file loading is included.

## Start with the existing project environment

Run in PowerShell:

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The existing `.venv` already has the dependencies. No installation is required.
Do not recreate the environment or run package install, upgrade, downgrade, or
uninstall commands against it. `requirements.txt` lists the service runtime
dependencies (including torch and transformers); it is not a lockfile for the existing ML environment. `-B` prevents
Python bytecode writes. Stop the server with Ctrl+C.

## Test manually

```powershell
curl.exe http://127.0.0.1:8000/health
curl.exe -X POST http://127.0.0.1:8000/verify/image -F "file=@C:\path\to\product.png;type=image/png"
```

Health returns `{"status":"ok"}`. An image returns, for example:

```json
{"filename":"product.png","width":640,"height":480,"format":"PNG","model":"facebook/dinov2-small","embedding_dimension":384,"inference_device":"cpu","processing_time_ms":250.0}
```

Interactive API docs: http://127.0.0.1:8000/docs. Use the `file` multipart field.
Image format is detected from content, not the filename. Filename is returned
as metadata only and never used as a filesystem path.

Errors use FastAPI's `detail` response field:

| Status | Meaning |
| --- | --- |
| 400 | Empty, malformed, truncated, or unsupported image |
| 413 | Upload exceeds 10 MiB or image exceeds 50 million pixels / Pillow safety limits |
| 415 | Missing or non-image declared content type |
| 422 | Missing required multipart file or invalid request structure |
| 503 | Processor/model loading failed; check connectivity, cache access, and device support, then restart to retry |
| 500 | Inference failed, including device errors or insufficient memory |

Pillow verifies the image and decodes its first frame. Animated images return
canvas dimensions; this is not verification of every animation frame. SVG is
unsupported by Pillow. Uploaded files are not retained; multipart parsing may
temporarily spool uploads to disk and the route closes its upload handle.
The file-size check runs after multipart parsing, so it is not a transport-level
request limit. A future public deployment should enforce a request limit at its
ingress. This stage runs locally.

CORS permits HTTP localhost and 127.0.0.1 on ports 5173 (Vite), 4173 (preview),
and 3000. It permits GET/POST and Content-Type, without credentials. No frontend
proxy or existing application behavior is changed.

## Automated checks

From `ai-service`:

```powershell
..\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
```

Tests use standard-library unittest and the existing environment's `httpx`
(FastAPI TestClient). `httpx` is a test-only dependency and intentionally is not
in the runtime requirements. Tests generate image fixtures in memory and mock
pretrained loaders; they never download weights. Embedding tests use real PyTorch
tensors to check CLS pooling, normalization, inference mode, RGB conversion,
concurrent model reuse, device selection, and sanitized failures. A small randomly
initialized DINOv2 also exercises the installed Transformers processor and model
without pretrained weights. CUDA selection
is mocked and does not demonstrate actual GPU execution.

## Layout

- `app/main.py`: application, CORS, health endpoint
- `app/routes/verification.py`: upload route and resource cleanup
- `app/services/image_verification.py`: bounded image reading and Pillow validation
- `app/schemas/verification.py`: typed metadata response
- `app/utils/`: reserved utility package
- `tests/test_verification.py`: endpoint and validation checks

## DINOv2 embedding behavior

Model: [facebook/dinov2-small](https://huggingface.co/facebook/dinov2-small).
The matching Hugging Face `AutoImageProcessor` handles resize, crop, rescaling,
and normalization using the pretrained configuration. Images are converted to RGB.
The model runs in evaluation mode under `torch.inference_mode()`. We select the
final CLS token (`last_hidden_state[0, 0, :]`) and L2-normalize its 384 values.
This is the global image representation described in the
[DINOv2 documentation](https://huggingface.co/docs/transformers/model_doc/dinov2).

`app.services.embedding_service.embed_image(pillow_image)` returns an
`EmbeddingResult` containing the normalized 1-D CPU tensor, model identifier, and
inference device. Later similarity, video-frame, or classification components can
reuse it. The HTTP response deliberately excludes the vector and makes no
verification/authenticity decision. Animated uploads use the first frame only.

The processor and model load lazily on the first valid upload, once per process.
A lock protects initialization and serializes inference to limit concurrent GPU
memory use. Run one Uvicorn worker for laptop development; each additional worker
would load its own model. `/health` is a liveness check and does not load or confirm
model readiness. Invalid uploads also do not load the model.

The first valid upload needs internet access to download the pretrained processor,
configuration, and weights from Hugging Face. Model files are explicitly cached in
`ai-service/.cache/huggingface` (ignored by the service-local `.gitignore`), not in
`.venv`. Subsequent requests reuse the in-memory model; subsequent process starts
reuse cached files, though Hugging Face may check for upstream updates. An initial
loading failure is remembered until restart, avoiding repeated download attempts
on every request. No model download is performed by automated tests.

CUDA is selected automatically when `torch.cuda.is_available()` is true. Otherwise
a warning is logged and CPU inference proceeds normally. CPU is expected to be
slower; unavailable CUDA is not an HTTP error. If CUDA is reported available but
model placement or inference fails, the service returns 503 or 500 respectively,
without silently misreporting CPU work as GPU inference.

`processing_time_ms` measures service processing from upload validation through
embedding completion, including first-load/download time and waiting for the
inference lock. It excludes multipart parsing and response transfer. Copying the
result to CPU waits for GPU computation to finish. The example timing above is
illustrative, not a benchmark; first requests can take substantially longer.

## Verify CUDA usage

From `ai-service`, using the same interpreter as the server:

```powershell
..\.venv\Scripts\python.exe -B -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

Send a valid image using the curl command above or http://127.0.0.1:8000/docs.
A successful response with `inference_device: "cuda"` means the model and inputs
were placed on CUDA and inference completed. `"cpu"` means CPU fallback. On an
NVIDIA system, `nvidia-smi` can additionally show the Python process and GPU memory
usage while the service runs. Do not modify the existing environment to address
CUDA availability as part of this stage.

Additional files:
- `app/services/embedding_service.py`: reusable singleton feature extraction
- `tests/test_embedding_service.py`: isolated embedding tests without downloads
- `.gitignore`: service-local model cache and bytecode exclusions

## Stage 3: image-to-image visual similarity

`POST /verify/image-similarity` accepts two multipart file fields:
`reference_image` and `product_image`. Both use the same validation as `/verify/image`
(10 MiB and 50 million pixels per image, image content type, Pillow verification,
full first-frame decoding, and decompression-bomb checks). Both are validated before
inference. This endpoint reuses the existing singleton DINOv2 embedding service;
it does not load a separate model.

The score is the dot product of the two L2-normalized 384-dimensional embeddings,
clamped to [-1, 1] for floating-point overshoot. `similarity_percent` is exactly
`cosine_similarity * 100`, so its range is [-100, 100]; negative values are retained.
It is a visual similarity value, not an authenticity probability, confidence,
or proof that a product is genuine. Similar appearance alone does not prove
materials, origin, craftsmanship, or authenticity. Raw vectors are never returned.

Provisional development thresholds are named constants in
`app/services/similarity_service.py` and require later calibration:

| Cosine similarity | Interpretation |
| --- | --- |
| >= 0.80 | `high_visual_similarity` |
| >= 0.60 and < 0.80 | `moderate_visual_similarity` |
| < 0.60 | `low_visual_similarity` |

A response includes reference/product filename, width and height, plus model,
embedding dimension, inference device, cosine score, percentage, interpretation,
and processing time. Timing includes validation, both embeddings, comparison,
and any initial model loading or lock wait; it excludes multipart parsing and
response transfer. The device describes embedding inference; the vector dot
product is computed on the returned CPU tensors.

Validation errors retain their existing HTTP status and identify the offending
field in `detail`. Missing fields return 422. Model loading failures return 503;
embedding or similarity computation failures return 500 with a clear message.
Both upload handles and decoded images are closed on success and failure.

### Test in Swagger

1. Start the service using the PowerShell command above.
2. Open http://127.0.0.1:8000/docs.
3. Expand **POST /verify/image-similarity** and click **Try it out**.
4. Choose a file for **reference_image** and a file for **product_image**.
5. Click **Execute**. The first valid request may take longer while DINOv2 loads.
6. Inspect the score, interpretation, and `inference_device` in the response.
   Try the same image in both fields for a score close to 1, then compare different
   images. Different images can still have high visual similarity.

Optional PowerShell curl test:

```powershell
curl.exe http://127.0.0.1:8000/verify/image-similarity -F "reference_image=@C:\path\to\reference.png;type=image/png" -F "product_image=@C:\path\to\product.png;type=image/png"
```

`tests/test_similarity.py` mocks embeddings and never downloads DINOv2. It covers
valid requests, invalid inputs, identical/similar/different vectors, negative
scores, threshold boundaries, clamping, and embedding/computation failures.
Run it with the existing unittest discovery command above. No new dependencies,
YOLO, or video verification are introduced in this stage.

## Stage 4: sampled video temporal analysis

`POST /verify/video` accepts a multipart upload named `video`. MP4, MOV, AVI,
and WebM extensions are supported with matching video MIME types. Missing MIME
or `application/octet-stream` is allowed when the extension is supported; OpenCV
must still decode the video. Codec availability depends on the installed OpenCV
build. A supported container extension does not guarantee codec support.

Defaults are configured in the `VideoLimits` dataclass in
`app/services/video_service.py`:

- Maximum upload: 100 MiB; maximum reported duration: 60 seconds.
- Analysis frames fit within 1920 x 1080, preserving aspect ratio without upscaling.
  Larger source videos are resized, subject to a 50-million-source-pixel safety cap.
- Maximum FPS: 240; maximum frame count: 14,400; at least two frames are required.
- Sample count: eight. Change `DEFAULT_LIMITS` to calibrate these development limits.

OpenCV reports FPS, frame count, source dimensions, and estimated duration
(frame count / FPS). Missing, nonfinite, or invalid metadata is rejected.
We seek to distinct frame indices distributed from approximately 5% to 95% of
the available frames, avoiding reliance on the opening/closing frame. Very short
clips may return fewer samples and include their endpoints. These are uniform
representative samples, not codec keyframes or detected craft milestones.
`timestamps_seconds` contains estimated frame-index / FPS times; variable-frame-rate
files and backend seeking may be approximate. The service checks only sampled
frames, so it cannot detect every corrupt or unusual section in a video.

Sampling bounds DINOv2 work rather than embedding every frame. Codec seeking may
internally decode intermediate frames. Each sampled BGR frame is resized, converted
to RGB/Pillow, and embedded sequentially using the existing singleton DINOv2 model.
`frame_embedding` separates conversion from orchestration for future batching.
No new model instance is created per frame. No YOLO or video classification is added.

The response includes filename, `video_metadata`, `frames_analyzed`,
`timestamps_seconds`, model, embedding dimension, inference device, processing
time, and `temporal_analysis` containing:

- `consecutive_similarities`: clamped cosine scores between adjacent samples.
- `average_consecutive_similarity`, `minimum_consecutive_similarity`, and
  `maximum_consecutive_similarity`.
- `average_visual_change` and `maximum_visual_change`, using `1 - cosine` per pair.

Cosine ranges from -1 to 1, so visual change ranges from 0 to 2. No raw embeddings
are returned. Visual change does not prove craft progression or authenticity.
Camera movement, lighting, zoom, background movement, and editing can all affect
these values. No authenticity score or genuine/fake decision is produced.

Upload data is copied in bounded chunks to a Python `TemporaryDirectory` under
`ai-service/.cache/video-uploads`, already excluded by `.gitignore`. OpenCV capture
handles are released before directory cleanup, including on processing errors;
the route closes its upload handle. Empty cache parent directories may remain.
As with image uploads, FastAPI parses multipart data before the service size check;
this is not a transport-level limit. Source frames must be decoded before resizing,
so the analysis resolution is not a bound on decoder memory. Metadata limits rely
on the decoder's reported values, not a full-stream audit.

Errors: 415 for unsupported format/type; 400 for empty, corrupt, invalid metadata,
or unextractable frames; 413 for safety limits; 422 for a missing video field;
503 for model loading failure; 500 for inference, temporal computation, or temporary
storage failure. Internal stack traces are not returned.

### Test video in Swagger

1. Start FastAPI using the existing command at the top of this README.
2. Open http://127.0.0.1:8000/docs.
3. Expand **POST /verify/video**, then click **Try it out**.
4. Choose a short supported video in the **video** file field and click **Execute**.
5. Inspect metadata, timestamps, frame count, and temporal metrics. The first valid
   request may download/load DINOv2; later requests reuse it. CPU works but may be
   slower than CUDA. `inference_device` reports where embedding inference ran.

```powershell
curl.exe http://127.0.0.1:8000/verify/video -F "video=@C:\path\to\craft.mp4;type=video/mp4"
```

`tests/test_video.py` uses small arrays and mocked capture/embedding services to
exercise metadata, sampling, metrics, invalid input, limits, color conversion,
resizing, and cleanup. Tests require neither CUDA nor pretrained downloads.
OpenCV is listed in runtime requirements; no environment packages were installed
or changed. New modules: `app/services/video_service.py`, `app/schemas/video.py`.

## Stage 5: video-to-listing visual match

`POST /verify/video-product-match` accepts multipart fields `video` and
`product_image`. It compares the listing image against several frames from the
final portion of the video. It does not identify whether those frames actually
contain a finished product, and does not produce an authenticity or trust score.

Image validation, video limits, temporary storage cleanup, frame resizing/RGB
conversion, the singleton DINOv2 model, and clamped cosine comparison are shared
with the existing endpoints. No dependencies or model-loading behavior change.
The image is embedded once; selected video frames are embedded sequentially.

`FINAL_FRAME_POSITIONS` in `app/services/video_product_match_service.py` defaults
to `(0.70, 0.80, 0.90, 0.95)`. Each fraction maps to
`round((total_frames - 1) * fraction)`, with duplicates removed and indices sorted.
Timestamps are estimated as frame index / FPS; variable-frame-rate media and
codec seeking remain approximate. Very short clips may yield fewer than four
unique frames. Several late frames reduce reliance on an absolute final frame
that might be blank, blurred, an outro, or show the camera moving away. Sampling
does not guarantee a clear product view or exclude such frames automatically.

`frame_product_similarities` contains each sampled timestamp and its cosine score.
`best_similarity` is the highest score, `average_similarity` is the arithmetic
mean, and `best_matching_timestamp` identifies the highest-scoring sampled frame.
Ties select the earliest sampled timestamp. Cosine values remain in [-1, 1]. Raw
embedding vectors are never returned. Processing time includes validation, model
loading if needed, embedding, comparison, and temporary-file cleanup.

Interpretation uses the best score with provisional development constants
`HIGH_MATCH_THRESHOLD = 0.80` and `MODERATE_MATCH_THRESHOLD = 0.60`:

| Best similarity | Interpretation |
| --- | --- |
| >= 0.80 | `high_visual_match` |
| >= 0.60 and < 0.80 | `moderate_visual_match` |
| < 0.60 | `low_visual_match` |

These are visual-match thresholds requiring calibration. Visual matching alone
does not prove authenticity. DINOv2 whole-image features are influenced by
background, camera angle, lighting, crop, scale, and hands/persons in the frame.
Future work should combine object localization/cropping and process evidence;
none of those capabilities or YOLO is added here.

Validation errors keep existing HTTP status codes and identify the image/video
field during initial validation. Frame extraction errors return 400, model-loading
errors 503, and inference/comparison errors 500. Both uploads, decoded images, and
video temporary files are cleaned up even if processing fails.

### Test video-product matching in Swagger

1. Start the service with the command shown at the top of this README.
2. Open http://127.0.0.1:8000/docs.
3. Expand **POST /verify/video-product-match**.
4. Click **Try it out**.
5. Choose the craft video for **video** and listing image for **product_image**.
6. Click **Execute**. The first request requiring DINOv2 may download/load it.
7. Inspect `frame_product_similarities`, `best_similarity`, `average_similarity`,
   `best_matching_timestamp`, and the development-only `interpretation`.

```powershell
curl.exe http://127.0.0.1:8000/verify/video-product-match -F "video=@C:\path\to\craft.mp4;type=video/mp4" -F "product_image=@C:\path\to\listing.jpg;type=image/jpeg"
```

New files: `app/services/video_product_match_service.py`,
`app/schemas/video_product_match.py`, and `tests/test_video_product_match.py`.
Normal tests mock video capture and embeddings; no model downloads, CUDA, or
large video fixtures are needed. Run the full unittest discovery command above.

## Stage 6: sampled person and common-object evidence

`POST /verify/video-process-evidence` accepts multipart field `video` and runs
Ultralytics YOLO11 nano detection (`yolo11n.pt`, pretrained on COCO). It reuses the
existing video validation, temporary-file cleanup, source limits, analysis resizing,
and approximately eight 5%-95% representative sample positions. Frames are analyzed
sequentially. This endpoint does not invoke DINOv2, tracking, pose estimation, or
real-time analysis.

The detector loads lazily once per process, protected by a lock that also serializes
predictions. CUDA is selected when available, otherwise a CPU fallback warning is
logged. `inference_device` reports the selected execution device. First use downloads
weights into `ai-service/.cache/ultralytics`; later calls reuse the model. Loading
failures are cached until restart (HTTP 503). Inference failures return HTTP 500
without internal exception details. Existing video validation errors still apply.
Normal tests mock loading and inference; they never download weights or need CUDA.

The lazy loader sets process-local `YOLO_CONFIG_DIR` to the service cache and
`YOLO_AUTOINSTALL=false` before importing Ultralytics, and disables its automatic
package installation flag. This does not read or modify `.env` or install into
`.venv`. Weights/configuration stay under the existing ignored `.cache` directory.
Prediction file saving is disabled. The existing environment already provides
Ultralytics; the runtime requirements now list it without installing anything.

`DETECTION_CONFIDENCE = 0.35` in `object_detection_service.py` is the provisional
filter threshold. Predictions use 640-pixel inference size and at most 100 retained
boxes per sample (`MAX_DETECTIONS`). This cap can undercount very crowded frames.
Internal `Detection.xyxy` stores pixel box coordinates relative to the resized
analysis frame; boxes are omitted from the public response.

The endpoint returns:

- `frames_analyzed`, estimated `timestamps_seconds`, detector, device, and timing.
- Per-frame person presence, person count, and highest person confidence.
- `frames_with_person` and `person_presence_ratio`: the fraction of sampled frames
  containing at least one retained person detection. It is not a fraction of exact
  video duration, a count of unique people, or evidence of continuous presence.
- `average_person_confidence`: arithmetic mean across all retained person boxes
  across samples; frames with multiple people contribute multiple confidences.
- `maximum_person_confidence`: highest confidence among retained person boxes.
- A class summary with frames containing each class (counted once per frame) and
  maximum confidence. Classes are sorted by name for stable responses.

When no person is detected, counts/ratio are zero and person confidence fields
are `null`. No detections produces an empty class summary. A missed detection is
not proof that no person was present.

Person presence does not establish artisan identity, handmade production, genuine
craft activity, or authenticity. This endpoint supplies detection evidence only;
no final trust or verification score is produced. Occlusion, blur, lighting,
viewpoint, and sampling can affect results.

Standard COCO labels do not include pottery wheel, loom, weaving shuttle, chisel,
carving tool, spinning wheel, or artisan-specific tools. Common labels such as
`knife` or `scissors` must not be relabeled as craft tools. Craft-specific tool
recognition requires a custom labeled dataset and future fine-tuning.

Model documentation: https://docs.ultralytics.com/models/yolo11/
The following 80 labels come from the installed Ultralytics COCO configuration;
inference uses the pretrained model's actual class-name mapping:

`person`, `bicycle`, `car`, `motorcycle`, `airplane`, `bus`, `train`, `truck`, `boat`, `traffic light`, `fire hydrant`, `stop sign`, `parking meter`, `bench`, `bird`, `cat`, `dog`, `horse`, `sheep`, `cow`, `elephant`, `bear`, `zebra`, `giraffe`, `backpack`, `umbrella`, `handbag`, `tie`, `suitcase`, `frisbee`, `skis`, `snowboard`, `sports ball`, `kite`, `baseball bat`, `baseball glove`, `skateboard`, `surfboard`, `tennis racket`, `bottle`, `wine glass`, `cup`, `fork`, `knife`, `spoon`, `bowl`, `banana`, `apple`, `sandwich`, `orange`, `broccoli`, `carrot`, `hot dog`, `pizza`, `donut`, `cake`, `chair`, `couch`, `potted plant`, `bed`, `dining table`, `toilet`, `tv`, `laptop`, `mouse`, `remote`, `keyboard`, `cell phone`, `microwave`, `oven`, `toaster`, `sink`, `refrigerator`, `book`, `clock`, `vase`, `scissors`, `teddy bear`, `hair drier`, `toothbrush`.

### Test process evidence in Swagger

1. Start the service using the PowerShell command at the top of this README.
2. Open http://127.0.0.1:8000/docs.
3. Expand **POST /verify/video-process-evidence** and click **Try it out**.
4. Choose a short supported video in **video** and click **Execute**.
5. Allow time for the first YOLO download/load, then inspect `person_analysis`,
   `frame_results`, and `detected_classes_summary`.
6. Treat these as sampled detection measurements, not craft verification.

```powershell
curl.exe http://127.0.0.1:8000/verify/video-process-evidence -F "video=@C:\path\to\craft.mp4;type=video/mp4"
```

New modules: `app/services/object_detection_service.py`,
`app/services/process_evidence_service.py`, and `app/schemas/process_evidence.py`.
`tests/test_process_evidence.py` exercises mocked predictions, lazy/single loading,
device selection, aggregation, no-person and multiple-person cases, and endpoint
responses/errors. Run the existing full unittest discovery command.

## Stage 7: combined craft evidence report

`POST /verify/craft` accepts multipart `video` and `product_image` and returns a
`craft_evidence_score` between 0 and 1. This is a provisional weighted heuristic,
not a trained authenticity classifier. The weights, temporal curve, and labels
have not been trained, statistically calibrated, or validated as marketplace
approval criteria. The score is NOT proof of authenticity or an AI probability.

The shared flow validates each upload once and opens one temporary video capture.
It takes the sorted union of the representative sample indices and final-stage
indices. Each unique selected frame is extracted once and gets one DINOv2
embedding; the product image is embedded once. Embeddings are reused by temporal
analysis and final-frame matching. YOLO runs once on each representative sample,
not on additional final-only samples. This usually means up to 11 unique frames
with the default overlapping 95% position (short clips may have fewer). Codec
seeking can internally decode intermediate frames; the application does not
re-extract or re-embed the same selected frame. Models retain their existing
per-process singleton lifetimes. Large frame arrays are not retained across the
whole clip; only compact embeddings and detection results are kept.

### Components and exact provisional formula

- Product match: clamp the highest final-frame/product cosine to [0, 1]. Negative
  cosine becomes zero, not a remapping of the entire [-1, 1] range.
- Human presence: the representative-sample person presence ratio, clamped to
  [0, 1]. Average person detection confidence is included as context only; it is
  not an extra scoring term. No-person confidence is `null`, with presence score 0.
- Temporal change: transform average `1 - consecutive cosine` with the following
  uncalibrated trapezoid, configured in `evidence_scoring_service.py`:

| Average visual change c | Temporal score |
| --- | --- |
| c <= 0.02 | 0 |
| 0.02 < c < 0.15 | (c - 0.02) / (0.15 - 0.02) |
| 0.15 <= c <= 0.35 | 1 |
| 0.35 < c < 0.80 | (0.80 - c) / (0.80 - 0.35) |
| c >= 0.80 | 0 |

This merely downweights nearly static and extremely changing samples. It does
not identify camera motion, cuts, or craftsmanship. More change is not always
assigned a higher score. The breakpoints are named constants for future calibration.

`EvidenceWeights` is immutable and validates finite, nonnegative values summing
to 1. Defaults are product match 0.50, human presence 0.30, and temporal change 0.20:

```text
craft_evidence_score = clamp(
    0.50 * product_match_score
  + 0.30 * human_presence_score
  + 0.20 * temporal_change_score, 0, 1)
craft_evidence_percent = craft_evidence_score * 100
```

Component values and the applied weights are returned. Nonfinite calculations
fail explicitly rather than producing invalid JSON. Development interpretation
constants assign `strong_supporting_evidence` at >= 0.80,
`moderate_supporting_evidence` at >= 0.60 and < 0.80, and
`limited_supporting_evidence` below 0.60. A strong label remains a heuristic label,
not an authenticity decision. For example, perfect product matching and person
presence can reach 0.80 even when the temporal component is zero.

### Limitations

The score combines automated supporting evidence only. It can be affected or
misled by staged, prerecorded, or edited videos; camera movement; lighting;
product/background similarity; people appearing without crafting; YOLO detection
errors; and DINOv2 scene/background bias. It does not establish ownership, identity,
origin, materials, or actual craft activity. Existing sampling and whole-image
limitations still apply. No Gemini/LLM verification, custom training, facial or
identity recognition, metadata forensics, audio analysis, blockchain, frontend
integration, or final marketplace approval logic is introduced.

The endpoint retains existing upload limits and temporary-resource cleanup.
Model-loading failures return 503; inference or scoring failures return 500;
validation errors retain their existing statuses. It does not silently return a
partial score when a model fails. `inference_device` is reported only when both
models used the same device; inconsistent device results produce an error.

### Test combined evidence in Swagger

1. Start FastAPI with the existing PowerShell command at the top of this README.
2. Open http://127.0.0.1:8000/docs.
3. Expand **POST /verify/craft** and click **Try it out**.
4. Select the craft video under **video** and listing image under **product_image**.
5. Click **Execute**. First use may load/download either model.
6. Inspect all three `evidence.*.score` values, `best_matching_timestamp`, the
   person frame counts, and raw `average_visual_change` before interpreting the
   aggregate. Check returned `weights`, `craft_evidence_score`,
   `craft_evidence_percent`, `interpretation`, `models`, and `inference_device`.

```powershell
curl.exe http://127.0.0.1:8000/verify/craft -F "video=@C:\path\to\craft.mp4;type=video/mp4" -F "product_image=@C:\path\to\listing.jpg;type=image/jpeg"
```

New modules: `app/services/craft_service.py`,
`app/services/evidence_scoring_service.py`, and `app/schemas/craft.py`.
`tests/test_craft.py` checks weights, clamping, temporal scoring, labels, unbalanced
components, no-person behavior, cleanup, and mocked integration with explicit
inference-count assertions. Normal tests require neither model downloads nor CUDA.

## KARIGAR Trust Score

The primary user-facing summary is now `trust_score` on `POST /verify/craft`.
It measures HOW MUCH SUPPORTING AND VERIFIABLE EVIDENCE A SELLER PROVIDES. It does
not measure the mathematical probability that a seller or product is authentic.
These are provisional development heuristics that may later be calibrated using
marketplace data. Submitted media is analyzed, not independently established as
truthful, original, or owned by the seller.

### Compatibility and current inputs

`product_image` remains required. `video` (the making-process video) is now optional,
so one valid product photo can receive a score. Existing image-plus-video requests
retain their technical `evidence`, models, device, legacy `craft_evidence_score`,
legacy weights, and legacy interpretation unchanged. Those legacy values are for
compatibility; use `trust_score.score` and `trust_score.level` for the new design.
The additional `technical_signals` exposes raw best/average similarity, person
presence ratio, and full temporal metrics separately from category points.

For photo-only requests, video, detector, and video-dependent legacy fields/raw
signals are null. No video or YOLO work is performed. Invalid provided media and
model failures still produce errors; missing optional evidence is not an error.
A single photo is supported and no multi-view consistency is claimed.

Standalone product-video and listing-metadata uploads are NOT yet accepted by
this endpoint. Their categories are explicitly unavailable with zero points;
the making-process upload is never counted as a standalone product video.
`TrustInputs` provides internal extension fields for future independently validated
product-video and listing-completeness information from the backend. These fields
are not user-supplied scoring assertions on the current API.

### Categories and exact point mapping

All maxima and mapping constants live in `app/services/trust_score_service.py`.
`TrustMaxima` checks nonnegative finite maxima summing to 100. Points are rounded
to four decimal places per category; the total is the sum of those displayed
category points, without reweighting unavailable categories.

| Category | Maximum | Initial mapping |
| --- | --- | --- |
| Product Photo Evidence | 35 | 21 for successful image validation/decoding, plus 14 for successful DINOv2 extraction |
| Product Video Evidence | 15 | 15 for an independently validated/analyzed standalone product video; currently unavailable |
| Craft Process Evidence | 20 | 10 for successful process-video analysis plus 10 times the bounded activity component |
| Artisan Visibility | 15 | 15 times clamped person-presence ratio; confidence statistics are context only |
| Product / Process Match | 10 | 80% best + 20% average cosine; map combined similarity 0.40-0.90 linearly to 0-10 and clamp |
| Listing Completeness | 5 | 5 times a validated completeness fraction supplied by future integration; currently unavailable |

Photo points describe successful analysis, not aesthetic quality or product
truthfulness. The current HTTP flow returns an error on embedding failure rather
than issuing partial points; the reusable service can represent decoded-only
photo evidence with 21 points for future workflows.

The current process activity component is the existing temporal-change trapezoid:
zero through 0.02, linear rise to one at 0.15, plateau through 0.35, linear fall to
zero at 0.80, and zero beyond. More visual change does not always earn more points.
Source duration and sample count are reported as context, not rewards for uploading
longer footage. Existing safety limits remain enforced.

Process signals reserve `temporal_progression_component`, `hand_presence_component`,
and `interaction_component`. The latter two are null and `hand_evidence_available`
is false in current API responses. No hands are inferred from person detection.
Future validated components h and i (each 0-1) can extend temporal component t using
`activity = 1 - (1-t)*(1-h)*(1-i)`, with unavailable components contributing zero.
This is a provisional additive heuristic, not a probability formula. It cannot
reduce already earned temporal points and caps activity at one. No hand detector,
MediaPipe, interaction detection, Gemini, or custom YOLO training is implemented.

Full artisan visibility is an EXTRA TRANSPARENCY BONUS, never a prerequisite.
Not showing a face does not make a seller untrustworthy. YOLO person presence does
not establish full-body/face visibility or identity. Zero person detections earn
zero only in that category and never remove points from another category.
With all future input categories available, a seller can reach 85 without person
visibility. With today's API, the maximum is 80, or 65 without person detections;
90+ is not currently attainable because two input categories remain unavailable.

### Neutral levels

| Score interval | Level |
| --- | --- |
| 0 <= score < 40 | `low_evidence` |
| 40 <= score < 60 | `basic_evidence` |
| 60 <= score < 80 | `good_evidence` |
| 80 <= score < 90 | `high_evidence` |
| 90 <= score <= 100 | `very_high_evidence` |

Each category returns score, maximum, availability, reasons, and relevant signals.
These levels describe evidence coverage, not seller character or marketplace
approval. Staged/edited/prerecorded footage, background similarity, camera motion,
lighting, and model detection errors can influence the technical signals.

Transparency examples (illustrative, not automatic rewards for claims): a photo
alone currently earns 35; an independently analyzed standalone product video could
add 15 in a future integration; process footage adds analysis and bounded activity
points; future validated hand/interaction evidence could improve activity points
when not already at the cap; person visibility adds an optional bonus. Adding
evidence does not guarantee a score increase if that category is already saturated.

### Swagger workflow and example

1. Start FastAPI using the existing interpreter command at the top of this README.
2. Open http://127.0.0.1:8000/docs and expand **POST /verify/craft**.
3. Click **Try it out** and choose `product_image`.
4. For photo-only scoring, leave optional `video` unset and disable its **Send empty
   value** checkbox if Swagger shows one. For combined analysis, select a process
   video in `video`.
5. Click **Execute**. Inspect `trust_score.categories`, their reasons/signals, the
   total, and neutral level. Use `technical_signals` for raw analysis and `models`
   / `inference_device` for execution context.

```powershell
curl.exe http://127.0.0.1:8000/verify/craft -F "product_image=@C:\path\to\listing.jpg;type=image/jpeg"
```

For an illustrative analyzed photo, moderate temporal change (0.20), person
presence in 4/8 samples, and best/average similarity both 0.90:

- Photo: 21 + 14 = 35.
- Standalone product video: unavailable = 0.
- Process: 10 + 10 * 1 = 20.
- Visibility: 15 * 0.5 = 7.5.
- Match: 10 * clamp((0.8*0.90 + 0.2*0.90 - 0.40)/0.50) = 10.
- Listing metadata: unavailable = 0.

Total = 72.5 / 100 (`good_evidence`). This is an illustration, not a measurement
from a real uploaded video. A complete generated example response is in
`examples/trust_score_example.json`.

Tests cover visible category sums, bounds, unavailable categories, zero/minimal
inputs, no-person/full-person cases, match strength, future hand extension, levels,
photo-only endpoint behavior, and theoretical 100-point inputs. The theoretical
case uses internal future inputs, not fabricated current API evidence.

## Stage 10: PRODUCT VIDEO EVIDENCE (current inputs and scoring)

A product video is an optional finished-product showcase, separate from the making
process. Additional analyzed media can increase transparency; it does not prove
authenticity or that different product viewpoints were actually captured. Earlier
notes saying product-video uploads are unsupported are superseded by this section.

`POST /verify/product-video` accepts required `product_video` and optional
`product_image`. Without an image, consistency is explicitly unavailable and its
metrics are null. It still returns metadata and showcase variation measurements.
No YOLO or MediaPipe inference runs on showcase videos.

The existing validator and temp-file cleanup are reused, with a configurable
30-second limit (`PRODUCT_VIDEO_MAX_DURATION`) and unchanged 100 MiB/source safety
limits. Sampling fractions are `.10, .25, .40, .60, .75, .90` in
`PRODUCT_VIDEO_POSITIONS`; frame indices are rounded from fraction*(frame_count-1).
Duplicate indices on very short videos are removed. `frames_target` is six;
`frames_requested` is the number of unique requested indices. Every requested
sample must decode and embed successfully, otherwise the request fails. Thus
successful `valid_frame_ratio` is 1; it is not a claim that the entire video is
free of corruption or that every frame is useful. No minimum long duration is
required. Timestamps retain the existing frame-index/FPS approximation.

Image consistency returns per-frame cosine, best, average, minimum, and spread
(maximum-minus-minimum). `showcase_analysis` includes target/requested/analyzed
counts, valid ratio, duration, average consecutive visual change, and a bounded
`view_diversity_score`. The score is a visual-change proxy, not measured camera
angles or verified viewpoints. It reuses the existing trapezoid on mean
`1 - consecutive cosine`:

- <=0.02: 0; between 0.02 and 0.15: linear rise from 0 to 1.
- 0.15 through 0.35: 1.
- Between 0.35 and 0.80: linear fall to 0; >=0.80: 0.

### Product Video Evidence points: maximum 15

| Component | Maximum | Development mapping |
| --- | --- | --- |
| Valid product video | 5 | All requested samples decoded and embedded successfully |
| Product consistency | 7 | Average cosine >=0.80: 7; >=0.65: 5; >=0.50: 2; otherwise 0 |
| View diversity | 3 | Three times the bounded diversity score |

No image means consistency unavailable and zero points. No showcase video means
all product-video components unavailable and zero points, without changing other
categories. Point maxima and consistency bands are configurable constants in
`trust_score_service.py`; the category score is the sum of its visible components.
The aggregate Trust Score remains the sum of category scores, capped by maxima
summing to 100. Listing integration and hand-object interaction are still absent.

Repeated identical frames have zero diversity: a photo converted into a video can
get at most 12/15 with perfect image matching, or 5/15 without an image. This is a
reduced contribution, not a reliable anti-gaming detector. Camera motion, edits,
backgrounds and lighting can affect all visual measurements. No synthetic-video
detection, proof of multiple viewpoints, or authenticity claim is made.

### Craft inputs and compatibility

`POST /verify/craft` now accepts any nonempty combination of `product_image`,
`product_video`, and `process_video`. `video` remains the legacy alias for
`process_video`; sending both aliases is a 422 error to avoid ambiguity. Sending
no media is also 422. Missing optional evidence earns no points and is not an
error; invalid supplied media still fails validation.

Old image-plus-`video` requests retain their prior technical and legacy weighted
score fields. Process-only requests retain process/person/hand raw signals but
image match and legacy combined score remain unavailable. Showcase-only requests
run no process/person/hand pipeline. A single image embedding is reused for both
videos' comparisons. Each distinct upload is validated/opened once; each selected
frame is embedded once for its video's analysis. User-declared upload roles are
kept separate; the system does not independently prove that a showcase is a
finished product or that two uploaded files are distinct recordings.

Inspect showcase raw metrics at
`technical_signals.product_video_analysis` in `/verify/craft`, and points at
`trust_score.categories.product_video_evidence`, including `components`, `reasons`,
and `signals`. Process evidence, artisan visibility, and product/process matching
remain separate. A seller can still obtain good evidence coverage without this
optional category; adding it never subtracts existing points.

Example: a successfully analyzed photo earns 35. Adding a static perfectly matching
showcase adds 5+7+0=12, for 47 total. Adding a showcase with average cosine 0.85 and
bounded diversity 1 adds 5+7+3=15, for 50. The same 15 can be added to an unchanged
70.5 process report, yielding 85.5. These are illustrative arithmetic examples,
not measurements. Current API maximum is 93 (98 remains theoretical with future
listing completeness; the two interaction points remain reserved).

### Swagger workflow

Stop the previous server with Ctrl+C and start:

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

1. Open http://127.0.0.1:8000/docs.
2. Expand **POST /verify/product-video**, click **Try it out**, choose
   `product_video`, optionally choose `product_image`, then **Execute**.
3. Inspect `product_image_consistency` and `showcase_analysis`; repeat without the
   image to verify unavailable consistency.
4. Expand **POST /verify/craft**, click **Try it out**, choose `product_image` and
   `product_video`, optionally select a making video under `process_video` OR
   legacy `video`, then **Execute**. Leave unused fields unset (disable Swagger's
   Send empty value checkbox if shown).
5. Inspect the product-video category's three component scores and raw showcase
   report. Compare the total against the same request without `product_video`.

Tests mock video/model inference and cover missing/invalid videos, static samples,
consistency bands, missing images, aliases, independent process input, image
embedding reuse, category bounds and existing endpoints. No model downloads,
package installations, or environment changes are required for these tests.

## Stage 11: LISTING COMPLETENESS (current metadata support)

`POST /verify/craft` now accepts optional **listing_metadata**, a JSON string in a
multipart form field alongside the existing media uploads. This supersedes earlier
notes that listing metadata is not accepted. Existing requests without it continue
to work. At least one media upload is still required; metadata alone does not
replace the existing media requirement.

Listing completeness measures useful information provided, not truthfulness.
It contributes only five of the possible 100 Trust Score points because descriptive
coverage is a modest transparency signal. It does not confirm materials, region,
price accuracy, story, identity, or seller trustworthiness. No LLM is used and no
additional model inference is performed for metadata.

Field configuration is centralized in `listing_completeness_service.py`:

| Core field | Points |
| --- | --- |
| title | 0.50 |
| description | 1.00 |
| category | 0.50 |
| materials | 0.75 |
| price | 0.75 |

| Recommended transparency field | Points |
| --- | --- |
| region | 0.40 |
| dimensions | 0.30 |
| craft_technique | 0.50 |
| artisan_story | 0.30 |

Core subtotal: 3.5; recommended subtotal: 1.5; maximum: 5. All fields are optional
for request validity. Missing or unsuitable values receive no points. Text fields
must be strings with non-whitespace content. Materials must be an array containing
at least one nonblank string. Empty strings, whitespace, arrays, objects and nulls
do not complete fields. Price must be a finite positive JSON number; booleans,
numeric strings, zero, negative and nonfinite values earn no price points. This
checks numeric form, not whether the price is commercially appropriate. Unknown
fields are ignored and cannot earn extra points; text length earns no extra credit.

Malformed JSON, non-object JSON, and metadata above 64 KiB return HTTP 422 before
ML analysis. JSON NaN/Infinity literals are rejected. Missing individual fields
are not errors. An omitted field returns `available:false`, score 0, and reason
`Listing metadata not provided to AI service`. A supplied `{}` returns
`available:true` with zero points. Neither case subtracts from other categories.

The category returns `completed_fields`, `missing_fields`, `completion_ratio`,
reasons, and counts of completed/total core and recommended fields. Completion
ratio is the unweighted count divided by nine, rounded to four decimal places;
it is not the weighted score divided by five. Final Trust Score remains the sum
of visible category scores with no hidden reweighting.

### Example JSON and Swagger request

```json
{
  "title": "Handmade Terracotta Vase",
  "description": "Wheel-thrown terracotta vase with a natural finish",
  "category": "Pottery",
  "materials": ["Terracotta Clay"],
  "price": 1200,
  "region": "West Bengal",
  "dimensions": "20cm x 12cm",
  "craft_technique": "Wheel-thrown pottery",
  "artisan_story": "Made in our family workshop"
}
```

This earns **5/5**, with nine completed fields and ratio 1. Removing dimensions
and artisan_story earns **4.4/5**, with seven completed fields and ratio 0.7778.
For example, a 35-point analyzed photo becomes 40 with the full metadata; an
otherwise unchanged 85.5 report becomes 90.5. These examples reward information
presence only; the quoted claims have not been checked. The overall category
maximum remains 100, while the current unimplemented two-point hand interaction
component leaves the currently achievable ceiling at 98.

1. Start the service with the existing command below.
2. Open http://127.0.0.1:8000/docs and expand **POST /verify/craft**.
3. Click **Try it out** and choose your media (for example, `product_image`).
4. Paste the JSON above into the **listing_metadata** text field, not a file input.
5. Leave unused file fields unset and click **Execute**.
6. Inspect `trust_score.categories.listing_completeness`: score, completed/missing
   fields, ratio, reasons, and core/recommended counters. Check the total equals
   the category sum. Repeat without metadata to compare unchanged media evidence.

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

New tests cover all 512 field-presence combinations, blank/invalid values, numeric
price handling, malformed/non-object JSON, and mocked multipart integration,
including unchanged non-listing categories and no extra ML calls. No dependency,
frontend, Node, environment, or model changes are needed for listing completeness.

## Stage 13: Live Camera Capture Evidence (current)

The seller Verification page now includes **Process Evidence** with **Upload Video**
and **Record Live**. Existing upload and ML endpoints remain available. Live recording
is optional; camera access begins only after Record Live. The browser requests video
with a preferred environment/rear camera and no audio. No challenge-response, requested
gestures, spoken codes, face recognition, identity verification or generated-video
classifier is used.

Start locally in separate PowerShell terminals:

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```powershell
cd D:\Karigar\KARIGAR
npm.cmd run dev
```

No package installations are required for Stage 13. Existing ML dependencies and caches
are reused. The frontend uses the existing `safeFetch` client through
`src/utils/verificationApi.js`, targeting the development AI URL
`http://127.0.0.1:8000`. Existing Node `/api` communication is unchanged.

### Browser walkthrough

1. Open the Vite URL (normally `http://localhost:5173`), sign in as a seller and go to
   `/seller/verification`.
2. In Process Evidence, choose **Record Live**. Allow camera access. A live preview and
   **Camera active** indicator appear. Nothing is uploaded while recording.
3. Click **Start Recording**, record the making process naturally, then **Stop Recording**.
   A timer is displayed. The configurable maximum is 60 seconds; automatic stop leaves
   a 0.5-second finalization margin below the server limit. Stop earlier if desired.
4. Review the recorded video. Use **Discard recording** or **Re-record** if needed.
   **Stop Camera / Cancel** exits the active camera flow. Camera tracks also stop when
   recording ends, the panel unmounts, an error occurs or a pending permission response
   arrives after cancellation. Object URLs are revoked when the preview is replaced.
5. Optionally select a product photo to enable product/process matching.
6. Click **Submit recording and analyze**. First the capture endpoint validates the video
   and returns a receipt. Then the same bytes and trusted receipt token are sent to
   `/verify/craft`. The existing pipeline performs temporal analysis, person detection,
   hand detection and, when a photo is supplied, product/process comparison.
7. Look for **Capture session accepted** and open **View evidence response**. The normal
   `trust_score` remains out of 100. `live_capture_evidence` is a separate top-level field.
8. Confirm the camera hardware light and browser camera-use indicator turn off after
   stopping/cancelling or navigating away. A retained permission icon does not necessarily
   mean the camera is active. Automated tests mock track stopping; test actual hardware
   and target mobile browsers manually.

Permission denied, unsupported browser, missing/busy camera, encoding errors and expired
sessions have fallback messages. **Upload Video** stays available. Analysis failures
retain the recording and receipt for retry; the receipt expires after 30 minutes. If
capture submission succeeds but its response is lost, that session is consumed: record
again or upload normally. Capture metadata is not recovered from a client assertion.

### Session and receipt protocol

`POST /capture/session`, JSON `{"purpose":"process_video"}`, returns:

```json
{
  "capture_session_id": "server-generated-bearer-id",
  "created_at": "2026-01-01T00:00:00Z",
  "expires_at": "2026-01-01T00:05:00Z",
  "purpose": "process_video",
  "max_recording_seconds": 60
}
```

`POST /capture/process-video` takes multipart `capture_session_id` and `video`.
The service checks existence, expiry, purpose and consumption; validates/decodes sampled
frames using the shared video utilities; hashes the exact received bytes with standard
library SHA-256; then atomically checks again and consumes the session. Invalid video
does not consume it. Concurrent successful submissions cannot consume it twice.
The response includes `session_valid`, `capture_session_id`, `received_at`,
`video_sha256`, `duration_seconds`, `capture_receipt_token` and `receipt_expires_at`.
There is deliberately no invented camera capture timestamp: server session creation
and receipt times are known, actual camera start time is not attested.

An internal structured receipt records the server timestamps, session ID, purpose,
method, duration, SHA-256 and single-use status. Only the server store constructs it.
For analysis, submit multipart `process_video` (or legacy `video`), optional
`product_image`, and `capture_receipt_token` to `/verify/craft`. Product showcase and
listing metadata inputs remain supported. The service resolves the opaque token and
compares the new upload's hash against its stored receipt before running normal ML.
A token with a different video is rejected. The receipt may be reused to retry analysis
of those exact bytes until expiry; the capture session itself remains single-use.

`live_capture=true`, `capture_method=karigar_live_camera`, manually supplied receipts or
an invented ID cannot award evidence. Missing/expired/used sessions yield 404/410/409;
wrong purpose or mismatched receipt yields 422. Invalid media retains existing
400/413/415 errors. Invalid or expired receipt tokens yield 410. On server restart,
all development records disappear. Tokens are bearer capabilities: do not log or share
session IDs or receipt tokens.

The live diagnostic appears **beside**, not inside, `trust_score`:

```json
{
  "live_capture_evidence": {
    "available": true,
    "verified_capture_session": true,
    "capture_method": "karigar_live_camera",
    "purpose": "process_video",
    "suggested_score": 10,
    "suggested_max_score": 10,
    "included_in_trust_score": false,
    "capture_session_id": "server-generated-bearer-id"
  }
}
```

Ordinary uploads receive `available:false`, `verified_capture_session:false`,
`capture_method:"ordinary_upload"` and suggested score 0. The 10/10 is a provisional
provenance/transparency contribution only, not an authenticity probability. It is never
added to the 100-point total. Existing hand, person, temporal and match points are not
counted a second time. No Trust Score weights or model behavior were changed.

Inspect `technical_signals.temporal_analysis`, `technical_signals.hand_analysis`,
`technical_signals.hand_evidence_available`, `technical_signals.person_presence_ratio`,
and `technical_signals.best_similarity` / `average_similarity` in the craft response.
The Trust Score category components show the corresponding points. Hand model failure
still produces the existing unavailable/error signals, not fabricated hand evidence.
Without a product photo, product/process matching is unavailable as before.

### Trust boundary and development limitations

KARIGAR can verify submission of these exact bytes through a valid KARIGAR capture
session. Browser APIs cannot cryptographically prove that bytes originated from a
physical camera: a modified client can submit pre-existing bytes to a valid session.
This is **capture provenance**, not camera attestation or liveness verification.
It cannot establish that the scene is genuine, the camera was not filming a display,
the content was not staged, the artisan identity is verified, or the product is authentic.
The hash establishes byte integrity only. No authenticity guarantees are made.

`MemoryCaptureStore` implements a small replaceable store interface. Secure IDs/tokens
use `secrets.token_urlsafe(32)` (256 random bits), locked single-use transitions, five-minute
sessions, 30-minute receipts and bounded tables of 1,000 records each. Expired entries
are pruned during writes. Configuration constants are in `capture_service.py`; browser
recording constants are in `src/utils/liveCapture.js` and the server duration limit is
`VideoLimits.max_duration`. Keep the browser limit at or below the server limit.

This store is **development-only, single-process**. Start one worker; restarts/reload
lose sessions. It is not connected to seller authentication, does not persist video,
and does not implement duplicate-hash tracking. Before production use, implement an
atomic shared Redis/database store, bind sessions to authenticated sellers, add request
rate limits, and deploy HTTPS with restricted CORS. Those integrations are outside this
stage. Receipt possession currently grants reanalysis provenance for its exact bytes.

Camera APIs require a secure browser context (HTTPS or localhost). A phone browsing
plain HTTP on a laptop's LAN IP may not permit camera access; localhost on a phone also
refers to the phone. Mobile testing requires an HTTPS frontend and reachable HTTPS AI
endpoint, updating `AI_SERVICE_URL` and CORS for that deployment; no `.env` edits were
made here.

MediaRecorder chooses supported VP9 WebM, VP8 WebM, WebM, then MP4. The actual browser
MIME type controls the uploaded extension. Decode support depends on OpenCV codecs.
Browser WebM sometimes lacks frame-count/duration metadata; a bounded decode pass counts
frames and checks timestamps, then reopens the original bytes and reads representative samples sequentially. Existing 100 MiB,
60-second, source resolution, FPS and frame-count safety limits remain enforced. Timing
jitter, unsupported codecs or non-seekable output can still require a shorter clip or
ordinary upload. No conversion dependency has been added.

### Automated checks

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m unittest discover -s tests -q
cd ..
node --test src/utils/liveCapture.test.js
.\node_modules\.bin\oxlint.cmd src/components/ProcessEvidenceCapture.jsx src/utils/liveCapture.js src/utils/liveCapture.test.js src/utils/verificationApi.js
npm.cmd run build
```

Backend tests cover random sessions, expiry, replay/concurrency, purpose, invalid media,
SHA-256, receipts, forged flags/tokens, byte mismatch, unchanged totals and reuse of the
normal process pipeline. Frontend tests use Node's built-in test runner with mocked
camera/MediaRecorder, including permissions, lifecycle, final data, cleanup, format
selection, timing and session/token multipart submission. No camera, CUDA, model
downloads or new test packages are required. There is no existing React DOM test runner;
visual layout and physical-browser recording remain manual checks.

Keep the live diagnostic outside the score while testing capture reliability and abuse
cases. Rebalance only after calibration and product review; do not automatically award
an extra ten points or increase the total above 100.


### Browser WebM compatibility fix

Chrome-generated streaming WebM can omit frame-count, frame-rate and seek-index metadata.
The local synthetic Chrome reproduction selected `video/webm;codecs=vp9`; OpenCV decoded
frames but reported FPS=1000 and a negative frame count. After scanning to EOF, seeking
reported success while the next read failed. For missing-metadata WebM only, timing now
comes from decoded presentation timestamps and a fresh decoder reads samples sequentially.
This retains the shared analysis path, original-byte hash, file-size/source-resolution/
frame-count/duration limits and measured FPS limit. Ordinary MP4 sampling is unchanged.
No codec preference change, installation, external FFmpeg process or transcoding is used.

In Vite development mode, DevTools Console logs selected/actual recorder MIME, Blob type,
size and filename, plus upload metadata. Submission failures log the exception. The
FastAPI terminal logs filename, Content-Type, byte length, header-based container hint,
reported WebM metadata and exact validation errors. No receipt token, media bytes or
stack trace is displayed in seller UI. Browser recording details may differ from the
synthetic fixture; inspect the actual failed Network response `detail` when diagnosing.

Retest: Record Live -> Start Recording -> Stop Recording -> Preview -> Submit recording
and analyze. Confirm `/capture/process-video` returns 200 with a receipt, then `/verify/craft`
runs and returns top-level `live_capture_evidence`. The Trust Score remains out of 100.

## Stage 12: Synthetic / AI Media Risk Analysis (final AI feature stage)

`POST /verify/synthetic-media-risk` and `/verify/craft` now expose an **uncalibrated
ensemble of forensic risk signals**. This is not a definitive AI detector, an
AI-generation probability, an authenticity probability or a seller rejection rule.
Every report includes limitations and `included_in_trust_score: false`. The existing
Trust Score weights and maximum of 100 are unchanged; Stage 13 live-capture evidence
remains a separate provenance diagnostic. No frontend, capture-session, original-byte
hashing or recording behavior was changed for this stage.

### Scope and reuse

The standalone endpoint accepts multipart `video` and optional `capture_receipt_token`.
It returns `filename`, `frames_analyzed`, `duration_seconds`, `processing_time_ms`,
`inference_devices` and the nested `synthetic_media_risk` report. The nested report
contains `available`, nullable `risk_score`, `risk_level`, `coverage`, `signals`,
`context`, `limitations`, forensic `processing_time_ms`, and
`included_in_trust_score:false`. Each signal has `available`, nullable `risk`,
`coverage`, `reason` and `raw_metrics`. Raw embedding vectors and hand landmarks are
never returned.

Craft responses add a top-level `synthetic_media_risk` using the **process video**.
If no process video is supplied, this field is unavailable/inconclusive. Product
showcase video is not analyzed for synthetic risk in this stage; existing showcase
analysis and scores are unchanged. All old craft fields remain available.

The standalone endpoint reuses the same validator, sampler, DINOv2 singleton and
MediaPipe service. It does not run YOLO because person visibility is not a synthetic
risk signal. The craft endpoint continues its normal DINOv2, YOLO, hand, temporal and
product/process matching work. Forensic analysis reuses its representative embeddings,
hand detections and decoded frames. It adds at most eight nearby samples to the same
sorted extraction sequence, without extra DINOv2/YOLO/MediaPipe calls. Each nearby pair
has a target gap of 0.10 seconds (rounded to a frame, minimum one frame) and must be
within 0.50 seconds. At very low FPS no nearby pair may be available.

Only up to sixteen grayscale copies are retained, each at most 256 pixels on its long
edge. OpenCV Farneback uses two pyramid levels, 15-pixel window and two iterations.
No second forensic video decode pass is added. The existing streaming WebM validation
scan/reopen is retained for Chrome compatibility. No extra transcoding is performed.

### Signals and provisional weights

| Group | Weight | Risk interpretation / raw measurements |
| --- | ---: | --- |
| Temporal / embedding consistency | 0.35 | Consecutive DINO cosine similarities, fraction of changes above 0.40, isolated transition changes exceeding both neighbors by 0.30, median sample gap, mean/max visual change. Risk = 0.5 abrupt fraction + 0.5 isolated-outlier fraction. This is distinct from the existing temporal-progression trust curve. |
| Optical-flow consistency | 0.40 | Median flow magnitude and spatial variance, normalized by frame diagonal; mean fraction of pixels with residual motion above 0.03 diagonals after removing global translation; median absolute change in pair motion magnitudes divided by 0.02 (clamped); maximum change is also reported. Risk = 0.5 extreme residual fraction + 0.5 bounded instability. Camera movement alone is not a conclusion. |
| Hand temporal consistency | 0.20 | Presence toggles, count changes, mean normalized landmark displacement, fraction above 0.20 displacement, and handedness flips. Requires at least four frames with hands and three nearby pairs with exactly one hand and 21 landmarks on both frames. Component weights: 0.30 toggles, 0.30 count changes, 0.25 jumps, 0.15 flips. Unknown handedness excludes that component and reduces coverage. No identity association or hand tracking is added. |
| Media metadata | 0.05 | Validated FPS, frame count, duration, extension/container hint, reconstructed-WebM flag and relative duration mismatch. Risk = clamp(relative duration mismatch / 0.10). Codec is null where unavailable. Missing metadata, compression, low FPS and re-encoding do not themselves increase risk. |

Temporal and embedding metrics form one group, avoiding a duplicate vote for the same
DINO evidence. Metadata comparisons use already validated/derived values and therefore
provide only a weak consistency check, not independent evidence of synthesis. Missing
WebM metadata receives zero anomaly risk with reduced metadata coverage, not a penalty.

All weights, thresholds and sampling parameters live in
`app/services/synthetic_media_service.py`. They are development heuristics with no
statistical calibration. The service's `RiskSignal` interface and weight map provide an
extension point for a future evaluated learned classifier. No learned classifier is
loaded, downloaded or represented as available now.

### Exact ensemble and coverage calculation

For available signals with non-null risk and positive coverage:

```
effective_weight_i = configured_weight_i * signal_coverage_i
risk_score = sum(signal_risk_i * effective_weight_i) / sum(effective_weight_i)
overall_coverage = sum(effective_weight_i) / sum(all configured weights)
```

If there are no usable votes, `risk_score` is null. Unavailable signals have null risk
and zero coverage; they never act as zero-risk votes. Overall coverage is the fraction
of usable weighted evidence, **not statistical confidence**. It is not increased by a
live-capture receipt.

The visual quality factor is the mean, across prepared frames, of the minimum of:
clamp(grayscale standard deviation / 24), clamp(Laplacian variance / 80),
clamp(mean brightness / 30), clamp((255 - mean brightness) / 30), and
clamp(original short edge / 240). Multiply this by min(duration / 5 seconds, 1).
If all nearby pixel-change measurements are below 0.005 of the intensity range,
multiply by 0.20 and report `low_information_content:true`. Static content reduces
coverage rather than increasing synthetic risk.

- Temporal coverage = quality factor * min(valid transitions / 7, 1) *
  min(0.50 seconds / median representative gap, 1). At least three transitions are needed.
- Flow coverage = quality factor * min(successful nearby pairs / 8, 1), with at least
  three usable pairs required.
- Hand coverage = quality factor * fraction of representative frames with hands *
  min(comparable pairs / 7, 1) * sum(usable hand-component weights). Without enough
  nearby, unambiguous observations the whole signal is unavailable.
- Metadata coverage = 1 for ordinary validated metadata, 0.5 when streaming WebM timing
  was reconstructed. This low-weight signal cannot determine the risk label alone.

Labels are **inconclusive** if coverage < 0.35, or fewer than two non-metadata groups
have coverage >= 0.10. Otherwise risk < 0.30 is **low**; 0.30 through < 0.60 is **medium**;
>= 0.60 is **high** only when at least two usable non-metadata groups also have risk
>= 0.30. Without that corroboration the label stays medium. A single signal cannot
produce a high classification. These labels do not trigger any penalty or rejection.

### Failure behavior and limitations

Malformed media retains the existing validation errors. On the standalone diagnostic
endpoint, DINOv2 or MediaPipe loading/inference failures make their signal unavailable;
the remaining diagnostic can still return 200 with reduced coverage/inconclusive status.
Craft preserves its existing model-error behavior. Failed optical-flow pairs are logged
and excluded. Absent hands are not evidence that video is real or synthetic.

Compression (including WhatsApp), low-resolution phones, poor lighting, motion blur,
low FPS, cuts, unstable handheld recording and temporary hand occlusion can affect these
metrics. Quality issues reduce coverage; they are not standalone high-risk triggers.
Sparse representative embeddings/hands can be several seconds apart in long clips.
Their coverage is reduced and hand comparison can be unavailable; a long clip may
therefore remain inconclusive. No extra model calls are made to conceal that limitation.
Flow compares nearby pairs at separated sample locations, not every adjacent frame.
Frame timing based on average validated FPS is approximate for variable-rate recordings.

Live context is set only by the existing secure receipt resolver and original-byte hash
match. `live_capture=true` cannot enable it. `context.karigar_live_capture:true` does
**not** alter the numerical risk, coverage or label. Browser capture is separate
provenance evidence and cannot guarantee the scene is genuine.

### Swagger and craft testing

Start the existing service without installing anything:

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

1. Open `http://127.0.0.1:8000/docs`.
2. Expand `POST /verify/synthetic-media-risk`, click **Try it out**, select a video,
   leave the optional receipt blank for ordinary upload, and **Execute**.
3. Inspect `synthetic_media_risk.signals`, each signal's availability/coverage/raw metrics,
   overall coverage, limitations and `included_in_trust_score:false`.
4. For `/verify/craft`, select a process video using `process_video` (or legacy `video`,
   not both), optionally attach `product_image`, product showcase video and listing JSON.
   Execute and inspect top-level `synthetic_media_risk` alongside the unchanged
   `trust_score`, `live_capture_evidence` and `technical_signals`.
5. For trusted live context, record through the working KARIGAR UI and submit normally.
   Craft's response now includes the new diagnostic automatically. For a standalone
   comparison, submit the **exact original recorded bytes** with their server-issued
   `capture_receipt_token` before its expiry. Do not re-encode those bytes when using
   the receipt; the hash mismatch must reject them. Capture-session IDs are not receipt
   tokens. Do not log/share receipt tokens when collecting calibration reports.

### Calibration comparison protocol

Save the JSON reports together with an independently assigned category, source ID,
original/variant relationship, recording duration/resolution, software versions and
human notes. Compare these categories; the code has no special behavior for filenames:

| Category | Comparison purpose |
| --- | --- |
| A: real camera footage | Establish variation across cameras, scenes, lighting and craft movement. |
| B: KARIGAR live browser recording | Compare WebM and provenance context; live context must not zero risk. |
| C: compressed/re-encoded real video | Pair with A using the same underlying scene; check coverage loss and false positives. |
| D: independently documented AI-generated craft video | Evaluate whether any signals distinguish it; do not assume high risk must result. |
| E: static image converted into video | Check low-information reporting and reduced coverage, not automatic high risk. |
| F: mismatched/unrelated video | Compare product/process similarity separately; mismatch is not proof of synthesis. |

Use multiple examples per category and keep all variants of one source together when
splitting calibration and evaluation sets. Compare raw metrics, availability, coverage,
risk distributions, inconclusive rates and false positives on legitimate footage.
Keep the Trust Score untouched during calibration. No empirical accuracy, sensitivity
or specificity has been established by this implementation or its synthetic unit tests.

### Performance and tests

`synthetic_media_risk.processing_time_ms` measures added grayscale preparation and
forensic computation, excluding video decoding and model inference. Standalone outer
`processing_time_ms` includes the entire endpoint analysis; craft's existing total
includes all work. At most eight extra requested neighbor frames and zero extra model
calls are added to craft. Existing WebM sequential decoding may traverse intervening
frames, as before; this diagnostic does not analyze every decoded frame.

Local CPU measurement: ten measured runs after two warmups, synthetic 640x480 textured
frames representing eight windows in a 60-second clip, reused mocked embeddings, no
hands. Added forensic computation measured **109.675 ms median / 124.434 ms p95**.
Sixteen grayscale copies occupied 786,432 bytes (0.75 MiB), excluding temporary flow
arrays. This is not a production end-to-end or cold-model benchmark; decoder/codec,
content, CPU contention and input size affect actual latency.

```powershell
..\.venv\Scripts\python.exe -B -m unittest discover -s tests -q
```

Tests cover MP4 and the real Chrome-generated synthetic WebM fixture, invalid/short/
static/low-quality footage, absent/sparse/unstable hands, abrupt embeddings, flow
availability/failure, coverage/label/ensemble boundaries, forged and valid receipts,
unchanged trust totals and unchanged craft model-call counts. Models are mocked;
no webcam, CUDA, network access or model downloads are needed by these tests.
No new dependency, model, third-party detector API, audio analysis or automatic trust
adjustment was added. OpenCV API reference:
https://docs.opencv.org/4.10.0/dc/d6b/group__video__track.html
