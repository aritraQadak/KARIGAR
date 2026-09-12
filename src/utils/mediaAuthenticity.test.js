import test from 'node:test';
import assert from 'node:assert/strict';
import { detectMedia, mediaEligibility } from './mediaAuthenticity.js';

const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

test('detection handles empty proxy errors, malformed responses and outages safely', async (t) => {
  for (const [name, response, expected] of [
    ['empty 502', new Response('', { status: 502 }), /could not be reached/],
    ['HTML 503', new Response('<html>Unavailable</html>', { status: 503 }), /could not be reached/],
    ['empty success', new Response(''), /invalid response/],
    ['invalid success', Response.json({ status: 'success' }), /invalid response/],
    ['null JSON', Response.json(null), /invalid response/],
    ['validation failure', Response.json({ detail: 'File is empty or exceeds the upload limit.' }, { status: 413 }), /upload limit/],
  ]) {
    await t.test(name, async (t) => {
      t.mock.method(globalThis, 'fetch', async () => response);
      const result = await detectMedia(file);
      assert.equal(result.status, 'error');
      assert.equal(result.review_required, true);
      assert.match(result.message, expected);
      assert.ok(mediaEligibility({ productImages: [{ authenticity: result }] }));
    });
  }
  for (const [name, error, expected] of [
    ['network failure', new TypeError('Failed to fetch'), /could not be reached/],
    ['timeout', new DOMException('Aborted', 'TimeoutError'), /timed out/],
  ]) {
    await t.test(name, async (t) => {
      t.mock.method(globalThis, 'fetch', async () => { throw error; });
      assert.match((await detectMedia(file)).message, expected);
    });
  }
});

test('detection preserves valid results and actionable provider failures', async (t) => {
  for (const result of [
    { status: 'success', label: 'Likely camera-captured', ai_score: 0.01, review_required: false },
    { status: 'success', label: 'Likely AI-generated', ai_score: 0.99, review_required: true },
    { status: 'error', message: 'Sightengine credentials are missing.', review_required: true },
    { status: 'unavailable', message: 'Detection unavailable: Sightengine credentials are not configured.', review_required: true },
    { status: 'unsupported', message: 'This file type is unsupported.', review_required: true },
  ]) {
    await t.test(result.label || result.status, async (t) => {
      t.mock.method(globalThis, 'fetch', async () => Response.json(result));
      assert.deepEqual(await detectMedia(file), result);
    });
  }
});
