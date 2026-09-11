import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSellerProfile } from '../../data/sellerData';
import { historyCounts } from '../../utils/trustCenter';
import { listProducts } from '../../utils/productApi';
import { formatEvidenceScore, evidenceLevels } from '../../utils/evidenceFormat';

export default function Verification() {
  const {user,token}=useAuth();
  const [loaded,setLoaded]=useState({token:null,products:[],error:''});
  useEffect(()=>{
    if(!token)return;
    let active=true;
    listProducts(token).then(data=>{if(active)setLoaded({token,products:data.products,error:''});})
      .catch(()=>{if(active)setLoaded({token,products:[],error:'Product history could not be loaded. Refresh to try again.'});});
    return()=>{active=false;};
  },[token]);
  const ready=!!token&&loaded.token===token,products=ready?loaded.products:[],counts=historyCounts(products);
  const cards=[['Identity / KYC','Not connected','Government identity checks are not connected.'],
    ['Pehchan Card','Not connected','No verified Pehchan record is available.'],
    ['GI Authorization',user?.giTagNumber?'Details supplied':'Not added','A supplied registration number is not proof of authorization.'],
    ['Cooperative Credential',user?.clusterName?'Organization supplied':'Not added','Membership verification is not connected.']];
  const processLabel=p=>!p.media?.processVideo?'No process evidence':p.media.processSource==='live_capture'&&p.evidence?.live_capture?'Captured through KARIGAR':'Uploaded process video';
  const panel='rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-4';
  return <div className="space-y-6 text-gray-900">
    <header className={panel}><p className="text-sm font-semibold text-seller-accent-ink">Your credentials and listing history</p><h1 className="text-2xl font-bold">Artisan Verification &amp; Trust Center</h1><p className="text-sm text-gray-600">Manage your artisan trust profile. Product evidence analysis belongs in Add Product.</p></header>
    <section className={panel}><h2 className="text-lg font-bold">Artisan Verification Status</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{cards.map(([title,status,help])=><article key={title} className="rounded-xl border p-4"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm font-medium text-gray-700">{status}</p><p className="mt-2 text-sm text-gray-500">{help}</p></article>)}</div><p className="text-xs text-gray-500">Supplied profile information comes from your account. No external credential verification is implied.</p></section>
    <section className={panel}><h2 className="text-lg font-bold">Seller Trust Profile</h2><p className="text-2xl font-bold">{initialSellerProfile.trustScore} / 5 <span className="text-sm font-normal text-gray-500">Demo profile rating</span></p><p className="text-sm text-gray-600">This is the existing sample seller rating shown by the prototype. A live seller-rating service is not connected. This is separate from each product?s 100-point evidence score.</p></section>
    <section className={panel}><h2 className="text-lg font-bold">Verification Badges</h2><p className="text-sm">{user?.isVerified?'Account marked verified by KARIGAR':'Account verification pending'}</p><p className="text-sm text-gray-500">Account status is recorded by KARIGAR; it does not establish KYC, Pehchan, GI authorization or cooperative membership. External credential badges are not available yet.</p></section>
    <section className={panel}><h2 className="text-lg font-bold">Product Verification History</h2>{!ready?<p role="status">Loading your published products...</p>:loaded.error?<p role="alert">{loaded.error}</p>:<><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[[counts.published,'Products published'],[counts.analyzed,'Evidence snapshots'],[counts.process,'With making evidence'],[counts.live,'With live capture status']].map(([count,label])=><div key={label} className="rounded-xl bg-emerald-50 p-4"><p className="text-2xl font-bold">{count}</p><p className="text-sm">{label}</p></div>)}</div><p className="text-xs text-gray-500">History comes from your saved product records. Evidence snapshots were submitted when publishing; they are not independent government or identity verification.</p>{products.length===0?<p>No published product history yet.</p>:<ul className="divide-y">{products.slice(0,10).map(p=><li key={p.id} className="py-3 space-y-1"><h3 className="font-semibold">{p.title}</h3><p className="text-sm">Evidence: {formatEvidenceScore(p.evidence?.score)} / 100 ? {evidenceLevels[p.evidence?.level]||'Level unavailable'}</p><p className="text-sm text-gray-600">{processLabel(p)}</p><p className="text-xs text-gray-500">Analysis date: {p.evidence?.analyzed_at&&!Number.isNaN(Date.parse(p.evidence.analyzed_at))?new Date(p.evidence.analyzed_at).toLocaleDateString():'Not recorded'}</p></li>)}</ul>}</>}</section>
    <section className={panel}><h2 className="text-lg font-bold">Process Evidence History</h2>{ready&&!loaded.error?<ul className="space-y-2 text-sm">{products.slice(0,10).map(p=><li key={p.id}><span className="font-semibold">{p.title}</span> ? {processLabel(p)}</li>)}{!products.length&&<li>No published process history yet.</li>}</ul>:<p className="text-sm">{loaded.error||'Loading history...'}</p>}</section>
    <section className={panel}><h2 className="text-lg font-bold">Document Status &amp; Renewal</h2><p className="text-sm text-gray-600">Document review, expiry dates and renewal reminders are not yet connected. No renewal dates or current-document claims are shown.</p></section>
  </div>;
}
