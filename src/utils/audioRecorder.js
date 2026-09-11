export const MAX_VOICE_SECONDS = 120;
export const MAX_VOICE_BYTES = 10 * 1024 * 1024;
export class AudioRecorder {
  constructor({onChange=()=>{}, mediaDevices=globalThis.navigator?.mediaDevices, Recorder=globalThis.MediaRecorder, maxSeconds=MAX_VOICE_SECONDS}={}) {
    Object.assign(this,{onChange,mediaDevices,Recorder,maxSeconds}); this.generation=0;
  }
  emit(state, extra={}) { this.onChange({state,...extra}); }
  tracks() { this.stream?.getTracks().forEach(track=>track.stop()); this.stream=null; }
  async open() {
    this.dispose(); const generation=this.generation; this.emit('requesting_microphone');
    try {
      if (!this.mediaDevices?.getUserMedia || !this.Recorder) throw new Error('This browser cannot record audio. You can fill details manually.');
      const stream=await this.mediaDevices.getUserMedia({audio:true});
      if(generation!==this.generation){stream.getTracks().forEach(track=>track.stop());return;}
      this.stream=stream; this.emit('ready');
    } catch(error) { if(generation===this.generation)this.fail(error); }
  }
  fail(error) {
    console.error('[KARIGAR voice recording]',error); this.dispose();
    const messages={NotAllowedError:'Microphone permission was denied. Allow access or fill details manually.',NotFoundError:'No microphone was found. You can fill details manually.',NotReadableError:'The microphone may be in use. Close other recording apps and try again.'};
    this.emit('error',{error:messages[error.name]||error.message||'Recording failed. Try again or fill details manually.'});
  }
  start() {
    try {
      const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(type=>this.Recorder.isTypeSupported(type));
      if(!mime)throw new Error('No supported audio recording format. Try another browser or fill details manually.');
      const recorder=new this.Recorder(this.stream,{mimeType:mime});
      this.recorder=recorder; this.chunks=[]; this.bytes=0;
      const generation=this.generation;
      recorder.ondataavailable=event=>{if(event.data.size){this.chunks.push(event.data);this.bytes+=event.data.size;if(this.bytes>MAX_VOICE_BYTES)this.fail(new Error('Recording is too large. Please record a shorter message.'));}};
      recorder.onerror=event=>this.fail(event.error||new Error('Audio recording failed.'));
      recorder.onstop=()=>{
        if(generation!==this.generation)return;
        clearInterval(this.timer);this.tracks();
        const duration=this.duration ?? (Date.now()-this.started)/1000;
        const type=recorder.mimeType||mime;
        const file=new File(this.chunks,['product-voice',type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm'].join('.'),{type});
        if(!file.size||duration<1){this.fail(new Error('Record at least one second of speech before stopping.'));return;}
        this.emit('recorded',{file,duration:Math.min(duration,this.maxSeconds)});
      };
      this.duration=null;this.started=Date.now();recorder.start(250);this.emit('recording',{seconds:0});
      this.timer=setInterval(()=>{const seconds=(Date.now()-this.started)/1000;if(seconds>=this.maxSeconds)this.stop();else this.emit('recording',{seconds:Math.floor(seconds)});},250);
    }catch(error){this.fail(error);}
  }
  stop() {
    if(this.recorder?.state==='recording'){
      this.duration=(Date.now()-this.started)/1000;
      this.recorder.stop();clearInterval(this.timer);this.tracks();
    }
  }
  dispose() {
    this.generation++;clearInterval(this.timer);
    if(this.recorder){this.recorder.onstop=null;this.recorder.ondataavailable=null;this.recorder.onerror=null;if(this.recorder.state!=='inactive')this.recorder.stop();}
    this.recorder=null;this.tracks();
  }
}
