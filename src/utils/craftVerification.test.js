import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft } from './productDraft.js';
import { CATEGORIES,analysisSnapshot,craftBody,currentAnalysis,validateAnalysis,requestAnalysis,suggestions } from './craftVerification.js';
function response(){return {trust_score:{score:35,max_score:100,level:'basic_evidence',categories:Object.fromEntries(CATEGORIES.map(([key],i)=>[key,{score:i===0?35:0,max_score:[35,15,20,15,10,5][i],available:i===0}]))},technical_signals:{},synthetic_media_risk:{secret:'excluded'}};}
function draft(){const d=emptyDraft();d.media.productImages=[{file:new File(['a'],'a.png')},{file:new File(['b'],'b.png')}];d.media.primaryImageIndex=1;return d;}
test('multipart uses primary only, separate videos, JSON metadata and existing receipt',()=>{
  const d=draft();d.details.materials=['Clay'];d.details.price='450';
  d.media.productVideo={file:new File(['v'],'show.webm')};d.media.processVideo={file:new File(['p'],'process.webm'),source:'live_capture',captureReceipt:{capture_receipt_token:'existing-token'}};
  const body=craftBody(analysisSnapshot(d));assert.equal(body.get('product_image').name,'b.png');assert.equal(body.get('product_video').name,'show.webm');assert.equal(body.get('process_video').name,'process.webm');assert.equal(body.get('capture_receipt_token'),'existing-token');assert.equal(body.has('video'),false);assert.equal(body.has('capture_session_id'),false);assert.deepEqual(JSON.parse(body.get('listing_metadata')).materials,['Clay']);assert.equal(JSON.parse(body.get('listing_metadata')).price,450);
  d.media.processVideo.source='upload';assert.equal(craftBody(analysisSnapshot(d)).has('capture_receipt_token'),false);
});
test('valid analysis survives navigation and marketplace edits, becomes stale for actual inputs',()=>{
  const d=draft();d.verification={status:'success',inputs:analysisSnapshot(d),result:validateAnalysis(response())};assert.ok(currentAnalysis(d));
  d.details.stock='2';assert.ok(currentAnalysis(d));d.details.title='New title';assert.equal(currentAnalysis(d),false);d.details.title='';assert.ok(currentAnalysis(d));
  d.media.primaryImageIndex=0;assert.equal(currentAnalysis(d),false);assert.ok(d.verification.result);
});
test('backend scores preserved without recalculation; absent signals and synthetic output excluded',()=>{
  const raw=response(),result=validateAnalysis(raw);assert.equal(result.trust_score,raw.trust_score);assert.equal(result.live_capture,false);assert.equal(result.signals.hands,null);assert.equal('synthetic_media_risk' in result,false);assert.ok(suggestions(result,analysisSnapshot(draft())).length);
  delete raw.trust_score.categories.artisan_visibility;assert.throws(()=>validateAnalysis(raw));
});
test('request uses existing endpoint; failure exposes no backend paths or traces',async()=>{
  const d=draft(),before=d.details;
  const result=await requestAnalysis(analysisSnapshot(d),async(url,options)=>{assert.ok(url.endsWith('/verify/craft'));assert.equal(options.method,'POST');assert.equal(options.headers,undefined);return {ok:true,json:async()=>response()};});assert.equal(result.trust_score.score,35);
  await assert.rejects(requestAnalysis(analysisSnapshot(d),async()=>({ok:false,status:503,json:async()=>({detail:'private path'})})),/temporarily unavailable/);assert.equal(d.details,before);
});
