# Artisan center, product fields and public intro

Artisan Story is removed from new Add Product drafts, manual fields, review,
verification metadata, Node publish validation and new persisted listings. Old stored
records remain untouched. Legacy voice responses can still contain the field, but
the frontend discards it and removes it from missing-field prompts; no provider work
was performed.

Listing completeness remains 5 points. Before: title .5, description1, category .5,
materials .75, price .75, region .4, dimensions .3, technique .5, story .3.
After: title .5, description1, category .5, materials .75, price .75, region .5,
dimensions .4, technique .6. Each of the last three receives .1 from the removed .3.
Eight meaningful fields now produce full completeness. All other score formulas and
models are unchanged. New publishing snapshots use version craft-evidence-v2;
historical scores are not recalculated.

The protected `/seller/verification` page is now the Artisan Verification & Trust
Center. Account verification flag and supplied GI/organization presence come from
AuthContext's API-backed user. Government KYC, Pehchan, document expiry, renewal and
external membership checks are explicitly not connected. The existing sample 4.8/5
seller rating is isolated and labeled demo; it is not a product score. No fictional
credential dates/badges are used. Product and process counts/recent history come from
owner-scoped GET /api/products, using the saved compact snapshots. These snapshots
remain client-submitted historical records, not independently signed certificates.
No product/camera uploads are provided here; shared Stage 13 code is retained.

Intro originals remain `intro pc.mp4` (1920×1080,4s) and `intro mobile.mp4`
(1080×1920,4s) at the project root. Vite `?url` imports serve them in development and
emit hashed files under dist/assets at build time. No source copies/transcodes/moves
were needed. Only one selected URL is placed on the video element: ≤639px uses mobile,
≥640px uses desktop. `object-contain` preserves the full frame on black without crop.

LoginEntry wraps the existing Login only at `/login`; `/` and `/auth` still redirect
there. Auth loading/active sessions suppress the intro. Video autoplays muted and inline,
with preload auto. End, Skip, error or rejected play promise triggers a 500ms fade.
A 10-second safety timer prevents a playback stall from trapping login. The login is
mounted throughout the fade but inert while the overlay is present. Intro seen is
stored in sessionStorage as karigar_intro_seen=true when playback is attempted, so
same-tab refresh/navigation skips it. Storage failures do not block login. Normal
authenticated routes never mount this wrapper. New tabs can play again (tabs cloned
by a browser may inherit sessionStorage).

Manual preview: http://127.0.0.1:5173/ ; login `/login`, artisan center
`/seller/verification`, Add Product `/seller/add-product`. Test desktop/mobile in fresh
tabs, Skip, ended fade, same-tab refresh, and authenticated dashboard refresh. Confirm
the eight-field product form, neutral credential states and real history counts.
