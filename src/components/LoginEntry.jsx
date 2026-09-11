import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import desktopIntro from '../../intro pc.mp4?url';
import mobileIntro from '../../intro mobile.mp4?url';

function introSeen() { try{return sessionStorage.getItem('karigar_intro_seen')==='true';}catch{return false;} }
export default function LoginEntry() {
  const {isAuthenticated,loading}=useAuth();
  const [finished,setFinished]=useState(introSeen);
  const [fading,setFading]=useState(false);
  const [source]=useState(()=>window.matchMedia('(max-width: 639px)').matches?mobileIntro:desktopIntro);
  const video=useRef(null);
  const show=!loading&&!isAuthenticated&&!finished;
  useEffect(()=>{
    if(!show)return;
    try{sessionStorage.setItem('karigar_intro_seen','true');}catch{/* Storage restrictions must not block login. */}
    const timer=setTimeout(()=>setFading(true),10000);
    video.current?.play()?.catch(()=>setFading(true));
    return()=>clearTimeout(timer);
  },[show]);
  useEffect(()=>{if(!fading)return;const timer=setTimeout(()=>setFinished(true),500);return()=>clearTimeout(timer);},[fading]);
  return <><div inert={show} aria-hidden={show||undefined}><Login/></div>{show&&<div role="dialog" aria-label="Welcome to KARIGAR" aria-modal="true" className={`app-fullscreen-intro fixed inset-0 w-screen h-screen overflow-hidden z-[100] bg-black transition-opacity duration-500 ${fading?'opacity-0 pointer-events-none':'opacity-100'}`}>
    <video ref={video} src={source} autoPlay muted playsInline preload="auto" onEnded={()=>setFading(true)} onError={()=>setFading(true)} className="h-full w-full object-cover object-center"/>
  </div>}</>;
}
