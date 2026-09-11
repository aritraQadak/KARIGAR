import React, { useEffect, useRef, useState } from 'react';
import { LiveCapture } from '../utils/liveCapture.js';
import { captureApi } from '../utils/verificationApi.js';

function RecordedPreview({ file }) {
  const video = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    video.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <video ref={video} controls playsInline className="w-full max-w-lg rounded-lg" aria-label="Recorded video preview" />;
}

export default function ProcessEvidenceCapture() {
  const [capture, setCapture] = useState({ status: 'idle' });
  const [upload, setUpload] = useState(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef(null);
  const camera = useRef(null);
  const request = useRef({ id: 0 });
  useEffect(() => {
    const instance = new LiveCapture({ api: captureApi, onChange: setCapture });
    controller.current = instance;
    const requests = request.current;
    return () => { requests.id++; instance.dispose(); };
  }, []);
  useEffect(() => { if (camera.current) camera.current.srcObject = capture.stream || null; }, [capture.stream]);
  function resetResult() { request.current.id++; setResult(null); setError(''); setBusy(false); }
  async function analyze() {
    const id = ++request.current.id;
    setBusy(true); setError(''); setResult(null);
    try {
      const receipt = upload ? null : capture.receipt || await controller.current.submit();
      if (!upload && !receipt) return;
      const data = await captureApi.analyze(upload || capture.file, image, receipt);
      if (id === request.current.id) setResult(data);
    } catch (err) { if (id === request.current.id) setError(`${err.message} Your video remains available to retry analysis.`); }
    finally { if (id === request.current.id) setBusy(false); }
  }
  const canSubmit = upload || ['recorded', 'submitted'].includes(capture.status);
  return <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
    <h2 className="text-lg font-bold">Process Evidence</h2>
    <p className="text-sm">Upload a process video or record naturally through KARIGAR. Live capture is optional transparency evidence, not proof of authenticity. No gestures or spoken codes are required.</p>
    <div className="flex flex-wrap gap-3">
      <label className="border rounded-lg p-2 cursor-pointer">Upload Video
        <input aria-label="Upload process video" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" disabled={busy} className="block text-sm max-w-full"
          onChange={e => { if (e.target.files[0]) { resetResult(); controller.current.discard(); setUpload(e.target.files[0]); } }} />
      </label>
      <button type="button" className="border rounded-lg p-2" disabled={busy || ['requesting_camera', 'recording', 'stopping', 'submitting'].includes(capture.status)}
        onClick={() => { resetResult(); setUpload(null); controller.current.open(); }}>Record Live</button>
    </div>
    <p className="text-xs">Camera access is needed only when you choose Record Live. Audio is not recorded. Maximum recording: 60 seconds; maximum upload: 100 MiB.</p>
    <p role="status" className="text-sm">{capture.stream ? 'Camera active' : 'Camera off'} ? {capture.status.replaceAll('_', ' ')}</p>
    <video ref={camera} autoPlay muted playsInline hidden={!capture.stream} className="w-full max-w-lg rounded-lg" aria-label="Camera preview" />
    {capture.status === 'ready' && <button type="button" className="border rounded-lg p-2" onClick={() => controller.current.start()}>Start Recording</button>}
    {capture.status === 'recording' && <div className="flex gap-3 items-center">
      <span role="timer">Recording: {Math.floor(capture.seconds || 0)} / {capture.limit} seconds</span>
      <button type="button" className="border rounded-lg p-2" onClick={() => controller.current.stop()}>Stop Recording</button>
    </div>}
    {['requesting_camera', 'ready', 'recording', 'stopping'].includes(capture.status) &&
      <button type="button" className="border rounded-lg p-2" onClick={() => { resetResult(); controller.current.discard(); }}>Stop Camera / Cancel</button>}
    {capture.file && <div className="space-y-2">
      <RecordedPreview file={capture.file} />
      <button type="button" disabled={busy} className="border rounded-lg p-2" onClick={() => { resetResult(); controller.current.discard(); }}>Discard recording</button>
      <button type="button" disabled={busy} className="border rounded-lg p-2 ml-2" onClick={() => { resetResult(); controller.current.open(); }}>Re-record</button>
    </div>}
    {upload && <p className="text-sm">Selected upload: {upload.name}. Ordinary upload receives normal process analysis.</p>}
    <label className="block text-sm">Optional product photo for product/process matching
      <input aria-label="Product photo" type="file" accept="image/*" disabled={busy} onChange={e => { resetResult(); setImage(e.target.files[0] || null); }} />
    </label>
    <button type="button" disabled={!canSubmit || busy} className="bg-emerald-700 text-white rounded-lg px-4 py-2 disabled:opacity-50" onClick={analyze}>
      {busy ? 'Submitting / analyzing?' : upload ? 'Analyze uploaded video' : 'Submit recording and analyze'}
    </button>
    {(error || capture.error) && <p role="alert" className="text-red-600">{error || capture.error}</p>}
    {capture.receipt && <p className="text-sm">Capture session accepted. Captured through KARIGAR. This does not verify the scene or artisan identity.</p>}
    {result && <div className="space-y-2" aria-live="polite">
      <h3 className="font-bold">AI evidence analysis: {result.trust_score.score} / {result.trust_score.max_score}</h3>
      <p>Live Capture Evidence: {result.live_capture_evidence.suggested_score} / 10 suggested provenance contribution. Excluded from the Trust Score.</p>
      <p className="text-sm">The response below includes temporal analysis, person visibility, hand availability/results and product/process similarity when a photo was provided.</p>
      <details><summary className="cursor-pointer">View evidence response</summary><pre className="text-xs overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre></details>
    </div>}
  </section>;
}
