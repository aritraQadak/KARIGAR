import test from 'node:test';
import assert from 'node:assert/strict';
import { historyCounts } from './trustCenter.js';
import { emptyDraft,listingMetadata } from './productDraft.js';
import { applyVoiceResult,DETAIL_KEYS } from './voiceApi.js';
test('history counts derive from records, requiring process file and recorded provenance',()=>{
  assert.deepEqual(historyCounts([]),{published:0,analyzed:0,process:0,live:0});
  const rows=[{evidence:{score:35}},{media:{processVideo:'/uploads/a',processSource:'upload'},evidence:{score:60,live_capture:false}},{media:{processVideo:'/uploads/b',processSource:'live_capture'},evidence:{score:70,live_capture:true}},{evidence:{live_capture:true}}];
  assert.deepEqual(historyCounts(rows),{published:4,analyzed:3,process:2,live:1});
});
test('retired artisan story is absent from draft and metadata; legacy voice output is ignored',()=>{
  const d=emptyDraft();assert.equal('artisan_story' in d.details,false);assert.equal('artisan_story' in listingMetadata({...d.details,artisan_story:'legacy'}),false);
  const details={...Object.fromEntries(DETAIL_KEYS.map(key=>[key,null])),materials:[],artisan_story:'legacy'};
  const next=applyVoiceResult(d,{details,transcript:'A pot',source_language:'en',missing_fields:['artisan_story','price']});
  assert.equal('artisan_story' in next.details,false);assert.deepEqual(next.voice.missing_fields,['price']);
});
