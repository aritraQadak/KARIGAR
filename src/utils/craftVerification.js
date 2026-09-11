import { AI_SERVICE_URL } from './verificationApi.js';
import { verificationInputs } from './productDraft.js';
export const CATEGORIES = [
  ['product_photo_evidence','Product Photos','Clear product photos help buyers understand what they are purchasing.'],
  ['product_video_evidence','Product Showcase Video','A showcase video provides additional views of the finished product.'],
  ['craft_process_evidence','Making Process','Making footage provides evidence of how the craft was produced.'],
  ['artisan_visibility','Artisan Visibility','Visible artisan presence adds transparency, without verifying identity.'],
  ['product_process_match','Product & Process Match','Visual consistency compares the product with making footage; backgrounds can influence it.'],
  ['listing_completeness','Listing Completeness','Detailed information helps buyers understand the listing; it does not verify seller claims.'],
];
export function analysisSnapshot(draft) { const inputs=verificationInputs(draft);return {...inputs,listing_metadata:JSON.stringify(inputs.listing_metadata)}; }
export function sameInputs(a,b) { return !!a&&!!b&&Object.keys(a).every(key=>a[key]===b[key]); }
export function currentAnalysis(draft) { return draft.verification?.status==='success'&&sameInputs(draft.verification.inputs,analysisSnapshot(draft)); }
export function craftBody(inputs) {
  const body=new FormData();
  for(const key of ['product_image','product_video','process_video','capture_receipt_token'])if(inputs[key])body.append(key,inputs[key]);
  body.append('listing_metadata',inputs.listing_metadata);return body;
}
export function validateAnalysis(result) {
  const trust=result?.trust_score;
  if(!trust||!Number.isFinite(trust.score)||trust.score<0||trust.score>100||trust.max_score!==100)throw new Error('Invalid analysis response. Please try again.');
  for(const [key] of CATEGORIES){const c=trust.categories?.[key];if(!c||!Number.isFinite(c.score)||!Number.isFinite(c.max_score)||c.score<0||c.score>c.max_score||typeof c.available!=='boolean')throw new Error('Incomplete analysis response. Please try again.');}
  const signals=result.technical_signals||{};
  return {trust_score:trust,live_capture:result.live_capture_evidence?.verified_capture_session===true,
    signals:{person:signals.person_presence_ratio,hands:signals.hand_evidence_available?signals.hand_presence_ratio:null,
      similarity:signals.best_similarity,temporal:signals.temporal_analysis?.average_visual_change}};
}
export async function requestAnalysis(inputs,fetcher=globalThis.fetch) {
  try {
    const response=await fetcher(`${AI_SERVICE_URL}/verify/craft`,{method:'POST',body:craftBody(inputs)});
    if(!response.ok){
      console.error('[KARIGAR evidence analysis]',{status:response.status});
      throw new Error([400,413,415,422].includes(response.status)?"We couldn't analyze one of the media files or its capture receipt. Return to Product Media and check the file.":'KARIGAR analysis is temporarily unavailable. Your product information is safe. Please try again.');
    }
    return validateAnalysis(await response.json());
  }catch(error){
    if(error instanceof TypeError||error instanceof SyntaxError)throw new Error('KARIGAR analysis is temporarily unavailable. Your product information is safe. Please try again.');
    throw error;
  }
}
export function suggestions(result,inputs) {
  const categories=result.trust_score.categories,items=[];
  if(!inputs.product_video)items.push('Add a short showcase video to give buyers more views of the product.');
  if(!inputs.process_video)items.push('Add a making-process video to provide more craft evidence.');
  if(inputs.process_video&&categories.artisan_visibility.score<categories.artisan_visibility.max_score/2)items.push('If comfortable, include yourself in part of the making video.');
  if(categories.listing_completeness.score<categories.listing_completeness.max_score)items.push('Add more product details to improve listing completeness.');
  if(!categories.product_process_match.available)items.push('Provide a clear product photo and making video so KARIGAR can compare them.');
  return items;
}
