# Add Product evidence analysis

Step 3 explicitly runs one existing `POST /verify/craft` request. There is no automatic
request on navigation and no simulated sub-stage progress. Scores, maxima and evidence
levels come entirely from the backend. No synthetic-media output is used or displayed.
The existing backend may internally compute it; this integration does not change that pipeline.

Multipart mapping:
- Seller-selected primary photo → `product_image` (one photo only).
- Optional showcase file → `product_video`.
- Uploaded or live process file → `process_video`, never the legacy `video` alias.
- Live process receipt → `capture_receipt_token`, only for the corresponding live file.
- `listing_metadata` → JSON with title, description, category, materials array, numeric
  price (null if empty), region, dimensions, craft_technique and artisan_story.

No new capture session is created. Additional photos and marketplace stock/GI fields
remain in the draft/review, but are not part of this endpoint's scoring inputs.

Analysis stores a snapshot of file references, receipt and metadata. Navigation preserves
it; differing relevant inputs mark it stale and hide the score. Reverting to identical
inputs can reuse the result. A synchronous running-state guard prevents double submission;
wizard navigation is disabled while analysis runs. Results arriving after page unmount
are ignored. The current request is allowed to finish rather than starting overlapping
server jobs. No browser timeout is imposed on the existing ML pipeline.

Hand-analysis unavailability can appear in a successful backend response; no hand
observation is claimed in that case. Other pipeline failures may fail the entire request:
the frontend never fabricates partial scores. Errors preserve media/details and offer retry.
Receipt expiry/rejection requires returning to media; no provenance is silently removed.

Continue to Review requires a current successful result. Review displays that result;
publishing remains disabled. Drafts remain memory-only. Gemini is not required for manual
details and no voice code is changed.

Run `npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort` from the project root.
Run `..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
from ai-service in a network-enabled terminal if existing ML assets require downloading.
Open http://127.0.0.1:5173/seller/add-product.

Focused tests: `node --test src/utils/craftVerification.test.js src/utils/productDraft.test.js src/utils/liveCapture.test.js src/utils/addProductRender.test.js`.
