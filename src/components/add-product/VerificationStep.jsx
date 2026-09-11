import React from 'react';
import { formatEvidenceScore } from '../../utils/evidenceFormat.js';
import { CATEGORIES, currentAnalysis, suggestions } from '../../utils/craftVerification.js';
const levels={low_evidence:'Low Evidence',basic_evidence:'Basic Evidence',good_evidence:'Good Evidence',high_evidence:'High Evidence',very_high_evidence:'Very High Evidence'};
export default function VerificationStep({draft,onRun,onEditMedia,onEditDetails}) {
  const analysis=draft?.verification,busy=analysis?.status==='running';
  const valid=draft&&currentAnalysis(draft),result=valid?analysis.result:null;
  const stale=analysis&&!busy&&analysis.status==='success'&&!valid;
  const button='min-h-11 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold disabled:opacity-50';
  return <section className="rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-5">
    <h2 className="text-xl font-bold">KARIGAR AI Evidence Analysis</h2>
    <p className="text-sm text-gray-600">What evidence has KARIGAR found for this listing? Only your selected primary photo is analyzed; other photos remain in your listing.</p>
    {busy&&<div role="status" className="rounded-xl bg-seller-accent-soft p-4"><span aria-hidden="true" className="inline-block h-4 w-4 rounded-full border-2 border-seller-accent border-t-transparent animate-spin mr-2"/>Analyzing your listing evidence…<p className="mt-2 text-sm">Checking supplied product media, making-process evidence, artisan visibility, visual consistency and listing completeness. This is one request; individual stage progress is not available.</p></div>}
    {stale&&<p role="status" className="rounded-xl bg-seller-accent-soft p-4 text-seller-accent-ink">Your listing changed after the last analysis. Run analysis again to update the evidence score.</p>}
    {analysis?.status==='error'&&<p role="alert" className="rounded-xl bg-seller-accent-soft p-4">{analysis.error}</p>}
    {result&&<>
      <div className="rounded-2xl bg-emerald-50 p-5"><h3 className="font-semibold">KARIGAR Trust Evidence Score</h3><p className="my-2 text-3xl font-bold">{formatEvidenceScore(result.trust_score.score)} / {result.trust_score.max_score}</p><p className="font-semibold">{levels[result.trust_score.level]||'Listing Evidence'}</p><p className="mt-2 text-sm">Higher scores mean the seller has provided more verifiable and transparent listing evidence. This score is not an authenticity guarantee.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{CATEGORIES.map(([key,label,description])=>{const category=result.trust_score.categories[key];return <article key={key} className="rounded-xl border border-gray-200 p-4"><h3 className="font-semibold">{label}</h3><p className="text-xl font-bold mt-2">{formatEvidenceScore(category.score)} / {category.max_score}</p><p className="text-xs text-gray-500">{category.available?'Evidence analyzed':'Not available'}</p><p className="text-sm text-gray-600 mt-2">{description}</p></article>;})}</div>
      <div><h3 className="font-semibold">Evidence found</h3><ul className="mt-2 space-y-2 text-sm">{[
        ['Product photo provided',!!analysis.inputs.product_image],['Product showcase video provided',!!analysis.inputs.product_video],['Making-process video provided',!!analysis.inputs.process_video],
        ['Hands observed',result.signals.hands>0],['Artisan/person visible',result.signals.person>0],['Product/process visual comparison available',result.trust_score.categories.product_process_match.available],
        ['Listing information provided',result.trust_score.categories.listing_completeness.score>0],['Recorded through KARIGAR',result.live_capture],
      ].map(([label,found])=><li key={label}>{found?'✓':'—'} {label}: {found?'Available':'Not provided or not enough evidence'}</li>)}</ul></div>
      <details className="rounded-xl border p-4 text-sm"><summary className="cursor-pointer font-semibold">View analysis details</summary><dl className="mt-3 space-y-2">{[['Person presence ratio',result.signals.person],['Hand presence ratio',result.signals.hands],['Product/process similarity',result.signals.similarity],['Average visual change',result.signals.temporal]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{Number.isFinite(value)?value.toFixed(3):'Not available'}</dd></div>)}</dl><p className="mt-3">Visual signals do not prove identity or authenticity. Live capture records provenance and does not add points to this score.</p></details>
      {suggestions(result,analysis.inputs).length>0&&<div><h3 className="font-semibold">Want to strengthen this listing?</h3><ul className="list-disc pl-5 text-sm mt-2 space-y-2">{suggestions(result,analysis.inputs).map(item=><li key={item}>{item}</li>)}</ul></div>}
    </>}
    <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={busy} onClick={onEditMedia}>Edit Media</button><button type="button" className={button} disabled={busy} onClick={onEditDetails}>Edit Product Details</button><button type="button" className={button} disabled={busy} onClick={onRun}>{busy?'Analysis running…':analysis?'Run Analysis Again':'Run Analysis'}</button></div>
  </section>;
}
