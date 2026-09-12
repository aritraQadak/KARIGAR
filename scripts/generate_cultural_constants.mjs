import fs from 'fs';
import { DEMO_ARTISANS } from '../prisma/artisanData.js';
import { CRAFT_CATEGORIES } from '../src/constants/craftCategories.js';
import { STATE_TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../src/constants/culturalTranslations.js';

const inv = JSON.parse(fs.readFileSync('./scripts/data_inventory.json', 'utf8'));

// 1. Comprehensive Vocabulary for Indian Arts & Places
const CRAFT_VOCAB = {
  // Major Craft Names
  "Jamdani": { hi: "जामदानी", bn: "জামদানি" },
  "Tant": { hi: "तांत", bn: "তাঁত" },
  "Patola": { hi: "पटोला", bn: "পাটোলা" },
  "Bandhani": { hi: "बंधनी", bn: "বন্ধনী" },
  "Sambalpuri": { hi: "संबलपुरी", bn: "সম্বলপুরী" },
  "Ikat": { hi: "इकात", bn: "ইকাত" },
  "Muga": { hi: "मूगा", bn: "মুগা" },
  "Kanchipuram": { hi: "कांचीपुरम", bn: "কাঞ্চীপুরম" },
  "Banarasi": { hi: "बनारसी", bn: "বেনারসি" },
  "Kantha": { hi: "कांथा", bn: "কাঁথা" },
  "Phulkari": { hi: "फुलकारी", bn: "ফুলকারি" },
  "Chikankari": { hi: "चिकनकारी", bn: "চিকনকারি" },
  "Kundan": { hi: "कुंदन", bn: "কুন্দন" },
  "Blue Pottery": { hi: "ब्लू पॉटरी", bn: "ব্লু পটারি" },
  "Madhubani": { hi: "मधुबनी", bn: "মধুবনী" },
  "Warli": { hi: "वारली", bn: "ওয়ারলি" },
  "Bastar": { hi: "बस्तर", bn: "বস্তার" },
  "Dhokra": { hi: "ढोकरा", bn: "ডোকরা" },
  "Terracotta": { hi: "टेराकोटा", bn: "পোড়ামাটি" },
  "Pattachitra": { hi: "पट्टचित्र", bn: "পট্টচিত্র" },
  "Kalamkari": { hi: "कलमकारी", bn: "কলমকারী" },
  "Chanderi": { hi: "चंदेरी", bn: "চান্দেরি" },
  "Pashmina": { hi: "पश्मीना", bn: "পশমিনা" },
  "Bidriware": { hi: "बिद्रीवेयर", bn: "বিদ্রিওয়্যার" },
  "Meenakari": { hi: "मीनाकारी", bn: "মিনাকারি" },
  "Kasuti": { hi: "कसूती", bn: "কসুতি" },
  "Aipan": { hi: "ऐपण", bn: "ঐপণ" },
  "Kondapalli": { hi: "कोंडापल्ली", bn: "কোন্ডাপল্লী" },
  "Kinhal": { hi: "किण्हाल", bn: "কিনহাল" },
  "Channapatna": { hi: "चन्नपटना", bn: "চন্নাপাটনা" },
  "Thanjavur": { hi: "तंजावुर", bn: "তাঞ্জাভুর" },
  "Tanjore": { hi: "तंजावुर", bn: "তাঞ্জাভুর" },
  "Rogan": { hi: "रोगन", bn: "রোগন" },
  "Sujani": { hi: "सुजनी", bn: "সুজনি" },
  "Gond": { hi: "गोंड", bn: "গন্ড" },
  "Cheriyal": { hi: "चेरियाल", bn: "চেরিয়াল" },
  "Kullu": { hi: "कुल्लू", bn: "কুল্লু" },
  "Pochampally": { hi: "पोचमपल्ली", bn: "পোচমপল্লী" },
  "Kathputli": { hi: "कठपुतली", bn: "কাঠপুতুল" },
  "Thewa": { hi: "थेवा", bn: "থেওয়া" },
  "Filigree": { hi: "तारकशी", bn: "তারকাশি" },
  "Ajrakh": { hi: "अजरख", bn: "অজরখ" },
  "Bagh": { hi: "बाघ", bn: "বাঘ" },
  "Bagru": { hi: "बगरू", bn: "বগরু" },
  "Balaramapuram": { hi: "बलरामपुरम", bn: "বলরামপুরম" },
  "Baluchari": { hi: "बालूचरी", bn: "বালুচরী" },
  "Swarnachari": { hi: "स्वर्णचरी", bn: "স্বর্ণচরী" },
  "Bawan Buti": { hi: "बावन बूटी", bn: "বায়ান্ন বুটি" },
  "Perak": { hi: "पेराक", bn: "পেরাক" },
  "Bell Metal": { hi: "कांसा", bn: "কাঁসা" },
  "Bengal": { hi: "बंगाल", bn: "বাংলা" },
  "Bhadohi": { hi: "भदोही", bn: "ভদোহি" },
  "Bhagalpuri": { hi: "भागलपुरी", bn: "ভাগলপুরী" },
  "Tussar": { hi: "तसर", bn: "তসর" },
  "Bobbili": { hi: "बोब्बिली", bn: "বোব্বিলি" },
  "Veena": { hi: "वीणा", bn: "বীণা" },
  "Bomkai": { hi: "बोमकाई", bn: "বোমকাই" },
  "Budithi": { hi: "बुदिति", bn: "বুদ্বিতী" },
  "Chamba": { hi: "चंबा", bn: "চম্বা" },
  "Rumal": { hi: "रूमाल", bn: "রুমাল" },
  "Chettinad": { hi: "चेट्टीनाड", bn: "চেট্টিনাড" },
  "Kandasangi": { hi: "कंदसंगी", bn: "কন্দসঙ্গী" },
  "Dharmavaram": { hi: "धर्मावरम", bn: "ধর্মাবরম" },
  "Durgi": { hi: "दुर्गी", bn: "দুর্গী" },
  "Etikoppaka": { hi: "एतिकोपका", bn: "এতিকোপ্পাকা" },
  "Gabra": { hi: "गबरा", bn: "গাবরা" },
  "Ganjifa": { hi: "गंजीफा", bn: "গঞ্জিফা" },
  "Cards": { hi: "पत्ते", bn: "তাস" },
  "Gorakhpur": { hi: "गोरखपुर", bn: "গোরখপুর" },
  "Habaspuri": { hi: "हबासपुरी", bn: "হাবাসপুরী" },
  "Ilkal": { hi: "इल्कल", bn: "ইলকল" },
  "Jharocraft": { hi: "झारोशिल्प", bn: "ঝাড়োশিল্প" },
  "Kani": { hi: "कानी", bn: "কানি" },
  "Kotpad": { hi: "कोटपाड़", bn: "কোটপাড়" },
  "Lippan": { hi: "लिप्पन", bn: "লিপ্পন" },
  "Manjusha": { hi: "मंजूषा", bn: "মঞ্জুষা" },
  "Mata Ni Pachedi": { hi: "माता नी पछेड़ी", bn: "মাতা নী পছেড়ী" },
  "Molela": { hi: "मोलेला", bn: "মোলেলা" },
  "Murshidabad": { hi: "मुर्शिदाबाद", bn: "মুর্শিদাবাদ" },
  "Mysore": { hi: "मैसूर", bn: "মহীশূর" },
  "Nirmal": { hi: "निर्मल", bn: "নির্মল" },
  "Paithani": { hi: "पैठणी", bn: "পৈঠানী" },
  "Patan": { hi: "पाटन", bn: "পাটন" },
  "Pithora": { hi: "पिथोरा", bn: "পিথোরা" },
  "Sanganeri": { hi: "सांगानेरी", bn: "সাঙ্গানেরি" },
  "Santhali": { hi: "संथाली", bn: "সাঁওতালি" },
  "Sikki": { hi: "सिकी", bn: "সিকি" },
  "Sohrai": { hi: "सोहराई", bn: "সোহরাই" },
  "Khovar": { hi: "खोवर", bn: "খোভার" },
  "Surat": { hi: "सूरत", bn: "সুরাট" },
  "Zari": { hi: "ज़री", bn: "জরি" },
  "Toda": { hi: "टोडा", bn: "তোদা" },
  "Udupi": { hi: "उडुपी", bn: "উডুপী" },
  "Uppada": { hi: "उप्पाड़ा", bn: "উপ্পাড়া" },
  "Varanasi": { hi: "वाराणसी", bn: "বারাণসী" },
  "Zardozi": { hi: "जरदोजी", bn: "জরদৌজি" },

  // Generic Craft Nouns / Descriptors
  "Handloom": { hi: "हथकरघा", bn: "হস্ততাঁত" },
  "Weaving": { hi: "बुनाई", bn: "বয়ন" },
  "Textile": { hi: "वस्त्र", bn: "বস্ত্র" },
  "Textiles": { hi: "वस्त्र", bn: "বস্ত্র" },
  "Silk": { hi: "सिल्क", bn: "সিল্ক" },
  "Cotton": { hi: "सूती", bn: "সুতি" },
  "Wool": { hi: "ऊन", bn: "পশম" },
  "Woollen": { hi: "ऊनी", bn: "পশমি" },
  "Shawl": { hi: "शॉल", bn: "শাল" },
  "Shawls": { hi: "शॉल", bn: "শাল" },
  "Saree": { hi: "साड़ी", bn: "শাড়ি" },
  "Sari": { hi: "साड़ी", bn: "শাড়ি" },
  "Embroidery": { hi: "कढ़ाई", bn: "নকশিকাজ" },
  "Needlework": { hi: "सुईशिल्प", bn: "সূচিশিল্প" },
  "Pottery": { hi: "मृत्तिका शिल्प", bn: "মৃৎশিল্প" },
  "Clay": { hi: "मिट्टी", bn: "মাটি" },
  "Metal": { hi: "धातु", bn: "ধাতু" },
  "Metalwork": { hi: "धातुशिल्प", bn: "ধাতুশিল্প" },
  "Brass": { hi: "पीतल", bn: "পিতল" },
  "Brassware": { hi: "पीतल बर्तन", bn: "পিতলের বাসন" },
  "Bronze": { hi: "कांस्य", bn: "ব্রোঞ্জ" },
  "Copper": { hi: "तांबा", bn: "তামা" },
  "Silver": { hi: "चांदी", bn: "রুপো" },
  "Gold": { hi: "स्वर्ण", bn: "স্বর্ণ" },
  "Painting": { hi: "चित्रकला", bn: "চিত্রকলা" },
  "Art": { hi: "कला", bn: "শিল্প" },
  "Jewellery": { hi: "आभूषण", bn: "গয়না" },
  "Jewelry": { hi: "आभूषण", bn: "গয়না" },
  "Wood": { hi: "काष्ठ", bn: "কাঠ" },
  "Wooden": { hi: "काष्ठ", bn: "কাঠের" },
  "Carving": { hi: "नक्काशी", bn: "খোদাই" },
  "Woodcraft": { hi: "काष्ठशिल्प", bn: "কাষ্ঠশিল্প" },
  "Bamboo": { hi: "बांस", bn: "বাঁশ" },
  "Cane": { hi: "बेंत", bn: "বেত" },
  "Rattan": { hi: "बेंत", bn: "বেত" },
  "Basketry": { hi: "टोकरी शिल्प", bn: "ডালা বয়ন" },
  "Natural": { hi: "प्राकृतिक", bn: "প্রাকৃতিক" },
  "Fibre": { hi: "तंतु", bn: "তন্তু" },
  "Fiber": { hi: "तंतु", bn: "তন্তু" },
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
  "Mache": { hi: "माशी", bn: "মাশে" },
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
  "Brocade": { hi: "ब्रोकेड", bn: "ব্রোকেড" },
  "Inlay": { hi: "जड़ाऊ", bn: "জড়াও" },
  "Applique": { hi: "एप्लिक", bn: "অ্যাপ্লিক" },
  "Mirror": { hi: "दर्पण", bn: "দর্পণ" },
  "Work": { hi: "शिल्प", bn: "শিল্প" },
  "Scroll": { hi: "स्क्रॉल", bn: "স্ক্রল" },
  "Scrolls": { hi: "स्क्रॉल", bn: "স্ক্রল" },
  "Mala": { hi: "माला", bn: "মালা" },
  "Beaded": { hi: "मनकों का", bn: "পুতির" },
  "Lamp": { hi: "दीप", bn: "প্রদীপ" },
  "Utensil": { hi: "बर्तन", bn: "বাসন" },
  "Reeds": { hi: "नरकट", bn: "নলখাগড়া" },
  "Splint": { hi: "कमानी", bn: "বাখারি" },
  "Fish": { hi: "मत्स्य", bn: "মাছ" },
  "Icon": { hi: "प्रतिमा", bn: "মূর্তি" },
  "Casting": { hi: "ढलाई", bn: "ঢালাই" },
  "Puppets": { hi: "कठपुतली", bn: "পুতুলনাচ" },
  "Tweed": { hi: "ट्वीड", bn: "টুইড" },
  "Striped": { hi: "धारीदार", bn: "ডোরাকাটা" },
  "Skirt": { hi: "स्कर्ट", bn: "স্কার্ট" },
  "Banana": { hi: "केला", bn: "কলা" },
  "Batik": { hi: "बाटिक", bn: "বাটিক" },
  "Island": { hi: "द्वीप", bn: "द्वीप" },
  "Black": { hi: "काला", bn: "কালো" },
  "Blue": { hi: "ब्लू", bn: "ব্লু" },
  "Bone": { hi: "अस्थि", bn: "হাড়" },
  "Architectural": { hi: "स्थापत्य", bn: "স্থাপত্য" }
};

// 2. Comprehensive Vocabulary for Indian Places & Districts
const PLACE_VOCAB = {
  // Metros & Major Hubs
  "Kolkata": { hi: "कोलकाता", bn: "কলকাতা" },
  "New Delhi": { hi: "नई दिल्ली", bn: "নতুন দিল্লি" },
  "Delhi": { hi: "दिल्ली", bn: "দিল্লি" },
  "Mumbai": { hi: "मुंबई", bn: "মুম্বাই" },
  "Chennai": { hi: "चेन्नई", bn: "চেন্নাই" },
  "Bengaluru": { hi: "बेंगलुरु", bn: "বেঙ্গালুরু" },
  "Hyderabad": { hi: "हैदराबाद", bn: "হায়দরাবাদ" },
  "Ahmedabad": { hi: "अहमदाबाद", bn: "আহমেদাবাদ" },
  "Surat": { hi: "सूरत", bn: "সুরাট" },
  "Varanasi": { hi: "वाराणसी", bn: "বারাণসী" },
  "Jaipur": { hi: "जयपुर", bn: "জয়পুর" },
  "Lucknow": { hi: "लखनऊ", bn: "লখনউ" },
  "Srinagar": { hi: "श्रीनगर", bn: "শ্রীনগর" },
  "Kutch": { hi: "कच्छ", bn: "কচ্ছ" },
  "Bhuj": { hi: "भुज", bn: "ভুজ" },
  "Mysore": { hi: "मैसूर", bn: "মহীশূর" },
  "Madurai": { hi: "मदुरै", bn: "মাদুরাই" },
  "Patna": { hi: "पटना", bn: "পাটনা" },
  "Bhopal": { hi: "भोपाल", bn: "ভোপাল" },
  "Puri": { hi: "पुरी", bn: "পুরী" },
  "Guwahati": { hi: "गुवाहाटी", bn: "গুয়াহাটি" },
  "Agra": { hi: "आगरा", bn: "আগ্রা" },
  "Amritsar": { hi: "अमृतसर", bn: "অমৃতসর" },
  "Jodhpur": { hi: "जोधपुर", bn: "যোধপুর" },
  "Udaipur": { hi: "उदयपुर", bn: "উদয়পুর" },
  "Bikaner": { hi: "बीकानेर", bn: "বিকানের" },
  "Leh": { hi: "लेह", bn: "লেহ" },
  "Kargil": { hi: "कारगिल", bn: "কার্গিল" },
  "Jammu": { hi: "जम्मू", bn: "জম্মু" },
  "Shimla": { hi: "शिमला", bn: "শিমলা" },
  "Kullu": { hi: "कुल्लू", bn: "কুল্লু" },
  "Dharamshala": { hi: "धर्मशाला", bn: "ধর্মশালা" },
  "Dehradun": { hi: "देहरादून", bn: "দেরাদুন" },
  "Haridwar": { hi: "हरिद्वार", bn: "হরিদ্বার" },
  "Rishikesh": { hi: "ऋषिकेश", bn: "ঋষিকেশ" },
  "Almora": { hi: "अल्मोड़ा", bn: "আলমোড়া" },
  "Nainital": { hi: "नैनीताल", bn: "নৈনিতাল" },
  "Thiruvananthapuram": { hi: "तिरुवनंतपुरम", bn: "তিরুবনন্তপুরম" },
  "Alappuzha": { hi: "अलाप्पुझा", bn: "আলাপ্পুঝা" },
  "Thrissur": { hi: "त्रिशूर", bn: "ত্রিশুর" },
  "Kozhikode": { hi: "कोझिकोड", bn: "কোঝিকোড়" },
  "Kannur": { hi: "कन्नूर", bn: "কান্নুর" },
  "Panaji": { hi: "पणजी", bn: "পানাজি" },
  "Margao": { hi: "मडगांव", bn: "মারগাও" },
  "Raipur": { hi: "रायपुर", bn: "রায়পুর" },
  "Bastar": { hi: "बस्तर", bn: "বস্তার" },
  "Ranchi": { hi: "रांची", bn: "রাঁচি" },
  "Jamshedpur": { hi: "जमशेदपुर", bn: "জামশেদপুর" },
  "Dhanbad": { hi: "धनबाद", bn: "ধানবাদ" },
  "Cuttack": { hi: "कटक", bn: "কটক" },
  "Sambalpur": { hi: "संबलपुर", bn: "সম্বলপুর" },
  "Bargarh": { hi: "बरगढ़", bn: "বরগড়" },
  "Mayurbhanj": { hi: "मयूरभंज", bn: "ময়ূরভঞ্জ" },
  "Imphal": { hi: "इंफाल", bn: "ইম্ফল" },
  "Kohima": { hi: "कोहिमा", bn: "কোহিমা" },
  "Dimapur": { hi: "दीमापुर", bn: "দিমাপুর" },
  "Aizawl": { hi: "आइजोल", bn: "আইজল" },
  "Shillong": { hi: "शिलांग", bn: "শিলং" },
  "Agartala": { hi: "अगरतला", bn: "আগরতলা" },
  "Gangtok": { hi: "गंगटोक", bn: "গ্যাংটক" },
  "Itanagar": { hi: "ईटानगर", bn: "ইটানগর" },
  "Port Blair": { hi: "पोर्ट ब्लेयर", bn: "পোর্ট ব্লেয়ার" },
  "Kavaratti": { hi: "कवरत्ती", bn: "কাভারাত্তি" },
  "Puducherry": { hi: "पुडुचेरी", bn: "পুদুচেরি" },
  "Chandigarh": { hi: "चंडीगढ़", bn: "চণ্ডীগড়" },

  // West Bengal Crafts Hubs
  "Bankura": { hi: "बांकुड़ा", bn: "বাঁকুড়া" },
  "Bishnupur": { hi: "बिष्णुपुर", bn: "বিষ্ণুপুর" },
  "Birbhum": { hi: "बीरभूम", bn: "বীরভূম" },
  "Shantiniketan": { hi: "शांतिनिकेतन", bn: "শান্তিনিকেতন" },
  "Bolpur": { hi: "बोलपुर", bn: "বোলপুর" },
  "Murshidabad": { hi: "मुर्शिदाबाद", bn: "মুর্শিদাবাদ" },
  "Nadia": { hi: "नदिया", bn: "নদীয়া" },
  "Hooghly": { hi: "हुगली", bn: "হুগলি" },
  "Bardhaman": { hi: "बर्धमान", bn: "বর্ধমান" },
  "Midnapore": { hi: "मिदनापुर", bn: "মেদিনীপুর" },
  "Purulia": { hi: "पुरुलिया", bn: "পুরুলিয়া" },
  "Darjeeling": { hi: "दार्जिलिंग", bn: "দার্জিলিং" },
  "Jalpaiguri": { hi: "जलपाईगुड़ी", bn: "জলপাইগুড়ি" },
  "Cooch Behar": { hi: "कूचबिहार", bn: "কোচবিহার" },
  "Malda": { hi: "मालदा", bn: "মালদা" },
  "Kalimpong": { hi: "कलिम्पोंग", bn: "কালিম্পং" },
  "Howrah": { hi: "हावड़ा", bn: "হাওড়া" },
  "North 24 Parganas": { hi: "उत्तर २४ परगना", bn: "উত্তর ২৪ পরগনা" },
  "South 24 Parganas": { hi: "दक्षिण २४ परगना", bn: "দক্ষিণ ২৪ পরগনা" },

  // Common Placename Qualifiers
  "East": { hi: "पूर्वी", bn: "পূর্ব" },
  "West": { hi: "पश्चिमी", bn: "পশ্চিম" },
  "North": { hi: "उत्तरी", bn: "উত্তর" },
  "South": { hi: "दक्षिणी", bn: "দক্ষিণ" },
  "Central": { hi: "मध्य", bn: "मध्य" },
  "District": { hi: "ज़िला", bn: "জেলা" },
  "Valley": { hi: "घाटी", bn: "উপত্যকা" },
  "Hills": { hi: "पहाड़ियाँ", bn: "পাহাড়" },
  "Island": { hi: "द्वीप", bn: "দ্বীপ" },
  "Islands": { hi: "द्वीपसमूह", bn: "দ্বীপপুঞ্জ" }
};

// 3. Indian Personal Name Vocabulary
const NAME_VOCAB = {
  "Aritra": { hi: "अरित्र", bn: "অরিত্র" },
  "Adak": { hi: "आदक", bn: "আদক" },
  "Kalyan": { hi: "कल्याण", bn: "কল্যাণ" },
  "Chakravarthy": { hi: "चक्रवर्ती", bn: "চক্রবর্তী" },
  "Lakshmi": { hi: "लक्ष्मी", bn: "লক্ষ্মী" },
  "Prasanna": { hi: "प्रसन्ना", bn: "প্রসন্না" },
  "Venkateswara": { hi: "वेंकटेश्वर", bn: "ভেঙ্কটেশ্বর" },
  "Rao": { hi: "राव", bn: "রাও" },
  "Anita": { hi: "अनीता", bn: "অনীতা" },
  "Sharma": { hi: "शर्मा", bn: "শর্মা" },
  "Ramesh": { hi: "रमेश", bn: "রমেশ" },
  "Kumar": { hi: "कुमार", bn: "কুমার" },
  "Sunita": { hi: "सुनीता", bn: "সুনীতা" },
  "Devi": { hi: "देवी", bn: "দেবী" },
  "Mohammad": { hi: "मोहम्मद", bn: "মহম্মদ" },
  "Ansari": { hi: "अंसारी", bn: "আনসারি" },
  "Abdul": { hi: "अब्दुल", bn: "আব্দুল" },
  "Khatri": { hi: "खत्री", bn: "খত্রী" },
  "Meera": { hi: "मीरा", bn: "মীরা" },
  "Bai": { hi: "बाई", bn: "বাঈ" },
  "Rajesh": { hi: "राजेश", bn: "রাজেশ" },
  "Patel": { hi: "पटेल", bn: "প্যাটেল" },
  "Suresh": { hi: "सुरेश", bn: "সুরেশ" },
  "Verma": { hi: "वर्मा", bn: "বর্মা" },
  "Subhash": { hi: "सुभाष", bn: "সুভাষ" },
  "Mukherjee": { hi: "मुखर्जी", bn: "মুখার্জি" },
  "Amit": { hi: "अमित", bn: "অমিত" },
  "Banerjee": { hi: "बनर्जी", bn: "ব্যানার্জি" },
  "Ratan": { hi: "रतन", bn: "রতন" },
  "Ghosh": { hi: "घोष", bn: "ঘোষ" },
  "Swapan": { hi: "स्वपन", bn: "স্বপন" },
  "Karmakar": { hi: "कर्मकार", bn: "কর্মকার" },
  "Bikash": { hi: "विकास", bn: "বিকাশ" },
  "Pal": { hi: "पाल", bn: "পাল" },
  "Sanjay": { hi: "संजय", bn: "সঞ্জয়" },
  "Sutradhar": { hi: "सूत्रधार", bn: "সূত্রধর" },
  "Pradip": { hi: "प्रदीप", bn: "প্রদীপ" },
  "Malakar": { hi: "मालाकार", bn: "মালাকার" },
  "Gourango": { hi: "गौरांग", bn: "গৌরাঙ্গ" },
  "Das": { hi: "दास", bn: "দাস" },
  "Dilip": { hi: "दिलीप", bn: "দিলীপ" },
  "Chitrakar": { hi: "चित्रकार", bn: "চিত্রকর" },
  "Manju": { hi: "मंजू", bn: "মঞ্জু" },
  "Shanti": { hi: "शांति", bn: "শান্তি" },
  "Radha": { hi: "राधा", bn: "রাধা" },
  "Rani": { hi: "रानी", bn: "রানী" },
  "Fatima": { hi: "फातिमा", bn: "ফাতিমা" },
  "Begum": { hi: "बेगम", bn: "বেগম" },
  "Gurpreet": { hi: "गुरप्रीत", bn: "গুরপ্রীত" },
  "Singh": { hi: "सिंह", bn: "সিংহ" },
  "Harpreet": { hi: "हरप्रीत", bn: "হরপ্রীত" },
  "Kaur": { hi: "कौर", bn: "কৌর" },
  "Tsering": { hi: "त्सेरिंग", bn: "সেরিং" },
  "Angchuk": { hi: "आंगचुक", bn: "আংচুক" },
  "Stanzin": { hi: "स्टैंजिन", bn: "স্ট্যানজিন" },
  "Dorjay": { hi: "दोरजे", bn: "দোরজে" }
};

// 4. Phonetic Transliteration Engine
const CONSONANTS = [
  ['shh', 'ष्', 'ষ'], ['chh', 'छ', 'ছ'], ['kh', 'ख', 'খ'], ['gh', 'घ', 'ঘ'],
  ['ch', 'च', 'চ'], ['jh', 'झ', 'ঝ'], ['th', 'थ', 'থ'], ['dh', 'ध', 'ধ'],
  ['ph', 'फ', 'ফ'], ['bh', 'भ', 'ভ'], ['sh', 'श', 'শ'], ['zh', 'झ़', 'ঝ'],
  ['k', 'क', 'ক'], ['g', 'ग', 'গ'], ['c', 'क', 'ক'], ['j', 'ज', 'জ'],
  ['t', 'त', 'ত'], ['d', 'द', 'দ'], ['n', 'न', 'ন'], ['p', 'प', 'প'],
  ['f', 'फ़', 'ফ'], ['b', 'ब', 'ব'], ['m', 'म', 'ম'], ['y', 'य', 'য'],
  ['r', 'र', 'র'], ['l', 'ल', 'ল'], ['v', 'व', 'ভ'], ['w', 'व', 'ও'],
  ['s', 'स', 'স'], ['h', 'ह', 'হ'], ['z', 'ज़', 'জ'], ['q', 'क', 'ক'],
  ['x', 'क्स', 'ক্স']
];

function transliteratePhonetic(word, target = 'hi') {
  if (!word) return '';

  if (CRAFT_VOCAB[word]) return CRAFT_VOCAB[word][target];
  if (PLACE_VOCAB[word]) return PLACE_VOCAB[word][target];
  if (NAME_VOCAB[word]) return NAME_VOCAB[word][target];

  const w = word.toLowerCase();

  const initVowels = target === 'hi' ? {
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

  while (i < w.length) {
    let matchedVowel = null;
    for (const v of ['aa', 'ee', 'oo', 'ai', 'au', 'a', 'i', 'u', 'e', 'o']) {
      if (w.startsWith(v, i)) {
        matchedVowel = v;
        break;
      }
    }

    if (matchedVowel) {
      if (prevIsConsonant) {
        if (matchedVowel === 'a' && i + 1 === w.length && res.length > 2) {
          res += target === 'hi' ? 'ा' : 'া';
        } else {
          res += matras[matchedVowel];
        }
      } else {
        res += initVowels[matchedVowel];
      }
      i += matchedVowel.length;
      prevIsConsonant = false;
      continue;
    }

    let matchedC = null;
    for (const [seq, hiChar, bnChar] of CONSONANTS) {
      if (w.startsWith(seq, i)) {
        matchedC = { seq, char: target === 'hi' ? hiChar : bnChar };
        break;
      }
    }

    if (matchedC) {
      res += matchedC.char;
      i += matchedC.seq.length;
      prevIsConsonant = true;
      continue;
    }

    res += w[i];
    i++;
    prevIsConsonant = false;
  }

  return res;
}

export function translateString(phrase, target = 'hi') {
  if (!phrase || typeof phrase !== 'string') return phrase;

  if (CRAFT_VOCAB[phrase]) return CRAFT_VOCAB[phrase][target];
  if (PLACE_VOCAB[phrase]) return PLACE_VOCAB[phrase][target];
  if (NAME_VOCAB[phrase]) return NAME_VOCAB[phrase][target];

  if (phrase.includes(',')) {
    return phrase.split(',').map(p => translateString(p.trim(), target)).join(', ');
  }
  if (phrase.includes('/')) {
    return phrase.split('/').map(p => translateString(p.trim(), target)).join(' / ');
  }
  if (phrase.includes('&')) {
    return phrase.split('&').map(p => translateString(p.trim(), target)).join(target === 'hi' ? ' एवं ' : ' ও ');
  }

  return phrase.split(/\s+/).map(t => {
    if (CRAFT_VOCAB[t]) return CRAFT_VOCAB[t][target];
    if (PLACE_VOCAB[t]) return PLACE_VOCAB[t][target];
    if (NAME_VOCAB[t]) return NAME_VOCAB[t][target];
    return transliteratePhonetic(t, target);
  }).join(' ');
}

// Generate full translations for all items in inventory
const craftsMap = {};
for (const c of inv.crafts) {
  craftsMap[c] = {
    en: c,
    hi: translateString(c, 'hi'),
    bn: translateString(c, 'bn')
  };
}

const districtsMap = {};
for (const d of inv.districts) {
  districtsMap[d] = {
    en: d,
    hi: translateString(d, 'hi'),
    bn: translateString(d, 'bn')
  };
}

const namesMap = {};
for (const n of inv.names) {
  namesMap[n] = {
    en: n,
    hi: translateString(n, 'hi'),
    bn: translateString(n, 'bn')
  };
}

// Merge PLACE_VOCAB into districtsMap
for (const [place, trans] of Object.entries(PLACE_VOCAB)) {
  districtsMap[place] = {
    en: place,
    hi: trans.hi,
    bn: trans.bn
  };
}

// Merge NAME_VOCAB into namesMap
namesMap["Aritra Adak"] = {
  en: "Aritra Adak",
  hi: "अरित्र आदक",
  bn: "অরিত্র আদক"
};
namesMap["Aritra"] = {
  en: "Aritra",
  hi: "अरित्र",
  bn: "অরিত্র"
};
namesMap["Adak"] = {
  en: "Adak",
  hi: "आदक",
  bn: "আদক"
};
for (const [name, trans] of Object.entries(NAME_VOCAB)) {
  namesMap[name] = {
    en: name,
    hi: trans.hi,
    bn: trans.bn
  };
}

// Merge CRAFT_VOCAB into craftsMap
for (const [craft, trans] of Object.entries(CRAFT_VOCAB)) {
  if (!craftsMap[craft]) {
    craftsMap[craft] = {
      en: craft,
      hi: trans.hi,
      bn: trans.bn
    };
  }
}

// Build consolidated token lookup for runtime transliteration
const tokenLookup = {};
for (const [k, v] of Object.entries(CRAFT_VOCAB)) {
  if (!k.includes(' ')) tokenLookup[k.toLowerCase()] = v;
}
for (const [k, v] of Object.entries(PLACE_VOCAB)) {
  if (!k.includes(' ')) tokenLookup[k.toLowerCase()] = v;
}
for (const [k, v] of Object.entries(NAME_VOCAB)) {
  if (!k.includes(' ')) tokenLookup[k.toLowerCase()] = v;
}
tokenLookup["aritra"] = { hi: "अरित्र", bn: "অরিত্র" };
tokenLookup["adak"] = { hi: "आदक", bn: "আদক" };
tokenLookup["kolkata"] = { hi: "कोलकाता", bn: "কলকাতা" };

// Write src/constants/culturalTranslations.js cleanly
const outParts = [];
outParts.push(`/**
 * KARIGAR Indian Cultural Entity Localization Map
 * Contains explicit, standardized mappings for:
 * 1. 37 States and Union Territories
 * 2. 13 Canonical Craft Categories
 * 3. 340 Regional Craft Types
 * 4. 271 Verified Districts and Cultural Hubs
 * 5. 370 Master Artisan and Patron Names
 * 
 * Includes high-performance, deterministic presentation-level helpers.
 */
`);

outParts.push('export const STATE_TRANSLATIONS = ' + JSON.stringify(STATE_TRANSLATIONS, null, 2) + ';\n');
outParts.push('export const CATEGORY_TRANSLATIONS = ' + JSON.stringify(CATEGORY_TRANSLATIONS, null, 2) + ';\n');
outParts.push('export const CRAFT_TRANSLATIONS = ' + JSON.stringify(craftsMap, null, 2) + ';\n');
outParts.push('export const DISTRICT_TRANSLATIONS = ' + JSON.stringify(districtsMap, null, 2) + ';\n');
outParts.push('export const NAME_TRANSLATIONS = ' + JSON.stringify(namesMap, null, 2) + ';\n');
outParts.push('export const TOKEN_LOOKUP = ' + JSON.stringify(tokenLookup, null, 2) + ';\n');

outParts.push(`
const CONSONANTS = [
  ['shh', 'ष्', 'ষ'], ['chh', 'छ', 'ছ'], ['kh', 'ख', 'খ'], ['gh', 'घ', 'ঘ'],
  ['ch', 'च', 'চ'], ['jh', 'झ', 'ঝ'], ['th', 'थ', 'থ'], ['dh', 'ध', 'ধ'],
  ['ph', 'फ', 'ফ'], ['bh', 'भ', 'ভ'], ['sh', 'श', 'শ'], ['zh', 'झ़', 'ঝ'],
  ['k', 'क', 'ক'], ['g', 'ग', 'গ'], ['c', 'क', 'ক'], ['j', 'ज', 'জ'],
  ['t', 'त', 'ত'], ['d', 'द', 'দ'], ['n', 'न', 'ন'], ['p', 'प', 'প'],
  ['f', 'फ़', 'ফ'], ['b', 'ब', 'ব'], ['m', 'म', 'ম'], ['y', 'य', 'য'],
  ['r', 'र', 'র'], ['l', 'ल', 'ল'], ['v', 'व', 'ভ'], ['w', 'व', 'ও'],
  ['s', 'स', 'স'], ['h', 'ह', 'হ'], ['z', 'ज़', 'জ'], ['q', 'क', 'ক'],
  ['x', 'क्स', 'ক্স']
];

export function transliterateText(phrase, lang = 'en') {
  if (!phrase || typeof phrase !== 'string' || lang === 'en') return phrase || '';
  const target = lang.startsWith('bn') ? 'bn' : (lang.startsWith('hi') ? 'hi' : 'en');
  if (target === 'en') return phrase;

  if (phrase.includes(',')) {
    return phrase.split(',').map(p => transliterateText(p.trim(), target)).join(', ');
  }
  if (phrase.includes('/')) {
    return phrase.split('/').map(p => transliterateText(p.trim(), target)).join(' / ');
  }
  if (phrase.includes('&')) {
    return phrase.split('&').map(p => transliterateText(p.trim(), target)).join(target === 'hi' ? ' एवं ' : ' ও ');
  }

  const initVowels = target === 'hi' ? {
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

  return phrase.split(/\\s+/).map(token => {
    const w = token.toLowerCase();
    const known = TOKEN_LOOKUP[w];
    if (known) return target === 'hi' ? known.hi : known.bn;
    let res = '';
    let i = 0;
    let prevIsConsonant = false;

    while (i < w.length) {
      let matchedVowel = null;
      for (const v of ['aa', 'ee', 'oo', 'ai', 'au', 'a', 'i', 'u', 'e', 'o']) {
        if (w.startsWith(v, i)) {
          matchedVowel = v;
          break;
        }
      }

      if (matchedVowel) {
        if (prevIsConsonant) {
          if (matchedVowel === 'a' && i + 1 === w.length && res.length > 2) {
            res += target === 'hi' ? 'ा' : 'া';
          } else {
            res += matras[matchedVowel];
          }
        } else {
          res += initVowels[matchedVowel];
        }
        i += matchedVowel.length;
        prevIsConsonant = false;
        continue;
      }

      let matchedC = null;
      for (const [seq, hiChar, bnChar] of CONSONANTS) {
        if (w.startsWith(seq, i)) {
          matchedC = { seq, char: target === 'hi' ? hiChar : bnChar };
          break;
        }
      }

      if (matchedC) {
        res += matchedC.char;
        i += matchedC.seq.length;
        prevIsConsonant = true;
        continue;
      }

      res += w[i];
      i++;
      prevIsConsonant = false;
    }

    return res;
  }).join(' ');
}

export function translateState(state, lang = 'en') {
  if (!state || typeof state !== 'string') return '';
  const cleanLang = (lang || 'en').split('-')[0];
  if (cleanLang === 'en') return state;
  const match = STATE_TRANSLATIONS[state.trim()];
  if (match && match[cleanLang]) return match[cleanLang];
  return transliterateText(state, cleanLang);
}

export function translateCategory(category, lang = 'en') {
  if (!category || typeof category !== 'string') return '';
  const cleanLang = (lang || 'en').split('-')[0];
  if (cleanLang === 'en') return category;
  const match = CATEGORY_TRANSLATIONS[category.trim()];
  if (match && match[cleanLang]) return match[cleanLang];
  return transliterateText(category, cleanLang);
}

export function translateCraftType(craftType, lang = 'en') {
  if (!craftType || typeof craftType !== 'string') return '';
  const cleanLang = (lang || 'en').split('-')[0];
  if (cleanLang === 'en') return craftType;
  const match = CRAFT_TRANSLATIONS[craftType.trim()];
  if (match && match[cleanLang]) return match[cleanLang];
  return transliterateText(craftType, cleanLang);
}

export function translateDistrict(district, lang = 'en') {
  if (!district || typeof district !== 'string') return '';
  const cleanLang = (lang || 'en').split('-')[0];
  if (cleanLang === 'en') return district;
  const match = DISTRICT_TRANSLATIONS[district.trim()];
  if (match && match[cleanLang]) return match[cleanLang];
  return transliterateText(district, cleanLang);
}

export function translatePersonName(name, lang = 'en') {
  if (!name || typeof name !== 'string') return '';
  const cleanLang = (lang || 'en').split('-')[0];
  if (cleanLang === 'en') return name;
  const match = NAME_TRANSLATIONS[name.trim()];
  if (match && match[cleanLang]) return match[cleanLang];
  return transliterateText(name, cleanLang);
}
`);

fs.writeFileSync('./src/constants/culturalTranslations.js', outParts.join(''));
console.log('Successfully written src/constants/culturalTranslations.js');
