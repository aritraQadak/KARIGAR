# Product details from voice

POST `/onboarding/product-from-voice` accepts multipart `audio`, `selected_language`
(`bn`, `hi`, `en`) and `duration_seconds`. No authentication/verification/publishing
behavior is changed. This is a local prototype endpoint; restrict access and add
per-user rate limits before public deployment.

Set `GEMINI_API_KEY` in the **backend process environment**, never a `VITE_` variable.
Do not put keys in source control. Startup reads only `GEMINI_API_KEY` and
`GEMINI_VOICE_MODEL` from `KARIGAR/.env`, resolved independently of the working
directory. Existing process variables take precedence. Key values are never logged.
Optional `GEMINI_VOICE_MODEL` defaults to `gemini-3.8-flash`, as documented in
[Gemini audio understanding](https://ai.google.dev/gemini-api/docs/audio).
Uses the REST Interactions API with JSON schema outputs and `store: false`.
No SDK installation is needed. API access/quota and internet are required.

Two independent service functions transcribe original-language speech, then extract
English fields. Both responses undergo strict Pydantic validation. Prompts prohibit
unsupported claims, preserve cultural names, and return null/empty arrays for missing
facts. Category is restricted to the existing seller Products filters. These safeguards
cannot guarantee factual correctness: sellers must review the transcript and every field.
Missing generated values do not erase existing manual entries. Stock/GI and media stay intact.

Recording supports browser-selected WebM/Opus, Ogg/Opus or MP4/AAC (sent as M4A to
Gemini), matching filename/MIME. Limit: 120 seconds, 10 MiB; minimum one second.
The server validates MIME, container signature, bytes, submitted duration and provider-
reported duration. It does not independently decode audio duration; malicious clients
can falsify metadata. Add a bounded audio decoder before treating duration as a security
boundary. No permanent local audio files are created; Google provider data policies apply.
FastAPI UploadFile temporary spool files are closed after each request.

The UI requests microphone access only on click, requires a separate Start action,
stops all tracks after Stop/discard/unmount, and revokes preview URLs. Transcript and
details survive wizard navigation; recordings are released on leaving Step 2. Drafts
are memory-only and disappear on refresh. Processing uses an honest combined status
because this single endpoint does not stream stage progress. Calls time out after 60
seconds per provider stage; client timeout is 135 seconds.

Start with the existing environment (no package changes):

```powershell
cd D:\Karigar\KARIGAR\ai-service
..\.venv\Scripts\python.exe -B -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In another terminal run `npm.cmd run dev` from `D:\Karigar\KARIGAR`; open the Vite
URL plus `/seller/add-product`. Add a photo, continue to Product Details, choose a
language, Speak → Start → Stop → listen → Generate. Check transcript, missing facts,
manual edits and back/forward persistence. Re-record and test the manual path.

Tests (from repository root):

```powershell
node --test src/utils/voice.test.js src/utils/liveCapture.test.js src/utils/productDraft.test.js src/utils/addProductRender.test.js
cd ai-service
..\.venv\Scripts\python.exe -B -m unittest discover -s tests -p test_voice.py
```

No Step 3 integration, publishing, Trust Score changes or simulated voice results.

Development diagnostics distinguish missing keys, authentication, quota, invalid
models, unsupported audio, provider timeout, malformed responses and network errors.
Provider HTTP messages are retained in backend logs with the key redacted; seller
responses stay generic. Windows socket error 10013 means the process cannot access
the network: launch FastAPI from a normal network-enabled terminal, not a restricted
sandbox. The normal uvicorn command above now loads the project voice settings.
