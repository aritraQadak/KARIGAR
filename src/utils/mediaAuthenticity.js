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
    // A disconnected reverse proxy can return an empty or HTML error page.
    // Do not expose a JSON parser exception as the detection result.
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { /* Handle transport errors below. */ }
    if (!response.ok) {
      const detail = typeof data?.detail === 'string' ? data.detail : null;
      throw new Error(detail || ([502, 503, 504].includes(response.status)
        ? 'Detection unavailable. The AI service could not be reached. Please retry shortly.'
        : `Detection failed (HTTP ${response.status}). Please retry.`));
    }
    if (!data || !['success', 'error', 'unsupported', 'unavailable'].includes(data.status)
      || (data.status === 'success' && !['Likely camera-captured', 'Likely AI-generated', 'Inconclusive'].includes(data.label))) {
      throw new Error('The detection service returned an invalid response. Please retry.');
    }
    return data;
  } catch (error) {
    return {status:'error', review_required:true, message:
      ['TimeoutError', 'AbortError'].includes(error.name)
        ? 'Detection timed out. Please retry.'
        : error.name === 'TypeError'
          ? 'Detection unavailable. The AI service could not be reached. Please retry shortly.' : error.message};
  }
}
