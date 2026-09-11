import React, { useRef, useState, useEffect } from 'react';
import ProductPhotoUpload from './ProductPhotoUpload.jsx';
import ProductVideoUpload from './ProductVideoUpload.jsx';
import ProcessVideoCapture from './ProcessVideoCapture.jsx';
import CameraCapture from './CameraCapture.jsx';

export default function ProductMediaStep({ model, busy, onBusy }) {
  const [camera,setCamera]=useState(null), [error,setError]=useState('');
  const mounted=useRef(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  async function add(files,kind,source='upload',receipt=null) {
    if(!files.length)return;
    onBusy(true);setError('');
    try { await model.addMedia(files,kind,source,receipt); }
    catch(err){if(mounted.current)setError(err.message);throw err;}
    finally{if(mounted.current)onBusy(Boolean(camera));}
  }
  function upload(files,kind){add(files,kind).catch(()=>{});}
  function open(kind){setError('');setCamera(kind);onBusy(true);}
  function close(){setCamera(null);onBusy(false);}
  return <div className="space-y-5">
    <div><h2 className="text-xl font-bold text-gray-900">Media & Craft Evidence</h2><p className="mt-1 text-sm text-gray-500">Start with your product photos. Add optional videos to help tell the story of your craft.</p></div>
    {error&&<p role="alert" className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>}
    <ProductPhotoUpload media={model.draft.media} busy={busy} onFiles={files=>upload(files,'photo')} onCamera={()=>open('photo')} onRemove={i=>model.remove('photo',i)} onPrimary={model.primary}/>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <ProductVideoUpload media={model.draft.media.productVideo} busy={busy} onFile={file=>upload([file],'showcase')} onCamera={()=>open('showcase')} onRemove={()=>model.remove('showcase')}/>
      <ProcessVideoCapture media={model.draft.media.processVideo} busy={busy} onFile={file=>upload([file],'process')} onCamera={()=>open('process')} onRemove={()=>model.remove('process')}/>
    </div>
    {camera&&<CameraCapture key={camera} kind={camera} onClose={close} onAccept={(file,source,receipt)=>add([file],camera,source,receipt)}/>}
    <p className="text-xs text-gray-500">Camera permission is requested only when you choose a capture action. Photos and videos stay in this page's draft; accepting Record Live submits that recording for capture provenance. No AI product verification runs in this step.</p>
  </div>;
}
