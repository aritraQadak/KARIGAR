import React from 'react';
import { Camera, UploadCloud, ImagePlus } from 'lucide-react';
import { IMAGE_ACCEPT } from '../../utils/productDraft.js';
import MediaPreview from './MediaPreview.jsx';
export default function ProductPhotoUpload({ media, onFiles, onCamera, onRemove, onPrimary, busy }) {
  return <section className="rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-4 min-w-0">
    <div className="flex gap-3"><ImagePlus className="text-seller-accent-ink shrink-0"/><div><h3 className="font-bold text-gray-900">Product Photos</h3><p className="text-sm text-gray-500">Required for the listing. Add up to five photos and choose your primary image.</p></div></div>
    <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!busy)onFiles(Array.from(e.dataTransfer.files));}} className="rounded-xl border-2 border-dashed border-seller-accent bg-seller-accent-soft/40 p-5 text-center space-y-3">
      <p className="text-sm text-gray-600">Drag and drop your product photos here</p>
      <div className="flex flex-wrap justify-center gap-3">
        <label className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl border border-gray-300 bg-seller-card font-semibold text-sm cursor-pointer focus-within:ring-2 focus-within:ring-orange-500"><UploadCloud size={18}/>Upload Photos
          <input className="sr-only" type="file" multiple accept={IMAGE_ACCEPT} aria-label="Upload product photos" disabled={busy} onChange={e=>{onFiles(Array.from(e.target.files));e.target.value='';}} /></label>
        <button type="button" className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl bg-seller-accent text-white font-semibold text-sm disabled:opacity-50" disabled={busy} onClick={onCamera}><Camera size={18}/>Take Photo</button>
      </div><p className="text-xs text-gray-500">JPEG, PNG or WebP ? 10 MiB per photo ? up to 50 megapixels</p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {media.productImages.map((item,index)=><div key={item.previewUrl} className="border rounded-xl p-2 min-w-0 space-y-2">
        <MediaPreview media={item} photo label={`Product photo ${index+1}`} />
        <button type="button" aria-pressed={media.primaryImageIndex===index} disabled={busy} onClick={()=>onPrimary(index)} className="min-h-11 w-full text-xs font-semibold rounded-lg bg-seller-accent-soft text-seller-accent-ink">{media.primaryImageIndex===index?'Primary image':'Set as primary'}</button>
        <button type="button" disabled={busy} onClick={()=>onRemove(index)} className="min-h-11 w-full text-xs text-gray-600 underline">Remove photo {index+1}</button>
      </div>)}
    </div>
  </section>;
}
