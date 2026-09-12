import test from 'node:test';
import assert from 'node:assert/strict';
import { formatEvidenceScore } from './evidenceFormat.js';
import { publishBody,publishIssues } from './productApi.js';
import { emptyDraft } from './productDraft.js';
import { analysisSnapshot } from './craftVerification.js';
test('evidence display examples retain full precision in source',()=>{
  const values=[73.9268,13.6407,6.994899999,5.625,7.6662,5];
  assert.deepEqual(values.map(formatEvidenceScore),['73.9','13.6','7.0','5.6','7.7','5']);assert.equal(values[0],73.9268);
});
function ready(){const d=emptyDraft();Object.assign(d.details,{title:'Clay pot',category:'Pottery',price:'450',stock:'0'});d.media.productImages=[{file:new File(['image'],'pot.png',{type:'image/png'}),previewUrl:'blob:private',authenticity:{status:'success',label:'Likely camera-captured'}}];d.verification={status:'success',inputs:analysisSnapshot(d),analyzedAt:'2026-09-11T12:00:00Z',result:{trust_score:{score:35,level:'low_evidence',categories:{}},live_capture:false}};return d;}
test('publish requires fields and fresh analysis, never a high score or optional videos',()=>{
  const d=ready();assert.deepEqual(publishIssues(d),[]);d.details.title='Changed';assert.ok(publishIssues(d).some(x=>x.includes('analysis')));assert.throws(()=>publishBody(d));
  d.details.title='Clay pot';d.details.stock='';assert.ok(publishIssues(d).some(x=>x.includes('stock')));
});
test('publish payload contains actual files, numeric commercial fields, no preview URLs or tokens',()=>{
  const d=ready(),body=publishBody(d),listing=JSON.parse(body.get('listing'));
  assert.equal(body.get('images').name,'pot.png');assert.equal(listing.price,450);assert.equal(listing.stock,0);assert.equal(body.get('primary_index'),'0');assert.equal(body.has('product_video'),false);
  assert.equal(JSON.stringify([...body.entries()]).includes('blob:'),false);assert.equal(body.has('capture_receipt_token'),false);assert.equal(JSON.parse(body.get('evidence')).score,35);
});
