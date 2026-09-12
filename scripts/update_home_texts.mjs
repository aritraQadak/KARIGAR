import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const enPath = path.join(projectRoot, 'src/i18n/en.json');
const hiPath = path.join(projectRoot, 'src/i18n/hi.json');
const bnPath = path.join(projectRoot, 'src/i18n/bn.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

// 1. Add top-level "home" translations
en.home = en.home || {};
en.home.heroProvenanceText = "Direct from India’s master craftspeople to your sanctuary. Verified Geographical Indication provenance, protected by fair-wage artisan escrow.";
en.home.exploreCraftClusters = "Explore Craft Clusters";

hi.home = hi.home || {};
hi.home.heroProvenanceText = "भारत के श्रेष्ठ शिल्पकारों से सीधे आपके घर तक। सत्यापित भौगोलिक संकेत (GI) मूल प्रमाण, निष्पक्ष मजदूरी वाले कारीगर एस्क्रो द्वारा संरक्षित।";
hi.home.exploreCraftClusters = "शिल्प समूहों का अन्वेषण करें";

bn.home = bn.home || {};
bn.home.heroProvenanceText = "ভারতের দক্ষ কারুশিল্পীদের কাছ থেকে সরাসরি আপনার ঘরে। যাচাইকৃত ভৌগোলিক নির্দেশক (GI) উৎস, ন্যায্য মজুরিভিত্তিক কারিগর এসক্রো ব্যবস্থায় সুরক্ষিত।";
bn.home.exploreCraftClusters = "কারুশিল্প ক্লাস্টার অন্বেষণ করুন";

// 2. Update buyer.home translations
if (!en.buyer) en.buyer = {};
if (!en.buyer.home) en.buyer.home = {};
en.buyer.home.heroSubtitle = "Direct from India’s master craftspeople to your sanctuary. Verified Geographical Indication provenance, protected by fair-wage artisan escrow.";
en.buyer.home.heroProvenanceText = "Direct from India’s master craftspeople to your sanctuary. Verified Geographical Indication provenance, protected by fair-wage artisan escrow.";
en.buyer.home.exploreClusters = "Explore Craft Clusters";
en.buyer.home.exploreClustersCta = "Explore Craft Clusters";
en.buyer.home.exploreCraftClusters = "Explore Craft Clusters";

if (!hi.buyer) hi.buyer = {};
if (!hi.buyer.home) hi.buyer.home = {};
hi.buyer.home.archiveBadge = "राष्ट्रीय हथकरघा एवं गिल्ड अभिलेखागार • सत्यापित जीआई रजिस्ट्री";
hi.buyer.home.heroBadge = "राष्ट्रीय हथकरघा एवं गिल्ड अभिलेखागार • सत्यापित जीआई रजिस्ट्री";
hi.buyer.home.heroTitleLine1 = "जहाँ हर धागा";
hi.buyer.home.heroTitleLine2 = "एक संप्रभु गाथा सुनाता है";
hi.buyer.home.heroSubtitle = "भारत के श्रेष्ठ शिल्पकारों से सीधे आपके घर तक। सत्यापित भौगोलिक संकेत (GI) मूल प्रमाण, निष्पक्ष मजदूरी वाले कारीगर एस्क्रो द्वारा संरक्षित।";
hi.buyer.home.heroProvenanceText = "भारत के श्रेष्ठ शिल्पकारों से सीधे आपके घर तक। सत्यापित भौगोलिक संकेत (GI) मूल प्रमाण, निष्पक्ष मजदूरी वाले कारीगर एस्क्रो द्वारा संरक्षित।";
hi.buyer.home.exploreClusters = "शिल्प समूहों का अन्वेषण करें";
hi.buyer.home.exploreClustersCta = "शिल्प समूहों का अन्वेषण करें";
hi.buyer.home.exploreCraftClusters = "शिल्प समूहों का अन्वेषण करें";
hi.buyer.home.watchStories = "कारीगरों की कहानियाँ देखें";
hi.buyer.home.watchStoriesCta = "कारीगरों की कहानियाँ देखें";
hi.buyer.home.registeredMasters = "पंजीकृत गिल्ड मास्टर्स";
hi.buyer.home.certifiedClusters = "प्रमाणित जीआई समूह";
hi.buyer.home.escrowPayout = "एस्क्रो संरक्षित भुगतान";
hi.buyer.home.artisanHonorarium = "प्रत्यक्ष कारीगर मानदेय";
hi.buyer.home.tickerMasters = "पंजीकृत गिल्ड मास्टर्स";

if (!bn.buyer) bn.buyer = {};
if (!bn.buyer.home) bn.buyer.home = {};
bn.buyer.home.archiveBadge = "জাতীয় হস্ততাঁত ও গিল্ড আর্কাইভ • যাচাইকৃত জিআই রেজিস্ট্রি";
bn.buyer.home.heroBadge = "জাতীয় হস্ততাঁত ও গিল্ড আর্কাইভ • যাচাইকৃত জিআই রেজিস্ট্রি";
bn.buyer.home.heroTitleLine1 = "যেখানে প্রতিটি সুতো";
bn.buyer.home.heroTitleLine2 = "একটি সার্বভৌম গল্প বলে";
bn.buyer.home.heroSubtitle = "ভারতের দক্ষ কারুশিল্পীদের কাছ থেকে সরাসরি আপনার ঘরে। যাচাইকৃত ভৌগোলিক নির্দেশক (GI) উৎস, ন্যায্য মজুরিভিত্তিক কারিগর এসক্রো ব্যবস্থায় সুরক্ষিত।";
bn.buyer.home.heroProvenanceText = "ভারতের দক্ষ কারুশিল্পীদের কাছ থেকে সরাসরি আপনার ঘরে। যাচাইকৃত ভৌগোলিক নির্দেশক (GI) উৎস, ন্যায্য মজুরিভিত্তিক কারিগর এসক্রো ব্যবস্থায় সুরক্ষিত।";
bn.buyer.home.exploreClusters = "কারুশিল্প ক্লাস্টার অন্বেষণ করুন";
bn.buyer.home.exploreClustersCta = "কারুশিল্প ক্লাস্টার অন্বেষণ করুন";
bn.buyer.home.exploreCraftClusters = "কারুশিল্প ক্লাস্টার অন্বেষণ করুন";
bn.buyer.home.watchStories = "কারিগরদের গল্প দেখুন";
bn.buyer.home.watchStoriesCta = "কারিগরদের গল্প দেখুন";
bn.buyer.home.registeredMasters = "নিবন্ধিত গিল্ড মাস্টার";
bn.buyer.home.certifiedClusters = "প্রত্যয়িত জিআই ক্লাস্টার";
bn.buyer.home.escrowPayout = "এসক্রো সুরক্ষিত অর্থপ্রদান";
bn.buyer.home.artisanHonorarium = "সরাসরি কারিগর সম্মাননা";
bn.buyer.home.tickerMasters = "নিবন্ধিত গিল্ড মাস্টার";

// Sync any missing keys symmetrically
function ensureKeys(target, source) {
  for (const k of Object.keys(source)) {
    if (typeof source[k] === 'object' && source[k] !== null && !Array.isArray(source[k])) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      ensureKeys(target[k], source[k]);
    } else if (target[k] === undefined) {
      target[k] = source[k];
    }
  }
}

ensureKeys(hi, en);
ensureKeys(bn, en);
ensureKeys(en, hi);
ensureKeys(en, bn);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2), 'utf8');

console.log('Successfully updated en.json, hi.json, and bn.json with Text A and Text B!');
