import React, { useState } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { IMAGE_ACCEPT, VIDEO_ACCEPT } from '../../utils/productDraft.js';
import MediaPreview from './MediaPreview.jsx';
import { authenticityEntries } from '../../utils/mediaAuthenticity.js';

export default function MediaAuthenticityStep({model, onBusy=()=>{}, readOnly=false}) {
  const [replacing,setReplacing]=useState(false),[error,setError]=useState('');
  async function replace(entry,file) {
    if(!file)return;
    setError('');setReplacing(true);onBusy(true);
    try {await model.replaceMedia(entry,file);} catch(e){setError(e.message);}
    finally {setReplacing(false);onBusy(false);}
  }
  const entries = authenticityEntries(model.draft.media);
  return <section className="rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-5">
    <h2 className="text-xl font-bold">Media Authenticity Check</h2>
    <p className="text-sm text-gray-500">Detection is an estimate and does not prove that a product is handmade. Every attached file must be likely camera-captured before continuing.</p>
    {error&&<p role="alert" className="text-red-400">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {entries.map(({entry,photo})=>{
        const result = entry.authenticity;
        const running = result?.status === 'running';
        const success = result?.status === 'success';
        const accepted=success&&result.label==='Likely camera-captured';
        const rejected=success&&result.label==='Likely AI-generated';
        return <article key={entry.previewUrl} className="rounded-xl border border-gray-200 p-3 space-y-3 min-w-0">
          <MediaPreview media={entry} photo={photo} label="Media for authenticity analysis"/>
          <div role="status" aria-live="polite" className={`rounded-lg p-3 text-sm space-y-2 ${accepted?'bg-emerald-500/10':rejected?'bg-red-500/10':'bg-seller-accent-soft'}`}>
            <p className={`font-semibold flex items-center gap-2 ${accepted?'text-emerald-400':rejected?'text-red-400':'text-seller-accent-ink'}`}>{accepted?<CircleCheck size={18} aria-hidden="true"/>:rejected?<TriangleAlert size={18} aria-hidden="true"/>:null}{running?'Analyzing…':success?result.label:result?.status==='unsupported'?'Unsupported media':result?.status==='unavailable'?'Detection unavailable':result?.status==='error'?'Detection failed':'Not analyzed'}</p>
            {result?.message&&<p>{result.message}</p>}
            {photo&&Number.isInteger(result?.error_code)&&<p>Sightengine error code: {result.error_code}</p>}
            {photo&&success&&Number.isFinite(result.ai_score)&&<p>Detector AI-generation score: {(result.ai_score*100).toFixed(1)}%</p>}
            {!photo&&<p>Based on sampled visual content; not proof of authenticity.</p>}
            {success&&<p>{result.cached?'Saved analysis':'Analysis complete'}</p>}
            {!running&&(!success||result.review_required)&&<p>Needs review</p>}
          </div>
          {!readOnly&&<div className="flex flex-wrap gap-2">
            {(!success||result.retryable||result.label==='Inconclusive')&&<button type="button" disabled={running||replacing} onClick={()=>model.detect(entry)} className="min-h-11 rounded-xl bg-seller-accent text-white px-4 py-2 text-sm disabled:opacity-50">{running?'Analyzing…':result?'Retry':'Analyze'}</button>}
            {rejected&&<label className="min-h-11 rounded-xl border border-red-400/40 px-4 py-2 text-sm text-red-400 cursor-pointer focus-within:ring-2">
              {replacing?'Replacing...':'Replace file'}<input type="file" aria-label={`Replace ${entry.file.name}`} className="sr-only" accept={photo?IMAGE_ACCEPT:VIDEO_ACCEPT} disabled={replacing} onChange={event=>{const file=event.target.files?.[0];event.target.value='';replace(entry,file);}}/>
            </label>}
          </div>}
        </article>;
      })}
    </div>
  </section>;
}
