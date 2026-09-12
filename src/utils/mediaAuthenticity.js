import { AI_SERVICE_URL } from './verificationApi.js';
export function authenticityEntries(media) {
  return [...media.productImages.map(entry => ({entry, photo:true})),
    ...[media.productVideo, media.processVideo].filter(Boolean).map(entry => ({entry, photo:false}))];
}
export function mediaEligibility(media) {
  const entries=authenticityEntries(media);
  if(entries.some(({entry})=>entry.authenticity?.status==='success'&&entry.authenticity.label==='Likely AI-generated'))
    return 'Remove or replace media flagged as likely AI-generated before continuing.';
  if(!media.productImages.length||entries.some(({entry})=>entry.authenticity?.status!=='success'||entry.authenticity.label!=='Likely camera-captured'||entry.authenticity.retryable))
    return 'Complete media analysis before continuing. Uncertain results must be resolved.';
  return '';
}
export async function detectMedia(file) {
  const body = new FormData();
  body.append('media', file);
  try {
    const response = await fetch(`${AI_SERVICE_URL}/verify/media-authenticity`, {
      method:'POST', body, signal:AbortSignal.timeout(120000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Detection failed. Please retry.');
    return data;
  } catch (error) {
    return {status:'error', review_required:true, message:error.name === 'TypeError'
      ? 'Detection unavailable. Check that the AI service is running.' : error.message};
  }
}
