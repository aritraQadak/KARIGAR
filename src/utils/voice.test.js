import test from 'node:test';
import assert from 'node:assert/strict';
import { applyVoiceResult, generateVoiceDetails, validateVoiceResult, DETAIL_KEYS } from './voiceApi.js';
import { AudioRecorder } from './audioRecorder.js';
import { emptyDraft } from './productDraft.js';
const result=()=>({transcript:'I make clay pots',source_language:'en',details:{...Object.fromEntries(DETAIL_KEYS.map(key=>[key,null])),title:'Clay Pot',materials:['Clay']},missing_fields:['price','dimensions']});
test('voice populates shared details, preserving media, stock and missing manual values',()=>{
  const draft=emptyDraft();draft.details.price='500';draft.details.stock='3';
  const next=applyVoiceResult(draft,result());
  assert.equal(next.media,draft.media);assert.equal(next.details.price,'500');assert.equal(next.details.stock,'3');assert.deepEqual(next.details.materials,['Clay']);assert.equal(next.voice.transcript,'I make clay pots');assert.equal(draft.details.title,'');
});
test('malformed response cannot mutate an existing draft',()=>{
  const draft=emptyDraft(),before=structuredClone(draft),bad=result();bad.details.materials='Clay';
  assert.throws(()=>applyVoiceResult(draft,bad));assert.deepEqual(draft,before);
  bad.details.materials=[];bad.details.price=Infinity;assert.throws(()=>validateVoiceResult(bad));
});
test('audio API sends actual file and language; handles provider failure',async()=>{
  const file=new File(['audio'],'voice.webm',{type:'audio/webm'});
  const data=await generateVoiceDetails(file,'bn',15,undefined,async(url,options)=>{
    assert.ok(url.endsWith('/onboarding/product-from-voice'));assert.equal(options.body.get('selected_language'),'bn');assert.equal(options.body.get('audio').type,'audio/webm');assert.equal(options.body.get('duration_seconds'),'15');return {ok:true,json:async()=>result()};
  });assert.equal(data.transcript,result().transcript);
  await assert.rejects(generateVoiceDetails(file,'en',15,undefined,async()=>({ok:false})));
});
test('recorder preserves method owners, collects final chunk, stops all tracks and keeps actual MIME',async()=>{
  let stopped=0,last;
  const stream={getTracks(){assert.equal(this,stream);return [{stop(){stopped++;}},{stop(){stopped++;}}];}};
  const devices={async getUserMedia(options){assert.equal(this,devices);assert.deepEqual(options,{audio:true});return stream;}};
  class Recorder {
    static isTypeSupported(type){assert.equal(this,Recorder);return type.startsWith('audio/webm');}
    constructor(stream,options){this.mimeType=options.mimeType;this.state='inactive';}
    start(){assert.ok(this instanceof Recorder);this.state='recording';}
    stop(){assert.ok(this instanceof Recorder);this.state='inactive';this.ondataavailable?.({data:new Blob(['final'])});this.onstop?.();}
  }
  const audio=new AudioRecorder({mediaDevices:devices,Recorder,onChange:value=>{last=value;}});
  await audio.open();assert.equal(last.state,'ready');audio.start();assert.equal(stopped,0);assert.equal(last.state,'recording');audio.started-=2000;audio.stop();
  assert.equal(last.state,'recorded');assert.equal(await last.file.text(),'final');assert.equal(last.file.name,'product-voice.webm');assert.equal(stopped,2);audio.dispose();
});
test('late microphone permission after close immediately releases tracks',async()=>{
  let resolve,stopped=0;
  const audio=new AudioRecorder({mediaDevices:{getUserMedia:()=>new Promise(r=>{resolve=r;})},Recorder:class {}});
  const opening=audio.open();audio.dispose();resolve({getTracks:()=>[{stop:()=>stopped++}]});await opening;assert.equal(stopped,1);
});
