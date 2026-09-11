import test from 'node:test';
import assert from 'node:assert/strict';
import { LiveCapture, selectMimeType } from './liveCapture.js';
import { captureApi } from './verificationApi.js';

function fixture(options = {}) {
  const track = { stopped: false, stop() { this.stopped = true; } };
  const stream = { getTracks: () => [track] };
  class Recorder {
    static isTypeSupported(type) { return type === 'video/webm;codecs=vp8'; }
    constructor(_stream, { mimeType }) { this.mimeType = mimeType; this.state = 'inactive'; }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(['recording']) }); this.onstop?.(); });
    }
  }
  let callback, time = 0;
  const submissions = [];
  const api = {
    createSession: async () => ({ capture_session_id: 'server-session', max_recording_seconds: 60, expires_at: new Date(Date.now() + 300000).toISOString() }),
    submit: async (...args) => { submissions.push(args); return { capture_receipt_token: 'server-receipt' }; },
  };
  const capture = new LiveCapture({ api, Recorder, mediaDevices: { getUserMedia: async () => stream },
    now: () => time, setTimer: fn => { callback = fn; return 1; }, clearTimer: () => {}, onChange: () => {}, ...options });
  return { capture, track, Recorder, submissions, tick: seconds => { time = seconds * 1000; callback(); } };
}
const flush = () => new Promise(resolve => queueMicrotask(resolve));
test('unsupported browser leaves ordinary upload possible', async () => {
  const { capture } = fixture({ mediaDevices: null });
  await capture.open(); assert.equal(capture.state.status, 'error');
  assert.match(capture.state.error, /Upload Video/); capture.discard(); assert.equal(capture.state.status, 'idle');
});
test('permission denied and missing camera give useful fallback', async () => {
  for (const name of ['NotAllowedError', 'NotFoundError', 'NotReadableError']) {
    const { capture } = fixture({ mediaDevices: { getUserMedia: async () => { throw { name }; } } });
    await capture.open(); assert.match(capture.state.error, /Upload Video/); assert.equal(capture.state.stream, null);
  }
});
test('format selection uses browser support', () => {
  assert.equal(selectMimeType(fixture().Recorder), 'video/webm;codecs=vp8');
  assert.equal(selectMimeType({ isTypeSupported: type => type === 'video/mp4' }), 'video/mp4');
});
test('record start, final data, preview file, session submission and discard', async () => {
  const { capture, track, submissions } = fixture();
  await capture.open(); assert.equal(capture.state.status, 'ready');
  capture.start(); assert.equal(capture.state.status, 'recording'); assert.equal(submissions.length, 0);
  capture.stop(); await flush(); assert.equal(capture.state.status, 'recorded');
  assert.equal(await capture.state.file.text(), 'recording'); assert.equal(track.stopped, true);
  assert.equal(capture.state.file.name, 'karigar-process.webm');
  await capture.submit(); assert.equal(submissions[0][0], 'server-session');
  assert.equal(submissions[0][1], capture.state.file); assert.equal(capture.state.status, 'submitted');
  capture.discard(); assert.equal(capture.state.file, null); assert.equal(capture.state.receipt, null);
  await capture.open(); assert.equal(capture.state.status, 'ready'); capture.dispose();
});
test('auto stop honors limit without upload', async () => {
  const { capture, tick, submissions } = fixture(); await capture.open(); capture.start(); tick(59.5); await flush();
  assert.equal(capture.state.status, 'recorded'); assert.equal(submissions.length, 0);
});
test('cancel while permission pending stops late stream', async () => {
  let resolve;
  const track = { stopped: false, stop() { this.stopped = true; } };
  const { capture } = fixture({ mediaDevices: { getUserMedia: () => new Promise(r => { resolve = r; }) } });
  const opening = capture.open(); capture.discard(); resolve({ getTracks: () => [track] }); await opening;
  assert.equal(track.stopped, true); assert.equal(capture.state.status, 'idle');
});
test('session failure stops camera and recording failure cleans up', async () => {
  const { capture, track } = fixture({ api: { createSession: async () => { throw new Error('Service unavailable'); } } });
  await capture.open(); assert.equal(track.stopped, true); assert.equal(capture.state.status, 'error');
  const other = fixture(); await other.capture.open(); other.capture.start();
  other.capture.recorder.onerror({ error: new Error('Encoder failed') }); await flush();
  assert.equal(other.capture.state.status, 'error'); assert.equal(other.track.stopped, true);
});
test('unmount during recording releases camera and ignores final data', async () => {
  const { capture, track } = fixture(); await capture.open(); capture.start(); capture.dispose(); await flush();
  assert.equal(track.stopped, true); assert.equal(capture.state.file, null);
});
test('failed submission preserves recording for fallback', async () => {
  const { capture } = fixture(); await capture.open(); capture.start(); capture.stop(); await flush();
  capture.api.submit = async () => { throw new Error('Session expired'); };
  await capture.submit(); assert.equal(capture.state.status, 'recorded'); assert.ok(capture.state.file);
});
test('API uses session ID, receipt token and multipart without forged flags', async () => {
  const original = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response('{}', { headers: { 'Content-Type': 'application/json' } }); };
  try {
    await captureApi.createSession();
    const video = new File(['video'], 'capture.webm', { type: 'video/webm' });
    await captureApi.submit('issued-id', video);
    await captureApi.analyze(video, null, { capture_receipt_token: 'issued-token' });
    await captureApi.analyze(video, null, null);
    assert.equal(JSON.parse(requests[0].options.body).purpose, 'process_video');
    assert.equal(requests[1].options.body.get('capture_session_id'), 'issued-id');
    assert.equal(requests[2].options.body.get('capture_receipt_token'), 'issued-token');
    assert.equal(requests[3].options.body.has('capture_receipt_token'), false);
    assert.equal(requests[2].options.body.has('live_capture'), false);
  } finally { globalThis.fetch = original; }
});

// Native Window timers reject a controller instance as their receiver. Exercise
// constructor defaults, rather than the injected arrow timers in the fixture.
test('default timers retain their browser receiver through start, stop and re-record', async () => {
  const originalSet = globalThis.setInterval;
  const originalClear = globalThis.clearInterval;
  let scheduled, cleared = 0;
  globalThis.setInterval = function (callback, delay) {
    if (this !== globalThis) throw new TypeError('Illegal invocation');
    assert.equal(delay, 100);
    scheduled = callback;
    return 123;
  };
  globalThis.clearInterval = function (id) {
    if (this !== globalThis) throw new TypeError('Illegal invocation');
    assert.equal(id, 123);
    cleared++;
  };
  const { capture, track } = fixture({ setTimer: undefined, clearTimer: undefined });
  try {
    await capture.open();
    capture.start();
    assert.equal(capture.state.status, 'recording');
    assert.equal(capture.recorder.state, 'recording');
    assert.equal(track.stopped, false);
    assert.equal(typeof scheduled, 'function');
    capture.recorder.ondataavailable({ data: new Blob(['first chunk;']) });
    capture.stop();
    await flush();
    assert.equal(capture.state.status, 'recorded');
    assert.equal(await capture.state.file.text(), 'first chunk;recording');
    assert.equal(capture.state.file.type, 'video/webm;codecs=vp8');
    assert.ok(capture.state.file instanceof Blob);
    assert.equal(track.stopped, true);
    assert.equal(cleared, 1);
    capture.discard();
    track.stopped = false;
    await capture.open();
    capture.start();
    assert.equal(capture.recorder.state, 'recording');
    assert.equal(track.stopped, false);
    capture.dispose();
    await flush();
    assert.equal(track.stopped, true);
    assert.equal(cleared, 2);
  } finally {
    capture.dispose();
    globalThis.setInterval = originalSet;
    globalThis.clearInterval = originalClear;
  }
});

test('start failures log the original exception without putting its stack in UI state', async () => {
  const originalError = console.error;
  const calls = [];
  const failure = new Error('Recorder could not start');
  const { capture, Recorder, track } = fixture();
  const originalStart = Recorder.prototype.start;
  console.error = (...args) => calls.push(args);
  Recorder.prototype.start = function () { throw failure; };
  try {
    await capture.open();
    capture.start();
    assert.equal(capture.state.status, 'error');
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1], failure);
    assert.equal(capture.state.error, failure.message);
    assert.ok(!capture.state.error.includes(failure.stack));
    assert.equal(track.stopped, true);
  } finally {
    capture.dispose();
    console.error = originalError;
    Recorder.prototype.start = originalStart;
  }
});

test('MP4 recording uses matching extension and MIME', async () => {
  const { capture, Recorder } = fixture();
  Recorder.isTypeSupported = type => type === 'video/mp4';
  await capture.open(); capture.start(); capture.stop(); await flush();
  assert.equal(capture.state.file.name, 'karigar-process.mp4');
  assert.equal(capture.state.file.type, 'video/mp4');
  capture.dispose();
});
test('empty final recording is rejected before submission', async () => {
  const { capture, Recorder, track, submissions } = fixture();
  Recorder.prototype.stop = function () {
    this.state = 'inactive';
    queueMicrotask(() => { this.ondataavailable?.({data: new Blob([])}); this.onstop?.(); });
  };
  await capture.open(); capture.start(); capture.stop(); await flush();
  assert.equal(capture.state.status, 'error');
  assert.match(capture.state.error, /empty/);
  assert.equal(capture.state.file, null);
  assert.equal(track.stopped, true);
  assert.equal(submissions.length, 0);
});

test('ordinary showcase recording reuses recorder without creating capture provenance', async () => {
  let sessionCalls=0, submitCalls=0;
  const { capture, track, tick }=fixture({ provenance:false, maxRecordingSeconds:30,
    api:{createSession:async()=>{sessionCalls++;throw new Error('Must not create session');},submit:async()=>{submitCalls++;}} });
  await capture.open(); assert.equal(capture.state.status,'ready');
  assert.equal(capture.session,null); assert.equal(capture.limit,30);
  capture.start(); assert.equal(track.stopped,false);
  tick(29.5); await flush();
  assert.equal(capture.state.file.name,'karigar-product.webm');
  assert.equal(capture.state.status,'recorded');
  assert.equal(await capture.submit(),null);
  assert.equal(sessionCalls,0);assert.equal(submitCalls,0);assert.equal(capture.state.receipt,null);
  capture.dispose();assert.equal(track.stopped,true);
});
