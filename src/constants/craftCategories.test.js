import test from 'node:test';
import assert from 'node:assert/strict';
import { CRAFT_CATEGORIES, LEGACY_CRAFT_CATEGORIES, normalizeCraftCategory, isCraftCategory } from './craftCategories.js';
import { validateListing } from '../../server/productHandler.js';
test('shared categories accept canonical and legacy inputs without losing unknown historical labels',()=>{
  assert.equal(CRAFT_CATEGORIES.length,13);
  assert.equal(new Set(CRAFT_CATEGORIES).size,13);
  for(const label of CRAFT_CATEGORIES) assert.equal(normalizeCraftCategory(label.toLowerCase()),label);
  for(const [old,label] of Object.entries(LEGACY_CRAFT_CATEGORIES)) assert.equal(normalizeCraftCategory(old),label);
  assert.equal(normalizeCraftCategory(' Pottery '),'Pottery & Clay');
  assert.equal(normalizeCraftCategory('Special/Other'),'Special/Other');
  assert.equal(isCraftCategory('All crafts'),false);
});
test('new listing API stores canonical category and rejects unsupported categories',()=>{
  const listing={title:'Clay pot',category:'pottery',price:450,stock:1,materials:[],description:'',region:'',dimensions:'',craft_technique:'',giTag:''};
  assert.equal(validateListing(listing).category,'Pottery & Clay');
  for(const category of CRAFT_CATEGORIES) assert.equal(validateListing({...listing,category}).category,category);
  for(const category of ['All crafts','unknown','']) assert.throws(()=>validateListing({...listing,category}));
});
