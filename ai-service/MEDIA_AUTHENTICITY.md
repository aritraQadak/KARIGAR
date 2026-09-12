# Media authenticity

The Add Product flow checks photos and videos through Sightengine's `genai`
image endpoint: https://sightengine.com/docs/ai-generated-image-detection .
The paid video endpoint is not used. Credentials remain in the AI backend;
set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET in the root .env or server
process environment, then restart the AI service on port 8000.

## Video policy

OpenCV validates uploads using existing size, duration, resolution and decode
limits. Videos up to 15 seconds use 3 frames; over 15 through 30 seconds use 5;
over 30 seconds use 8 (maximum existing duration: 60 seconds). Samples are the
midpoints of equal intervals across the video. Very short clips with fewer frames
use each available frame once. Frames are JPEG quality 90, with longest edge at
most 1280 pixels. Temporary video storage is removed on success and failure;
encoded frames remain only in memory during the request.

All selected frames must have valid results. All scores >= 0.9 yields Likely
AI-generated; all <= 0.1 yields Likely camera-captured. Any mixed or intermediate
scores, or incomplete analysis, yields Inconclusive. An incomplete result offers
Retry. No calibrated video probability is claimed and no video percentage is
shown. The frontend displays a single result and the limitation: Based on sampled
visual content; not proof of authenticity. No frame previews, counts, timestamps,
or implementation controls appear in the interface. Photo results are unchanged.
These image-model thresholds are application rules, not validated video accuracy.
Sampling can miss manipulation; motion and audio are not evaluated.

## Cost and caching

At most 3, 5 or 8 image API calls occur per video attempt, processed sequentially.
Any failed call stops the remaining batch, including quota and credential errors.
The API-call phase has a 95-second budget, with at most 25 seconds per frame call.
Only one analysis runs per AI process; concurrent requests get a retry message.
Use one worker; multi-worker deployments need a shared job/locking service.

Successful frame calls are committed immediately in .cache/authenticity.sqlite3,
so retries reuse them even after a later failure. Complete video results are cached
by SHA-256, detector revision, sampling/encoding and aggregation policy. Frame
entries use encoded-frame SHA-256 and the same version policy. Entries expire after
24 hours; incomplete results are never stored as completed video results. Changing
SIGHTENGINE_DETECTOR_VERSION invalidates reuse. This is an operator revision because
the hosted model has no pinned provider version. No media bytes are stored in cache.

All attached files must have a complete Likely camera-captured result to continue
or publish. Camera-captured cards are green; AI-generated cards are red and offer
targeted replacement. Uncertain results remain amber and can be retried. Failed
replacement validation preserves the original file. Replacements clear only their
own result and capture receipt. This is a media eligibility rule, not user identity
verification or a claim of honesty.

The Node publishing server hashes the actual uploaded bytes and calls the AI
service /verify/media-eligibility endpoint. That endpoint is read-only and checks
current-policy, unexpired cached results for every hash and media kind. Browser
labels, scores and hashes cannot grant eligibility. Missing, expired, mismatched,
uncertain or flagged results block publishing. AI service failure fails closed.
The Node server uses AI_SERVICE_URL (default http://127.0.0.1:8000); configure it
only server-side to the trusted AI service when deploying separately. Restart both
services after this update. Cache expiry is 24 hours; expired media must be analyzed
again before publishing. There is no administrator review queue.

## Offline verification

From ai-service: python -m unittest discover -s tests -p test_authenticity.py
From project root: node --test src/utils/addProductRender.test.js
All detector calls in tests are mocked. No live API trial is needed.
