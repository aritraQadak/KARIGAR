import { isCraftCategory } from '../constants/craftCategories.js';
import { safeFetch, API_BASE_URL } from './api.js';
import { listingMetadata } from './productDraft.js';
import { currentAnalysis } from './craftVerification.js';
import { mediaEligibility } from './mediaAuthenticity.js';
export function publishIssues(draft) {
  const issues=[],d=draft.details;
  const eligibility=mediaEligibility(draft.media);if(eligibility)issues.push(eligibility);
  if(!draft.media.productImages[draft.media.primaryImageIndex])issues.push('Add a primary product photo in Edit Media.');
  if(!d.title.trim()||!isCraftCategory(d.category))issues.push('Add a title and choose a craft category in Edit Product Details.');
  if(!Number.isFinite(Number(d.price))||Number(d.price)<=0)issues.push('Enter a positive price in Edit Product Details.');
  if(d.stock===''||!Number.isInteger(Number(d.stock))||Number(d.stock)<0||Number(d.stock)>2147483647)issues.push('Enter a whole-number stock quantity of zero or more.');
  if(!currentAnalysis(draft))issues.push('Run analysis again before publishing: the current listing needs an up-to-date result.');
  return issues;
}
export function publishBody(draft) {
  const issues=publishIssues(draft);if(issues.length)throw new Error(issues[0]);
  const body=new FormData(),result=draft.verification.result;
  body.append('listing',JSON.stringify({...listingMetadata(draft.details),stock:Number(draft.details.stock),giTag:draft.details.giTag}));
  const {score,level,categories}=result.trust_score;
  body.append('evidence',JSON.stringify({score,level,categories:Object.fromEntries(Object.entries(categories).map(([key,c])=>[key,{score:c.score,max_score:c.max_score}])),live_capture:result.live_capture,analyzed_at:draft.verification.analyzedAt}));
  for(const image of draft.media.productImages)body.append('images',image.file);
  body.append('primary_index',String(draft.media.primaryImageIndex));
  if(draft.media.productVideo)body.append('product_video',draft.media.productVideo.file);
  if(draft.media.processVideo){body.append('process_video',draft.media.processVideo.file);body.append('process_source',draft.media.processVideo.source);}
  return body;
}
export function publishProduct(draft,key,token) {
  if(!token)throw new Error('Please sign in before publishing. Your draft is still here.');
  return safeFetch('/api/products',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Idempotency-Key':key},body:publishBody(draft)}).then(result=>{if (typeof window !== 'undefined') window.dispatchEvent(new Event('karigar-products-changed'));return result;});
}
export function listProducts(token){return safeFetch('/api/products',{headers:{Authorization:`Bearer ${token}`}});}
export function productMediaUrl(url){return url?.startsWith('/uploads/')?`${API_BASE_URL}${url}`:url;}
