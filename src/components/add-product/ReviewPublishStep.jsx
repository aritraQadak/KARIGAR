import React from 'react';
import MediaPreview from './MediaPreview.jsx';
import { currentAnalysis } from '../../utils/craftVerification.js';
import { CATEGORIES } from '../../utils/craftVerification.js';
import { formatEvidenceScore, evidenceLevels } from '../../utils/evidenceFormat.js';
import { publishIssues } from '../../utils/productApi.js';
export default function ReviewPublishStep({draft,inputs,onEdit,busy}) {
  const primary=draft.media.productImages[draft.media.primaryImageIndex];
  const d=inputs.listing_metadata;
  return <section className="rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-5">
    <h2 className="text-xl font-bold">Review & Publish</h2>
    <p className="text-sm text-gray-600">Review your product listing before publishing. You can return to any previous step if something needs to be changed.</p>
    {currentAnalysis(draft)&&<div className="rounded-xl bg-emerald-50 p-4 space-y-3"><h3 className="font-semibold">KARIGAR Evidence Score</h3><p className="text-2xl font-bold">{formatEvidenceScore(draft.verification.result.trust_score.score)} / 100</p><p>{evidenceLevels[draft.verification.result.trust_score.level]}</p><dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">{CATEGORIES.map(([key,label])=>{const c=draft.verification.result.trust_score.categories[key];return <div key={key} className="flex justify-between gap-3"><dt>{label}</dt><dd>{formatEvidenceScore(c.score)} / {c.max_score}</dd></div>;})}</dl><p className="text-sm">This score reflects supporting and transparency evidence for the listing. It is not an authenticity guarantee.</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-3">{primary&&<MediaPreview media={primary} photo label="Primary product image"/>}<div className="grid grid-cols-3 gap-2">{draft.media.productImages.filter(p=>p!==primary).map(p=><img key={p.previewUrl} src={p.previewUrl} alt="Additional product image" className="rounded-lg aspect-square object-cover w-full"/>)}</div></div>
      <div className="md:col-span-2 min-w-0 space-y-3"><h3 className="text-xl font-bold break-words">{d.title||'Untitled product'}</h3><p className="whitespace-pre-wrap break-words text-gray-600">{d.description||'No description yet.'}</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">{[['Category',d.category],['Materials',d.materials.join(', ')],['Region',d.region],['Dimensions',d.dimensions],['Technique',d.craft_technique],['Price',d.price===null?'':`INR ${d.price}`],['Stock',draft.details.stock],['Certification',draft.details.giTag]].map(([label,value])=><div key={label} className="min-w-0"><dt className="text-gray-500">{label}</dt><dd className="font-medium break-words">{value||'Not provided'}</dd></div>)}</dl>
      </div>
    </div>
    <div><h3 className="font-semibold mb-2">Product Showcase Video</h3>{draft.media.productVideo?<MediaPreview media={draft.media.productVideo}/>:<p className="text-sm text-gray-500">Not provided</p>}</div>
    <div><h3 className="font-semibold mb-2">Making Process</h3>{draft.media.processVideo?<><MediaPreview media={draft.media.processVideo}/><p className="text-sm text-emerald-800 mt-2">{draft.verification?.result?.live_capture&&currentAnalysis(draft)?'Captured through KARIGAR':'Uploaded process evidence'}</p></>:<p className="text-sm text-gray-500">Not provided</p>}</div>
    <div className="flex flex-wrap gap-3">{['Edit Media','Edit Product Details','Review Analysis'].map((label,index)=><button type="button" key={label} disabled={busy} onClick={()=>onEdit(index)} className="min-h-11 rounded-xl border px-4 py-3 text-sm disabled:opacity-50">{label}</button>)}</div>
    {publishIssues(draft).length>0&&<ul role="status" className="rounded-xl bg-seller-accent-soft p-4 text-sm space-y-2">{publishIssues(draft).map(issue=><li key={issue}>{issue}</li>)}</ul>}
  </section>;
}
