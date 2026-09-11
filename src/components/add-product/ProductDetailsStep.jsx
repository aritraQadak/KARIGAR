import { CRAFT_CATEGORIES,normalizeCraftCategory } from '../../constants/craftCategories.js';
import React, { useState } from 'react';
import { materialsArray } from '../../utils/productDraft.js';
import ProductVoiceInput from './ProductVoiceInput.jsx';
const fields=[['title','Product title'],['price','Price (INR)','number'],['region','Region'],['dimensions','Dimensions'],['craft_technique','Craft technique'],['stock','Stock quantity','number'],['giTag','GI tag / certification (optional)']];
export default function ProductDetailsStep({details,onChange,voice,onGenerated,onBusy}) {
  const [materials,setMaterials]=useState(()=>details.materials.join(', '));
  const input='mt-1 w-full min-w-0 rounded-xl border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500';
  return <section className="rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-5">
    <div><h2 className="text-xl font-bold">Product Details</h2><p className="text-sm text-gray-500 mt-1">Create a draft with your voice or enter details manually. Every field remains editable.</p></div>
    <ProductVoiceInput voice={voice} onBusy={onBusy} onGenerated={result=>{onGenerated(result);if(result.details.materials.length)setMaterials(result.details.materials.join(', '));}}/>
    {voice?.missing_fields?.length>0&&<p className="text-sm text-seller-accent-ink">Complete any missing details: {voice.missing_fields.filter(key=>!details[key]||(Array.isArray(details[key])&&!details[key].length)).map(key=>key.replaceAll('_',' ')).join(', ') || 'All previously missing fields are filled.'}</p>}
    <div id="product-details-form" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="text-sm font-semibold text-gray-700">Category<select className={input} value={normalizeCraftCategory(details.category)} onChange={e=>onChange('category',e.target.value)}><option value="">Choose a category</option>{CRAFT_CATEGORIES.map(category=><option key={category} value={category}>{category}</option>)}</select></label>
      {fields.map(([key,label,type='text'])=><label key={key} className="text-sm font-semibold text-gray-700">{label}<input className={input} type={type} min={type==='number'?0:undefined} step={key==='price'?'0.01':key==='stock'?'1':undefined} value={details[key]} onChange={e=>onChange(key,e.target.value)}/></label>)}
      <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Materials<input className={input} value={materials} placeholder="Terracotta clay, natural pigment" onChange={e=>{setMaterials(e.target.value);onChange('materials',materialsArray(e.target.value));}}/><span className="text-xs font-normal text-gray-500">Separate materials with commas.</span></label>
      {[['description','Product description']].map(([key,label])=><label key={key} className="text-sm font-semibold text-gray-700 sm:col-span-2">{label}<textarea rows={4} className={input} value={details[key]} onChange={e=>onChange(key,e.target.value)}/></label>)}
    </div><p className="text-xs text-gray-500">Certification details are seller-provided information. Entering a GI tag does not award verification or Trust Score points.</p>
  </section>;
}
