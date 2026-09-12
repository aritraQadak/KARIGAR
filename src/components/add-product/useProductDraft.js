import { useEffect, useRef, useState } from 'react';
import { emptyDraft, PreviewUrls, inspectMedia, validateMedia, appendPhotos, removePhoto, setPrimary, replaceMediaEntry } from '../../utils/productDraft.js';
import { analysisSnapshot, requestAnalysis } from '../../utils/craftVerification.js';
import { applyVoiceResult } from '../../utils/voiceApi.js';
import { detectMedia } from '../../utils/mediaAuthenticity.js';

export default function useProductDraft() {
  const [draft, setDraft] = useState(emptyDraft);
  const current = useRef(draft);
  const [urls] = useState(() => new PreviewUrls());
  const lifecycle = useRef({ generation: 0 });
  useEffect(() => { const registry = urls; const life = lifecycle.current;
    return () => { life.generation++; registry.dispose(); }; }, [urls]);
  function commit(update) { current.current = update(current.current); setDraft(current.current); }
  async function addMedia(files, kind, source = 'upload', captureReceipt = null) {
    const generation = lifecycle.current.generation;
    const entries = [];
    try {
      if (kind === 'photo' && current.current.media.productImages.length + files.length > 5) throw new Error('You can add up to five product photos.');
      for (const file of files) {
        if (generation !== lifecycle.current.generation) throw new Error('The product page was closed.');
        validateMedia(file, kind);
        const previewUrl = urls.create(file);
        const entry = { file, source, previewUrl, captureReceipt: source === 'live_capture' ? captureReceipt : null };
        entries.push(entry);
        Object.assign(entry, await inspectMedia(file, kind, previewUrl));
      }
      if (generation !== lifecycle.current.generation) throw new Error('The product page was closed.');
      const old = kind === 'photo' ? null : current.current.media[kind === 'showcase' ? 'productVideo' : 'processVideo'];
      commit(prev => ({ ...prev, media: kind === 'photo' ? appendPhotos(prev.media, entries) :
        { ...prev.media, [kind === 'showcase' ? 'productVideo' : 'processVideo']: entries[0] } }));
      if (old) urls.release(old.previewUrl);
    } catch (error) { entries.forEach(entry => urls.release(entry.previewUrl)); throw error; }
  }
  function remove(kind, index) {
    const key = kind === 'showcase' ? 'productVideo' : 'processVideo';
    const entry = kind === 'photo' ? current.current.media.productImages[index] : current.current.media[key];
    commit(prev => ({ ...prev, media: kind === 'photo' ? removePhoto(prev.media,index) : { ...prev.media,[key]:null } }));
    if (entry) urls.release(entry.previewUrl);
  }
  async function replaceMedia(old, file) {
    const media=current.current.media;
    const kind=media.productImages.some(p=>p.previewUrl===old.previewUrl)?'photo':media.productVideo?.previewUrl===old.previewUrl?'showcase':'process';
    validateMedia(file,kind);
    const previewUrl=urls.create(file),generation=lifecycle.current.generation;
    try {
      const metadata=await inspectMedia(file,kind,previewUrl);
      if(generation!==lifecycle.current.generation)throw new Error('The product page was closed.');
      const replacement={file,previewUrl,source:'upload',captureReceipt:null,...metadata};
      commit(prev=>({...prev,media:replaceMediaEntry(prev.media,old.previewUrl,replacement)}));
      urls.release(old.previewUrl);
    } catch(error) {urls.release(previewUrl);throw error;}
  }
  async function analyze() {
    if(current.current.verification?.status==='running')return;
    const inputs=analysisSnapshot(current.current),generation=lifecycle.current.generation;
    commit(prev=>({...prev,verification:{status:'running',inputs}}));
    try {
      const result=await requestAnalysis(inputs);
      if(generation===lifecycle.current.generation)commit(prev=>({...prev,verification:{status:'success',inputs,result,analyzedAt:new Date().toISOString()}}));
    } catch(error) {
      if(generation===lifecycle.current.generation)commit(prev=>({...prev,verification:{status:'error',inputs,error:error.message}}));
    }
  }
  async function detect(entry) {
    if(entry.authenticity?.status==='running')return;
    const generation=lifecycle.current.generation;
    function update(authenticity) {
      commit(prev=>({...prev,media:{...prev.media,
        productImages:prev.media.productImages.map(p=>p.file===entry.file?{...p,authenticity}:p),
        productVideo:prev.media.productVideo?.file===entry.file?{...prev.media.productVideo,authenticity}:prev.media.productVideo,
        processVideo:prev.media.processVideo?.file===entry.file?{...prev.media.processVideo,authenticity}:prev.media.processVideo}}));
    }
    update({status:'running'});
    const result=await detectMedia(entry.file);
    if(generation===lifecycle.current.generation)update(result);
  }
  return { draft, replaceMedia, detect, analyze, addMedia, remove, applyVoice: result => commit(prev => ({...applyVoiceResult(prev,result),verification:prev.verification})), primary: index => commit(prev => ({ ...prev, media:setPrimary(prev.media,index) })),
    details: (key,value) => commit(prev => ({ ...prev, details:{...prev.details,[key]:value} })) };
}
