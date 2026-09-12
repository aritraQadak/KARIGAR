import test from 'node:test';
import assert from 'node:assert/strict';
import {mediaEligibility} from './mediaAuthenticity.js';
import {emptyDraft,replaceMediaEntry,validateMedia} from './productDraft.js';
import {publishIssues} from './productApi.js';
const accepted={status:'success',label:'Likely camera-captured'};
test('all attached media must pass; rejected and unresolved media block publication',()=>{
  const draft=emptyDraft(),m=draft.media;
  assert.ok(mediaEligibility(m));
  m.productImages=[{authenticity:accepted}];assert.equal(mediaEligibility(m),'');
  for(const result of [null,{status:'running'},{status:'error'},{status:'success',label:'Inconclusive'}, {...accepted,retryable:true}]){
    m.processVideo={authenticity:result};assert.match(mediaEligibility(m),/Complete media analysis/);
    assert.ok(publishIssues(draft).some(s=>s.includes('Complete media analysis')));
  }
  m.processVideo={authenticity:{status:'success',label:'Likely AI-generated'}};
  assert.match(mediaEligibility(m),/Remove or replace/);
  m.processVideo={authenticity:accepted};assert.equal(mediaEligibility(m),'');
});
test('targeted replacement invalidates only that media and leaves original on invalid input',()=>{
  const m=emptyDraft().media;
  const old={previewUrl:'old',authenticity:accepted},other={previewUrl:'other',authenticity:accepted};
  m.productImages=[other,old];m.primaryImageIndex=1;m.processVideo=other;
  assert.throws(()=>validateMedia({size:0},'photo'));
  assert.equal(m.productImages[1],old);
  const replacement={previewUrl:'new',file:{},source:'upload',captureReceipt:null};
  const next=replaceMediaEntry(m,'old',replacement);
  assert.equal(next.productImages[0],other);assert.equal(next.processVideo,other);
  assert.equal(next.primaryImageIndex,1);assert.equal(next.productImages[1].authenticity,undefined);
  assert.ok(mediaEligibility(next));assert.equal(m.productImages[1],old);
  assert.throws(()=>replaceMediaEntry(m,'missing',replacement));
});
