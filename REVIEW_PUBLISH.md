# Review and publish

## Existing architecture and additions

The repository had only a Prisma User model and avatar uploads. There was no product
creation endpoint. My Products previously used SellerContext demo/localStorage entries.
The new `GET/POST /api/products` handler runs through the same authenticated Node
router used by both Vite's API middleware and `server/server.js`. It checks the JWT,
loads the user, requires an active ARTISAN, and scopes reads/writes to that user.
The avatar endpoint is unchanged: reusing it would overwrite the artisan's avatar.

The additive SQLite Product migration links Product to User and stores searchable title,
category, price and stock plus JSON strings for details, media and compact evidence.
No user records are changed. During deployment the historical password-column rename
was found already present in the database but absent from migration history; it was
marked applied after read-only column inspection, before adding Product.
The alternative PostgreSQL schema is not migrated by this task.

## Publish request and persistence

Multipart `POST /api/products`, with the existing Bearer token and `Idempotency-Key`:

- `listing`: title, description, category, materials[], numeric price, region,
  dimensions, craft_technique, artisan_story, integer stock and giTag.
- `images`: all selected files; `primary_index`: seller-selected index.
- Optional `product_video`, `process_video`, `process_source`.
- `evidence`: full-precision overall score, level, six score/max pairs, live status,
  and analysis timestamp. No raw detections, embeddings, synthetic signals or receipt secrets.

Required: primary image, nonblank title/category, finite positive price, integer stock
0–2147483647, and current successful analysis in the UI. No minimum score is required.
Optional videos stay optional. Server validates fields, size, container signatures,
score bounds/total and active ownership. Uploads are bounded to 252 MiB total, photos
10 MiB each (up to five), videos 100 MiB each. This prototype buffers bounded multipart
requests in memory; use streaming upload handling before scaling concurrent uploads.
Signature validation is not a complete media decoder. Step 1/AI validation remains in place.

Media is written once under UUID names in `public/uploads/products`, following the
existing public-upload convention. SQLite stores only `/uploads/products/...` references;
never Blob URLs, original client paths or raw base64. New files are removed if database
creation fails. A unique artisan/request-key constraint prevents duplicate creation on
retry, including concurrent attempts. Published files are not removed on wizard exit.

Evidence is labeled internally `client_analysis_snapshot`: the existing AI API does not
sign results, so the Node server cannot independently establish that a client submitted
the original result. Shape/total validation is not cryptographic verification. This
snapshot is an audit/display aid, not an authorization credential or authenticity claim.
Before using these fields for public trust guarantees, introduce a server-verified
analysis reference. This task does not change scoring or add an evidence platform.

On confirmed success the wizard shows Go to My Products; leaving releases temporary
browser previews. Failures retain the entire draft. My Products loads only the current
artisan's server listings and uses durable primary images. No buyer-detail route is
invented. Product edit/delete are not implemented by this task; those actions are
disabled for persisted rows rather than pretending local changes update the database.

## Actual Trust Score formulas (unchanged)

Sources: `ai-service/app/services/trust_score_service.py`,
`evidence_scoring_service.py`, `listing_completeness_service.py`,
`product_video_service.py`, `video_service.py`.

Let C(x)=min(1,max(0,x)). Nonfinite metrics are rejected. Visual change d is the mean
of (1 − cosine similarity) across consecutive sampled embeddings. T(d) is:

- 0 when d≤.02 or d≥.80;
- (d−.02)/.13 when .02<d<.15;
- 1 when .15≤d≤.35;
- (.80−d)/.45 when .35<d<.80.

| Category | Current calculation | Type / unavailable behavior |
|---|---|---|
| Photo /35 | 35×(.60+.40×embedded), provided decoded=true | Discrete: 0,21,35; no decoded photo=0. Normal successful photo pipeline embeds and earns35. No actual clarity or multi-photo consistency scoring. |
| Showcase /15 | Valid analysis5 + consistency(average cosine≥.80→7, ≥.65→5, ≥.50→2, otherwise0) + 3×T(d) | Mixed threshold/continuous. Missing video=0; missing comparison/diversity=0 for that component. |
| Process /20 | Valid process4 + 6×T(d) + hand points + interaction0 | Hand ratio≥.75→8, ≥.50→6, ≥.25→3, >0→1, else0. Unavailable components=0. Interaction has maximum2 but is unimplemented, so current attainable process maximum18. |
| Artisan /15 | 15×C(person-presence ratio) | Continuous; no available process/person ratio=0. Identity is not verified. |
| Product/process /10 | 10×C((.8×best cosine+.2×average cosine−.40)/.50) | Bounded linear mapping: zero at combined≤.40; full at≥.90. Requires analyzed process, embedded photo and both similarities; unavailable=0. |
| Completeness /5 | title .5 + description1 + category .5 + materials .75 + price .75 + region .4 + dimensions .3 + technique .5 + story .3 | Weighted binary presence: trimmed nonempty strings, at least one meaningful material, finite numeric price>0. Missing field=0; supplied claims are not verified. |

Total sums category points; missing evidence is not redistributed. Levels: ≥90 very
high, ≥80 high, ≥60 good, ≥40 basic, otherwise low. Live provenance adds no points.
The separate legacy weighted craft score (.5 match + .3 human + .2 temporal) is NOT
the 100-point score displayed here. Backend components/categories already use four-
decimal rounding in several places; process total can contain binary floating-point
artifacts. None of that implementation was changed.

`formatEvidenceScore` rounds only display: noninteger values use one decimal, exact
integers remain integers (6.994899→7.0; 5→5). Steps 3/4 and persisted product summaries
use it. Full-precision values remain in the request and database.

## Run and test

From the project root:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm.cmd start
```

Vite serves frontend/API at http://127.0.0.1:5173; the standalone Node API is at
http://127.0.0.1:5000. FastAPI remains at http://127.0.0.1:8000 for analysis.
Preview: http://127.0.0.1:5173/seller/add-product.

Tests: `node --test server/productHandler.test.js src/utils/productPublish.test.js
src/utils/craftVerification.test.js src/utils/addProductRender.test.js`.
The backend integration test uses a temporary SQLite database, not real user records.

Manual: inspect rounded scores/footer buttons; review all media/details; edit and rerun
stale analysis; publish; check My Products after refresh; simulate an offline publish
and retry without losing the draft or producing duplicates. No webcam automation needed.
