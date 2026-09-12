import { categoryImage, artisanPortrait } from './demoImages.js';
import i18n from '../i18n/i18n.js';
import { DEMO_ARTISANS } from '../../prisma/artisanData.js';
import { getCraftCategory, getCraftImage } from '../constants/craftImageMap.js';
import { normalizeState } from './heritage.js';

/**
 * KARIGAR Masterwork Products Catalog
 * Curated certified heirloom pieces across major artisan clusters of India
 */

export const PRODUCTS = [
  {
    id: 'wb-nk-042',
    get name() { return i18n.t('buyer.data.products.wb-nk-042.name', 'Radha-Krishna Narrative Nakshi Kantha Tapestry'); },
    stateSlug: 'west-bengal',
    stateName: 'West Bengal',
    craftCategory: 'Embroidery',
    craftLineage: 'Nakshi Kantha',
    artisanName: 'Smt. Ananya Devi',
    artisanTitle: 'Presidential National Awardee (2018)',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    price: 48000,
    artisanSharePercent: 90,
    artisanShareAmount: 43200,
    platformFeeAmount: 2400,
    clusterFundAmount: 2400,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #WB-082',
    district: 'Bolpur, Birbhum',
    images: [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.wb-nk-042.description', 'Smt. Ananya Devi (National Award \'18). Hand-stitched running stitch on unbleached wild tussar silk depicting Krishna under the Kalpavriksha tree.'); },
    specs: {
      "dimensions": "60\" × 40\" Inches (152 × 101 cm)",
      "material": "100% Wild Forest Tussar Silk",
      "stitchDensity": "180 Stitches per square inch",
      "embroideryTime": "180 Days (approx. 720 artisan hours)",
      "dyeType": "Fermented plant indigo and madder root dyes"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.wb-nk-042.longStory.title', 'The Song of the Kadamba Bough'),
        englishText: i18n.t('buyer.data.products.wb-nk-042.longStory.text', 'Embroidered over 180 uninterrupted dawns upon hand-beaten wild tussar silk, this singular narrative revives the pastoral divinity of Radha-Krishna under the Kalpavriksha (the eternal wishing tree). Every figure is meticulously shaped by microscopic running kantha stitches, layered to create tactile low-relief ripples across the cloth.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-nk-042.longStory.title', 'কদমতলার অমর প্রেমগাথা') : 'কদমতলার অমর প্রেমগাথা',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-nk-042.longStory.text', 'অখণ্ড ১৮০ দিনের সুনিপুণ পরিশ্রমে বুনো তসর রেশমের পটভূমিতে রচিত এই অনবদ্য নকশী কাঁথাটি রাধা-কৃষ্ণের চিরন্তন কদমতলার মিলনগাথাকে মূর্ত করে তুলেছে। বাংলার শতাব্দীপ্রাচীন সুজনী ভরাট ও সুক্ষ্ম কাঁথাস্টিচের বুননে সৃষ্ট প্রতিটি নকশা যেন পল্লীপ্রকৃতির এক নিবিড় উচ্চারণ।') : 'অখণ্ড ১৮০ দিনের সুনিপুণ পরিশ্রমে বুনো তসর রেশমের পটভূমিতে রচিত এই অনবদ্য নকশী কাঁথাটি রাধা-কৃষ্ণের চিরন্তন কদমতলার মিলনগাথাকে মূর্ত করে তুলেছে। বাংলার শতাব্দীপ্রাচীন সুজনী ভরাট ও সুক্ষ্ম কাঁথাস্টিচের বুননে সৃষ্ট প্রতিটি নকশা যেন পল্লীপ্রকৃতির এক নিবিড় উচ্চারণ।'
      };
    },
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true
  },
  {
    id: 'wb-jamdani-01',
    get name() { return i18n.t('buyer.data.products.wb-jamdani-01.name', 'Nilambari Fine Cotton Jamdani Saree'); },
    stateSlug: 'west-bengal',
    stateName: 'West Bengal',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Jamdani Weave',
    artisanName: 'Debabrata Pal',
    artisanTitle: '4th Generation Jamdani Master Weaver',
    artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    price: 32500,
    artisanSharePercent: 90,
    artisanShareAmount: 29250,
    platformFeeAmount: 1625,
    clusterFundAmount: 1625,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #WB-041',
    district: 'Shantipur, Nadia',
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.wb-jamdani-01.description', 'Master Weaver Debabrata Pal. Supplementary weft geometric and floral motif on gossamer 200s high-count handspun cotton muslin.'); },
    specs: {
      "dimensions": "5.5 Meters Saree with Unstitched Blouse Piece",
      "material": "200s Count Handspun Muslin Cotton & Pure Silver Zari",
      "stitchDensity": "Supplementary weft hand-shuttle insertion",
      "embroideryTime": "90 Days of continuous loom weaving",
      "dyeType": "Midnight Indigo Organic Dip Dye"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.wb-jamdani-01.longStory.title', 'Shadows on Gossamer Muslin'),
        englishText: i18n.t('buyer.data.products.wb-jamdani-01.longStory.text', 'Jamdani weaving is an intangible cultural art form where intricate floral motifs are inserted thread-by-thread into the sheer cotton warp using delicate non-mechanized bamboo needles.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-jamdani-01.longStory.title', 'মেঘের ডানায় রূপালী নকশা') : 'মেঘের ডানায় রূপালী নকশা',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-jamdani-01.longStory.text', 'শান্তিপুরের ঐতিহাসিক পিট লুমের তাঁতে বোনা ২০০ কাউন্টের এই সূক্ষ্ম ঢাকাই জামদানী শাড়িটিতে রূপালী জারির কাজে ফুটিয়ে তোলা হয়েছে ঐতিহ্যবাহী কোণকা ও পন্নাহাজাড় বুটি।') : 'শান্তিপুরের ঐতিহাসিক পিট লুমের তাঁতে বোনা ২০০ কাউন্টের এই সূক্ষ্ম ঢাকাই জামদানী শাড়িটিতে রূপালী জারির কাজে ফুটিয়ে তোলা হয়েছে ঐতিহ্যবাহী কোণকা ও পন্নাহাজাড় বুটি।'
      };
    },
    rating: 4.8,
    reviewsCount: 31,
    isFeatured: true
  },
  {
    id: 'wb-swarna-02',
    get name() { return i18n.t('buyer.data.products.wb-swarna-02.name', 'Mythological Swarnachari Silk Saree'); },
    stateSlug: 'west-bengal',
    stateName: 'West Bengal',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Baluchari & Swarnachari',
    artisanName: 'Ruma Pramanik',
    artisanTitle: 'National Craft Guru (2019)',
    artisanAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    price: 64000,
    artisanSharePercent: 91,
    artisanShareAmount: 58240,
    platformFeeAmount: 3200,
    clusterFundAmount: 2560,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #WB-019',
    district: 'Bishnupur, Bankura',
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.wb-swarna-02.description', 'Master Artisan Ruma Pramanik. Gold and crimson silk brocade recreating Mahabharata battle scenes across the pallu.'); },
    specs: {
      "dimensions": "6.2 Meters with Running Blouse Piece",
      "material": "Pure Mulberry Bishnupuri Silk & Gold Brocade",
      "stitchDensity": "Jacquard Jacqueti Extra Warp Insertion",
      "embroideryTime": "120 Days of artisan loomwork",
      "dyeType": "Crimson Alizarin Organic Dye"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.wb-swarna-02.longStory.title', 'Chariots Woven in Gold Filament'),
        englishText: i18n.t('buyer.data.products.wb-swarna-02.longStory.text', 'Swarnachari sarees inherit the epic narrative traditions of Bishnupur, featuring pure gold-plated metallic thread brocading of Mahabharata and Ramayana scenes.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-swarna-02.longStory.title', 'সোনার সুতোয় আঁকা মহাভারত') : 'সোনার সুতোয় আঁকা মহাভারত',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-swarna-02.longStory.text', 'বিষ্ণুপুরের ঐতিহাসিক স্বর্নচরী শাড়িতে কুরুক্ষেত্রের রথের চাকা এবং গীতোপদেশের অলঙ্করণ সুচারুভাবে বোনা হয়েছে।') : 'বিষ্ণুপুরের ঐতিহাসিক স্বর্নচরী শাড়িতে কুরুক্ষেত্রের রথের চাকা এবং গীতোপদেশের অলঙ্করণ সুচারুভাবে বোনা হয়েছে।'
      };
    },
    rating: 4.95,
    reviewsCount: 19,
    isFeatured: true
  },
  {
    id: 'wb-terracotta-03',
    get name() { return i18n.t('buyer.data.products.wb-terracotta-03.name', 'Panchmura Long-Neck Terracotta Heritage Horse'); },
    stateSlug: 'west-bengal',
    stateName: 'West Bengal',
    craftCategory: 'Pottery/Clay',
    craftLineage: 'Bankura Terracotta',
    artisanName: 'Baidyanath Kumbhakar',
    artisanTitle: 'State Heritage Master Potter',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    price: 18500,
    artisanSharePercent: 92,
    artisanShareAmount: 17020,
    platformFeeAmount: 925,
    clusterFundAmount: 555,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #WB-004',
    district: 'Panchmura, Bankura',
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.wb-terracotta-03.description', 'Master Potter Baidyanath Kumbhakar. Hand-thrown and wood-fired natural clay votive horse with hollow segmented neck.'); },
    specs: {
      "dimensions": "36\" Height × 18\" Width",
      "material": "Alluvial River Clay & Natural Iron Slurry",
      "stitchDensity": "Hand-wheel thrown & hollow assembled",
      "embroideryTime": "45 Days pit firing process",
      "dyeType": "Natural terracotta red ox-blood wood firing"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.wb-terracotta-03.longStory.title', 'The Votive Earth of Panchmura'),
        englishText: i18n.t('buyer.data.products.wb-terracotta-03.longStory.text', 'The Panchmura terracotta horse is the world-renowned symbol of Indian folk craft, handcrafted by traditional Kumbhakar artisans.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-terracotta-03.longStory.title', 'বাঁকুড়ার পোড়ামাটির অমর রূপ') : 'বাঁকুড়ার পোড়ামাটির অমর রূপ',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.wb-terracotta-03.longStory.text', 'পঞ্চমুড়ার পোড়ামাটির ঘোড়া ভারতীয় লোকশিল্পের এক অনন্য নিদর্শন যা দীর্ঘকাল ধরে গ্রাম বাংলার উপাসনা ও সৌন্দর্যের প্রতীক।') : 'পঞ্চমুড়ার পোড়ামাটির ঘোড়া ভারতীয় লোকশিল্পের এক অনন্য নিদর্শন যা দীর্ঘকাল ধরে গ্রাম বাংলার উপাসনা ও সৌন্দর্যের প্রতীক।'
      };
    },
    rating: 4.85,
    reviewsCount: 56,
    isFeatured: true
  },
  {
    id: 'jk-pashmina-01',
    get name() { return i18n.t('buyer.data.products.jk-pashmina-01.name', 'Royal Shahus Kani Weave Pashmina Shawl'); },
    stateSlug: 'jammu-kashmir',
    stateName: 'Jammu & Kashmir',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Kani Pashmina',
    artisanName: 'Ghulam Hassan Mir',
    artisanTitle: 'Kani Loom Master & Guild President',
    artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    price: 85000,
    artisanSharePercent: 90,
    artisanShareAmount: 76500,
    platformFeeAmount: 4250,
    clusterFundAmount: 4250,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #JK-092',
    district: 'Srinagar, Kashmir',
    images: [
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.jk-pashmina-01.description', 'Master Weaver Ghulam Hassan Mir. Hand-woven on traditional looms using Changthangi grade-A pashmina with Kani wooden needles.'); },
    specs: {
      "dimensions": "80\" × 40\" Inches",
      "material": "100% Pure Changthangi Cashmere Goat Fleece (12-14 Micron)",
      "stitchDensity": "Wooden eyeless shuttle (Tuji) weave",
      "embroideryTime": "240 Days of loom weaving",
      "dyeType": "Vegetable and saffron organic dyes"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.jk-pashmina-01.longStory.title', 'Whispers of the Changthang Plateau'),
        englishText: i18n.t('buyer.data.products.jk-pashmina-01.longStory.text', 'Hand-woven using wooden bobbins called Tujis according to coded Talim notation scripts passed down through generations in Srinagar.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.jk-pashmina-01.longStory.title', 'চাংথাং মালভূমির সোনার পশম') : 'চাংথাং মালভূমির সোনার পশম',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.jk-pashmina-01.longStory.text', 'শ্রীনগরের ঐতিহ্যবাহী তালিম লিপির সাহায্যে কাঠের সুচ দিয়ে বোনা অত্যন্ত সূক্ষ্ম ও উষ্ণ শাহুস পশমিনা শাল।') : 'শ্রীনগরের ঐতিহ্যবাহী তালিম লিপির সাহায্যে কাঠের সুচ দিয়ে বোনা অত্যন্ত সূক্ষ্ম ও উষ্ণ শাহুস পশমিনা শাল।'
      };
    },
    rating: 5,
    reviewsCount: 28,
    isFeatured: true
  },
  {
    id: 'rj-bluepottery-01',
    get name() { return i18n.t('buyer.data.products.rj-bluepottery-01.name', 'Jaipur Blue Pottery Royal Floral Urn'); },
    stateSlug: 'rajasthan',
    stateName: 'Rajasthan',
    craftCategory: 'Pottery/Clay',
    craftLineage: 'Jaipur Blue Pottery',
    artisanName: 'Pt. Kripal Singh Studio',
    artisanTitle: 'Shilp Guru Heirloom Atelier',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    price: 24000,
    artisanSharePercent: 89,
    artisanShareAmount: 21360,
    platformFeeAmount: 1440,
    clusterFundAmount: 1200,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #RJ-012',
    district: 'Jaipur, Rajasthan',
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.rj-bluepottery-01.description', 'Master Artisan Kripal Singh Studio. Clay-free quartz frit pottery with Persian cobalt blue arabesque painting.'); },
    specs: {
      "dimensions": "18\" Height × 12\" Diameter",
      "material": "Powdered Quartz, Glass Frit & Gum Traagacanth",
      "stitchDensity": "Hand-moulded & hand-painted cobalt oxide",
      "embroideryTime": "30 Days low-fire kiln process",
      "dyeType": "Cobalt oxide blue & copper green natural glazes"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.rj-bluepottery-01.longStory.title', 'The Turquoise Flame of Amber'),
        englishText: i18n.t('buyer.data.products.rj-bluepottery-01.longStory.text', 'Jaipur Blue Pottery is unique as it uses no clay, made instead from Egyptian paste of powdered quartz stone and glass.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.rj-bluepottery-01.longStory.title', 'জয়পুরের নীল মৃৎশিল্প') : 'জয়পুরের নীল মৃৎশিল্প',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.rj-bluepottery-01.longStory.text', 'জয়পুর ব্লু পটারি মাটির পরিবর্তে কোয়ার্টজ পাথর গুঁড়ো করে তৈরি এক অপূর্ব পার্সিয়ান মোটিফযুক্ত শিল্পকর্ম।') : 'জয়পুর ব্লু পটারি মাটির পরিবর্তে কোয়ার্টজ পাথর গুঁড়ো করে তৈরি এক অপূর্ব পার্সিয়ান মোটিফযুক্ত শিল্পকর্ম।'
      };
    },
    rating: 4.9,
    reviewsCount: 37,
    isFeatured: true
  },
  {
    id: 'up-chanderi-01',
    get name() { return i18n.t('buyer.data.products.up-chanderi-01.name', 'Imperial Gold Zari Chanderi Silk Tissue Saree'); },
    stateSlug: 'madhya-pradesh',
    stateName: 'Madhya Pradesh',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Chanderi Weave',
    artisanName: 'Ustad Ramdas Ansari',
    artisanTitle: 'Padma Shri Nominee & Guild Master',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    price: 34500,
    artisanSharePercent: 90,
    artisanShareAmount: 31050,
    platformFeeAmount: 1725,
    clusterFundAmount: 1725,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #MP-104',
    district: 'Chanderi, Ashoknagar',
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.up-chanderi-01.description', 'Master Weaver Ramdas Ansari. Sheer silk-cotton woven with pure tested gold zari motifs.'); },
    specs: {
      "dimensions": "5.5 Meters Saree with Unstitched Blouse Piece",
      "material": "Chanderi Silk Warp & Cotton Weft with Gold Zari",
      "stitchDensity": "Hand-shuttle zari insertion",
      "embroideryTime": "60 Days of pit-loom weaving",
      "dyeType": "Organic Turmeric & Lac Natural Dye"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.up-chanderi-01.longStory.title', 'Glimmer of the Malwa Kingdom'),
        englishText: i18n.t('buyer.data.products.up-chanderi-01.longStory.text', 'Chanderi weaving creates lightweight translucent fabrics embellished with delicate gold and silver zari buttis.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.up-chanderi-01.longStory.title', 'মালব রাজত্বের সোনার আলো') : 'মালব রাজত্বের সোনার আলো',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.up-chanderi-01.longStory.text', 'চন্দেরী তাঁতের আলো-ছায়াময় সূক্ষ্ম রেশম সুতায় বোনা সোনালী ও রূপালী জারির কাজ রাজকীয় আভিজাত্যের রূপ।') : 'চন্দেরী তাঁতের আলো-ছায়াময় সূক্ষ্ম রেশম সুতায় বোনা সোনালী ও রূপালী জারির কাজ রাজকীয় আভিজাত্যের রূপ।'
      };
    },
    rating: 4.92,
    reviewsCount: 22,
    isFeatured: true
  },
  {
    id: 'gj-ajrakh-01',
    get name() { return i18n.t('buyer.data.products.gj-ajrakh-01.name', 'Ajrakhpur 16-Stage Natural Dye Block Print Stole'); },
    stateSlug: 'gujarat',
    stateName: 'Gujarat',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Ajrakh Block Print',
    artisanName: 'Dr. Ismail M. Khatri',
    artisanTitle: 'Shilp Guru Awardee (9th Gen Carver)',
    artisanAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    price: 28000,
    artisanSharePercent: 92,
    artisanShareAmount: 25760,
    platformFeeAmount: 1400,
    clusterFundAmount: 840,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #GJ-029',
    district: 'Ajrakhpur, Kutch',
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.gj-ajrakh-01.description', 'Shilp Guru Dr. Ismail M. Khatri. Natural indigo, madder, and iron-resist block print on Tussar silk.'); },
    specs: {
      "dimensions": "2.2 Meters Length × 36\" Width",
      "material": "100% Pure Forest Tussar Silk",
      "stitchDensity": "16-stage hand block printing",
      "embroideryTime": "40 Days of resist washing and dip-dyeing",
      "dyeType": "Fermented scrap iron, indigo, and madder root"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.gj-ajrakh-01.longStory.title', 'Symphony of River and Mud'),
        englishText: i18n.t('buyer.data.products.gj-ajrakh-01.longStory.text', 'Ajrakh is a complex 16-step block printing process utilizing natural minerals and vegetable dyes in Kutch.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.gj-ajrakh-01.longStory.title', 'নদী ও মাটির প্রাকৃতিক সুর') : 'নদী ও মাটির প্রাকৃতিক সুর',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.gj-ajrakh-01.longStory.text', 'অজরখ হলো কচ্ছের ১৬টি জটিল ধাপে প্রাকৃতিক ভেজষ রঙ ও কারুকার্যময় কাঠের ব্লকে মুদ্রিত ঐতিহ্যবাহী বস্ত্রশিল্প।') : 'অজরখ হলো কচ্ছের ১৬টি জটিল ধাপে প্রাকৃতিক ভেজষ রঙ ও কারুকার্যময় কাঠের ব্লকে মুদ্রিত ঐতিহ্যবাহী বস্ত্রশিল্প।'
      };
    },
    rating: 4.97,
    reviewsCount: 48,
    isFeatured: true
  },
  {
    id: 'tn-kanchi-01',
    get name() { return i18n.t('buyer.data.products.tn-kanchi-01.name', 'Kanchipuram Heavy Crimson Korvai Silk Saree'); },
    stateSlug: 'tamil-nadu',
    stateName: 'Tamil Nadu',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Kanchipuram Silk',
    artisanName: 'Murugan Swamy',
    artisanTitle: 'Presidential Awardee & Master Weaver',
    artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    price: 72000,
    artisanSharePercent: 91,
    artisanShareAmount: 65520,
    platformFeeAmount: 3600,
    clusterFundAmount: 2880,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #TN-003',
    district: 'Kanchipuram',
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.tn-kanchi-01.description', 'Master Weaver Murugan Swamy. Interlocked Korvai weave with 3-ply Mulberry silk and certified gold zari.'); },
    specs: {
      "dimensions": "5.5 Meters Saree with Unstitched Blouse Piece",
      "material": "3-Ply Mulberry Silk & Certified Pure Gold Zari",
      "stitchDensity": "Interlocked Korvai border joining",
      "embroideryTime": "90 Days of 2-weaver loom operation",
      "dyeType": "Pure Crimson Organic Lac Dip"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.tn-kanchi-01.longStory.title', 'The Temple Looms of Kanchi'),
        englishText: i18n.t('buyer.data.products.tn-kanchi-01.longStory.text', 'Korvai is the ancient temple technique of interlocked weaving where the border and body are woven separately and joined with unmatched strength.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.tn-kanchi-01.longStory.title', 'কাঞ্চিপুরমের মন্দির তাঁত') : 'কাঞ্চিপুরমের মন্দির তাঁত',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.tn-kanchi-01.longStory.text', 'কোরভই হলো কাঞ্চিপুরমের তাঁতের প্রাচীন কৌশল যেখানে শাড়ির বডি ও পাড় আলাদা বুনে অত্যন্ত শক্তিশালী সংযোগে জোড়া হয়।') : 'কোরভই হলো কাঞ্চিপুরমের তাঁতের প্রাচীন কৌশল যেখানে শাড়ির বডি ও পাড় আলাদা বুনে অত্যন্ত শক্তিশালী সংযোগে জোড়া হয়।'
      };
    },
    rating: 4.88,
    reviewsCount: 35,
    isFeatured: true
  },
  {
    id: 'cg-dhokra-01',
    get name() { return i18n.t('buyer.data.products.cg-dhokra-01.name', 'Bastar Bell Metal Lost-Wax Dhokra Tribal Procession'); },
    stateSlug: 'chhattisgarh',
    stateName: 'Chhattisgarh',
    craftCategory: 'Metal',
    craftLineage: 'Bell Metal Dhokra',
    artisanName: 'Budhram Jhoria',
    artisanTitle: 'National Awardee Tribal Artisan',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    price: 21500,
    artisanSharePercent: 90,
    artisanShareAmount: 19350,
    platformFeeAmount: 1075,
    clusterFundAmount: 1075,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #CG-011',
    district: 'Bastar, Kondagaon',
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.cg-dhokra-01.description', 'Master Craftsperson Budhram Jhoria. Ancient cire-perdue lost-wax cast bell metal sculpture depicting tribal musicians.'); },
    specs: {
      "dimensions": "14\" Length × 8\" Height × 4\" Depth",
      "material": "Recycled Bell Metal Brass & Beeswax Mould",
      "stitchDensity": "Cire-perdue single-use clay mould casting",
      "embroideryTime": "35 Days moulding and lost-wax firing",
      "dyeType": "Natural brass patina with antique charcoal rub"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.cg-dhokra-01.longStory.title', 'Molten Bronze of the Bastar Forest'),
        englishText: i18n.t('buyer.data.products.cg-dhokra-01.longStory.text', 'Dhokra metal casting uses the 4,000-year-old lost-wax technique, ensuring that every single figurine is a one-of-a-kind original.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.cg-dhokra-01.longStory.title', 'বস্তারের প্রাচীন বেল মেটাল ঢালাই') : 'বস্তারের প্রাচীন বেল মেটাল ঢালাই',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.cg-dhokra-01.longStory.text', 'ঢোকরা ধাতব শিল্প ৪০০০ বছরের প্রাচীন লস্ট-ওয়াক্স মোম ঢালাই পদ্ধতি মেনে তৈরি এক অনন্য উপজাতীয় নিদর্শন।') : 'ঢোকরা ধাতব শিল্প ৪০০০ বছরের প্রাচীন লস্ট-ওয়াক্স মোম ঢালাই পদ্ধতি মেনে তৈরি এক অনন্য উপজাতীয় নিদর্শন।'
      };
    },
    rating: 4.93,
    reviewsCount: 29,
    isFeatured: true
  },
  {
    id: 'up-banarasi-01',
    get name() { return i18n.t('buyer.data.products.up-banarasi-01.name', 'Varanasi Royal Katan Silk Kadwa Jaal Brocade Saree'); },
    stateSlug: 'uttar-pradesh',
    stateName: 'Uttar Pradesh',
    craftCategory: 'Handloom & Textiles',
    craftLineage: 'Banarasi Brocade',
    artisanName: 'Ustad Ramdas Ansari',
    artisanTitle: 'Padma Shri Nominee & Guild Master',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    price: 58000,
    artisanSharePercent: 91,
    artisanShareAmount: 52780,
    platformFeeAmount: 2900,
    clusterFundAmount: 2320,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #UP-002',
    district: 'Varanasi',
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.up-banarasi-01.description', 'Ustad Ramdas Ansari (Padma Nominee). Pure Katan silk with gold Zari Kadwa weaving of Mughal jaal motifs.'); },
    specs: {
      "dimensions": "5.5 Meters with Unstitched Blouse Piece",
      "material": "100% Pure Katan Mulberry Silk & Real Gold Zari",
      "stitchDensity": "Kadwa needle-by-needle weaving technique",
      "embroideryTime": "100 Days of master loomwork",
      "dyeType": "Royal Emerald Green Natural Dip"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.up-banarasi-01.longStory.title', 'The Gold Filaments of Kashi'),
        englishText: i18n.t('buyer.data.products.up-banarasi-01.longStory.text', 'Kadwa is the painstaking technique of weaving each motif individually into the silk fabric without any loose threads on the reverse.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.up-banarasi-01.longStory.title', 'কাশীর সোনার ব্রোকেড') : 'কাশীর সোনার ব্রোকেড',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.up-banarasi-01.longStory.text', 'কড়ওয়া হলো বারাণসীর ঐতিহ্যবাহী তাঁত কৌশল যেখানে প্রতিটি বুটি স্বতন্ত্রভাবে বোনা হয় যেন উল্টো পিঠে কোনো আলগা সুতো না থাকে।') : 'কড়ওয়া হলো বারাণসীর ঐতিহ্যবাহী তাঁত কৌশল যেখানে প্রতিটি বুটি স্বতন্ত্রভাবে বোনা হয় যেন উল্টো পিঠে কোনো আলগা সুতো না থাকে।'
      };
    },
    rating: 4.96,
    reviewsCount: 52,
    isFeatured: true
  },
  {
    id: 'od-pattachitra-01',
    get name() { return i18n.t('buyer.data.products.od-pattachitra-01.name', 'Raghurajpur Palm Leaf Pattachitra Tale of Dashavatar'); },
    stateSlug: 'odisha',
    stateName: 'Odisha',
    craftCategory: 'Painting & Folk Art',
    craftLineage: 'Pattachitra',
    artisanName: 'Bhaskar Mahapatra',
    artisanTitle: 'Heritage Master Chitrakar',
    artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    price: 38000,
    artisanSharePercent: 90,
    artisanShareAmount: 34200,
    platformFeeAmount: 1900,
    clusterFundAmount: 1900,
    giTagStatus: 'GI Certified',
    giTagNumber: 'GI Registered #OD-007',
    district: 'Raghurajpur, Puri',
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
],
    get description() { return i18n.t('buyer.data.products.od-pattachitra-01.description', 'Master Chitrakar Bhaskar Mahapatra. Fine etching on dried palm leaf strips with natural mineral colours depicting Vishnu avatars.'); },
    specs: {
      "dimensions": "24\" Height × 18\" Width Folding Folio",
      "material": "Seasoned Palm Leaves & Natural Mineral Pigments",
      "stitchDensity": "Iron stylus needle etching & charcoal rub",
      "embroideryTime": "75 Days of intricate micro-etching",
      "dyeType": "Conch shell white, lampblack, and cinnabar"
},
    get longStory() {
      return {
        englishTitle: i18n.t('buyer.data.products.od-pattachitra-01.longStory.title', 'Etchings on the Sacred Folios'),
        englishText: i18n.t('buyer.data.products.od-pattachitra-01.longStory.text', 'Palm leaf Pattachitra involves stitching dried palm leaves together and etching delicate mythological scenes with an iron stylus.'),
        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.od-pattachitra-01.longStory.title', 'তালপাতায় খোদাই করা বিষ্ণু কথা') : 'তালপাতায় খোদাই করা বিষ্ণু কথা',
        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.od-pattachitra-01.longStory.text', 'তালপাতা পট্টচিত্র হলো শুকনো তালপাতাকে সুতোয় বেঁধে লোহার সূঁচালো নিব দিয়ে পৌরাণিক গল্প খোদাই করে চিত্রিত করার সুপ্রাচীন ও ঐতিহ্যবাহী ওড়িশি শিল্প।') : 'তালপাতা পট্টচিত্র হলো শুকনো তালপাতাকে সুতোয় বেঁধে লোহার সূঁচালো নিব দিয়ে পৌরাণিক গল্প খোদাই করে চিত্রিত করার সুপ্রাচীন ও ঐতিহ্যবাহী ওড়িশি শিল্প।'
      };
    },
    rating: 4.91,
    reviewsCount: 23,
    isFeatured: true
  }
];

for (const product of PRODUCTS) {
  product.images = product.images.map(() => categoryImage(product));
  product.artisanAvatar = artisanPortrait(product);
}

export function getProductById(id) {
  const direct = PRODUCTS.find(p => p.id === id);
  if (direct) return direct;

  if (id && (id.startsWith('artisan-piece-') || id.startsWith('artisan-'))) {
    const rawId = id.replace(/^artisan-(piece-)?/, '');
    const artisan = DEMO_ARTISANS.find(
      a => a.id === rawId || 
           a.fullName?.toLowerCase() === rawId.toLowerCase() || 
           a.email?.toLowerCase() === rawId.toLowerCase() ||
           String(a.id) === rawId
    ) || DEMO_ARTISANS.find(
      a => rawId.includes(a.fullName?.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    );

    if (artisan) {
      const cType = artisan.craftType;
      const img = getCraftImage(cType);
      return {
        id,
        name: `${cType} Masterpiece`,
        stateSlug: normalizeState(artisan.state),
        stateName: artisan.state,
        craftType: cType,
        craftCategory: getCraftCategory(cType),
        craftLineage: cType,
        artisanName: artisan.fullName,
        artisanTitle: `Master Artisan • ${artisan.yearsOfExperience || 15}+ Years Experience`,
        artisanAvatar: `/images/demo/male.jpeg`,
        price: 18000,
        artisanSharePercent: 90,
        artisanShareAmount: 16200,
        platformFeeAmount: 900,
        clusterFundAmount: 900,
        giTagStatus: 'Craft Certified',
        giTagNumber: artisan.giTagNumber || 'Registered Masterwork',
        district: artisan.district,
        images: [img],
        description: `Authentic handcrafted ${cType} created by master artisan ${artisan.fullName} from ${artisan.district ? artisan.district + ', ' : ''}${artisan.state}.`,
        specs: {
          dimensions: 'Craft Standard Dimensions',
          material: 'Locally sourced authentic materials',
          stitchDensity: 'Handcrafted traditional technique',
          embroideryTime: 'Handmade by master artisan',
          dyeType: 'Natural artisanal process'
        },
        longStory: {
          englishTitle: `${cType} of ${artisan.state}`,
          englishText: `Handcrafted in ${artisan.district || artisan.state} by master artisan ${artisan.fullName}, representing centuries of living heritage and authentic tradition.`,
          bengaliTitle: `${artisan.state}-এর ${cType}`,
          bengaliText: `কারিগর ${artisan.fullName}-এর হাতে তৈরি ঐতিহ্যবাহী শিল্পকর্ম।`
        },
        rating: 4.9,
        reviewsCount: 18,
        isFeatured: false
      };
    }
  }
  return null;
}

export function getProductsByState(stateSlug) {
  return PRODUCTS.filter(p => p.stateSlug === stateSlug);
}
