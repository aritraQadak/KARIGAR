import { normalizeCraftCategory } from '../constants/craftCategories.js';
export const PHOTO_LIMIT = 5;
export const IMAGE_BYTES = 10 * 1024 * 1024;
export const VIDEO_BYTES = 100 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const VIDEO_ACCEPT = '.mp4,.webm,.mov,.avi';
export const STEPS = ['Media & Craft Evidence', 'Media Authenticity Check', 'Product Details', 'KARIGAR Verification', 'Review & Publish'];
export function emptyDraft() {
  return { media: { productImages: [], primaryImageIndex: 0, productVideo: null, processVideo: null },
    details: { title: '', description: '', category: '', materials: [], price: '', region: '',
      dimensions: '', craft_technique: '', stock: '', giTag: '' }, verification: null };
}
export function materialsArray(value) { return [...new Set(value.split(',').map(s => s.trim()).filter(Boolean))]; }
export function listingMetadata(details) {
  const { title, description, category, materials, price, region, dimensions, craft_technique } = details;
  return { title, description, category:normalizeCraftCategory(category), materials: [...materials], price: price === '' ? null : Number(price), region, dimensions, craft_technique };
}
export function verificationInputs(draft) {
  return { product_image: draft.media.productImages[draft.media.primaryImageIndex]?.file || null,
    product_video: draft.media.productVideo?.file || null, process_video: draft.media.processVideo?.file || null,
    capture_receipt_token: draft.media.processVideo?.source === 'live_capture' ? draft.media.processVideo.captureReceipt?.capture_receipt_token || null : null,
    listing_metadata: listingMetadata(draft.details) };
}
export function validateMedia(file, kind) {
  if (!file?.size) throw new Error('This file is empty. Choose another file.');
  if (file.size > (kind === 'photo' ? IMAGE_BYTES : VIDEO_BYTES)) throw new Error(kind === 'photo' ? 'Photos must be 10 MiB or smaller.' : 'Videos must be 100 MiB or smaller.');
  if (kind === 'photo') {
    if (!IMAGE_ACCEPT.split(',').includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP photo.');
  } else {
    const suffix = file.name.split('.').pop().toLowerCase();
    const types = { mp4: ['video/mp4'], webm: ['video/webm'], mov: ['video/quicktime'], avi: ['video/avi','video/x-msvideo','video/msvideo'] };
    const mime = file.type.split(';')[0].toLowerCase();
    if (!types[suffix] || (mime && mime !== 'application/octet-stream' && !types[suffix].includes(mime))) throw new Error('Choose an MP4, WebM, MOV or AVI video with a matching file type.');
  }
}
export function appendPhotos(media, photos) {
  if (media.productImages.length + photos.length > PHOTO_LIMIT) throw new Error('You can add up to five product photos.');
  return { ...media, productImages: [...media.productImages, ...photos] };
}
export function removePhoto(media, index) {
  return { ...media, productImages: media.productImages.filter((_, i) => i !== index),
    primaryImageIndex: index < media.primaryImageIndex ? media.primaryImageIndex - 1 : index === media.primaryImageIndex ? 0 : media.primaryImageIndex };
}
export function setPrimary(media, index) {
  if (index < 0 || index >= media.productImages.length) return media;
  return { ...media, primaryImageIndex: index };
}
export function replaceMediaEntry(media, previewUrl, replacement) {
  let found=false;
  const swap=entry=>{if(entry?.previewUrl!==previewUrl)return entry;found=true;return replacement;};
  const next={...media,productImages:media.productImages.map(swap),productVideo:swap(media.productVideo),processVideo:swap(media.processVideo)};
  if(!found)throw new Error('This file was already removed.');
  return next;
}
export class PreviewUrls {
  constructor(urlApi = URL) { this.api = urlApi; this.urls = new Set(); }
  create(file) { const url = this.api.createObjectURL(file); this.urls.add(url); return url; }
  release(url) { if (this.urls.delete(url)) this.api.revokeObjectURL(url); }
  dispose() { for (const url of [...this.urls]) this.release(url); }
}
export function inspectMedia(file, kind, url) {
  return new Promise((resolve, reject) => {
    const element = document.createElement(kind === 'photo' ? 'img' : 'video');
    let done = false;
    const finish = (error, metadata = {}) => {
      if (done) return; done = true; clearTimeout(timer);
      element.onload = element.onloadedmetadata = element.onerror = null;
      if (kind !== 'photo') { element.removeAttribute('src'); element.load(); }
      if (error) reject(error); else resolve(metadata);
    };
    const timer = setTimeout(() => finish(new Error('This media could not be previewed. Try another file.')), 15000);
    element.onerror = () => finish(new Error('This media cannot be previewed by your browser. Try another file.'));
    if (kind === 'photo') element.onload = () => {
      const width = element.naturalWidth, height = element.naturalHeight;
      finish(!width || width * height > 50_000_000 ? new Error('Photos must be valid images no larger than 50 megapixels.') : null, { width, height });
    };
    else { element.preload = 'metadata'; element.onloadedmetadata = () => {
      const duration = Number.isFinite(element.duration) && element.duration > 0 ? element.duration : null;
      const limit = kind === 'showcase' ? 30 : 60;
      finish(duration && duration > limit ? new Error(`This video must be ${limit} seconds or shorter.`) : null, { duration });
    }; }
    element.src = url;
  });
}
