import { requestCamera } from './cameraMedia.js';
export const MAX_RECORDING_SECONDS = 60;
export const MAX_RECORDING_BYTES = 100 * 1024 * 1024;
export const MIME_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
export function selectMimeType(Recorder) {
  return MIME_TYPES.find(type => Recorder.isTypeSupported(type));
}
export function cameraError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError')
    return 'Camera permission was denied. Allow access and try again, or use Upload Video.';
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError')
    return 'No camera was found. Connect a camera or use Upload Video.';
  if (error?.name === 'NotReadableError')
    return 'The camera is busy or unavailable. Close other camera apps or use Upload Video.';
  return error?.message || 'Recording failed. Please try again or use Upload Video.';
}

// Framework-independent lifecycle so races and track cleanup can be tested without hardware.
export class LiveCapture {
  constructor({ api, onChange, provenance = true, maxRecordingSeconds = MAX_RECORDING_SECONDS, mediaDevices = globalThis.navigator?.mediaDevices,
    Recorder = globalThis.MediaRecorder, now = () => performance.now(),
    // Keep native Window timer receivers; these callbacks are invoked on this controller.
    setTimer = (...args) => globalThis.setInterval(...args),
    clearTimer = id => globalThis.clearInterval(id) }) {
    Object.assign(this, { api, onChange, provenance, maxRecordingSeconds, mediaDevices, Recorder, now, setTimer, clearTimer });
    this.generation = 0;
    this.state = { status: 'idle', seconds: 0, stream: null, file: null, receipt: null, error: '' };
  }
  update(values) { this.state = { ...this.state, ...values }; this.onChange(this.state); }
  stopTracks() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    if (this.timer !== undefined) this.clearTimer(this.timer);
    this.timer = undefined;
  }
  discard() {
    this.generation++;
    if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    this.recorder = null;
    this.stopTracks();
    this.update({ status: 'idle', seconds: 0, stream: null, file: null, receipt: null, error: '' });
  }
  dispose() { this.onChange = () => {}; this.discard(); }
  async open(facingMode = 'environment') {
    this.discard();
    const generation = this.generation;
    this.update({ status: 'requesting_camera' });
    try {
      if (!this.mediaDevices?.getUserMedia || !this.Recorder)
        throw new Error('Live recording is unsupported here. Use a supported browser on HTTPS or localhost, or Upload Video.');
      this.mimeType = selectMimeType(this.Recorder);
      if (!this.mimeType) throw new Error('This browser cannot record a supported video format. Use Upload Video.');
      const stream = await requestCamera(this.mediaDevices, facingMode);
      if (generation !== this.generation) { stream.getTracks().forEach(track => track.stop()); return; }
      this.stream = stream;
      this.update({ stream });
      this.session = this.provenance ? await this.api.createSession() : null;
      if (generation !== this.generation) return;
      this.limit = Math.min(this.maxRecordingSeconds, this.session?.max_recording_seconds ?? MAX_RECORDING_SECONDS);
      this.update({ status: 'ready', limit: this.limit });
    } catch (error) {
      if (generation !== this.generation) return;
      this.stopTracks();
      this.update({ status: 'error', stream: null, error: cameraError(error) });
    }
  }
  start() {
    if (this.state.status !== 'ready') return;
    const generation = this.generation;
    try {
      if (this.provenance && Date.now() >= Date.parse(this.session.expires_at)) throw new Error('The capture session expired. Choose Record Live again.');
      const recorder = new this.Recorder(this.stream, { mimeType: this.mimeType });
      this.recorder = recorder;
      const chunks = [];
      let bytes = 0;
      recorder.ondataavailable = event => {
        if (generation !== this.generation) return;
        bytes += event.data.size;
        if (bytes > MAX_RECORDING_BYTES) { this.fail(new Error('Recording is too large. Record a shorter clip.')); return; }
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = event => { if (generation === this.generation) this.fail(event.error); };
      recorder.onstop = () => {
        if (generation !== this.generation) return;
        this.stopTracks();
        const type = recorder.mimeType || this.mimeType;
        const file = new File(chunks, `karigar-${this.provenance ? 'process' : 'product'}.${type.startsWith('video/mp4') ? 'mp4' : 'webm'}`, { type });
        if (import.meta.env?.DEV) console.info('[KARIGAR recording]', { selectedMimeType: this.mimeType, recorderMimeType: recorder.mimeType, blobType: file.type, blobSize: file.size, filename: file.name });
        if (!file.size) { this.fail(new Error('The recording was empty. Record again or use Upload Video.')); return; }
        this.update({ status: 'recorded', stream: null, file });
      };
      recorder.start(1000);
      this.started = this.now();
      this.update({ status: 'recording', seconds: 0 });
      this.timer = this.setTimer(() => {
        const seconds = (this.now() - this.started) / 1000;
        this.update({ seconds });
        // Leave a small finalization margin beneath the server's strict 60-second limit.
        if (seconds >= this.limit - 0.5) this.stop();
      }, 100);
    } catch (error) {
      console.error('[KARIGAR live capture] Failed to start recording:', error);
      this.fail(error);
    }
  }
  fail(error) {
    this.discard();
    this.update({ status: 'error', error: cameraError(error) });
  }
  stop() {
    if (this.recorder?.state === 'recording') {
      this.recorder.stop();
      this.stopTracks();
      this.update({ status: 'stopping', stream: null });
    }
  }
  async submit() {
    if (!this.provenance || this.state.status !== 'recorded') return null;
    const generation = this.generation;
    this.update({ status: 'submitting', error: '' });
    try {
      const receipt = await this.api.submit(this.session.capture_session_id, this.state.file);
      if (generation !== this.generation) return null;
      this.stopTracks();
      this.update({ status: 'submitted', stream: null, receipt });
      return receipt;
    } catch (error) {
      if (generation === this.generation)
        this.update({ status: 'recorded', error: `${cameraError(error)} If the session expired or was already used, re-record or use Upload Video.` });
      console.error('[KARIGAR capture submission] Failed:', error);
      return null;
    }
  }
}
