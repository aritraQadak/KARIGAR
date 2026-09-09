const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '..', 'src', 'data', 'products.js');

const rawProductsData = [
  {
    id: 'wb-nk-042',
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
      'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Radha-Krishna Narrative Nakshi Kantha Tapestry',
    defaultDescription: "Smt. Ananya Devi (National Award '18). Hand-stitched running stitch on unbleached wild tussar silk depicting Krishna under the Kalpavriksha tree.",
    specs: {
      dimensions: '60" × 40" Inches (152 × 101 cm)',
      material: '100% Wild Forest Tussar Silk',
      stitchDensity: '180 Stitches per square inch',
      embroideryTime: '180 Days (approx. 720 artisan hours)',
      dyeType: 'Fermented plant indigo and madder root dyes'
    },
    longStory: {
      englishTitle: 'The Song of the Kadamba Bough',
      englishText: 'Embroidered over 180 uninterrupted dawns upon hand-beaten wild tussar silk, this singular narrative revives the pastoral divinity of Radha-Krishna under the Kalpavriksha (the eternal wishing tree). Every figure is meticulously shaped by microscopic running kantha stitches, layered to create tactile low-relief ripples across the cloth.',
      bengaliTitle: 'কদমতলার অমর প্রেমগাথা',
      bengaliText: 'অখণ্ড ১৮০ দিনের সুনিপুণ পরিশ্রমে বুনো তসর রেশমের পটভূমিতে রচিত এই অনবদ্য নকশী কাঁথাটি রাধা-কৃষ্ণের চিরন্তন কদমতলার মিলনগাথাকে মূর্ত করে তুলেছে। বাংলার শতাব্দীপ্রাচীন সুজনী ভরাট ও সুক্ষ্ম কাঁথাস্টিচের বুননে সৃষ্ট প্রতিটি নকশা যেন পল্লীপ্রকৃতির এক নিবিড় উচ্চারণ।'
    },
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true
  },
  {
    id: 'wb-jamdani-01',
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
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Nilambari Fine Cotton Jamdani Saree',
    defaultDescription: 'Master Weaver Debabrata Pal. Supplementary weft geometric and floral motif on gossamer 200s high-count handspun cotton muslin.',
    specs: {
      dimensions: '5.5 Meters Saree with Unstitched Blouse Piece',
      material: '200s Count Handspun Muslin Cotton & Pure Silver Zari',
      stitchDensity: 'Supplementary weft hand-shuttle insertion',
      embroideryTime: '90 Days of continuous loom weaving',
      dyeType: 'Midnight Indigo Organic Dip Dye'
    },
    longStory: {
      englishTitle: 'Shadows on Gossamer Muslin',
      englishText: 'Jamdani weaving is an intangible cultural art form where intricate floral motifs are inserted thread-by-thread into the sheer cotton warp using delicate non-mechanized bamboo needles.',
      bengaliTitle: 'মেঘের ডানায় রূপালী নকশা',
      bengaliText: 'শান্তিপুরের ঐতিহাসিক পিট লুমের তাঁতে বোনা ২০০ কাউন্টের এই সূক্ষ্ম ঢাকাই জামদানী শাড়িটিতে রূপালী জারির কাজে ফুটিয়ে তোলা হয়েছে ঐতিহ্যবাহী কোণকা ও পন্নাহাজাড় বুটি।'
    },
    rating: 4.8,
    reviewsCount: 31,
    isFeatured: true
  },
  {
    id: 'wb-swarna-02',
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
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Mythological Swarnachari Silk Saree',
    defaultDescription: 'Master Artisan Ruma Pramanik. Gold and crimson silk brocade recreating Mahabharata battle scenes across the pallu.',
    specs: {
      dimensions: '6.2 Meters with Running Blouse Piece',
      material: 'Pure Mulberry Bishnupuri Silk & Gold Brocade',
      stitchDensity: 'Jacquard Jacqueti Extra Warp Insertion',
      embroideryTime: '120 Days of artisan loomwork',
      dyeType: 'Crimson Alizarin Organic Dye'
    },
    longStory: {
      englishTitle: 'Chariots Woven in Gold Filament',
      englishText: 'Swarnachari sarees inherit the epic narrative traditions of Bishnupur, featuring pure gold-plated metallic thread brocading of Mahabharata and Ramayana scenes.',
      bengaliTitle: 'সোনার সুতোয় আঁকা মহাভারত',
      bengaliText: 'বিষ্ণুপুরের ঐতিহাসিক স্বর্নচরী শাড়িতে কুরুক্ষেত্রের রথের চাকা এবং গীতোপদেশের অলঙ্করণ সুচারুভাবে বোনা হয়েছে।'
    },
    rating: 4.95,
    reviewsCount: 19,
    isFeatured: true
  },
  {
    id: 'wb-terracotta-03',
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
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Panchmura Long-Neck Terracotta Heritage Horse',
    defaultDescription: 'Master Potter Baidyanath Kumbhakar. Hand-thrown and wood-fired natural clay votive horse with hollow segmented neck.',
    specs: {
      dimensions: '36" Height × 18" Width',
      material: 'Alluvial River Clay & Natural Iron Slurry',
      stitchDensity: 'Hand-wheel thrown & hollow assembled',
      embroideryTime: '45 Days pit firing process',
      dyeType: 'Natural terracotta red ox-blood wood firing'
    },
    longStory: {
      englishTitle: 'The Votive Earth of Panchmura',
      englishText: 'The Panchmura terracotta horse is the world-renowned symbol of Indian folk craft, handcrafted by traditional Kumbhakar artisans.',
      bengaliTitle: 'বাঁকুড়ার পোড়ামাটির অমর রূপ',
      bengaliText: 'পঞ্চমুড়ার পোড়ামাটির ঘোড়া ভারতীয় লোকশিল্পের এক অনন্য নিদর্শন যা দীর্ঘকাল ধরে গ্রাম বাংলার উপাসনা ও সৌন্দর্যের প্রতীক।'
    },
    rating: 4.85,
    reviewsCount: 56,
    isFeatured: true
  },
  {
    id: 'jk-pashmina-01',
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
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Royal Shahus Kani Weave Pashmina Shawl',
    defaultDescription: 'Master Weaver Ghulam Hassan Mir. Hand-woven on traditional looms using Changthangi grade-A pashmina with Kani wooden needles.',
    specs: {
      dimensions: '80" × 40" Inches',
      material: '100% Pure Changthangi Cashmere Goat Fleece (12-14 Micron)',
      stitchDensity: 'Wooden eyeless shuttle (Tuji) weave',
      embroideryTime: '240 Days of loom weaving',
      dyeType: 'Vegetable and saffron organic dyes'
    },
    longStory: {
      englishTitle: 'Whispers of the Changthang Plateau',
      englishText: 'Hand-woven using wooden bobbins called Tujis according to coded Talim notation scripts passed down through generations in Srinagar.',
      bengaliTitle: 'চাংথাং মালভূমির সোনার পশম',
      bengaliText: 'শ্রীনগরের ঐতিহ্যবাহী তালিম লিপির সাহায্যে কাঠের সুচ দিয়ে বোনা অত্যন্ত সূক্ষ্ম ও উষ্ণ শাহুস পশমিনা শাল।'
    },
    rating: 5.0,
    reviewsCount: 28,
    isFeatured: true
  },
  {
    id: 'rj-bluepottery-01',
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
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Jaipur Blue Pottery Royal Floral Urn',
    defaultDescription: 'Master Artisan Kripal Singh Studio. Clay-free quartz frit pottery with Persian cobalt blue arabesque painting.',
    specs: {
      dimensions: '18" Height × 12" Diameter',
      material: 'Powdered Quartz, Glass Frit & Gum Traagacanth',
      stitchDensity: 'Hand-moulded & hand-painted cobalt oxide',
      embroideryTime: '30 Days low-fire kiln process',
      dyeType: 'Cobalt oxide blue & copper green natural glazes'
    },
    longStory: {
      englishTitle: 'The Turquoise Flame of Amber',
      englishText: 'Jaipur Blue Pottery is unique as it uses no clay, made instead from Egyptian paste of powdered quartz stone and glass.',
      bengaliTitle: 'জয়পুরের নীল মৃৎশিল্প',
      bengaliText: 'জয়পুর ব্লু পটারি মাটির পরিবর্তে কোয়ার্টজ পাথর গুঁড়ো করে তৈরি এক অপূর্ব পার্সিয়ান মোটিফযুক্ত শিল্পকর্ম।'
    },
    rating: 4.9,
    reviewsCount: 37,
    isFeatured: true
  },
  {
    id: 'up-chanderi-01',
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
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Imperial Gold Zari Chanderi Silk Tissue Saree',
    defaultDescription: 'Master Weaver Ramdas Ansari. Sheer silk-cotton woven with pure tested gold zari motifs.',
    specs: {
      dimensions: '5.5 Meters Saree with Unstitched Blouse Piece',
      material: 'Chanderi Silk Warp & Cotton Weft with Gold Zari',
      stitchDensity: 'Hand-shuttle zari insertion',
      embroideryTime: '60 Days of pit-loom weaving',
      dyeType: 'Organic Turmeric & Lac Natural Dye'
    },
    longStory: {
      englishTitle: 'Glimmer of the Malwa Kingdom',
      englishText: 'Chanderi weaving creates lightweight translucent fabrics embellished with delicate gold and silver zari buttis.',
      bengaliTitle: 'মালব রাজত্বের সোনার আলো',
      bengaliText: 'চন্দেরী তাঁতের আলো-ছায়াময় সূক্ষ্ম রেশম সুতায় বোনা সোনালী ও রূপালী জারির কাজ রাজকীয় আভিজাত্যের রূপ।'
    },
    rating: 4.92,
    reviewsCount: 22,
    isFeatured: true
  },
  {
    id: 'gj-ajrakh-01',
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
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Ajrakhpur 16-Stage Natural Dye Block Print Stole',
    defaultDescription: 'Shilp Guru Dr. Ismail M. Khatri. Natural indigo, madder, and iron-resist block print on Tussar silk.',
    specs: {
      dimensions: '2.2 Meters Length × 36" Width',
      material: '100% Pure Forest Tussar Silk',
      stitchDensity: '16-stage hand block printing',
      embroideryTime: '40 Days of resist washing and dip-dyeing',
      dyeType: 'Fermented scrap iron, indigo, and madder root'
    },
    longStory: {
      englishTitle: 'Symphony of River and Mud',
      englishText: 'Ajrakh is a complex 16-step block printing process utilizing natural minerals and vegetable dyes in Kutch.',
      bengaliTitle: 'নদী ও মাটির প্রাকৃতিক সুর',
      bengaliText: 'অজরখ হলো কচ্ছের ১৬টি জটিল ধাপে প্রাকৃতিক ভেজষ রঙ ও কারুকার্যময় কাঠের ব্লকে মুদ্রিত ঐতিহ্যবাহী বস্ত্রশিল্প।'
    },
    rating: 4.97,
    reviewsCount: 48,
    isFeatured: true
  },
  {
    id: 'tn-kanchi-01',
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
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Kanchipuram Heavy Crimson Korvai Silk Saree',
    defaultDescription: 'Master Weaver Murugan Swamy. Interlocked Korvai weave with 3-ply Mulberry silk and certified gold zari.',
    specs: {
      dimensions: '5.5 Meters Saree with Unstitched Blouse Piece',
      material: '3-Ply Mulberry Silk & Certified Pure Gold Zari',
      stitchDensity: 'Interlocked Korvai border joining',
      embroideryTime: '90 Days of 2-weaver loom operation',
      dyeType: 'Pure Crimson Organic Lac Dip'
    },
    longStory: {
      englishTitle: 'The Temple Looms of Kanchi',
      englishText: 'Korvai is the ancient temple technique of interlocked weaving where the border and body are woven separately and joined with unmatched strength.',
      bengaliTitle: 'কাঞ্চিপুরমের মন্দির তাঁত',
      bengaliText: 'কোরভই হলো কাঞ্চিপুরমের তাঁতের প্রাচীন কৌশল যেখানে শাড়ির বডি ও পাড় আলাদা বুনে অত্যন্ত শক্তিশালী সংযোগে জোড়া হয়।'
    },
    rating: 4.88,
    reviewsCount: 35,
    isFeatured: true
  },
  {
    id: 'cg-dhokra-01',
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
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Bastar Bell Metal Lost-Wax Dhokra Tribal Procession',
    defaultDescription: 'Master Craftsperson Budhram Jhoria. Ancient cire-perdue lost-wax cast bell metal sculpture depicting tribal musicians.',
    specs: {
      dimensions: '14" Length × 8" Height × 4" Depth',
      material: 'Recycled Bell Metal Brass & Beeswax Mould',
      stitchDensity: 'Cire-perdue single-use clay mould casting',
      embroideryTime: '35 Days moulding and lost-wax firing',
      dyeType: 'Natural brass patina with antique charcoal rub'
    },
    longStory: {
      englishTitle: 'Molten Bronze of the Bastar Forest',
      englishText: 'Dhokra metal casting uses the 4,000-year-old lost-wax technique, ensuring that every single figurine is a one-of-a-kind original.',
      bengaliTitle: 'বস্তারের প্রাচীন বেল মেটাল ঢালাই',
      bengaliText: 'ঢোকরা ধাতব শিল্প ৪০০০ বছরের প্রাচীন লস্ট-ওয়াক্স মোম ঢালাই পদ্ধতি মেনে তৈরি এক অনন্য উপজাতীয় নিদর্শন।'
    },
    rating: 4.93,
    reviewsCount: 29,
    isFeatured: true
  },
  {
    id: 'up-banarasi-01',
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
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Varanasi Royal Katan Silk Kadwa Jaal Brocade Saree',
    defaultDescription: 'Ustad Ramdas Ansari (Padma Nominee). Pure Katan silk with gold Zari Kadwa weaving of Mughal jaal motifs.',
    specs: {
      dimensions: '5.5 Meters with Unstitched Blouse Piece',
      material: '100% Pure Katan Mulberry Silk & Real Gold Zari',
      stitchDensity: 'Kadwa needle-by-needle weaving technique',
      embroideryTime: '100 Days of master loomwork',
      dyeType: 'Royal Emerald Green Natural Dip'
    },
    longStory: {
      englishTitle: 'The Gold Filaments of Kashi',
      englishText: 'Kadwa is the painstaking technique of weaving each motif individually into the silk fabric without any loose threads on the reverse.',
      bengaliTitle: 'কাশীর সোনার ব্রোকেড',
      bengaliText: 'কড়ওয়া হলো বারাণসীর ঐতিহ্যবাহী তাঁত কৌশল যেখানে প্রতিটি বুটি স্বতন্ত্রভাবে বোনা হয় যেন উল্টো পিঠে কোনো আলগা সুতো না থাকে।'
    },
    rating: 4.96,
    reviewsCount: 52,
    isFeatured: true
  },
  {
    id: 'od-pattachitra-01',
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
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    defaultName: 'Raghurajpur Palm Leaf Pattachitra Tale of Dashavatar',
    defaultDescription: 'Master Chitrakar Bhaskar Mahapatra. Fine etching on dried palm leaf strips with natural mineral colours depicting Vishnu avatars.',
    specs: {
      dimensions: '24" Height × 18" Width Folding Folio',
      material: 'Seasoned Palm Leaves & Natural Mineral Pigments',
      stitchDensity: 'Iron stylus needle etching & charcoal rub',
      embroideryTime: '75 Days of intricate micro-etching',
      dyeType: 'Conch shell white, lampblack, and cinnabar'
    },
    longStory: {
      englishTitle: 'Etchings on the Sacred Folios',
      englishText: 'Palm leaf Pattachitra involves stitching dried palm leaves together and etching delicate mythological scenes with an iron stylus.',
      bengaliTitle: 'তালপাতায় খোদাই করা বিষ্ণু কথা',
      bengaliText: 'তালপাতা পট্টচিত্র হলো শুকনো তালপাতাকে সুতোয় বেঁধে লোহার সূঁচালো নিব দিয়ে পৌরাণিক গল্প খোদাই করে চিত্রিত করার সুপ্রাচীন ও ঐতিহ্যবাহী ওড়িশি শিল্প।'
    },
    rating: 4.91,
    reviewsCount: 23,
    isFeatured: true
  }
];

let fileContent = `import i18n from '../i18n/i18n.js';

/**
 * KARIGAR Masterwork Products Catalog
 * Curated certified heirloom pieces across major artisan clusters of India
 */

export const PRODUCTS = [\n`;

rawProductsData.forEach((p, idx) => {
  fileContent += `  {\n`;
  fileContent += `    id: '${p.id}',\n`;
  fileContent += `    get name() { return i18n.t('buyer.data.products.${p.id}.name', '${p.defaultName.replace(/'/g, "\\'")}'); },\n`;
  fileContent += `    stateSlug: '${p.stateSlug}',\n`;
  fileContent += `    stateName: '${p.stateName}',\n`;
  fileContent += `    craftCategory: '${p.craftCategory}',\n`;
  fileContent += `    craftLineage: '${p.craftLineage}',\n`;
  fileContent += `    artisanName: '${p.artisanName.replace(/'/g, "\\'")}',\n`;
  fileContent += `    artisanTitle: '${p.artisanTitle.replace(/'/g, "\\'")}',\n`;
  fileContent += `    artisanAvatar: '${p.artisanAvatar}',\n`;
  fileContent += `    price: ${p.price},\n`;
  fileContent += `    artisanSharePercent: ${p.artisanSharePercent},\n`;
  fileContent += `    artisanShareAmount: ${p.artisanShareAmount},\n`;
  fileContent += `    platformFeeAmount: ${p.platformFeeAmount},\n`;
  fileContent += `    clusterFundAmount: ${p.clusterFundAmount},\n`;
  fileContent += `    giTagStatus: '${p.giTagStatus}',\n`;
  fileContent += `    giTagNumber: '${p.giTagNumber}',\n`;
  fileContent += `    district: '${p.district}',\n`;
  fileContent += `    images: ${JSON.stringify(p.images, null, 6)},\n`;
  fileContent += `    get description() { return i18n.t('buyer.data.products.${p.id}.description', '${p.defaultDescription.replace(/'/g, "\\'")}'); },\n`;
  fileContent += `    specs: ${JSON.stringify(p.specs, null, 6)},\n`;
  fileContent += `    get longStory() {\n`;
  fileContent += `      return {\n`;
  fileContent += `        englishTitle: i18n.t('buyer.data.products.${p.id}.longStory.title', '${p.longStory.englishTitle.replace(/'/g, "\\'")}'),\n`;
  fileContent += `        englishText: i18n.t('buyer.data.products.${p.id}.longStory.text', '${p.longStory.englishText.replace(/'/g, "\\'")}'),\n`;
  fileContent += `        bengaliTitle: i18n.language === 'bn' ? i18n.t('buyer.data.products.${p.id}.longStory.title', '${p.longStory.bengaliTitle.replace(/'/g, "\\'")}') : '${p.longStory.bengaliTitle.replace(/'/g, "\\'")}',\n`;
  fileContent += `        bengaliText: i18n.language === 'bn' ? i18n.t('buyer.data.products.${p.id}.longStory.text', '${p.longStory.bengaliText.replace(/'/g, "\\'")}') : '${p.longStory.bengaliText.replace(/'/g, "\\'")}'\n`;
  fileContent += `      };\n`;
  fileContent += `    },\n`;
  fileContent += `    rating: ${p.rating},\n`;
  fileContent += `    reviewsCount: ${p.reviewsCount},\n`;
  fileContent += `    isFeatured: ${p.isFeatured}\n`;
  fileContent += `  }${idx < rawProductsData.length - 1 ? ',' : ''}\n`;
});

fileContent += `];

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByState(stateSlug) {
  return PRODUCTS.filter(p => p.stateSlug === stateSlug);
}
`;

fs.writeFileSync(productsFilePath, fileContent, 'utf8');
console.log('Rebuilt products.js cleanly with getters!');
