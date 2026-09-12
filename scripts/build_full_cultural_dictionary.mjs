import fs from 'fs';
import { DEMO_ARTISANS } from '../prisma/artisanData.js';
import { CRAFT_CATEGORIES } from '../src/constants/craftCategories.js';

const inv = JSON.parse(fs.readFileSync('./scripts/data_inventory.json', 'utf8'));

// Dictionaries for word parts commonly found in Indian names, crafts, and districts
const WORD_DICT = {
  // Common Place / District Words
  "East": { hi: "पूर्वी", bn: "পূর্ব" },
  "West": { hi: "पश्चिमी", bn: "পশ্চিম" },
  "North": { hi: "उत्तरी", bn: "উত্তর" },
  "South": { hi: "दक्षिणी", bn: "দক্ষিণ" },
  "Central": { hi: "मध्य", bn: "মধ্য" },
  "Hills": { hi: "हिल्स", bn: "পাহাড়" },
  "Valley": { hi: "घाटी", bn: "উপত্যকা" },
  "Islands": { hi: "द्वीपसमूह", bn: "দ্বীপপুঞ্জ" },
  "Island": { hi: "द्वीप", bn: "দ্বীপ" },
  "Pradesh": { hi: "प्रदेश", bn: "প্রদেশ" },
  "Territory": { hi: "केंद्रशासित प्रदेश", bn: "কেন্দ্রশাসিত অঞ্চল" },
  "Industrial": { hi: "औद्योगिक", bn: "শিল্প" },
  "Area": { hi: "क्षेत्र", bn: "এলাকা" },

  // Common Craft Words
  "Handloom": { hi: "हथकरघा", bn: "হস্ততাঁত" },
  "Weaving": { hi: "बुनाई", bn: "বয়ন" },
  "Textile": { hi: "वस्त्र", bn: "বস্ত্র" },
  "Textiles": { hi: "वस्त्र", bn: "বস্ত্র" },
  "Silk": { hi: "रेशम", bn: "রেশম" },
  "Cotton": { hi: "सूती", bn: "সুতি" },
  "Wool": { hi: "ऊन", bn: "পশম" },
  "Woollen": { hi: "ऊनी", bn: "পশমি" },
  "Shawl": { hi: "शॉल", bn: "শাল" },
  "Shawls": { hi: "शॉल", bn: "শাল" },
  "Saree": { hi: "साड़ी", bn: "শাড়ি" },
  "Embroidery": { hi: "कढ़ाई", bn: "নকশিকাজ" },
  "Needlework": { hi: "सुईशिल्प", bn: "সূচিশিল্প" },
  "Pottery": { hi: "मृत्तिका शिल्प", bn: "মৃৎশিল্প" },
  "Clay": { hi: "मिट्टी", bn: "মাটি" },
  "Terracotta": { hi: "टेराकोटा", bn: "পোড়ামাটি" },
  "Metal": { hi: "धातु", bn: "ধাতু" },
  "Metalwork": { hi: "धातुशिल्प", bn: "ধাতুশিল্প" },
  "Brass": { hi: "पीतल", bn: "পিতল" },
  "Brassware": { hi: "पीतल के बर्तन", bn: "পিতলের বাসন" },
  "Bronze": { hi: "कांस्य", bn: "ব্রোঞ্জ" },
  "Copper": { hi: "तांबा", bn: "তামা" },
  "Silver": { hi: "चांदी", bn: "রুপো" },
  "Gold": { hi: "स्वर्ण", bn: "স্বর্ণ" },
  "Filigree": { hi: "तारकशी", bn: "তারকাশি" },
  "Painting": { hi: "चित्रकला", bn: "চিত্রকলা" },
  "Art": { hi: "कला", bn: "শিল্প" },
  "Jewellery": { hi: "आभूषण", bn: "গয়না" },
  "Jewelry": { hi: "आभूषण", bn: "গয়না" },
  "Wood": { hi: "काष्ठ", bn: "কাঠ" },
  "Wooden": { hi: "काष्ठ", bn: "কাঠের" },
  "Carving": { hi: "नक्काशी", bn: "খোদাই" },
  "Bamboo": { hi: "बांस", bn: "বাঁশ" },
  "Cane": { hi: "बेंत", bn: "বেত" },
  "Basketry": { hi: "टोकरी निर्माण", bn: "ডালা বয়ন" },
  "Natural": { hi: "प्राकृतिक", bn: "প্রাকৃতিক" },
  "Fibre": { hi: "रेषा", bn: "তন্তু" },
  "Fiber": { hi: "रेषा", bn: "তন্তু" },
  "Grass": { hi: "घास", bn: "ঘাস" },
  "Stone": { hi: "पाषाण", bn: "পাথর" },
  "Sculpture": { hi: "मूर्तिकला", bn: "ভাস্কর্য" },
  "Toys": { hi: "खिलौने", bn: "খেলনা" },
  "Toy": { hi: "खिलौना", bn: "খেলনা" },
  "Dolls": { hi: "गुड़ियाँ", bn: "পুতুল" },
  "Doll": { hi: "गुड़िया", bn: "পুতুল" },
  "Leather": { hi: "चर्म", bn: "চামড়া" },
  "Craft": { hi: "शिल्प", bn: "শিল্প" },
  "Paper": { hi: "कागज़", bn: "কাগজ" },
  "Print": { hi: "प्रिंट", bn: "ছাপ" },
  "Printing": { hi: "छपाई", bn: "ছাপা" },
  "Block": { hi: "ब्लॉक", bn: "ব্লক" },
  "Carpet": { hi: "कालीन", bn: "গালিচা" },
  "Carpets": { hi: "कालीन", bn: "গালিচা" },
  "Durrie": { hi: "दरी", bn: "দরি" },
  "Durries": { hi: "दरियाँ", bn: "দরি" },
  "Home": { hi: "गृह", bn: "গৃহ" },
  "Living": { hi: "सज्जा", bn: "সজ্জা" },
  "Décor": { hi: "सज्जा", bn: "সজ্জা" },
  "Decor": { hi: "सज्जा", bn: "সজ্জা" },
  "Furniture": { hi: "फर्नीचर", bn: "আসবাবপত্র" },
  "Traditional": { hi: "पारंपरिक", bn: "ঐতিহ্যবাহী" },
  "Heritage": { hi: "धरोहर", bn: "ঐতিহ্য" },
  "Tribal": { hi: "जनजातीय", bn: "জনজাতীয়" },
  "Bell Metal": { hi: "घंटा धातु", bn: "কাঁসা" }
};

// Transliteration helper for general Indian names & placenames
const TRANSLIT_PAIRS = [
  // Multi-char consonants
  ['shh', 'ष्', 'ষ'], ['chh', 'छ', 'ছ'], ['kh', 'ख', 'খ'], ['gh', 'घ', 'ঘ'],
  ['ch', 'च', 'চ'], ['jh', 'झ', 'ঝ'], ['th', 'थ', 'থ'], ['dh', 'ध', 'ধ'],
  ['ph', 'फ', 'ফ'], ['bh', 'भ', 'ভ'], ['sh', 'श', 'শ'], ['zh', 'झ़', 'ঝ'],
  // Single consonants
  ['k', 'क', 'ক'], ['g', 'ग', 'গ'], ['c', 'क', 'ক'], ['j', 'ज', 'জ'],
  ['t', 'त', 'ত'], ['d', 'द', 'দ'], ['n', 'न', 'ন'], ['p', 'प', 'প'],
  ['f', 'फ़', 'ফ'], ['b', 'ब', 'ব'], ['m', 'म', 'ম'], ['y', 'य', 'য'],
  ['r', 'र', 'র'], ['l', 'ल', 'ল'], ['v', 'व', 'ভ'], ['w', 'व', 'ও'],
  ['s', 'स', 'স'], ['h', 'ह', 'হ'], ['z', 'ज़', 'জ'], ['q', 'क', 'ক'],
  ['x', 'क्स', 'ক্স']
];

function transliterateToken(token, target = 'hi') {
  const t = token.toLowerCase();
  const idx = target === 'hi' ? 1 : 2;
  
  // Direct dictionary hit
  if (WORD_DICT[token]) return WORD_DICT[token][target];
  
  // Specific common suffixes
  let s = t;
  const replacements = target === 'hi' ? [
    [/pur$/, 'पुर'], [/nagar$/, 'नगर'], [/garh$/, 'गढ़'], [/abad$/, 'आबाद'],
    [/kalan$/, 'कलां'], [/khurd$/, 'खुर्द'], [/ganj$/, 'गंज'], [/wadi$/, 'वाड़ी'],
    [/devi$/, 'देवी'], [/prasad$/, 'प्रसाद'], [/kumar$/, 'कुमार'], [/singh$/, 'सिंह'],
    [/sharma$/, 'शर्मा'], [/verma$/, 'वर्मा'], [/mishra$/, 'मिश्रा'], [/gupta$/, 'गुप्ता'],
    [/yadav$/, 'यादव'], [/das$/, 'दास'], [/paul$/, 'पॉल'], [/roy$/, 'रॉय'],
    [/khatri$/, 'खत्री'], [/ansari$/, 'अंसारी'], [/devi$/, 'देवी'], [/bai$/, 'बाई']
  ] : [
    [/pur$/, 'পুর'], [/nagar$/, 'নগর'], [/garh$/, 'গড়'], [/abad$/, 'আবাদ'],
    [/kalan$/, 'কালান'], [/khurd$/, 'খুর্দ'], [/ganj$/, 'গঞ্জ'], [/wadi$/, 'ওয়াড়ি'],
    [/devi$/, 'দেবী'], [/prasad$/, 'প্রসাদ'], [/kumar$/, 'কুমার'], [/singh$/, 'সিংহ'],
    [/sharma$/, 'শর্মা'], [/verma$/, 'বর্মা'], [/mishra$/, 'মিশ্র'], [/gupta$/, 'গুপ্ত'],
    [/yadav$/, 'যাদব'], [/das$/, 'দাস'], [/paul$/, 'পাল'], [/roy$/, 'রায়'],
    [/khatri$/, 'খত্রী'], [/ansari$/, 'আনসারি'], [/devi$/, 'দেবী'], [/bai$/, 'বাই']
  ];

  for (const [re, rep] of replacements) {
    if (re.test(s)) {
      const stem = s.replace(re, '');
      return transliterateWord(stem, target) + rep;
    }
  }

  return transliterateWord(s, target);
}

function transliterateWord(word, target = 'hi') {
  if (!word) return '';
  const idx = target === 'hi' ? 1 : 2;
  
  // Vowel map
  const initialVowels = target === 'hi' ? {
    'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'i': 'इ', 'oo': 'ऊ', 'u': 'उ',
    'ai': 'ऐ', 'e': 'ए', 'au': 'औ', 'o': 'ओ'
  } : {
    'aa': 'আ', 'a': 'অ', 'ee': 'ঈ', 'i': 'ই', 'oo': 'ঊ', 'u': 'উ',
    'ai': 'ঐ', 'e': 'এ', 'au': 'ঔ', 'o': 'ও'
  };

  const matras = target === 'hi' ? {
    'aa': 'ा', 'a': '', 'ee': 'ी', 'i': 'ि', 'oo': 'ू', 'u': 'ु',
    'ai': 'ै', 'e': 'े', 'au': 'ौ', 'o': 'ो'
  } : {
    'aa': 'া', 'a': '', 'ee': 'ী', 'i': 'ি', 'oo': 'ূ', 'u': 'ু',
    'ai': 'ৈ', 'e': 'ে', 'au': 'ৌ', 'o': 'ো'
  };

  let res = '';
  let i = 0;
  let prevIsConsonant = false;

  while (i < word.length) {
    // Check initial or standalone vowels
    let matchedVowel = null;
    for (const v of ['aa', 'ee', 'oo', 'ai', 'au', 'a', 'i', 'u', 'e', 'o']) {
      if (word.startsWith(v, i)) {
        matchedVowel = v;
        break;
      }
    }

    if (matchedVowel) {
      if (prevIsConsonant) {
        res += matras[matchedVowel];
      } else {
        res += initialVowels[matchedVowel];
      }
      i += matchedVowel.length;
      prevIsConsonant = false;
      continue;
    }

    // Check consonants
    let matchedCons = null;
    for (const [c, hiC, bnC] of TRANSLIT_PAIRS) {
      if (word.startsWith(c, i)) {
        matchedCons = target === 'hi' ? hiC : bnC;
        i += c.length;
        break;
      }
    }

    if (matchedCons) {
      res += matchedCons;
      prevIsConsonant = true;
      continue;
    }

    // Single character fallback
    res += word[i];
    i++;
    prevIsConsonant = false;
  }

  return res;
}

export function translatePhrase(phrase, target = 'hi') {
  if (!phrase || typeof phrase !== 'string') return phrase;
  
  // Handle comma separated places e.g. "Bolpur, Birbhum"
  if (phrase.includes(',')) {
    return phrase.split(',').map(part => translatePhrase(part.trim(), target)).join(', ');
  }

  // Handle slashes e.g. "Banarasi / Chanderi"
  if (phrase.includes('/')) {
    return phrase.split('/').map(part => translatePhrase(part.trim(), target)).join(' / ');
  }

  // Handle ampersand e.g. "Wood, Bamboo & Cane"
  if (phrase.includes('&')) {
    return phrase.split('&').map(part => translatePhrase(part.trim(), target)).join(' एवं ');
  }

  // Tokenize by spaces and hyphens
  return phrase.split(/\s+/).map(token => {
    if (token.includes('-')) {
      return token.split('-').map(t => transliterateToken(t, target)).join('-');
    }
    return transliterateToken(token, target);
  }).join(' ');
}

// Generate explicit dictionaries for inventory items
const craftDict = {};
for (const c of inv.crafts) {
  craftDict[c] = {
    en: c,
    hi: translatePhrase(c, 'hi'),
    bn: translatePhrase(c, 'bn')
  };
}

const districtDict = {};
for (const d of inv.districts) {
  districtDict[d] = {
    en: d,
    hi: translatePhrase(d, 'hi'),
    bn: translatePhrase(d, 'bn')
  };
}

const nameDict = {};
for (const n of inv.names) {
  nameDict[n] = {
    en: n,
    hi: translatePhrase(n, 'hi'),
    bn: translatePhrase(n, 'bn')
  };
}

fs.writeFileSync('./scripts/generated_craft_dict.json', JSON.stringify(craftDict, null, 2));
fs.writeFileSync('./scripts/generated_district_dict.json', JSON.stringify(districtDict, null, 2));
fs.writeFileSync('./scripts/generated_name_dict.json', JSON.stringify(nameDict, null, 2));

console.log('Dictionaries generated successfully:');
console.log('Crafts:', Object.keys(craftDict).length);
console.log('Districts:', Object.keys(districtDict).length);
console.log('Names:', Object.keys(nameDict).length);
