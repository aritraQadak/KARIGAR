const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const enPath = path.join(srcDir, 'i18n', 'en.json');
const hiPath = path.join(srcDir, 'i18n', 'hi.json');
const bnPath = path.join(srcDir, 'i18n', 'bn.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

function setDeep(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== 'object') {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

// Odisha Data
setDeep(en, 'buyer.data.states.odisha.tagline', 'Land of Craft, Culture & Coastlines');
setDeep(hi, 'buyer.data.states.odisha.tagline', 'शिल्प, संस्कृति और समुद्र तटों की पावन भूमि');
setDeep(bn, 'buyer.data.states.odisha.tagline', 'শিল্প, সংস্কৃতি ও উপকূলের পবিত্র ভূমি');

setDeep(en, 'buyer.data.states.odisha.quote', 'Where every weave tells a story.');
setDeep(hi, 'buyer.data.states.odisha.quote', 'जहाँ हर बुनाई एक कहानी बयां करती है।');
setDeep(bn, 'buyer.data.states.odisha.quote', 'যেখানে প্রতিটি বয়ন এক অনন্য আখ্যান বুনে চলে।');

// Chrome Strings
setDeep(en, 'buyer.stateExplore.exploreHeritage', "Explore {{name}}'s Heritage");
setDeep(hi, 'buyer.stateExplore.exploreHeritage', '{{name}} की विरासत देखें');
setDeep(bn, 'buyer.stateExplore.exploreHeritage', '{{name}}-এর ঐতিহ্য আবিষ্কার করুন');

setDeep(en, 'buyer.stateExplore.meetArtisans', 'Meet the Artisans');
setDeep(hi, 'buyer.stateExplore.meetArtisans', 'शिल्पकारों से मिलें');
setDeep(bn, 'buyer.stateExplore.meetArtisans', 'কারিগরদের সাথে পরিচিত হন');

setDeep(en, 'buyer.stateExplore.sideEditorial', 'Artisans Keep Traditions Alive');
setDeep(hi, 'buyer.stateExplore.sideEditorial', 'शिल्पकार परंपराओं को जीवंत रखते हैं');
setDeep(bn, 'buyer.stateExplore.sideEditorial', 'কারিগররা ঐতিহ্যকে জীবন্ত রাখেন');

setDeep(en, 'buyer.stateExplore.clusterCertified', '{{name}} Cluster · Certified Heritage');
setDeep(hi, 'buyer.stateExplore.clusterCertified', '{{name}} क्लस्टर · प्रमाणित विरासत');
setDeep(bn, 'buyer.stateExplore.clusterCertified', '{{name}} ক্লাস্টার · সার্টিফাইড ঐতিহ্য');

setDeep(en, 'buyer.stateExplore.defaultTagline', 'Land of Craft, Culture & Coastlines');
setDeep(hi, 'buyer.stateExplore.defaultTagline', 'शिल्प, संस्कृति और परंपरा की पावन भूमि');
setDeep(bn, 'buyer.stateExplore.defaultTagline', 'শিল্প, সংস্কৃতি ও ঐতিহ্যের রূপময় ভূমি');

setDeep(en, 'buyer.stateExplore.defaultQuote', 'Where every weave tells a story.');
setDeep(hi, 'buyer.stateExplore.defaultQuote', 'जहाँ हर बुनाई एक कहानी बयां करती है।');
setDeep(bn, 'buyer.stateExplore.defaultQuote', 'যেখানে প্রতিটি বয়ন এক অনন্য আখ্যান বুনে চলে।');

setDeep(en, 'buyer.stateExplore.catCraft', 'Craft');
setDeep(hi, 'buyer.stateExplore.catCraft', 'शिल्प');
setDeep(bn, 'buyer.stateExplore.catCraft', 'শিল্প');

setDeep(en, 'buyer.stateExplore.catCulture', 'Culture');
setDeep(hi, 'buyer.stateExplore.catCulture', 'संस्कृति');
setDeep(bn, 'buyer.stateExplore.catCulture', 'সংস্কৃতি');

setDeep(en, 'buyer.stateExplore.catHeritage', 'Heritage');
setDeep(hi, 'buyer.stateExplore.catHeritage', 'विरासत');
setDeep(bn, 'buyer.stateExplore.catHeritage', 'ঐতিহ্য');

setDeep(en, 'buyer.stateExplore.catArtisans', 'Artisans');
setDeep(hi, 'buyer.stateExplore.catArtisans', 'शिल्पकार');
setDeep(bn, 'buyer.stateExplore.catArtisans', 'কারিগর');

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2), 'utf8');

console.log('Successfully added Odisha hero i18n keys to en.json, hi.json, and bn.json!');
