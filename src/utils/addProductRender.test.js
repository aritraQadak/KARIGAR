import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { CRAFT_CATEGORIES } from '../constants/craftCategories.js';
import { emptyDraft } from './productDraft.js';
import { analysisSnapshot, CATEGORIES } from './craftVerification.js';

test('Add Product renders empty, accessible media controls and four honest steps', async () => {
  const server=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
  try {
    const {default:AddProduct}=await server.ssrLoadModule('/src/pages/seller/AddProduct.jsx');
    const html=renderToStaticMarkup(React.createElement(AddProduct));
    for(const label of ['Media &amp; Craft Evidence','Product Details','KARIGAR Verification','Review &amp; Publish','Upload Photos','Take Photo','Product Showcase Video','Record Video','Show How You Make It','Upload Process Video','Record Live'])assert.ok(html.includes(label),label);
    assert.ok(html.includes('grid-cols-2 md:grid-cols-4'));
    assert.ok(html.includes('grid-cols-1 xl:grid-cols-2'));
    assert.ok(!html.includes('<img'));
    for(const sample of ['Bengal Terracotta Pot','Dhokra Brass Figurine','Mithila Nature Painting','92%','Likely Authentic'])assert.ok(!html.includes(sample));
    const {default:Details}=await server.ssrLoadModule('/src/components/add-product/ProductDetailsStep.jsx');
    const details=renderToStaticMarkup(React.createElement(Details,{details:emptyDraft().details,onChange:()=>{}}));
    for(const label of ['Materials','Craft technique','Stock quantity','GI tag'])assert.ok(details.includes(label));
    for(const label of ['Speak About Your Product','Fill Details Manually','Bengali','Hindi','English'])assert.ok(details.includes(label));
    assert.ok(!details.includes('voice-assisted entry will be added'));
    for (const category of CRAFT_CATEGORIES) assert.ok(details.includes(category.replaceAll('&','&amp;')), category);
    assert.ok(!details.includes('All crafts'));
    assert.ok(details.includes('<select'));
    const {default:Verification}=await server.ssrLoadModule('/src/components/add-product/VerificationStep.jsx');
    assert.ok(renderToStaticMarkup(React.createElement(Verification,{draft:emptyDraft()})).includes('Run Analysis'));
    const draft=emptyDraft();
    draft.verification={status:'success',inputs:analysisSnapshot(draft),result:{trust_score:{score:73.9268,max_score:100,level:'good_evidence',categories:Object.fromEntries(CATEGORIES.map(([key])=>[key,{score:6.994899,max_score:20,available:true}]))},signals:{},live_capture:false}};
    const analysis=renderToStaticMarkup(React.createElement(Verification,{draft}));
    assert.ok(analysis.includes('73.9'));assert.ok(analysis.includes('7.0'));assert.ok(!analysis.includes('Continue to Review'));
    const {default:Review}=await server.ssrLoadModule('/src/components/add-product/ReviewPublishStep.jsx');
    const review=renderToStaticMarkup(React.createElement(Review,{draft,inputs:{listing_metadata:draft.details}}));
    for(const label of ['Review &amp; Publish','73.9','7.0','Edit Media','Edit Product Details','Review Analysis','Not provided'])assert.ok(review.includes(label),label);
  } finally {await server.close();}
});
