import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, materialsArray, listingMetadata, verificationInputs, validateMedia,
  appendPhotos, removePhoto, setPrimary, PreviewUrls, IMAGE_BYTES, VIDEO_BYTES, STEPS } from './productDraft.js';
import { capturePhoto, requestCamera, stopCamera } from './cameraMedia.js';

const photo = name => ({file:new File(['image'],name,{type:'image/png'}),previewUrl:`blob:${name}`,source:'upload'});
test('five-step draft starts empty with normalized fields, no demo selection',()=>{
  const draft=emptyDraft();assert.equal(STEPS.length,5);
  assert.deepEqual(draft.media.productImages,[]);assert.equal(draft.media.productVideo,null);assert.equal(draft.media.processVideo,null);
  assert.equal(draft.verification,null);assert.equal(verificationInputs(draft).product_image,null);
  assert.deepEqual(draft.details,{title:'',description:'',category:'',materials:[],price:'',region:'',dimensions:'',craft_technique:'',stock:'',giTag:''});
  draft.details.materials.push('Clay');assert.deepEqual(emptyDraft().details.materials,[]);
});
test('multiple photos, primary selection and removal preserve the correct file',()=>{
  let media=appendPhotos(emptyDraft().media,[photo('a.png'),photo('b.png'),photo('c.png')]);
  media=setPrimary(media,2); const chosen=media.productImages[2].file;
  media=removePhoto(media,0);assert.equal(media.primaryImageIndex,1);
  const draft={...emptyDraft(),media};assert.equal(verificationInputs(draft).product_image,chosen);
  media=removePhoto(media,1);assert.equal(media.primaryImageIndex,0);
  assert.throws(()=>appendPhotos(media,Array.from({length:5},()=>photo('extra.png'))),/five/);
});
test('materials normalize to an array and metadata excludes marketplace-only fields',()=>{
  assert.deepEqual(materialsArray(' Clay, Natural pigment, , Clay '),['Clay','Natural pigment']);
  const details={...emptyDraft().details,price:'1200.50',materials:['Clay'],stock:'2',giTag:'seller claim'};
  const metadata=listingMetadata(details);assert.equal(metadata.price,1200.5);assert.ok(Array.isArray(metadata.materials));
  assert.equal('stock' in metadata,false);assert.equal('giTag' in metadata,false);
});
test('showcase and process media map separately; uploads cannot retain stale live receipt',()=>{
  const draft=emptyDraft();const showcase=new File(['showcase'],'product.webm',{type:'video/webm'});
  const process=new File(['process'],'process.webm',{type:'video/webm'});
  draft.media.productVideo={file:showcase,source:'camera'};
  draft.media.processVideo={file:process,source:'live_capture',captureReceipt:{capture_receipt_token:'trusted-token'}};
  const inputs=verificationInputs(draft);assert.equal(inputs.product_video,showcase);assert.equal(inputs.process_video,process);assert.equal(inputs.capture_receipt_token,'trusted-token');
  draft.media.processVideo={file:process,source:'upload',captureReceipt:{capture_receipt_token:'stale'}};
  assert.equal(verificationInputs(draft).capture_receipt_token,null);
});
test('media state survives detail edits and navigation has no media mutation',()=>{
  const draft=emptyDraft();draft.media=appendPhotos(draft.media,[photo('camera.jpg')]);
  const next={...draft,details:{...draft.details,title:'My craft'}};
  assert.equal(next.media,draft.media);assert.equal(next.media.productImages[0].file,draft.media.productImages[0].file);
});
test('supported types and backend file-size limits are enforced',()=>{
  validateMedia({name:'a.png',type:'image/png',size:IMAGE_BYTES},'photo');
  validateMedia({name:'a.webm',type:'video/webm;codecs=vp9',size:VIDEO_BYTES},'process');
  validateMedia({name:'a.mp4',type:'',size:10},'showcase');
  for(const [file,kind] of [[{size:0},'photo'],[{size:IMAGE_BYTES+1},'photo'],[{size:VIDEO_BYTES+1},'process'],[{size:10,type:'text/plain',name:'bad.txt'},'photo'],[{size:10,type:'video/webm',name:'wrong.mp4'},'process']])assert.throws(()=>validateMedia(file,kind));
});
test('object URLs are revoked once on removal and once for remaining media on dispose',()=>{
  const removed=[];let next=0;const api={createObjectURL(){assert.equal(this,api);return `blob:${++next}`;},revokeObjectURL(url){assert.equal(this,api);removed.push(url);}};
  const registry=new PreviewUrls(api);const first=registry.create({}),second=registry.create({});
  registry.release(first);registry.release(first);assert.deepEqual(removed,[first]);registry.dispose();registry.dispose();assert.deepEqual(removed,[first,second]);
});
test('photo capture preserves camera dimensions and does not capture until requested',async()=>{
  let drawArgs,encoded;const canvas={getContext:()=>({drawImage:(...args)=>{drawArgs=args;}}),toBlob:(callback,type,quality)=>{encoded={type,quality};callback(new Blob(['jpeg'],{type}));}};
  const video={videoWidth:1920,videoHeight:1080};const file=await capturePhoto(video,()=>canvas);
  assert.equal(canvas.width,1920);assert.equal(canvas.height,1080);assert.deepEqual(drawArgs,[video,0,0,1920,1080]);
  assert.equal(file.type,'image/jpeg');assert.equal(encoded.quality,.95);
  await assert.rejects(capturePhoto({videoWidth:0,videoHeight:0}),/ready/);
});
test('shared camera helper preserves receivers and stops all tracks',async()=>{
  let stopped=0;const stream={getTracks(){assert.equal(this,stream);return [{stop(){stopped++;}},{stop(){stopped++;}}];}};
  const devices={async getUserMedia(options){assert.equal(this,devices);assert.equal(options.audio,false);assert.equal(options.video.facingMode.ideal,'environment');assert.equal(options.video.width.ideal,1920);return stream;}};
  assert.equal(await requestCamera(devices,'environment',true),stream);assert.equal(stopped,0);stopCamera(stream);assert.equal(stopped,2);
});
