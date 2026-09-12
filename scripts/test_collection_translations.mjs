import {
  CRAFT_TRANSLATIONS,
  STATE_TRANSLATIONS,
  DISTRICT_TRANSLATIONS,
  NAME_TRANSLATIONS,
  translateCraftType,
  translateState,
  translateDistrict,
  translatePersonName,
  transliterateText
} from '../src/constants/culturalTranslations.js';

export const COLLECTION_TITLE_TRANSLATIONS = {
  "Radha-Krishna Narrative Nakshi Kantha Tapestry": {
    en: "Radha-Krishna Narrative Nakshi Kantha Tapestry",
    hi: "राधा-कृष्ण कथात्मक नक्शी कांथा टेपेस्ट्री",
    bn: "রাধা-কৃষ্ণ আখ্যানমূলক নকশী কাঁথা টেপস্ট্রি"
  },
  "Nilambari Fine Cotton Jamdani Saree": {
    en: "Nilambari Fine Cotton Jamdani Saree",
    hi: "नीलांबरी महीन सूती जामदानी साड़ी",
    bn: "নীলাম্বরী ফাইন সুতি জামদানি শাড়ি"
  },
  "Mythological Swarnachari Silk Saree": {
    en: "Mythological Swarnachari Silk Saree",
    hi: "पौराणिक स्वर्णचरी रेशम साड़ी",
    bn: "পৌরাণিক স্বর্ণচরী রেশম শাড়ি"
  },
  "Panchmura Long-Neck Terracotta Heritage Horse": {
    en: "Panchmura Long-Neck Terracotta Heritage Horse",
    hi: "पंचमुरा लंबी गर्दन वाला टेराकोटा धरोहर घोड़ा",
    bn: "পাঁচমুড়া লম্বা-গলা টেরাকোটা ঐতিহ্যবাহী ঘোড়া"
  },
  "Royal Shahus Kani Weave Pashmina Shawl": {
    en: "Royal Shahus Kani Weave Pashmina Shawl",
    hi: "शाही शाहुस कानी बुनाई पश्मीना शॉल",
    bn: "রাজকীয় শাহুস কানি বয়নের পশমিনা শাল"
  },
  "Jaipur Blue Pottery Royal Floral Urn": {
    en: "Jaipur Blue Pottery Royal Floral Urn",
    hi: "जयपुर ब्लू पॉटरी शाही पुष्प फूलदान",
    bn: "জয়পুর ব্লু পটারি রাজকীয় পুষ্প পাত্র"
  },
  "Imperial Gold Zari Chanderi Silk Tissue Saree": {
    en: "Imperial Gold Zari Chanderi Silk Tissue Saree",
    hi: "शाही स्वर्ण जरी चंदेरी सिल्क टिशू साड़ी",
    bn: "ইম্পেরিয়াল গোল্ড জারি চন্দেরী রেশম টিস্যু শাড়ি"
  },
  "Imperial Gold Zari Chanderi Dupatta": {
    en: "Imperial Gold Zari Chanderi Dupatta",
    hi: "शाही स्वर्ण जरी चंदेरी दुपट्टा",
    bn: "ইম্পেরিয়াল গোল্ড জারি চন্দেরী দোপাট্টা"
  },
  "Ajrakhpur 16-Stage Natural Dye Block Print Stole": {
    en: "Ajrakhpur 16-Stage Natural Dye Block Print Stole",
    hi: "अजरखपुर १६-चरणीय प्राकृतिक रंग ब्लॉक प्रिंट स्टोल",
    bn: "অজরখপুর ১৬-ধাপের প্রাকৃতিক রঙের ব্লক প্রিন্ট স্টোল"
  },
  "Kanchipuram Heavy Crimson Korvai Silk Saree": {
    en: "Kanchipuram Heavy Crimson Korvai Silk Saree",
    hi: "कांचीपुरम भारी किरमिजी कोरवई रेशम साड़ी",
    bn: "কাঞ্চিপুরম হেভি ক্রিমসন কোরভই রেশম শাড়ি"
  },
  "Bastar Bell Metal Lost-Wax Dhokra Tribal Procession": {
    en: "Bastar Bell Metal Lost-Wax Dhokra Tribal Procession",
    hi: "बस्तर बेल मेटल लॉस्ट-वैक्स ढोकरा जनजातीय शोभायात्रा",
    bn: "বস্তার বেল মেটাল লস্ট-ওয়াক্স ঢোকরা উপজাতীয় মিছিল"
  },
  "Varanasi Royal Katan Silk Kadwa Jaal Brocade Saree": {
    en: "Varanasi Royal Katan Silk Kadwa Jaal Brocade Saree",
    hi: "वाराणसी शाही कतान सिल्क कड़वा जाल ब्रोकेड साड़ी",
    bn: "বারাণসী রাজকীয় কাতান সিল্ক কড়ওয়া জাল ব্রোকেড শাড়ি"
  },
  "Raghurajpur Palm Leaf Pattachitra Tale of Dashavatar": {
    en: "Raghurajpur Palm Leaf Pattachitra Tale of Dashavatar",
    hi: "रघुराजपुर ताड़पत्र पट्टचित्र दशावतार कथा",
    bn: "রঘুরাজপুর তালপাতা পট্টচিত্র দশা অবতার কথা"
  },
  "Banarasi Silk Saree": {
    en: "Banarasi Silk Saree",
    hi: "बनारसी सिल्क साड़ी",
    bn: "বেনারসি সিল্ক শাড়ি"
  },
  "Blue Pottery Vase": {
    en: "Blue Pottery Vase",
    hi: "ब्लू पॉटरी फूलदान",
    bn: "ব্লু পটারি ফুলদানি"
  },
  "Jamdani Saree": {
    en: "Jamdani Saree",
    hi: "जामदानी साड़ी",
    bn: "জামদানি শাড়ি"
  },
  "Tant Saree": {
    en: "Tant Saree",
    hi: "तांत साड़ी",
    bn: "তাঁত শাড়ি"
  },
  "Baluchari Saree": {
    en: "Baluchari Saree",
    hi: "बालूचरी साड़ी",
    bn: "বালুচরী শাড়ি"
  },
  "Kundan Jewellery Set": {
    en: "Kundan Jewellery Set",
    hi: "कुंदन आभूषण सेट",
    bn: "কুন্দন গয়না সেট"
  },
  "Meenakari Jewellery Set": {
    en: "Meenakari Jewellery Set",
    hi: "मीनाकारी आभूषण सेट",
    bn: "মীনাকারি গয়না সেট"
  },
  "Madhubani Painting": {
    en: "Madhubani Painting",
    hi: "मधुबनी चित्रकला",
    bn: "মধুবনী চিত্রকর্ম"
  },
  "Warli Folk Painting": {
    en: "Warli Folk Painting",
    hi: "वारली लोक चित्रकला",
    bn: "ওয়ারলি লোকচিত্রকর্ম"
  },
  "Pashmina Shawl": {
    en: "Pashmina Shawl",
    hi: "पश्मीना शॉल",
    bn: "পশমিনা শাল"
  },
  "Terracotta Horse": {
    en: "Terracotta Horse",
    hi: "टेराकोटा घोड़ा",
    bn: "টেরাকোটা ঘোড়া"
  }
};

const PRODUCT_NOUN_MAP = {
  "saree": { hi: "साड़ी", bn: "শাড়ি" },
  "sari": { hi: "साड़ी", bn: "শাড়ি" },
  "shawl": { hi: "शॉल", bn: "শাল" },
  "stole": { hi: "स्टोल", bn: "স্টোল" },
  "dupatta": { hi: "दुपट्टा", bn: "দোপাট্টা" },
  "tapestry": { hi: "टेपेस्ट्री", bn: "ট্যাপেস্ট্রি" },
  "vase": { hi: "फूलदान", bn: "ফুলদানি" },
  "urn": { hi: "कलश", bn: "কলস" },
  "horse": { hi: "घोड़ा", bn: "ঘোড়া" },
  "painting": { hi: "चित्रकला", bn: "চিত্রকর্ম" },
  "jewellery": { hi: "आभूषण", bn: "গয়না" },
  "jewelry": { hi: "आभूषण", bn: "গয়না" },
  "sculpture": { hi: "मूर्तिकला", bn: "ভাস্কর্য" },
  "figurine": { hi: "मूर्ति", bn: "মূর্তি" },
  "box": { hi: "डिब्बा", bn: "বাক্স" },
  "plate": { hi: "थाली", bn: "থালা" },
  "bowl": { hi: "कटोरा", bn: "বাটি" },
  "jacket": { hi: "जैकेट", bn: "জ্যাকেট" },
  "kurta": { hi: "कुर्ता", bn: "কুর্তা" },
  "folio": { hi: "पत्र", bn: "পত্র" },
  "carpet": { hi: "कालीन", bn: "কার্পেট" },
  "rug": { hi: "गलीचा", bn: "গালিচা" },
  "procession": { hi: "शोभायात्रा", bn: "শোভাযাত্রা" },
  "mask": { hi: "मुखौटा", bn: "মুখোশ" },
  "mirror": { hi: "दर्पण", bn: "আয়না" },
  "bell": { hi: "घंटी", bn: "ঘণ্টা" },
  "lamp": { hi: "दीपक", bn: "প্রদীপ" },
  "mat": { hi: "चटाई", bn: "মাদুর" },
  "basket": { hi: "टोकरी", bn: "ঝুড়ি" },
  "bag": { hi: "बैग", bn: "ব্যাগ" },
  "pouch": { hi: "थैली", bn: "থলি" },
  "silk": { hi: "सिल्क", bn: "সিল্ক" },
  "cotton": { hi: "सूती", bn: "সুতি" },
  "wool": { hi: "ऊनी", bn: "পশমি" },
  "woollen": { hi: "ऊनी", bn: "পশমি" },
  "fabric": { hi: "वस्त्र", bn: "বস্ত্র" },
  "weave": { hi: "बुनाई", bn: "বয়ন" },
  "craft": { hi: "शिल्प", bn: "কারুশিল্প" },
  "heritage": { hi: "धरोहर", bn: "ঐতিহ্য" },
  "traditional": { hi: "पारंपरिक", bn: "ঐতিহ্যবাহী" },
  "authentic": { hi: "प्रामाणिक", bn: "খাঁটি" },
  "handcrafted": { hi: "हस्तनिर्मित", bn: "হাতে তৈরি" },
  "handwoven": { hi: "हथकरघा बुना", bn: "হাতে বোনা" },
  "royal": { hi: "शाही", bn: "রাজকীয়" },
  "imperial": { hi: "शाही", bn: "ইম্পেরিয়াল" },
  "gold": { hi: "स्वर्ण", bn: "সোনালী" },
  "silver": { hi: "रजत", bn: "রুপোর" },
  "brass": { hi: "पीतल", bn: "পিতল" },
  "clay": { hi: "मिट्टी", bn: "মাটি" },
  "wood": { hi: "लकड़ी", bn: "কাঠ" },
  "stone": { hi: "पत्थर", bn: "পাথর" },
  "metal": { hi: "धातु", bn: "ধাতু" },
  "fine": { hi: "महीन", bn: "সূক্ষ্ম" },
  "heavy": { hi: "भारी", bn: "ভারী" },
  "pure": { hi: "शुद्ध", bn: "খাঁটি" },
  "masterpiece": { hi: "उत्कृष्ट कृति", bn: "শ্রেষ্ঠ শিল্পকর্ম" },
  "masterwork": { hi: "मास्टरवर्क", bn: "মাস্টারওয়ার্ক" }
};

export function translateCollectionTitle(title, lang = 'en') {
  if (!title || typeof title !== 'string') return '';
  const code = (lang || 'en').split('-')[0].toLowerCase();
  if (code === 'en') return title;

  const trimmed = title.trim();

  // 1. Direct dictionary lookup
  if (COLLECTION_TITLE_TRANSLATIONS[trimmed]?.[code]) {
    return COLLECTION_TITLE_TRANSLATIONS[trimmed][code];
  }

  // 2. Pattern: "<Craft> Masterpiece" or "<Craft> Masterwork"
  const masterMatch = trimmed.match(/^(.*?)\s+(Masterpiece|Masterwork)$/i);
  if (masterMatch) {
    const craftName = masterMatch[1].trim();
    const locCraft = translateCraftType(craftName, code);
    if (code === 'hi') return `${locCraft} उत्कृष्ट कृति`;
    if (code === 'bn') return `${locCraft} শ্রেষ্ঠ শিল্পকর্ম`;
  }

  // 3. Pattern: "<Craft> of <State>"
  const ofMatch = trimmed.match(/^(.*?)\s+of\s+(.*?)$/i);
  if (ofMatch) {
    const craftName = ofMatch[1].trim();
    const stateName = ofMatch[2].trim();
    const locCraft = translateCraftType(craftName, code);
    const locState = translateState(stateName, code);
    if (code === 'hi') return `${locState} का ${locCraft}`;
    if (code === 'bn') return `${locState}-এর ${locCraft}`;
  }

  // 4. Token-level decomposition and reconstruction
  const words = trimmed.split(/\s+/);
  const translatedWords = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (PRODUCT_NOUN_MAP[clean]?.[code]) {
      return PRODUCT_NOUN_MAP[clean][code];
    }
    // Check craft
    const cr = translateCraftType(w, code);
    if (cr && cr !== w) return cr;
    // Check state
    const st = translateState(w, code);
    if (st && st !== w) return st;
    // Transliterate if still English
    return transliterateText(w, code);
  });

  return translatedWords.join(' ');
}

export function translateCollectionDescription(desc, item = {}, lang = 'en') {
  if (!desc || typeof desc !== 'string') return '';
  const code = (lang || 'en').split('-')[0].toLowerCase();
  if (code === 'en') return desc;

  // Check known standard strings
  if (desc.includes("Handwoven by master artisans using traditional techniques")) {
    return code === 'hi'
      ? "पारंपरिक तकनीकों का उपयोग करके कुशल कारीगरों द्वारा हाथ से बुना गया।"
      : "ঐতিহ্যবাহী কৌশল ব্যবহার করে দক্ষ কারিগরদের হাতে বোনা।";
  }

  // Check synthesized artisan piece format:
  // "Authentic handcrafted <cType> by master artisan <artisanName> from <district ? district + ', ' : ''><state>."
  // or "Authentic handcrafted <cType> created by master artisan..."
  const authMatch = desc.match(/Authentic handcrafted\s+(.*?)\s+(?:by|created by)\s+master artisan\s+(.*?)\s+from\s+(.*?)\./i);
  if (authMatch || item.craftType || item.craftLineage) {
    const craft = item.craftType || item.craftLineage || (authMatch ? authMatch[1] : 'Traditional Craft');
    const artisan = item.artisanName || (authMatch ? authMatch[2] : 'Master Artisan');
    const state = item.stateName || item.state || '';
    const district = item.district || '';

    const locCraft = translateCraftType(craft, code);
    const locArtisan = translatePersonName(artisan, code);
    const locState = translateState(state, code);
    const locDistrict = translateDistrict(district, code);

    const locLoc = [locDistrict, locState].filter(Boolean).join(', ');

    if (code === 'hi') {
      return `${locLoc ? `${locLoc} के ` : ''}कुशल शिल्पकार ${locArtisan} द्वारा पारंपरिक तकनीकों से निर्मित प्रामाणिक हस्तनिर्मित ${locCraft}।`;
    }
    if (code === 'bn') {
      return `${locLoc ? `${locLoc}-এর ` : ''}দক্ষ কারিগর ${locArtisan}-এর ঐতিহ্যবাহী হস্তনির্মিত খাঁটি ${locCraft}।`;
    }
  }

  return transliterateText(desc, code);
}

// Test runner
console.log('Testing Collection Title Translation:');
const sampleTitles = [
  "Banarasi Silk Saree",
  "Blue Pottery Vase",
  "Jamdani Masterpiece",
  "Patola Masterpiece",
  "Radha-Krishna Narrative Nakshi Kantha Tapestry",
  "Nilambari Fine Cotton Jamdani Saree",
  "Bastar Bell Metal Lost-Wax Dhokra Tribal Procession",
  "Tribal Jewellery Masterpiece"
];

for (const t of sampleTitles) {
  console.log(`Title: "${t}"`);
  console.log(`  HI: ${translateCollectionTitle(t, 'hi')}`);
  console.log(`  BN: ${translateCollectionTitle(t, 'bn')}`);
}

console.log('\nTesting Collection Description Translation:');
const sampleDesc = "Authentic handcrafted Jamdani by master artisan Aritra Adak from Kolkata, West Bengal.";
const sampleItem = { craftType: "Jamdani", artisanName: "Aritra Adak", district: "Kolkata", state: "West Bengal" };
console.log('Desc:', sampleDesc);
console.log('  HI:', translateCollectionDescription(sampleDesc, sampleItem, 'hi'));
console.log('  BN:', translateCollectionDescription(sampleDesc, sampleItem, 'bn'));
