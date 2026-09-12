import { translateState, translateCategory, translateCraftType, translateDistrict, translatePersonName } from '../src/constants/culturalTranslations.js';
import fs from 'fs';

const text = fs.readFileSync('./src/constants/culturalTranslations.js', 'utf8');
const idx = text.indexOf('Kolkata');
console.log('Kolkata index:', idx);
if (idx !== -1) {
  console.log('Kolkata snippet:\n', text.substring(idx - 5, idx + 120));
}

const idx2 = text.indexOf('Aritra Adak');
console.log('Aritra Adak index:', idx2);
if (idx2 !== -1) {
  console.log('Aritra Adak snippet:\n', text.substring(idx2 - 5, idx2 + 120));
}

console.log('translateDistrict Kolkata:', translateDistrict('Kolkata', 'hi'), translateDistrict('Kolkata', 'bn'));
console.log('translatePersonName Aritra Adak:', translatePersonName('Aritra Adak', 'hi'), translatePersonName('Aritra Adak', 'bn'));
