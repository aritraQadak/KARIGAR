import { createHash } from 'node:crypto';

// The URL is server configuration, never supplied by the browser.
export async function verifyMediaEligibility(files, fetcher=fetch) {
  const base=(process.env.AI_SERVICE_URL||'http://127.0.0.1:8000').replace(/\/+$/, '');
  const response=await fetcher(`${base}/verify/media-eligibility`,{
    method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(10000),
    body:JSON.stringify({files:files.map(({buffer,kind})=>({sha256:createHash('sha256').update(buffer).digest('hex'),kind}))}),
  });
  if(!response.ok)throw new Error('Media verification unavailable');
  const result=await response.json();
  return result.eligible===true;
}
