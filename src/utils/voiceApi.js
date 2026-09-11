import { AI_SERVICE_URL } from './verificationApi.js';
export const DETAIL_KEYS = ['title','description','category','materials','price','region','dimensions','craft_technique'];
export function validateVoiceResult(value) {
  if (!value || typeof value.transcript !== 'string' || !value.transcript.trim() || typeof value.source_language !== 'string' || !value.details || !Array.isArray(value.missing_fields)) throw new Error('Invalid voice draft response.');
  if(value.missing_fields.some(key=>key!=='artisan_story'&&!DETAIL_KEYS.includes(key)))throw new Error('Invalid missing fields.');
  for (const key of DETAIL_KEYS) {
    const item = value.details[key];
    if (key === 'materials' ? !Array.isArray(item) || item.some(x => typeof x !== 'string') : key === 'price' ? item !== null && (typeof item !== 'number' || !Number.isFinite(item) || item <= 0) : item !== null && typeof item !== 'string') throw new Error('Invalid voice draft fields.');
  }
  return value;
}
export function applyVoiceResult(draft, result) {
  validateVoiceResult(result);
  const details = {...draft.details};
  // Missing AI values never erase information the seller already entered.
  for (const key of DETAIL_KEYS) {
    const value = result.details[key];
    if (value !== null && value !== '' && (!Array.isArray(value) || value.length)) details[key] = value;
  }
  return {...draft, details, verification:null, voice:{transcript:result.transcript,source_language:result.source_language,missing_fields:result.missing_fields.filter(key=>DETAIL_KEYS.includes(key))}};
}
export async function generateVoiceDetails(file, language, duration, signal, fetcher=globalThis.fetch) {
  const body = new FormData();
  body.append('audio', file); body.append('selected_language',language); body.append('duration_seconds',String(duration));
  const response = await fetcher(`${AI_SERVICE_URL}/onboarding/product-from-voice`, {method:'POST',body,signal});
  if (!response.ok) throw new Error('We could not process that recording. Try again or fill the details manually.');
  return validateVoiceResult(await response.json());
}
