import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {verifyMediaEligibility} from './mediaEligibility.js';
test('publishing hashes actual bytes and ignores forged labels and hashes',async()=>{
  const buffer=Buffer.from('actual upload');
  const files=[{buffer,kind:'photo',sha256:'forged',label:'Likely camera-captured'}];
  const fetcher=async(url,options)=>{
    assert.ok(url.endsWith('/verify/media-eligibility'));
    assert.deepEqual(JSON.parse(options.body),{files:[{sha256:createHash('sha256').update(buffer).digest('hex'),kind:'photo'}]});
    return {ok:true,json:async()=>({eligible:false})};
  };
  assert.equal(await verifyMediaEligibility(files,fetcher),false);
  assert.equal(await verifyMediaEligibility(files,async()=>({ok:true,json:async()=>({eligible:'true'})})),false);
  await assert.rejects(verifyMediaEligibility(files,async()=>({ok:false})));
});
