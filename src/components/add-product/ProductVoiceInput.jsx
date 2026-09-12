import React, { useEffect, useRef, useState } from 'react';
import { AudioRecorder, MAX_VOICE_SECONDS } from '../../utils/audioRecorder.js';
import { generateVoiceDetails } from '../../utils/voiceApi.js';
const noop=()=>{};
export default function ProductVoiceInput({voice,onGenerated,onBusy=noop}) {
  const [language,setLanguage]=useState('bn');
  const [capture,setCapture]=useState({state:'idle'});
  const audioPreview=useRef(null);
  const recorder=useRef(null),request=useRef(null),alive=useRef(false);
  useEffect(()=>{alive.current=true;recorder.current=new AudioRecorder({onChange:setCapture});return()=>{alive.current=false;recorder.current.dispose();request.current?.abort();};},[]);
  useEffect(()=>{if(!capture.file)return;const value=URL.createObjectURL(capture.file);if(audioPreview.current)audioPreview.current.src=value;return()=>URL.revokeObjectURL(value);},[capture.file]);
  const busy=['requesting_microphone','ready','recording','processing'].includes(capture.state);
  useEffect(()=>{onBusy(busy);return()=>onBusy(false);},[busy,onBusy]);
  function discard(){request.current?.abort();recorder.current.dispose();setCapture({state:'idle'});}
  async function process() {
    const controller=new AbortController();request.current=controller;
    const timeout=setTimeout(()=>controller.abort(),135000);
    setCapture(old=>({...old,state:'processing',error:null}));
    try {
      const result=await generateVoiceDetails(capture.file,language,capture.duration,controller.signal);
      if(alive.current&&!controller.signal.aborted){onGenerated(result);setCapture(old=>({...old,state:'completed'}));}
    } catch(error) {
      console.error('[KARIGAR voice processing]',error);
      if(alive.current)setCapture(old=>({...old,state:'error',error:error.name==='AbortError'
        ? 'Voice generation timed out. Try a shorter recording or fill the details manually.'
        : error.name==='TypeError' ? 'The voice service could not be reached. Try again shortly or fill the details manually.'
          : error.message || 'We could not process that recording. Try again or fill the details manually.'}));
    }finally{clearTimeout(timeout);}
  }
  const button='min-h-11 rounded-xl border border-seller-accent px-4 py-3 text-sm font-semibold disabled:opacity-50';
  return <div className="rounded-2xl bg-seller-accent-soft p-4 sm:p-5 space-y-4">
    <div><h3 className="text-lg font-bold">Tell us about your product</h3><p className="mt-2 text-sm text-gray-700">Speak naturally in your own language. Tell us what the product is, what it is made from, how you make it, where it comes from, and anything else you would like buyers to know.</p></div>
    <label className="block text-sm font-semibold">Recording language<select value={language} disabled={busy} onChange={e=>setLanguage(e.target.value)} className="block mt-1 rounded-xl border bg-seller-card p-3"><option value="bn">Bengali</option><option value="hi">Hindi</option><option value="en">English</option></select></label>
    <p className="text-xs text-gray-600">Optional. Up to {MAX_VOICE_SECONDS} seconds. When you generate details, your recording is sent to Google Gemini for processing. KARIGAR does not keep a permanent audio copy.</p>
    <details className="rounded-xl border border-seller-accent bg-seller-card p-3 text-sm">
      <summary className="cursor-pointer font-semibold">What should I talk about?</summary>
      <ol className="mt-3 list-decimal pl-5 space-y-2">
        <li>What is the product? <span className="text-gray-600">“This is a clay flower pot.”</span></li>
        <li>What is it made from? <span className="text-gray-600">“I use clay and natural pigment.”</span></li>
        <li>How do you make it? <span className="text-gray-600">“I shape it by hand, then fire it.”</span></li>
        <li>Where is it made? <span className="text-gray-600">“I make it in my workshop in Bankura.”</span></li>
        <li>What makes it special or traditional? <span className="text-gray-600">“I paint each floral pattern by hand.”</span></li>
        <li>Anything about you or your craft? <span className="text-gray-600">“I learned pottery from my father.”</span></li>
      </ol>
      <p className="mt-3 text-gray-600">You don't have to mention everything. Speak naturally about what you know. You can add missing details afterward.</p>
    </details>
    <div className="flex flex-wrap gap-3">
      {['idle','error','completed','recorded'].includes(capture.state)&&<button type="button" className={button} onClick={()=>recorder.current.open()}>{capture.file?'Re-record':'Speak About Your Product'}</button>}
      {capture.state==='ready'&&<button type="button" className={button} onClick={()=>recorder.current.start()}>Start Recording</button>}
      {capture.state==='recording'&&<button type="button" className={button} onClick={()=>recorder.current.stop()}>Stop Recording</button>}
      {capture.file&&capture.state!=='processing'&&<button type="button" className={button} onClick={process}>Generate Product Details</button>}
      {capture.state!=='idle'&&<button type="button" className={button} disabled={capture.state==='processing'} onClick={discard}>Discard recording / Close</button>}
      <button type="button" className={button} disabled={capture.state==='processing'} onClick={()=>{discard();document.getElementById('product-details-form')?.scrollIntoView({behavior:'smooth'});}}>Fill Details Manually</button>
    </div>
    <p role="status" className="text-sm">{capture.state==='requesting_microphone'?'Requesting microphone access…':capture.state==='ready'?'Microphone active. Press Start Recording when ready.':capture.state==='recording'?`Microphone active — recording ${capture.seconds || 0}s / ${MAX_VOICE_SECONDS}s`:capture.state==='processing'?'Transcribing your recording and preparing your product details…':capture.state==='recorded'?'Recording stopped. Listen before generating your draft.':capture.state==='completed'?'Your product details are ready. Review before continuing.':''}</p>
    {capture.file&&<audio ref={audioPreview} controls className="w-full"/>}
    {capture.error&&<p role="alert" className="text-sm text-red-700">{capture.error}</p>}
    {voice?.transcript&&<div><p className="text-sm font-semibold text-emerald-800">Draft created from your voice — review before continuing.</p><details className="mt-2 text-sm"><summary className="cursor-pointer">View transcript — You said</summary><p className="mt-2 whitespace-pre-wrap">{voice.transcript}</p></details></div>}
  </div>;
}
