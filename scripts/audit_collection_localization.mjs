import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

import {
  translateCollectionTitle,
  translateCollectionDescription,
  COLLECTION_TITLE_TRANSLATIONS,
  translateCraftType,
  translateState,
  translateDistrict,
  translatePersonName
} from '../src/constants/culturalTranslations.js';

import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  formatLocalizedDate
} from '../src/utils/formatters.js';

console.log('=== AUDITING COLLECTION TITLE TRANSLATIONS ===');
console.log('Total predefined collection titles:', Object.keys(COLLECTION_TITLE_TRANSLATIONS).length);

const testTitles = [
  "Banarasi Silk Saree",
  "Blue Pottery Vase",
  "Jamdani Masterpiece",
  "Patola Masterpiece",
  "Radha-Krishna Narrative Nakshi Kantha Tapestry",
  "Nilambari Fine Cotton Jamdani Saree",
  "Mythological Swarnachari Silk Saree",
  "Panchmura Long-Neck Terracotta Heritage Horse",
  "Royal Shahus Kani Weave Pashmina Shawl",
  "Jaipur Blue Pottery Royal Floral Urn",
  "Imperial Gold Zari Chanderi Silk Tissue Saree",
  "Imperial Gold Zari Chanderi Dupatta",
  "Ajrakhpur 16-Stage Natural Dye Block Print Stole",
  "Kanchipuram Heavy Crimson Korvai Silk Saree",
  "Bastar Bell Metal Lost-Wax Dhokra Tribal Procession",
  "Varanasi Royal Katan Silk Kadwa Jaal Brocade Saree",
  "Raghurajpur Palm Leaf Pattachitra Tale of Dashavatar",
  "Tribal Jewellery Masterpiece",
  "Kundan Jewellery Set",
  "Meenakari Jewellery Set",
  "Terracotta Horse",
  "Madhubani Painting",
  "Warli Folk Painting",
  "Pashmina Shawl"
];

let failedTitles = 0;
for (const title of testTitles) {
  const hi = translateCollectionTitle(title, 'hi');
  const bn = translateCollectionTitle(title, 'bn');

  // Check if contains untranslated English letters
  const hasEnglishInHi = /[a-zA-Z]/.test(hi);
  const hasEnglishInBn = /[a-zA-Z]/.test(bn);

  if (hasEnglishInHi || hasEnglishInBn) {
    console.error(`FAILED: "${title}" -> HI: "${hi}", BN: "${bn}"`);
    failedTitles++;
  } else {
    console.log(`PASS: "${title}"\n  HI: ${hi}\n  BN: ${bn}`);
  }
}

console.log(`\nFailed Titles: ${failedTitles} / ${testTitles.length}`);

console.log('\n=== AUDITING TEXT A & TEXT B IN I18N FILES ===');
const en = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/hi.json'), 'utf8'));
const bn = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/bn.json'), 'utf8'));

console.log('Text A:');
console.log('  EN:', en.home?.heroProvenanceText);
console.log('  HI:', hi.home?.heroProvenanceText);
console.log('  BN:', bn.home?.heroProvenanceText);

console.log('Text B:');
console.log('  EN:', en.home?.exploreCraftClusters);
console.log('  HI:', hi.home?.exploreCraftClusters);
console.log('  BN:', bn.home?.exploreCraftClusters);

console.log('\n=== CHECKING SAMPLES OF SYNTHESIZED ARTISAN DESCRIPTIONS ===');
const sampleItem = {
  craftType: "Jamdani",
  artisanName: "Aritra Adak",
  district: "Kolkata",
  state: "West Bengal"
};
const desc = "Authentic handcrafted Jamdani by master artisan Aritra Adak from Kolkata, West Bengal.";
console.log('Original Desc:', desc);
console.log('  HI:', translateCollectionDescription(desc, sampleItem, 'hi'));
console.log('  BN:', translateCollectionDescription(desc, sampleItem, 'bn'));

console.log('\n=== TESTING NUMBERS INSIDE COLLECTIONS ===');
console.log('Price 1250:');
console.log('  EN:', formatLocalizedPrice(1250, 'en'));
console.log('  HI:', formatLocalizedPrice(1250, 'hi'));
console.log('  BN:', formatLocalizedPrice(1250, 'bn'));
