import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Import translations
const en = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/hi.json'), 'utf8'));
const bn = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/bn.json'), 'utf8'));

// Import cultural translations
import {
  STATE_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  CRAFT_TRANSLATIONS,
  DISTRICT_TRANSLATIONS,
  NAME_TRANSLATIONS,
  translateState,
  translateCategory,
  translateCraftType,
  translateDistrict,
  translatePersonName
} from '../src/constants/culturalTranslations.js';

import {
  toLocaleDigits,
  formatLocalizedNumber,
  formatLocalizedPrice,
  formatLocalizedDate
} from '../src/utils/formatters.js';

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(flattenKeys(obj[k], fullKey));
    } else {
      keys.push({ key: fullKey, value: obj[k] });
    }
  }
  return keys;
}

const enFlat = flattenKeys(en);
const hiFlat = flattenKeys(hi);
const bnFlat = flattenKeys(bn);

const enKeyMap = new Map(enFlat.map(item => [item.key, item.value]));
const hiKeyMap = new Map(hiFlat.map(item => [item.key, item.value]));
const bnKeyMap = new Map(bnFlat.map(item => [item.key, item.value]));

console.log('=== I18N KEY AUDIT ===');
console.log(`Total English Keys: ${enKeyMap.size}`);
console.log(`Total Hindi Keys:   ${hiKeyMap.size}`);
console.log(`Total Bengali Keys: ${bnKeyMap.size}`);

const missingHi = [];
const emptyHi = [];
for (const [k, v] of enKeyMap.entries()) {
  if (!hiKeyMap.has(k)) {
    missingHi.push(k);
  } else if (!hiKeyMap.get(k) || typeof hiKeyMap.get(k) !== 'string' || hiKeyMap.get(k).trim() === '') {
    emptyHi.push(k);
  }
}

const missingBn = [];
const emptyBn = [];
for (const [k, v] of enKeyMap.entries()) {
  if (!bnKeyMap.has(k)) {
    missingBn.push(k);
  } else if (!bnKeyMap.get(k) || typeof bnKeyMap.get(k) !== 'string' || bnKeyMap.get(k).trim() === '') {
    emptyBn.push(k);
  }
}

console.log(`Missing Hindi keys: ${missingHi.length}`);
console.log(`Empty Hindi keys:   ${emptyHi.length}`);
console.log(`Missing Bengali keys: ${missingBn.length}`);
console.log(`Empty Bengali keys:   ${emptyBn.length}`);

console.log('\n=== CULTURAL ENTITIES AUDIT ===');
const stateCount = Object.keys(STATE_TRANSLATIONS).length;
console.log(`Total States / UTs translated: ${stateCount}`);
for (const [state, trans] of Object.entries(STATE_TRANSLATIONS)) {
  if (!trans.en || !trans.hi || !trans.bn) {
    console.error(`State ${state} missing a language:`, trans);
  }
}

const categoryCount = Object.keys(CATEGORY_TRANSLATIONS).length;
console.log(`Total Categories translated: ${categoryCount}`);
for (const [cat, trans] of Object.entries(CATEGORY_TRANSLATIONS)) {
  if (!trans.en || !trans.hi || !trans.bn) {
    console.error(`Category ${cat} missing a language:`, trans);
  }
}

const craftCount = Object.keys(CRAFT_TRANSLATIONS).length;
console.log(`Total Craft Types translated: ${craftCount}`);
for (const [craft, trans] of Object.entries(CRAFT_TRANSLATIONS)) {
  if (!trans.en || !trans.hi || !trans.bn) {
    console.error(`Craft ${craft} missing a language:`, trans);
  }
}

const districtCount = Object.keys(DISTRICT_TRANSLATIONS).length;
console.log(`Total Districts / Hubs translated: ${districtCount}`);
for (const [dist, trans] of Object.entries(DISTRICT_TRANSLATIONS)) {
  if (!trans.en || !trans.hi || !trans.bn) {
    console.error(`District ${dist} missing a language:`, trans);
  }
}

const nameCount = Object.keys(NAME_TRANSLATIONS).length;
console.log(`Total Explicit Person Names translated: ${nameCount}`);

console.log('\n=== NUMERIC & CURRENCY & DATE AUDIT ===');
const testNum = 1234567890;
console.log(`Number [${testNum}]:`);
console.log(`  EN: ${formatLocalizedNumber(testNum, 'en')}`);
console.log(`  HI: ${formatLocalizedNumber(testNum, 'hi')}`);
console.log(`  BN: ${formatLocalizedNumber(testNum, 'bn')}`);

const testPrice = 24500;
console.log(`Price [${testPrice}]:`);
console.log(`  EN: ${formatLocalizedPrice(testPrice, 'en')}`);
console.log(`  HI: ${formatLocalizedPrice(testPrice, 'hi')}`);
console.log(`  BN: ${formatLocalizedPrice(testPrice, 'bn')}`);

const testDate = new Date('2026-09-12T11:00:00Z');
console.log(`Date [${testDate.toISOString()}]:`);
console.log(`  EN: ${formatLocalizedDate(testDate, 'en')}`);
console.log(`  HI: ${formatLocalizedDate(testDate, 'hi')}`);
console.log(`  BN: ${formatLocalizedDate(testDate, 'bn')}`);

console.log('\n=== DYNAMIC VALUE SAMPLING ===');
console.log(`State "West Bengal":`);
console.log(`  EN: ${translateState('West Bengal', 'en')}`);
console.log(`  HI: ${translateState('West Bengal', 'hi')}`);
console.log(`  BN: ${translateState('West Bengal', 'bn')}`);

console.log(`District "Kolkata":`);
console.log(`  EN: ${translateDistrict('Kolkata', 'en')}`);
console.log(`  HI: ${translateDistrict('Kolkata', 'hi')}`);
console.log(`  BN: ${translateDistrict('Kolkata', 'bn')}`);

console.log(`Category "Handloom & Textiles":`);
console.log(`  EN: ${translateCategory('Handloom & Textiles', 'en')}`);
console.log(`  HI: ${translateCategory('Handloom & Textiles', 'hi')}`);
console.log(`  BN: ${translateCategory('Handloom & Textiles', 'bn')}`);

console.log(`Craft "Jamdani":`);
console.log(`  EN: ${translateCraftType('Jamdani', 'en')}`);
console.log(`  HI: ${translateCraftType('Jamdani', 'hi')}`);
console.log(`  BN: ${translateCraftType('Jamdani', 'bn')}`);

console.log(`Person "Aritra Adak":`);
console.log(`  EN: ${translatePersonName('Aritra Adak', 'en')}`);
console.log(`  HI: ${translatePersonName('Aritra Adak', 'hi')}`);
console.log(`  BN: ${translatePersonName('Aritra Adak', 'bn')}`);
