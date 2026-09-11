// Shared camera access; callers own the returned tracks and their cleanup.
export function requestCamera(mediaDevices = globalThis.navigator?.mediaDevices, facingMode = 'environment', highResolution = false) {
  if (!mediaDevices?.getUserMedia) throw new Error('Camera capture needs a supported browser on HTTPS or localhost. You can still upload a file.');
  return mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode }, ...(highResolution ? { width: { ideal: 1920 }, height: { ideal: 1080 } } : {}) }, audio: false });
}
export function stopCamera(stream) { stream?.getTracks().forEach(track => track.stop()); }
export async function capturePhoto(video, createCanvas = () => document.createElement('canvas')) {
  const width = video.videoWidth, height = video.videoHeight;
  if (!width || !height) throw new Error('The camera is still getting ready. Please try again.');
  if (width * height > 50_000_000) throw new Error('This camera image exceeds the supported resolution. Please upload a smaller photo.');
  const canvas = createCanvas(); canvas.width = width; canvas.height = height;
  canvas.getContext('2d').drawImage(video, 0, 0, width, height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .95));
  if (!blob?.size) throw new Error('The photo could not be captured. Try again or upload a photo.');
  return new File([blob], 'karigar-product.jpg', { type: 'image/jpeg' });
}
