import { safeFetch } from './api.js';

// Development endpoint. For deployment, use an HTTPS AI endpoint with restricted CORS.
export const AI_SERVICE_URL = 'http://127.0.0.1:8000';
async function aiFetch(url, options) {
  try { return await safeFetch(url, options); }
  catch (error) {
    const status = /Request failed with status (\d+)/.exec(error.message)?.[1];
    const messages = {
      400: 'The video could not be decoded. Try another browser or upload a supported video.',
      404: 'Capture session not found. Record again or use Upload Video.',
      409: 'This capture session was already submitted. Record again or use Upload Video.',
      410: 'The capture session or receipt expired. Record again or use Upload Video.',
      413: 'The video exceeds a duration, file-size or resolution safety limit. Try a shorter clip.',
      415: 'The recorded video format is unsupported. Try another browser or Upload Video.',
      422: 'The video or capture receipt is invalid or does not match. Record again or use Upload Video.',
      503: 'The AI service or a required model is unavailable. Try again shortly.',
    };
    throw new Error(messages[status] || error.message);
  }
}
export const captureApi = {
  createSession: () => aiFetch(`${AI_SERVICE_URL}/capture/session`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose: 'process_video' }),
  }),
  submit: (sessionId, video) => {
    if (import.meta.env?.DEV) console.info('[KARIGAR upload]', { filename: video.name, contentType: video.type, bytes: video.size });
    const body = new FormData();
    body.append('capture_session_id', sessionId);
    body.append('video', video);
    return aiFetch(`${AI_SERVICE_URL}/capture/process-video`, { method: 'POST', body });
  },
  analyze: (video, image, receipt) => {
    const body = new FormData();
    body.append('process_video', video);
    if (image) body.append('product_image', image);
    if (receipt) body.append('capture_receipt_token', receipt.capture_receipt_token);
    return aiFetch(`${AI_SERVICE_URL}/verify/craft`, { method: 'POST', body });
  },
};
