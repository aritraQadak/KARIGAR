import React, { useEffect, useRef, useState } from 'react';
import { LiveCapture, cameraError } from '../../utils/liveCapture.js';
import { requestCamera, stopCamera, capturePhoto } from '../../utils/cameraMedia.js';
import { captureApi } from '../../utils/verificationApi.js';

export default function CameraCapture({ kind, onAccept, onClose }) {
  const [capture,setCapture] = useState({status:'requesting_camera'});
  const [facing,setFacing] = useState('environment');
  const [attempt,setAttempt] = useState(0);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const preview = useRef(null), recorded = useRef(null), controller = useRef(null), life = useRef(null);
  const photo = kind === 'photo', live = kind === 'process';
  useEffect(() => {
    const lifecycle = { active:true, stream:null }; life.current = lifecycle;
    let instance;
    if (photo) {
      Promise.resolve().then(() => requestCamera(undefined,facing,true)).then(stream => {
        if (!lifecycle.active) { stopCamera(stream); return; }
        lifecycle.stream = stream; setCapture({status:'ready',stream});
      }).catch(err => { if (lifecycle.active) setCapture({status:'error',error:cameraError(err)}); });
    } else {
      instance = new LiveCapture({ api:captureApi, onChange:setCapture, provenance:live, maxRecordingSeconds:live ? 60 : 30 });
      controller.current = instance; instance.open(facing);
    }
    return () => { lifecycle.active = false; stopCamera(lifecycle.stream); instance?.dispose(); };
  }, [photo,live,facing,attempt]);
  useEffect(() => { if (preview.current) preview.current.srcObject = capture.stream || null; }, [capture.stream]);
  useEffect(() => {
    if (!capture.file) return;
    const url = URL.createObjectURL(capture.file);
    recorded.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [capture.file]);
  function retry() { setError(''); setCapture({status:'requesting_camera'}); setAttempt(n=>n+1); }
  async function takePhoto() {
    const lifecycle = life.current;
    setBusy(true); setError('');
    try {
      const file = await capturePhoto(preview.current);
      if (!lifecycle.active) return;
      stopCamera(lifecycle.stream); lifecycle.stream=null;
      setCapture({status:'recorded',file,stream:null});
    } catch (err) { if (lifecycle.active) setError(cameraError(err)); }
    finally { if (lifecycle.active) setBusy(false); }
  }
  async function accept() {
    const lifecycle = life.current;
    setBusy(true); setError('');
    try {
      const receipt = live ? capture.receipt || await controller.current.submit() : null;
      if (live && !receipt || !lifecycle.active) return;
      await onAccept(capture.file,live ? 'live_capture' : 'camera',receipt);
      if (lifecycle.active) onClose();
    } catch (err) { if (lifecycle.active) setError(err.message); }
    finally { if (lifecycle.active) setBusy(false); }
  }
  const button = 'min-h-11 rounded-xl border border-gray-300 px-4 py-2 font-semibold text-sm disabled:opacity-50';
  return <section aria-label="Camera capture" className="border-2 border-seller-accent rounded-2xl p-4 sm:p-6 space-y-4 bg-seller-card">
    <div className="flex justify-between items-center gap-3"><h3 className="font-bold">{photo ? 'Take a product photo' : live ? 'Record your making process' : 'Record the finished product'}</h3>
      <button type="button" className={button} onClick={onClose} disabled={busy}>Cancel / Close camera</button></div>
    <p role="status" className="text-sm text-gray-600">{capture.stream ? 'Camera active' : 'Camera off'}{capture.status === 'recording' ? ` ? Recording ${Math.floor(capture.seconds || 0)} / ${capture.limit} seconds` : ''}</p>
    <video ref={preview} autoPlay muted playsInline hidden={!capture.stream} className="w-full max-h-96 rounded-xl bg-gray-950" aria-label="Live camera preview" />
    {capture.file && (photo ? <img ref={recorded} alt="Captured product photo" className="max-h-96 w-full object-contain rounded-xl" /> :
      <video ref={recorded} controls playsInline className="w-full max-h-96 rounded-xl" aria-label="Recorded video preview" />)}
    <div className="flex flex-wrap gap-3">
      {capture.status === 'ready' && <><button className={button} type="button" disabled={busy} onClick={photo ? takePhoto : () => controller.current.start()}>{photo ? 'Capture Photo' : 'Start Recording'}</button>
        <button className={button} type="button" disabled={busy} onClick={()=>{setCapture({status:'requesting_camera'});setFacing(f=>f==='environment'?'user':'environment');}}>Switch camera</button></>}
      {capture.status === 'recording' && <button className={button} type="button" onClick={()=>controller.current.stop()}>Stop Recording</button>}
      {capture.file && <><button className={button+' bg-seller-accent text-white border-seller-accent'} type="button" disabled={busy} onClick={accept}>{busy ? 'Preparing media...' : photo ? 'Use Photo' : live ? 'Use Live Recording' : 'Use Video'}</button>
        <button className={button} type="button" disabled={busy} onClick={retry}>{photo ? 'Retake' : 'Re-record'}</button></>}
      {capture.status === 'error' && <button className={button} type="button" onClick={retry}>Try camera again</button>}
    </div>
    <p className="text-xs text-gray-500">{live ? 'Using this recording submits it through KARIGAR for capture provenance. Product verification comes later.' : 'Captured media is added to your listing draft. Camera capture does not verify authenticity.'} Audio is not recorded.</p>
    {(error || capture.error) && <p role="alert" className="text-sm text-red-700">{error || capture.error} You can cancel and upload a file instead.</p>}
  </section>;
}
