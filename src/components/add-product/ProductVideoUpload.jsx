import React from 'react';
import { Video } from 'lucide-react';
import { VIDEO_ACCEPT } from '../../utils/productDraft.js';
import MediaPreview from './MediaPreview.jsx';
export default function ProductVideoUpload({ media, onFile, onCamera, onRemove, busy, process = false }) {
  const title=process?'Show How You Make It':'Product Showcase Video';
  return <section className="rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-4 min-w-0">
    <div className="flex gap-3"><Video className={process?'text-emerald-700 shrink-0':'text-seller-accent-ink shrink-0'}/><div><h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{process?'Recommended: show how your product was made. Upload a process video for normal craft evidence, or Record Live for optional KARIGAR capture provenance.':'Optional: show the finished product from different angles. This can add supporting product evidence.'}</p></div></div>
    <div className="flex flex-wrap gap-3">
      <label className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl border border-gray-300 font-semibold text-sm cursor-pointer focus-within:ring-2 focus-within:ring-orange-500">{process?'Upload Process Video':'Upload Video'}
        <input type="file" className="sr-only" accept={VIDEO_ACCEPT} aria-label={process?'Upload process video':'Upload showcase video'} disabled={busy} onChange={e=>{if(e.target.files[0])onFile(e.target.files[0]);e.target.value='';}} /></label>
      <button type="button" disabled={busy} onClick={onCamera} className={`min-h-11 px-4 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-50 ${process?'bg-seller-accent':'bg-seller-accent'}`}>{process?'Record Live':'Record Video'}</button>
    </div>
    <p className="text-xs text-gray-500">MP4, WebM, MOV or AVI ? up to 100 MiB ? {process?60:30} seconds maximum</p>
    {media && <><MediaPreview media={media} label={title}/>
      {process && media.source==='live_capture' && <p className="text-sm font-semibold text-emerald-800">Captured through KARIGAR ? Live Capture Evidence</p>}
      {media.duration===null && <p className="text-xs text-gray-500">Duration is unavailable in this browser; it will be checked during verification.</p>}
      <button type="button" disabled={busy} onClick={onRemove} className="min-h-11 text-sm underline text-gray-600">Remove {process?'process':'showcase'} video</button></>}
  </section>;
}
