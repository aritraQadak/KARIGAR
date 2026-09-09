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

// 1. STATES TRANSLATIONS
const statesData = [
  {
    slug: 'haryana',
    name: { en: 'Haryana', hi: 'हरियाणा', bn: 'হরিয়ানা' },
    desc: {
      en: 'Land of sacred looms, intricate Phulkari embroidery weaves, and ancient terracotta metalworks.',
      hi: 'पवित्र करघों, जटिल फुलकारी कढ़ाई और प्राचीन टेराकोटा धातुकला की भूमि।',
      bn: 'পবিত্র তাঁত, জটিল ফুলকারি বয়ন এবং প্রাচীন পোড়ামাটির ধাতশিল্পের দেশ।'
    }
  },
  {
    slug: 'himachal-pradesh',
    name: { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश', bn: 'হিমাচল প্রদেশ' },
    desc: {
      en: 'High-altitude Himalayan weaves, famed Kullu shawls, Chamba rumals, and intricate wood carving traditions.',
      hi: 'उच्च हिमालयी बुनाई, प्रसिद्ध कुल्लू शॉल, चंबा रुमाल और जटिल काष्ठ नक्काशी परंपराएं।',
      bn: 'উচ্চ হিমালয়ের বয়ন ঐতিহ্য, বিখ্যাত কুল্লু শাল, চাম্বা রুমাল এবং সূক্ষ্ম কাঠের খোদাই কাজ।'
    }
  },
  {
    slug: 'punjab',
    name: { en: 'Punjab', hi: 'पंजाब', bn: 'পাঞ্জাব' },
    desc: {
      en: 'Vibrant land of golden Phulkari gardens, handcrafted Jutti footwear, and royal brass inlay crafts.',
      hi: 'सुनहरे फुलकारी बागों, हस्तनिर्मित जूती और शाही पीतल जड़ाई शिल्प की जीवंत भूमि।',
      bn: 'সোনালী ফুলকারি বাগান, হস্তনির্মিত জুতি এবং রাজকীয় পিতলের ইনলে শিল্পের প্রাণবন্ত ভূমি।'
    }
  },
  {
    slug: 'rajasthan',
    name: { en: 'Rajasthan', hi: 'राजस्थान', bn: 'রাজস্থান' },
    desc: {
      en: 'Royal desert kingdom celebrated for Jaipur Blue Pottery, Ajrakh & Dabu block prints, and Marwar miniature painting.',
      hi: 'जयपुर ब्लू पॉटरी, अजरक व डाबू ब्लॉक प्रिंट और मारवाड़ लघुचित्रों के लिए प्रसिद्ध शाही मरुभूमि राज्य।',
      bn: 'জয়পুর ব্লু পটারি, অজরখ ও ডাবু ব্লক প্রিন্ট এবং মারওয়াড় রৈখিক ক্ষুদ্রচিত্রের জন্য বিখ্যাত রাজকীয় মরুভূমি।'
    }
  },
  {
    slug: 'uttar-pradesh',
    name: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', bn: 'উত্তর প্রদেশ' },
    desc: {
      en: 'Sacred cradle of Banarasi brocade weaves, delicate Chikankari white needlecraft, and Firozabad glass art.',
      hi: 'बनारसी ज़री ब्रोकेड बुनाई, नाज़ुक चिकनकारी सफेद कढ़ाई और फिरोजाबाद कांच कला का पवित्र केंद्र।',
      bn: 'বারাণসী ব্রোকেড বয়ন, সূক্ষ্ম চিকনকারী সাদা সেলাই শিল্প এবং ফিরোজাবাদ কাঁচ শিল্পের ঐতিহ্যবাহী কেন্দ্র।'
    }
  },
  {
    slug: 'uttarakhand',
    name: { en: 'Uttarakhand', hi: 'उत्तराखंड', bn: 'উত্তরাখণ্ড' },
    desc: {
      en: 'Alpine sanctuary of Aipan geometric floor frescoes, Ringal bamboo weaving, and Himalayan sheep wool blankets.',
      hi: 'ऐपण ज्यामितीय अल्पना, रिंगाल बांस बुनाई और हिमालयी भेड़ की ऊन के कंबलों का पर्वतीय अभयारण्य।',
      bn: 'ঐপণ জ্যামিতিক নকশা, রিঙ্গাল বাঁশ বয়ন এবং হিমালয় ভেড়ার উল কম্বলের ঐতিহ্যবাহী পার্বত্য স্থান।'
    }
  },
  {
    slug: 'andhra-pradesh',
    name: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', bn: 'অন্ধ্র প্রদেশ' },
    desc: {
      en: 'Home of Kalamkari hand-painted temple scrolls, Uppada Jamdani weaves, and Kondapalli wooden toys.',
      hi: 'कलमकारी हस्तनिर्मित मंदिर स्क्रॉल, उप्पड़ा जमदानी बुनाई और कोंडापल्ली लकड़ी के खिलौनों की पावन धरा।',
      bn: 'কলমকারী হস্তচিত্রিত পটচিত্র, উপ্পাদা জামদানি শাড়ি এবং কোণ্ডাপল্লী কাঠের খেলনার কেন্দ্র।'
    }
  },
  {
    slug: 'karnataka',
    name: { en: 'Karnataka', hi: 'कर्नाटक', bn: 'কর্ণাটক' },
    desc: {
      en: 'Kingdom of Mysore pure mulberry silk, Bidriware silver inlay, and Channapatna wooden craft.',
      hi: 'मैसूर शुद्ध रेशम बुनाई, बिदरीवेयर चांदी की जड़ाई और चन्नापटना लकड़ी शिल्प का समृद्ध साम्राज्य।',
      bn: 'মাইসোর সিল্ক বয়ন, বিদরীওয়্যার রূপার ইনলে এবং চন্নাপাটনা কাঠের কারুশিল্পের ঐতিহ্যবাহী রাজ্য।'
    }
  },
  {
    slug: 'kerala',
    name: { en: 'Kerala', hi: 'केरल', bn: 'কেরালা' },
    desc: {
      en: 'Coastal haven of Kasaravu golden-bordered sarees, Aranmula metal mirrors, and Screw-pine weaving.',
      hi: 'कसरावू सुनहरे बॉर्डर वाली साड़ियों, आराणमुला धातु दर्पण और स्क्रूपाइन बुनाई का तटीय स्वर्ग।',
      bn: 'কাসারাভু সোনালী পাড় শাড়ি, আরানমুলা ধাতুর আয়না এবং কেয়া পাতার বয়নের তটরেখা।'
    }
  },
  {
    slug: 'tamil-nadu',
    name: { en: 'Tamil Nadu', hi: 'तमिलनाडु', bn: 'তামিলনাড়ু' },
    desc: {
      en: 'Loom capital of heavy Kanchipuram silk sarees, Toda tribal embroidery, and Tanjore gold leaf art.',
      hi: 'भारी कांजीवरम सिल्क साड़ियों, टोडा जनजातीय कढ़ाई और तंजावुर स्वर्ण पत्र कला की राजधानी।',
      bn: 'ঐতিহ্যবাহী কাঞ্চিপুরম রেশম শাড়ি, তোডা উপজাতীয় সেলাই এবং তাঞ্জাবুর স্বর্ণপত্র চিত্রকলার রাজধানী।'
    }
  },
  {
    slug: 'telangana',
    name: { en: 'Telangana', hi: 'तेलंगाना', bn: 'তেলেঙ্গানা' },
    desc: {
      en: 'Birthplace of Pochampally Ikat resist-dyeing, Pembarthi sheet metalwork, and Cheriyal scroll painting.',
      hi: 'पोचमपल्ली इकत प्रतिरोधी रंगाई, पेम्बरती धातु कला और चेरियाल स्क्रॉल चित्रों की जन्मभूमि।',
      bn: 'পোচমপল্লী ইকত বয়িন, পেম্বারতী ধাতব শিল্প এবং চেরিয়াল পটচিত্রের জন্মস্থান।'
    }
  },
  {
    slug: 'bihar',
    name: { en: 'Bihar', hi: 'बिहार', bn: 'বিহার' },
    desc: {
      en: 'Land of Madhubani Mithila wall paintings, Bhagalpur Tussar silk, and Sujani embroidered quilts.',
      hi: 'मधुबनी मिथिला लोकचित्र, भागलपुर टसर रेशम और सुजनी कढ़ाईदार कंबलों की ऐतिहासिक भूमि।',
      bn: 'মধুবনী মিথিলা লোকচিত্রকলা, ভাগলপুর তসর রেশম এবং সুজনি সেলাই কাঁথার ঐতিহ্যবাহী দেশ।'
    }
  },
  {
    slug: 'jharkhand',
    name: { en: 'Jharkhand', hi: 'झारखंड', bn: 'ঝাড়খণ্ড' },
    desc: {
      en: 'Forest realm of Sohrai & Khovar tribal wall art, Kuchai tussar silk, and Pyatkar scroll drawings.',
      hi: 'सोहराई व खोवर जनजातीय भित्तिचित्रों, कुचाई टसर सिल्क और प्यातकर स्क्रॉल कला का अरण्य क्षेत्र।',
      bn: 'সোহরাই ও খোভার উপজাতীয় দেয়ালচিত্র, কুচাই তসর রেশম এবং প্যাতকর পটচিত্রের বনভূমি।'
    }
  },
  {
    slug: 'odisha',
    name: { en: 'Odisha', hi: 'ओडिशा', bn: 'ওড়িশা' },
    desc: {
      en: 'Sacred coastal land of Sambalpuri Bandha Ikat, Pattachitra palm leaf paintings, and Silver Filigree.',
      hi: 'संभलपुरी बांधा इकत, पट्टचित्र ताड़पत्र चित्रकला और कटक चांदी तारकशी की पवित्र तटीय भूमि।',
      bn: 'সম্বলপুরী বান্ধা ইকত, পট্টচিত্র তালপাতা চিত্র এবং রুপোর তারকশি কাজের পবিত্র উপকূল।'
    }
  },
  {
    slug: 'west-bengal',
    name: { en: 'West Bengal', hi: 'पश्चिम बंगाल', bn: 'পশ্চিমবঙ্গ' },
    desc: {
      en: 'Cultural bastion of narrative Nakshi Kantha embroideries, Shantipur Jamdani muslins, and Bankura Terracotta.',
      hi: 'नक्शी कांथा कढ़ाई, शांतिपुर जमदानी मलमल और बांकुरा टेराकोटा की सांस्कृतिक धरोहर।',
      bn: 'নকশী কাঁথার কাহিনী বয়ন, শান্তিপুরী জামদানি মসলিন এবং বাঁকুড়া পোড়ামাটির রূপময় সংস্কৃতি।'
    }
  },
  {
    slug: 'goa',
    name: { en: 'Goa', hi: 'गोवा', bn: 'গোয়া' },
    desc: {
      en: 'Coastal craft enclave of Kunbi tribal weaves, Azulejos ceramic tiles, and coconut shell carving.',
      hi: 'कुनबी जनजातीय बुनाई, अजुलेजोस चीनी मिट्टी की टाइलों और नारियल खोल नक्काशी का तटीय क्षेत्र।',
      bn: 'কুনবি উপজাতীয় তাঁত, আজুলেজোস সিরামিক টাইলস এবং নারকেল মালাই খোদাই শিল্পের উপকূলীয় নিদর্শণ।'
    }
  },
  {
    slug: 'gujarat',
    name: { en: 'Gujarat', hi: 'गुजरात', bn: 'গুজরাট' },
    desc: {
      en: 'Vibrant craft kingdom of Ajrakh block prints, Patan Patola double Ikat, and Kutchi mirror embroidery.',
      hi: 'अजरक ब्लॉक प्रिंट, पाटन पटोला डबल इकत और कच्छी शीशा कढ़ाई का जीवंत शिल्प साम्राज्य।',
      bn: 'অজরখ ব্লক প্রিন্ট, পাটন পাটোলা ডাবল ইকত এবং কচ্ছের আয়না সেলাই কাজের রূপময় রাজ্য।'
    }
  },
  {
    slug: 'maharashtra',
    name: { en: 'Maharashtra', hi: 'महाराष्ट्र', bn: 'মহারাষ্ট্র' },
    desc: {
      en: 'Cradle of royal Paithani peacock sarees, Warli tribal wall frescoes, and Kolhapuri leather chappals.',
      hi: 'पैठणी मयूर साड़ियों, वारली जनजातीय भित्तिचित्रों और कोल्हापुरी चमड़े की चप्पलों की भूमि।',
      bn: 'পৈঠানী ময়ূর নকশা শাড়ি, ওয়ারলি উপজাতীয় দেয়ালচিত্র এবং কোলহাপুরী চামড়ার চটি জুতার কেন্দ্র।'
    }
  },
  {
    slug: 'chhattisgarh',
    name: { en: 'Chhattisgarh', hi: 'छत्तीसगढ़', bn: 'ছত্তিশগড়' },
    desc: {
      en: 'Tribal heartland of Bell Metal Dhokra casting, Kosa tussar silk, and Godna tattoo painting.',
      hi: 'बेल मेटल ढोकरा ढलाई, कोसा टसर रेशम और गोदना टैटू चित्रकला का जनजातीय हृदयस्थल।',
      bn: 'বেল মেটাল ঢোকরা ঢালাই, কোসা তসর রেশম এবং গোদনা ট্যাটু চিত্রকলার উপজাতীয় প্রাণকেন্দ্র।'
    }
  },
  {
    slug: 'madhya-pradesh',
    name: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', bn: 'মধ্যপ্রদেশ' },
    desc: {
      en: 'Historic realm of Chanderi sheer sarees, Maheshwari weaves, and Gond folk art painting.',
      hi: 'चंदेरी पारदर्शी साड़ियों, महेश्वरी बुनाई और गोंड लोक कला चित्रों की ऐतिहासिक भूमि।',
      bn: 'চন্দেরী সূক্ষ্ম শাড়ি, মহেশ্বরী বয়ন এবং গোণ্ড লোকচিত্রকলার ঐতিহাসিক রাজ্য।'
    }
  },
  {
    slug: 'arunachal-pradesh',
    name: { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश', bn: 'অরুনাচল প্রদেশ' },
    desc: {
      en: 'Highland realm of Apatani geometric weaves, Monpa handmade paper, and tribal woodcarving.',
      hi: 'आपतानी ज्यामितीय बुनाई, मोनपा हस्तनिर्मित कागज और जनजातीय काष्ठ नक्काशी का पर्वतीय क्षेत्र।',
      bn: 'আপাতানি জ্যামিতিক বয়ন, মনপা হাতে তৈরি কাগজ এবং উপজাতীয় কাঠ খোদাই শিল্প।'
    }
  },
  {
    slug: 'assam',
    name: { en: 'Assam', hi: 'असम', bn: 'অসম' },
    desc: {
      en: 'Valley of golden Muga silk, Eri ahimsa silk, Jaapi bamboo hats, and Majuli traditional masks.',
      hi: 'सुनहरे मूगा सिल्क, एरी अहिंसा रेशम, जापी बांस की टोपियों और माजुली मुखौटों की ब्रह्मपुत्र घाटी।',
      bn: 'সোনালী মুগা রেশম, এরি অহিংস রেশম, জাপি বাঁশের টুপি এবং মাজুলির ঐতিহ্যবাহী মুখোশের উপত্যকা।'
    }
  },
  {
    slug: 'manipur',
    name: { en: 'Manipur', hi: 'मणिपुर', bn: 'মণিপুর' },
    desc: {
      en: 'Land of Shaphee Lanphee lotus weaves, Kauna reed craft, and Longpi black earthenware.',
      hi: 'शाफी लांफी कमल बुनाई, कौना रीड शिल्प और लोंगपी काले मृद्भांडों की मनमोहक भूमि।',
      bn: 'শাফি লাংফি পদ্ম সুতা বয়ন, কৌনা কাঠির কারুশিল্প এবং লোংপি কালো পোড়ামাটির পাত্রের দেশ।'
    }
  },
  {
    slug: 'meghalaya',
    name: { en: 'Meghalaya', hi: 'मेघालय', bn: 'মেঘালয়' },
    desc: {
      en: 'Abode of Ryndia organic Eri silk, cane weaving, and Khasi bamboo architecture.',
      hi: 'रिंगडिया जैविक एरी रेशम, केन बांस बुनाई और खासी बांस स्थापत्य का सुरम्य धाम।',
      bn: 'রিন্ডিয়া প্রাকৃতিক এরি রেশম, বেতের বয়ন এবং খাসি বাঁশ স্থাপত্যের শান্ত রাজ্য।'
    }
  },
  {
    slug: 'mizoram',
    name: { en: 'Mizoram', hi: 'मिजोरम', bn: 'মিজোরাম' },
    desc: {
      en: 'Highland kingdom of Puan complex striped weaves, cane baskets, and Bamboo dance crafts.',
      hi: 'पुआन जटिल धारीदार बुनाई, बांस की टोकरियों और पर्वतीय लोक शिल्प का प्राकृतिक धाम।',
      bn: 'পুআন জটিল স্ট্রাইপ বয়ন, বেতের ঝুড়ি এবং বাঁশের নৃত্যের ঐতিহ্যবাহী পার্বত্য অঞ্চল।'
    }
  },
  {
    slug: 'nagaland',
    name: { en: 'Nagaland', hi: 'नागालैंड', bn: 'নাগাল্যান্ড' },
    desc: {
      en: 'Naga warrior shawls, intricate beadwork, and bamboo drinking mugs.',
      hi: 'नागा योद्धा शॉल, नाज़ुक मनके का काम और बांस के पार पारंपरिक पात्र।',
      bn: 'নাগা যোদ্ধা শাল, সূক্ষ্ম পুঁতির কাজ এবং বাঁশের তৈরি ঐতিহ্যবাহী পাত্র।'
    }
  },
  {
    slug: 'sikkim',
    name: { en: 'Sikkim', hi: 'सिक्किम', bn: 'সিকিম' },
    desc: {
      en: 'Alpine realm of Bhutia carpet weaving, Choktse carved tables, and Lepcha handlooms.',
      hi: 'भूटिया कालीन बुनाई, चोकत्से नक्काशीदार मेजों और लेपचा हथकरघा का अलौकिक पर्वतीय क्षेत्र।',
      bn: 'ভুটিয়া গালিচা বয়ন, চোকৎসে খোদাই করা টেবিল এবং লেপচা তাঁত শিল্পের অপূর্ব রূপ।'
    }
  },
  {
    slug: 'tripura',
    name: { en: 'Tripura', hi: 'त्रिपुरा', bn: 'ত্রিপুরা' },
    desc: {
      en: 'Haven of Risa & Rignai textiles, bamboo furniture, and cane basketry.',
      hi: 'रीसा व रिगनाई परिधानों, बांस के फर्नीचर और केन बुनाई की खूबसूरत भूमि।',
      bn: 'রিসা ও রিগনই পোশাক, বাঁশের আসবাবপত্র এবং বেতের কাজের সুন্দর রূপ।'
    }
  },
  {
    slug: 'andaman-nicobar',
    name: { en: 'Andaman & Nicobar Islands', hi: 'अंडमान और निकोबार द्वीप समूह', bn: 'আন্দামান ও নিকোবর দ্বীপপুঞ্জ' },
    desc: {
      en: 'Island arc of Nicobari mat weaving, shell craft jewellery, and padauk woodcarving.',
      hi: 'निकोबारी चटाई बुनाई, शंख व सीप आभूषणों और पड़ौक लकड़ी नक्काशी का द्वीप समूह।',
      bn: 'নিকোবোরি মাদুর বয়ন, শামুক-ঝিনুক গহনা এবং পদাউক কাঠ খোদাই করা দ্বীপপুঞ্জ।'
    }
  },
  {
    slug: 'chandigarh',
    name: { en: 'Chandigarh', hi: 'चंडीगढ़', bn: 'চণ্ডীগড়' },
    desc: {
      en: 'Heritage hub of Phulkari embroidery, Punjabi jutti, and modern pottery collectives.',
      hi: 'फुलकारी कढ़ाई, पंजाबी जूती और आधुनिक पॉटरी संग्रहों का स्थापत्य केंद्र।',
      bn: 'ফুলকারি সেলাই, পাঞ্জাবী জুতি এবং আধুনিক মৃৎশিল্পের স্থাপত্য শহর।'
    }
  },
  {
    slug: 'daman-diu-dadra',
    name: { en: 'Daman, Diu & Nagar Haveli', hi: 'दमन, दीव और नगर हवेली', bn: 'দমন, দিউ ও নগর হাভেলি' },
    desc: {
      en: 'Coastal hub of Portuguese-influenced lace embroidery, shell crafts, and palm mat weaving.',
      hi: 'पुर्तगाली प्रभावित लेस कढ़ाई, शंख शिल्प और खजूर चटाई बुनाई का तटीय क्षेत्र।',
      bn: 'পর্তুগিজ প্রভাবান্বিত লেইস সেলাই, ঝিনুক শিল্প এবং খেজুর পাতার মাদুর বয়ন।'
    }
  },
  {
    slug: 'delhi',
    name: { en: 'Delhi (NCT)', hi: 'दिल्ली (राष्ट्रीय राजधानी)', bn: 'দিল্লি (জাতীয় রাজধানী অঞ্চল)' },
    desc: {
      en: 'Imperial capital of Zardozi gold thread embroidery, Mughal miniature art, and ivory-style wood inlay.',
      hi: 'ज़रदोज़ी सोने के तार की कढ़ाई, मुग़ल लघुचित्रों और हाथीदांत शैली लकड़ी जड़ाई की ऐतिहासिक राजधानी।',
      bn: 'জারদোজি সোনার সুতার সেলাই, মুঘল ক্ষুদ্রচিত্র এবং কাঠের ইনলে কাজের ঐতিহাসিক রাজধানী।'
    }
  },
  {
    slug: 'jammu-kashmir',
    name: { en: 'Jammu & Kashmir', hi: 'जम्मू और कश्मीर', bn: 'জম্মু ও কাশ্মীর' },
    desc: {
      en: 'Crown land of Pashmina, Kani weave shawls, Papier-mâché, and Walnut woodcarving.',
      hi: 'पश्मीना, कानी शॉल बुनाई, पेपियर-माशे और अखरोट की लकड़ी की नक्काशी का मुकुटमणि।',
      bn: 'পশমিনা, কানি শাল বয়ন, পেপিয়ার-মাশে এবং আখরোট কাঠের খোদাই শিল্পের চিরন্তন মুকুট।'
    }
  },
  {
    slug: 'ladakh',
    name: { en: 'Ladakh', hi: 'लद्दाख', bn: 'লাদাখ' },
    desc: {
      en: 'High-altitude sanctuary of Pashmina wool spinning, Thangka scroll painting, and Nomad carpet weaves.',
      hi: 'पश्मीना ऊन कताई, थंगका स्क्रॉल चित्रकला और घुमंतू कालीन बुनाई का उच्च पर्वतीय अभयारण्य।',
      bn: 'পশমিনা উল কাটাই, থাংকা চিত্রপট এবং যাযাবর গালিচা বয়নের উচ্চ হিমালয় স্থান।'
    }
  },
  {
    slug: 'lakshadweep',
    name: { en: 'Lakshadweep', hi: 'लक्षद्वीप', bn: 'লক্ষদ্বীপ' },
    desc: {
      en: 'Coral archipelago of Coconut shell craft, coir fibre matting, and tortoise shell motifs.',
      hi: 'नारियल खोल शिल्प, नारियल जटा चटाई बुनाई और कछुआ खोल रूपांकनों का प्रवाल द्वीप समूह।',
      bn: 'নারকেল মালাই শিল্প, নারকেলের ছাল মাদুর বয়ন এবং ঝিনুক নকশার কোরাল দ্বীপ।'
    }
  },
  {
    slug: 'puducherry',
    name: { en: 'Puducherry', hi: 'पुडुचेरी', bn: 'পুদুচেরি' },
    desc: {
      en: 'Franco-Tamil enclave of handmade paper, terracotta figures, and natural dye batik.',
      hi: 'हस्तनिर्मित कागज, टेराकोटा मूर्तियों और प्राकृतिक रंग बाटिक का भारत-फ्रांसीसी तटीय केंद्र।',
      bn: 'হাতে তৈরি কাগজ, পোড়ামাটির প্রতিমা এবং প্রাকৃতিক রঙের বাটিকের ফরাসি-তামিল সংস্কৃতি।'
    }
  }
];

statesData.forEach(st => {
  setDeep(en, `buyer.data.states.${st.slug}.name`, st.name.en);
  setDeep(hi, `buyer.data.states.${st.slug}.name`, st.name.hi);
  setDeep(bn, `buyer.data.states.${st.slug}.name`, st.name.bn);

  setDeep(en, `buyer.data.states.${st.slug}.description`, st.desc.en);
  setDeep(hi, `buyer.data.states.${st.slug}.description`, st.desc.hi);
  setDeep(bn, `buyer.data.states.${st.slug}.description`, st.desc.bn);
});

// 2. PRODUCTS TRANSLATIONS
const productsData = [
  {
    id: 'wb-nk-042',
    name: { en: 'Radha-Krishna Narrative Nakshi Kantha Tapestry', hi: 'राधा-कृष्ण आख्यान नक्शी कांथा टेपेस्ट्री', bn: 'রাধা-কৃষ্ণ উপাখ্যান নকশী কাঁথা তাপেশ্রী' },
    desc: {
      en: 'Smt. Ananya Devi (National Award \'18). Hand-stitched running stitch on unbleached wild tussar silk depicting Krishna under the Kalpavriksha tree.',
      hi: 'श्रीमती अनन्या देवी (राष्ट्रीय पुरस्कार \'18)। कल्पवृक्ष के नीचे श्री कृष्ण को दर्शाती जंगली टसर सिल्क पर हाथ से की गई बारीक कांथा कढ़ाई।',
      bn: 'শ্রীমতী অনন্যা দেবী (জাতীয় পুরস্কার \'18)। বুনো তসর রেশমে হস্তনির্মিত সূক্ষ্ম নকশী কাঁথা সেলাইয়ে কল্পবৃক্ষের নিচে রাধা-কৃষ্ণের প্রেমগাথা।'
    },
    longStory: {
      title: { en: 'The Song of the Kadamba Bough', hi: 'कदंब की डाल का गीत', bn: 'কদমতলার অমর প্রেমগাথা' },
      text: {
        en: 'Embroidered over 180 uninterrupted dawns upon hand-beaten wild tussar silk, this singular narrative revives the pastoral divinity of Radha-Krishna under the Kalpavriksha (the eternal wishing tree). Every figure is meticulously shaped by microscopic running kantha stitches, layered to create tactile low-relief ripples across the cloth.',
        hi: 'हथकुटे जंगली टसर रेशम पर लगातार 180 भोर तक कढ़ी गई यह अनूठी कृति कल्पवृक्ष के नीचे राधा-कृष्ण के प्राकृतिक सौंदर्य को जीवंत करती है। प्रत्येक आकृति को सूक्ष्म कांथा टांकों द्वारा उभारा गया है।',
        bn: 'অখণ্ড ১৮০ দিনের সুনিপুণ পরিশ্রমে বুনো তসর রেশমের পটভূমিতে রচিত এই অনবদ্য নকশী কাঁথাটি রাধা-কৃষ্ণের চিরন্তন কদমতলার মিলনগাথাকে মূর্ত করে তুলেছে। বাংলার শতাব্দীপ্রাচীন সুজনী ভরাট ও সুক্ষ্ম কাঁথাস্টিচের বুননে সৃষ্ট প্রতিটি নকশা যেন পল্লীপ্রকৃতির এক নিবিড় উচ্চারণ।'
      }
    }
  },
  {
    id: 'wb-jamdani-01',
    name: { en: 'Nilambari Fine Cotton Jamdani Saree', hi: 'नीलांबरी बारीक सूती जमदानी साड़ी', bn: 'নীলাম্বরী সূক্ষ্ম সুতি জামদানি শাড়ি' },
    desc: {
      en: 'Master Weaver Debabrata Pal. Supplementary weft geometric and floral motif on gossamer 200s high-count handspun cotton muslin.',
      hi: 'मास्टर बुनकर देबव्रत पाल। 200s काउंट के महीन हाथ से कते सूती मलमल पर पूरक बाने से उकेरी गई ज्यामितीय व पुष्पीय बूटियां।',
      bn: 'মাস্টার তাঁতি দেবব্রত পাল। ২০০ কাউন্টের সূক্ষ্ম হাতে কাটা সুতি মসলিনে সম্পূরক টানা-বানের জ্যামিতিক ও ফুলদানি নকশা।'
    },
    longStory: {
      title: { en: 'Shadows on Gossamer Muslin', hi: 'मलमल पर उकेरी परछाइयां', bn: 'মেঘের ডানায় রূপালী নকশা' },
      text: {
        en: 'Jamdani weaving is an intangible cultural art form where intricate floral motifs are inserted thread-by-thread into the sheer cotton warp using delicate non-mechanized bamboo needles.',
        hi: 'जमदानी बुनाई एक अमूर्त सांस्कृतिक कला है जहां बांस की तीलियों से धागे-धागे को जोड़कर सूक्ष्म फूल-पत्तियां उकेरी जाती हैं।',
        bn: 'শান্তিপুরের ঐতিহাসিক পিট লুমের তাঁতে বোনা ২০০ কাউন্টের এই সূক্ষ্ম ঢাকাই জামদানী শাড়িটিতে রূপালী জারির কাজে ফুটিয়ে তোলা হয়েছে ঐতিহ্যবাহী কোণকা ও পন্নাহাজাড় বুটি।'
      }
    }
  },
  {
    id: 'wb-swarna-02',
    name: { en: 'Mythological Swarnachari Silk Saree', hi: 'पौराणिक स्वर्णचरी सिल्क साड़ी', bn: 'পৌরাণিক স্বর্ণচরী রেশম শাড়ি' },
    desc: {
      en: 'Master Artisan Ruma Pramanik. Gold and crimson silk brocade recreating Mahabharata battle scenes across the pallu.',
      hi: 'मास्टर कारीगर रूमा प्रमाणिक। पल्लू पर महाभारत के धर्मयुद्ध दृश्यों को उकेरने वाली स्वर्ण व लाल रेशम ब्रोकेड साड़ी।',
      bn: 'মাস্টার কারিগর রুমা প্রামাণিক। আঁচলে মহাভারতের কুরুক্ষেত্র যুদ্ধের চিত্র রূপালী ও সোনালী সুতায় নির্মিত অনবদ্য স্বর্নচরী।'
    },
    longStory: {
      title: { en: 'Chariots Woven in Gold Filament', hi: 'स्वर्ण तारों में बुने रथ', bn: 'সোনার সুতোয় আঁকা মহাভারত' },
      text: {
        en: 'Swarnachari sarees inherit the epic narrative traditions of Bishnupur, featuring pure gold-plated metallic thread brocading of Mahabharata and Ramayana scenes.',
        hi: 'स्वर्णचरी साड़ियां विष्णुपुर की पौराणिक आख्यान परंपरा को स्वर्णमयी ब्रोकेड धागों से जीवंत करती हैं।',
        bn: 'বিষ্ণুপুরের ঐতিহাসিক স্বর্নচরী শাড়িতে কুরুক্ষেত্রের রথের চাকা এবং গীতোপদেশের অলঙ্করণ সুচারুভাবে বোনা হয়েছে।'
      }
    }
  },
  {
    id: 'wb-terracotta-03',
    name: { en: 'Panchmura Long-Neck Terracotta Heritage Horse', hi: 'पंचमुरा लंबी गर्दन वाला टेराकोटा विरासत घोड़ा', bn: 'পঞ্চমুড়া লম্বা ঘাড়ের পোড়ামাটির ঐতিহ্যবাহী ঘোড়া' },
    desc: {
      en: 'Master Potter Baidyanath Kumbhakar. Hand-thrown and wood-fired natural clay votive horse with hollow segmented neck.',
      hi: 'मास्टर कुम्हार बैद्यनाथ कुंभकार। प्राकृतिक मिट्टी से निर्मित व लकड़ी की भट्टी में पकाया गया लंबी गर्दन का टेराकोटा घोड़ा।',
      bn: 'মাস্টার মৃৎশিল্পী বৈদ্যনাথ কুম্ভকার। প্রাকৃতিক লাল মাটি দিয়ে হাতে গড়া ও কাঠের ভাটিতে পোড়ানো বাঁকুড়ার ঐতিহ্যবাহী টেরাকোটা ঘোড়া।'
    },
    longStory: {
      title: { en: 'The Votive Earth of Panchmura', hi: 'पंचमुरा की पवित्र मृत्तिका', bn: 'বাঁকুড়ার পোড়ামাটির অমর রূপ' },
      text: {
        en: 'The Panchmura terracotta horse is the world-renowned symbol of Indian folk craft, handcrafted by traditional Kumbhakar artisans.',
        hi: 'पंचमुरा का टेराकोटा घोड़ा भारतीय लोक शिल्प का विश्व प्रसिद्ध प्रतीक है जिसे पारंपरिक कुंभकार तैयार करते हैं।',
        bn: 'পঞ্চমুড়ার পোড়ামাটির ঘোড়া ভারতীয় লোকশিল্পের এক অনন্য নিদর্শন যা দীর্ঘকাল ধরে গ্রাম বাংলার উপাসনা ও সৌন্দর্যের প্রতীক।'
      }
    }
  },
  {
    id: 'jk-pashmina-01',
    name: { en: 'Royal Shahus Kani Weave Pashmina Shawl', hi: 'शाही शाहूस कानी वीव पश्मीना शॉल', bn: 'রাজকীয় শাহুস কানি বয়নের পশমিনা শাল' },
    desc: {
      en: 'Master Weaver Ghulam Hassan Mir. Hand-woven on traditional looms using Changthangi grade-A pashmina with Kani wooden needles.',
      hi: 'मास्टर बुनकर गुलाम हसन मीर। चांगथांगी ग्रेड-ए पश्मीना और कानी की लकड़ी की तीलियों से हाथ से बुना गया शाही शॉल।',
      bn: 'মাস্টার তাঁতি গোলাম হাসান মীর। চাংথাঙ্গী গ্রেড-এ পশমিনা এবং কাঠের কাঠি দিয়ে হাতে বোনা অনন্য কাশ্মিরী কানি শাল।'
    },
    longStory: {
      title: { en: 'Whispers of the Changthang Plateau', hi: 'चांगथांग पठार की सरसराहट', bn: 'চাংথাং মালভূমির সোনার পশম' },
      text: {
        en: 'Hand-woven using wooden bobbins called Tujis according to coded Talim notation scripts passed down through generations in Srinagar.',
        hi: 'श्रीनगर में पीढ़ियों से चली आ रही तालीम की सांकेतिक भाषा के अनुसार लकड़ी की तुजी छड़ियों से बुना गया शॉल।',
        bn: 'শ্রীনগরের ঐতিহ্যবাহী তালিম লিপির সাহায্যে কাঠের সুচ দিয়ে বোনা অত্যন্ত সূক্ষ্ম ও উষ্ণ শাহুস পশমিনা শাল।'
      }
    }
  },
  {
    id: 'rj-bluepottery-01',
    name: { en: 'Jaipur Blue Pottery Royal Floral Urn', hi: 'जयपुर ब्लू पॉटरी शाही पुष्पीय कलश', bn: 'জয়পুর ব্লু পটারি রাজকীয় পুষ্প পাত্র' },
    desc: {
      en: 'Master Artisan Kripal Singh Studio. Clay-free quartz frit pottery with Persian cobalt blue arabesque painting.',
      hi: 'मास्टर कारीगर कृपाल सिंह स्टूडियो। बिना मिट्टी के क्वाार्ट्ज़ और पर्शियन कोबाल्ट ब्लू से तैयार हस्तचित्रित कलश।',
      bn: 'মাস্টার কারিগর কৃপাল সিং স্টুডিও। কাদা মাটি ছাড়া স্ফটিক কোয়ার্টজ ও পার্সিয়ান কোবাল্ট ব্লু হাতে আঁকা রাজকীয় ফুলদানি।'
    },
    longStory: {
      title: { en: 'The Turquoise Flame of Amber', hi: 'आमेर की फ़िरोज़ी ज्वाला', bn: 'জয়পুরের নীল মৃৎশিল্প' },
      text: {
        en: 'Jaipur Blue Pottery is unique as it uses no clay, made instead from Egyptian paste of powdered quartz stone and glass.',
        hi: 'जयपुर ब्लू पॉटरी अनूठी है क्योंकि इसमें मिट्टी का उपयोग नहीं होता, बल्कि यह क्वाार्ट्ज़ पत्थर और कांच के चूर्ण से बनती है।',
        bn: 'জয়পুর ব্লু পটারি মাটির পরিবর্তে কোয়ার্টজ পাথর গুঁড়ো করে তৈরি এক অপূর্ব পার্সিয়ান মোটিফযুক্ত শিল্পকর্ম।'
      }
    }
  },
  {
    id: 'up-chanderi-01',
    name: { en: 'Imperial Gold Zari Chanderi Silk Tissue Saree', hi: 'इंपीरियल गोल्ड ज़री चंदेरी सिल्क टिश्यू साड़ी', bn: 'ইম্পেরিয়াল গোল্ড জারি চন্দেরী রেশম টিস্যু শাড়ি' },
    desc: {
      en: 'Master Weaver Ramdas Ansari. Sheer silk-cotton woven with pure tested gold zari motifs.',
      hi: 'मास्टर बुनकर रामदास अंसारी। शुद्ध परीक्षित गोल्ड ज़री बूटियों से बुनी गई पारदर्शी सिल्क-कॉटन चंदेरी साड़ी।',
      bn: 'মাস্টার তাঁতি রামদাস আনসারী। খাঁটি সোনালী জারির বুটিযুক্ত স্বচ্ছ রেশম-সুতি চন্দেরী টিস্যু শাড়ি।'
    },
    longStory: {
      title: { en: 'Glimmer of the Malwa Kingdom', hi: 'मालवा साम्राज्य की चमक', bn: 'মালব রাজত্বের সোনার আলো' },
      text: {
        en: 'Chanderi weaving creates lightweight translucent fabrics embellished with delicate gold and silver zari buttis.',
        hi: 'चंदेरी बुनाई से बने हल्के और पारदर्शी वस्त्रों पर सोने-चांदी के तारों से बारीक बूटियां उकेरी जाती हैं।',
        bn: 'চন্দেরী তাঁতের আলো-ছায়াময় সূক্ষ্ম রেশম সুতায় বোনা সোনালী ও রূপালী জারির কাজ রাজকীয় আভিজাত্যের রূপ।'
      }
    }
  },
  {
    id: 'gj-ajrakh-01',
    name: { en: 'Ajrakhpur 16-Stage Natural Dye Block Print Stole', hi: 'अजरकपुर 16-चरणीय प्राकृतिक रंग ब्लॉक प्रिंट स्टोल', bn: 'অজরখপুর ১৬-ধাপের প্রাকৃতিক রঙের ব্লক প্রিন্ট স্টোল' },
    desc: {
      en: 'Shilp Guru Dr. Ismail M. Khatri. Natural indigo, madder, and iron-resist block print on Tussar silk.',
      hi: 'शिल्प गुरु डॉ. इस्माइल एम. खत्री। टसर सिल्क पर प्राकृतिक नील, मजीठ और लोहे से 16 चरणों में तैयार अजरक प्रिंट।',
      bn: 'শিল্প গুরু ডঃ ইসমাইল এম খত্রী। তসর রেশমে প্রাকৃতিক নীল, মঞ্জিষ্ঠা ও লোহার প্রলেপে ১৬টি ধাপে মুদ্রিত অজরখ স্টোল।'
    },
    longStory: {
      title: { en: 'Symphony of River and Mud', hi: 'नदी और माटी की जुगलबंदी', bn: 'নদী ও মাটির প্রাকৃতিক সুর' },
      text: {
        en: 'Ajrakh is a complex 16-step block printing process utilizing natural minerals and vegetable dyes in Kutch.',
        hi: 'अजरक कच्छ की एक जटिल 16-स्तरीय ब्लॉक प्रिंटिंग प्रक्रिया है जिसमें प्राकृतिक खनिजों और वनस्पति रंगों का उपयोग होता है।',
        bn: 'অজরখ হলো কচ্ছের ১৬টি জটিল ধাপে প্রাকৃতিক ভেজষ রঙ ও কারুকার্যময় কাঠের ব্লকে মুদ্রিত ঐতিহ্যবাহী বস্ত্রশিল্প।'
      }
    }
  },
  {
    id: 'tn-kanchi-01',
    name: { en: 'Kanchipuram Heavy Crimson Korvai Silk Saree', hi: 'कांजीवरम हैवी क्रिमसन कोरवई सिल्क साड़ी', bn: 'কাঞ্চিপুরম হেভি ক্রিমসন কোরভই রেশম শাড়ি' },
    desc: {
      en: 'Master Weaver Murugan Swamy. Interlocked Korvai weave with 3-ply Mulberry silk and certified gold zari.',
      hi: 'मास्टर बुनकर मुरुगन स्वामी। 3-प्लाई मलबरी सिल्क और प्रमाणित गोल्ड ज़री से इंटरलॉक कोरवई तकनीक द्वारा निर्मित।',
      bn: 'মাস্টার তাঁতি মুরুগান স্বামী। ৩-প্লাই তুত রেশম এবং খাঁটি সোনার জারিতে আন্তঃসংযুক্ত কোরভই বুননে তৈরি ভারী কাঞ্চিপুরম শাড়ি।'
    },
    longStory: {
      title: { en: 'The Temple Looms of Kanchi', hi: 'कांची के मंदिर करघे', bn: 'কাঞ্চিপুরমের মন্দির তাঁত' },
      text: {
        en: 'Korvai is the ancient temple technique of interlocked weaving where the border and body are woven separately and joined with unmatched strength.',
        hi: 'कोरवई अंतरग्रथित बुनाई की प्राचीन मंदिर तकनीक है जिसमें बॉर्डर और बॉडी को अलग बुना जाता है फिर मजबूती से जोड़ा जाता है।',
        bn: 'কোরভই হলো কাঞ্চিপুরমের তাঁতের প্রাচীন কৌশল যেখানে শাড়ির বডি ও পাড় আলাদা বুনে অত্যন্ত শক্তিশালী সংযোগে জোড়া হয়।'
      }
    }
  },
  {
    id: 'cg-dhokra-01',
    name: { en: 'Bastar Bell Metal Lost-Wax Dhokra Tribal Procession', hi: 'बस्तर बेल मेटल लॉस्ट-वैक्स ढोकरा जनजातीय जुलूस', bn: 'বস্তার বেল মেটাল লস্ট-ওয়াক্স ঢোকরা উপজাতীয় মিছিল' },
    desc: {
      en: 'Master Craftsperson Budhram Jhoria. Ancient cire-perdue lost-wax cast bell metal sculpture depicting tribal musicians.',
      hi: 'मास्टर शिल्पी बुधराम झोरिया। प्राचीन सीरे-परड्यू मोम ढलाई विधि से निर्मित जनजातीय संगीतकारों की पीतल मूर्ति।',
      bn: 'মাস্টার কারিগর বুধরাম ঝোরিয়া। প্রাচীন মোম ঢালাই পদ্ধতিতে তৈরি বেল মেটালের উপজাতীয় শোভাযাত্রা শিল্পকর্ম।'
    },
    longStory: {
      title: { en: 'Molten Bronze of the Bastar Forest', hi: 'बस्तर के जंगलों का पिघला कांस्य', bn: 'বস্তারের প্রাচীন বেল মেটাল ঢালাই' },
      text: {
        en: 'Dhokra metal casting uses the 4,000-year-old lost-wax technique, ensuring that every single figurine is a one-of-a-kind original.',
        hi: 'ढोकरा धातु ढलाई 4,000 वर्ष पुरानी लॉस्ट-वैक्स तकनीक का उपयोग करती है जिससे हर मूर्ति अनूठी और अद्वितीय बनती है।',
        bn: 'ঢোকরা ধাতব শিল্প ৪০০০ বছরের প্রাচীন লস্ট-ওয়াক্স মোম ঢালাই পদ্ধতি মেনে তৈরি এক অনন্য উপজাতীয় নিদর্শন।'
      }
    }
  },
  {
    id: 'up-banarasi-01',
    name: { en: 'Varanasi Royal Katan Silk Kadwa Jaal Brocade Saree', hi: 'वाराणसी रॉयल कतान सिल्क कड़वा जाल ब्रोकेड साड़ी', bn: 'বারাণসী রাজকীয় কাতান সিল্ক কড়ওয়া জাল ব্রোকেড শাড়ি' },
    desc: {
      en: 'Ustad Ramdas Ansari (Padma Nominee). Pure Katan silk with gold Zari Kadwa weaving of Mughal jaal motifs.',
      hi: 'उस्ताद रामदास अंसारी (पद्म नामांकित)। मुग़ल जाल बूटियों से युक्त शुद्ध कतान सिल्क व स्वर्ण ज़री कड़वा बुनाई साड़ी।',
      bn: 'উস্তাদ রামদাস আনসারী (পদ্ম মনোনীত)। মুঘল জাফরি নকশায় খাঁটি কড়ওয়া সোনালী জারিতে বোনা রাজকীয় বারাণসী কাতান শাড়ি।'
    },
    longStory: {
      title: { en: 'The Gold Filaments of Kashi', hi: 'काशी के स्वर्णिम तार', bn: 'কাশীর সোনার ব্রোকেড' },
      text: {
        en: 'Kadwa is the painstaking technique of weaving each motif individually into the silk fabric without any loose threads on the reverse.',
        hi: 'कड़वा रेशम पर प्रत्येक बूटी को अलग-अलग हाथ से बुनने की श्रमसाध्य तकनीक है जिससे पीछे कोई ढीला धागा नहीं रहता।',
        bn: 'কড়ওয়া হলো বারাণসীর ঐতিহ্যবাহী তাঁত কৌশল যেখানে প্রতিটি বুটি স্বতন্ত্রভাবে বোনা হয় যেন উল্টো পিঠে কোনো আলগা সুতো না থাকে।'
      }
    }
  },
  {
    id: 'od-pattachitra-01',
    name: { en: 'Raghurajpur Palm Leaf Pattachitra Tale of Dashavatar', hi: 'रघुराजपुर ताड़पत्र पट्टचित्र दशावतार कथा', bn: 'রঘুরাজপুর তালপাতা পট্টচিত্র দশা অবতার কথা' },
    desc: {
      en: 'Master Chitrakar Bhaskar Mahapatra. Fine etching on dried palm leaf strips with natural mineral colours depicting Vishnu avatars.',
      hi: 'मास्टर चित्रकार भास्कर महापात्र। सुखाए गए ताड़पत्रों पर खनिज रंगों व नक्काशी से उकेरे गए भगवान विष्णु के दशावतार।',
      bn: 'মাস্টার চিত্রকর ভাস্কর মহাপাত্র। শুকনো তালপাতায় সূক্ষ্ম খোদাই ও প্রাকৃতিক খনিজ রঙে অঙ্কিত ভগবান বিষ্ণুর দশা অবতার।'
    },
    longStory: {
      title: { en: 'Etchings on the Sacred Folios', hi: 'पवित्र पत्रों पर उकेरी रेखाएं', bn: 'তালপাতায় খোদাই করা বিষ্ণু কথা' },
      text: {
        en: 'Palm leaf Pattachitra involves stitching dried palm leaves together and etching delicate mythological scenes with an iron stylus.',
        hi: 'ताड़पत्र पट्टचित्र में ताड़ के सुखाए पत्तों को जोड़कर लोहे की सुई से पौराणिक दृश्यों की सूक्ष्म नक्काशी की जाती है।',
        bn: 'তালপাতা পট্টচিত্র হলো শুকনো তালপাতাকে সুতোয় বেঁধে লোহার সূঁচালো নিব দিয়ে পৌরাণিক গল্প খোদাই করে চিত্রিত করার সুপ্রাচীন ও ঐতিহ্যবাহী ওড়িশি শিল্প।'
      }
    }
  }
];

productsData.forEach(p => {
  setDeep(en, `buyer.data.products.${p.id}.name`, p.name.en);
  setDeep(hi, `buyer.data.products.${p.id}.name`, p.name.hi);
  setDeep(bn, `buyer.data.products.${p.id}.name`, p.name.bn);

  setDeep(en, `buyer.data.products.${p.id}.description`, p.desc.en);
  setDeep(hi, `buyer.data.products.${p.id}.description`, p.desc.hi);
  setDeep(bn, `buyer.data.products.${p.id}.description`, p.desc.bn);

  setDeep(en, `buyer.data.products.${p.id}.longStory.title`, p.longStory.title.en);
  setDeep(hi, `buyer.data.products.${p.id}.longStory.title`, p.longStory.title.hi);
  setDeep(bn, `buyer.data.products.${p.id}.longStory.title`, p.longStory.title.bn);

  setDeep(en, `buyer.data.products.${p.id}.longStory.text`, p.longStory.text.en);
  setDeep(hi, `buyer.data.products.${p.id}.longStory.text`, p.longStory.text.hi);
  setDeep(bn, `buyer.data.products.${p.id}.longStory.text`, p.longStory.text.bn);
});

// Save JSON files
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2), 'utf8');

console.log('Successfully merged buyer data i18n keys into en.json, hi.json, and bn.json!');
