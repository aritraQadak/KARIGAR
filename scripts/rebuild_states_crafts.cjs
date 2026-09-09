const fs = require('fs');
const path = require('path');

const statesCraftsFilePath = path.join(__dirname, '..', 'src', 'data', 'statesCrafts.js');

const rawStatesData = [
  // --- NORTH ---
  {
    slug: 'haryana',
    region: 'North',
    name: 'Haryana',
    description: 'Land of sacred looms, intricate Phulkari embroidery weaves, and ancient terracotta metalworks.',
    crafts: [
      { category: 'Embroidery', items: ['Phulkari Hand Embroidery', 'Bagh Needlework'] },
      { category: 'Pottery/Clay', items: ['Jhajjar Earthenware Potters', 'Rohtak Terracotta'] },
      { category: 'Handloom & Textiles', items: ['Panipat Durries', 'Khes Weaving'] }
    ]
  },
  {
    slug: 'himachal-pradesh',
    region: 'North',
    name: 'Himachal Pradesh',
    description: 'High-altitude Himalayan weaves, famed Kullu shawls, Chamba rumals, and intricate wood carving traditions.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Kullu Patterned Shawls', 'Kinnauri Woollen Shawls', 'Pattu Weaving'] },
      { category: 'Embroidery', items: ['Chamba Rumal Double-Sided Needlework'] },
      { category: 'Metal', items: ['Chamba Brass & Copper Temple Metalwork'] },
      { category: 'Wood', items: ['Himachali Carved Teak & Pine Architectural Panels'] }
    ]
  },
  {
    slug: 'punjab',
    region: 'North',
    name: 'Punjab',
    description: 'Vibrant land of golden Phulkari gardens, handcrafted Jutti footwear, and royal brass inlay crafts.',
    crafts: [
      { category: 'Embroidery', items: ['Phulkari & Chope Heritage Needlework'] },
      { category: 'Leather', items: ['Tilla Hand-Embroidered Punjabi Juttis'] },
      { category: 'Metal', items: ['Jandiala Guru Thatheras Brassware (UNESCO)'] },
      { category: 'Wood', items: ['Hoshiarpur Wood & Bone Inlay Craft'] }
    ]
  },
  {
    slug: 'rajasthan',
    region: 'North',
    name: 'Rajasthan',
    description: 'Royal desert kingdom celebrated for Jaipur Blue Pottery, Ajrakh & Dabu block prints, and Marwar miniature painting.',
    crafts: [
      { category: 'Pottery/Clay', items: ['Jaipur Quartz Blue Pottery', 'Molela Terracotta Plaques'] },
      { category: 'Handloom & Textiles', items: ['Kota Doria Zari Sarees', 'Bandhani Tie-Dye Muslin', 'Bagru & Dabu Woodblock Prints'] },
      { category: 'Painting & Folk Art', items: ['Pichwai Temple Wall Art', 'Kishangarh & Marwar Miniatures', 'Phad Scroll Painting'] },
      { category: 'Leather', items: ['Mojari Hand-Stitched Leather Footwear'] },
      { category: 'Jewellery', items: ['Meenakari Enamel & Kundan Jewellery'] }
    ]
  },
  {
    slug: 'uttar-pradesh',
    region: 'North',
    name: 'Uttar Pradesh',
    description: 'Sacred cradle of Banarasi brocade weaves, delicate Chikankari white needlecraft, and Firozabad glass art.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Banarasi Katan Silk & Zari Brocade', 'Tanda Handloom Fabrics'] },
      { category: 'Embroidery', items: ['Lucknow Chikankari Needlework', 'Zardozi Gold Filament Embroidery'] },
      { category: 'Metal', items: ['Moradabad Engraved Brassware', 'Aligarh Brass Craft'] },
      { category: 'Wood', items: ['Saharanpur Carved Sheesham Woodcraft'] },
      { category: 'Special/Other', items: ['Kannauj Natural Attar Perfumery', 'Firozabad Glassware'] }
    ]
  },
  {
    slug: 'uttarakhand',
    region: 'North',
    name: 'Uttarakhand',
    description: 'Alpine sanctuary of Aipan geometric floor frescoes, Ringal bamboo weaving, and Himalayan sheep wool blankets.',
    crafts: [
      { category: 'Painting & Folk Art', items: ['Aipan Sacred Geometric Frescoes', 'Garhwal Miniature Paintings'] },
      { category: 'Natural Fibre', items: ['Ringal Bamboo Weaving', 'Nettle Fibre Textiles'] },
      { category: 'Handloom & Textiles', items: ['Pankhi Woollen Blankets', 'Thulma Heavy Weaves'] },
      { category: 'Wood', items: ['Kumaoni Likhai Architectural Woodcarving'] }
    ]
  },

  // --- SOUTH ---
  {
    slug: 'andhra-pradesh',
    region: 'South',
    name: 'Andhra Pradesh',
    description: 'Home of Kalamkari hand-painted temple scrolls, Uppada Jamdani weaves, and Kondapalli wooden toys.',
    crafts: [
      { category: 'Painting & Folk Art', items: ['Srikalahasti Freehand Kalamkari', 'Machilipatnam Block Kalamkari'] },
      { category: 'Handloom & Textiles', items: ['Uppada Jamdani Fine Cotton', 'Dharmavaram Silk Sarees', 'Mangalagiri Cotton Weaves'] },
      { category: 'Wood', items: ['Kondapalli Softwood Toys', 'Etikoppaka Lacquerware Toys'] }
    ]
  },
  {
    slug: 'karnataka',
    region: 'South',
    name: 'Karnataka',
    description: 'Kingdom of Mysore pure mulberry silk, Bidriware silver inlay, and Channapatna wooden craft.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Mysore Crepe Silk Sarees', 'Ilkal Cotton & Silk Sarees', 'Guledgudda Khana Fabric'] },
      { category: 'Metal', items: ['Bidriware Silver Inlay Metalwork'] },
      { category: 'Wood', items: ['Channapatna Lacquerware Toys & Beads', 'Mysore Rosewood Inlay'] },
      { category: 'Special/Other', items: ['Sandals & Sandalwood Carving'] }
    ]
  },
  {
    slug: 'kerala',
    region: 'South',
    name: 'Kerala',
    description: 'Gods own country famed for Kasavu gold-bordered muslins, Aranmula metal mirrors, and coconut shell crafts.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Balaramapuram Kasavu Gold Saree', 'Kutampully Handloom Textiles'] },
      { category: 'Metal', items: ['Aranmula Kannadi Pure Metal Alloy Mirror', 'Payyannur Bell Metal Bells'] },
      { category: 'Natural Fibre', items: ['Coir Door Mats & Fibre Tapestries', 'Screwpine Leaf Mats'] },
      { category: 'Wood', items: ['Nettur Petti Wooden Keepsake Boxes', 'Kathakali Wooden Masks'] }
    ]
  },
  {
    slug: 'tamil-nadu',
    region: 'South',
    name: 'Tamil Nadu',
    description: 'Dravidian sanctuary of lustrous Kanchipuram silk temple weaves, Tanjore gold leaf paintings, and Swamimalai bronze icons.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Kanchipuram Heavy Silk Sarees', 'Madurai Sungudi Tie-Dye', 'Chettinad Cotton Sarees', 'Toda Tribal Embroidery'] },
      { category: 'Metal', items: ['Swamimalai Chola Bronze Castings', 'Nachiyar Kovil Brass Lamps'] },
      { category: 'Painting & Folk Art', items: ['Tanjore Gold Leaf Reliquary Paintings'] },
      { category: 'Wood', items: ['Tanjore Wooden Veena Musical Instruments', 'Pathamadai Mat Weaving'] }
    ]
  },
  {
    slug: 'telangana',
    region: 'South',
    name: 'Telangana',
    description: 'Land of geometric Pochampally Ikat textiles, Pembarthi sheet metalware, and Cheriyal scroll paintings.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Pochampally Double Ikat', 'Gadwal Silk & Cotton Sarees', 'Gollabama Sarees'] },
      { category: 'Metal', items: ['Pembarthi Embossed Brassware'] },
      { category: 'Painting & Folk Art', items: ['Cheriyal Nakashi Scroll Paintings'] },
      { category: 'Wood', items: ['Nirmal Painted Furniture & Toys'] }
    ]
  },

  // --- EAST ---
  {
    slug: 'bihar',
    region: 'East',
    name: 'Bihar',
    description: 'Ancient crucible of Mithila Madhubani folk paintings, Bhagalpuri wild tussar silk, and Sikki grass crafts.',
    crafts: [
      { category: 'Painting & Folk Art', items: ['Madhubani / Mithila Fresco & Canvas Art', 'Manjusha Scroll Art'] },
      { category: 'Handloom & Textiles', items: ['Bhagalpuri Tussar & Matka Silk', 'Bawan Butti Cotton Weaves'] },
      { category: 'Natural Fibre', items: ['Sikki Golden Grass Baskets & Decor'] },
      { category: 'Special/Other', items: ['Tikuli Glass Enamel Painting', 'Khatwa Patchwork Applique'] }
    ]
  },
  {
    slug: 'jharkhand',
    region: 'East',
    name: 'Jharkhand',
    description: 'Forest realm of Sohrai Khovar tribal mural art, Kuchai Tussar silk, and brass Dhokra metal casting.',
    crafts: [
      { category: 'Painting & Folk Art', items: ['Sohrai & Khovar Cave Mural Art', 'Jadopatia Tribal Scrolls'] },
      { category: 'Metal', items: ['Dhokra Lost-Wax Brass Figurines'] },
      { category: 'Handloom & Textiles', items: ['Kuchai Organic Tussar Silk'] },
      { category: 'Natural Fibre', items: ['Bamboo & Sabai Grass Baskets'] }
    ]
  },
  {
    slug: 'odisha',
    region: 'East',
    name: 'Odisha',
    description: 'Maritime heritage land of Sambalpuri Ikat handlooms, Raghurajpur Pattachitra palm-leaf scrolls, and Silver Filigree.',
    heroImage: '/images/states/odisha.png',
    tagline: 'Land of Craft, Culture & Coastlines',
    quote: 'Where every weave tells a story.',
    categories: ['Craft', 'Culture', 'Heritage', 'Artisans'],
    crafts: [
      { category: 'Painting & Folk Art', items: ['Raghurajpur Pattachitra Palm Leaf Scrolls', 'Jhoti Chita Folk Frescoes'] },
      { category: 'Handloom & Textiles', items: ['Sambalpuri Bandha Double Ikat', 'Bomkai & Pasapalli Silk Sarees', 'Kotpad Tribal Natural Dye Weaves'] },
      { category: 'Jewellery', items: ['Cuttack Tarakasi Silver Filigree'] },
      { category: 'Pottery/Clay', items: ['Terracotta Ritual Pottery'] }
    ]
  },
  {
    slug: 'west-bengal',
    region: 'East',
    name: 'West Bengal',
    description: 'Cultural bastion of narrative Nakshi Kantha embroideries, gossamer Jamdani muslins, Bankura terracotta, and Shantiniketan leather.',
    crafts: [
      { category: 'Embroidery', items: ['Nakshi Kantha Narrative Stitching', 'Sujani Needlework'] },
      { category: 'Handloom & Textiles', items: ['Dhakai & Shantipur Jamdani Muslin', 'Baluchari & Swarnachari Mythological Silk', 'Tangail Handloom Sarees'] },
      { category: 'Pottery/Clay', items: ['Bankura Panchmura Terracotta Horses', 'Krishnanagar Clay Sculptures'] },
      { category: 'Leather', items: ['Shantiniketan Embossed Goatskin Leathercraft'] },
      { category: 'Wood', items: ['Natungram Carved Wooden Dolls'] }
    ]
  },

  // --- WEST ---
  {
    slug: 'goa',
    region: 'West',
    name: 'Goa',
    description: 'Coastal craft enclave of Kunbi tribal weaves, Azulejos ceramic tiles, and coconut shell carving.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Kunbi Tribal Red-Check Sarees'] },
      { category: 'Pottery/Clay', items: ['Azulejos Painted Ceramic Tiles'] },
      { category: 'Special/Other', items: ['Coconut Shell Carving & Crafts', 'Seashell Jewellery & Mirrors'] }
    ]
  },
  {
    slug: 'gujarat',
    region: 'West',
    name: 'Gujarat',
    description: 'Vibrant craft kingdom of Ajrakh block prints, Patan Patola double Ikat, Kutchi mirror embroidery, and Rogan art.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Ajrakh 16-Stage Natural Block Print', 'Patan Patola Double Ikat Silk', 'Tangaliya Warp-Tufted Weaving'] },
      { category: 'Embroidery', items: ['Kutchi Mirrorwork (Kutch Bharat)', 'Rabari & Ahir Embroidery'] },
      { category: 'Painting & Folk Art', items: ['Pithora Tribal Murals', 'Nirona Castor Oil Rogan Art'] },
      { category: 'Wood', items: ['Sankheda Lacquered Wooden Furniture'] }
    ]
  },
  {
    slug: 'maharashtra',
    region: 'West',
    name: 'Maharashtra',
    description: 'Cradle of royal Paithani peacock sarees, Warli tribal wall frescoes, and Kolhapuri leather chappals.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Paithani Peacock Silk Sarees', 'Karvath Kati Tussar Sarees'] },
      { category: 'Painting & Folk Art', items: ['Warli Tribal Rice-Paste Wall Art', 'Pinguli Chitrakathi Puppets'] },
      { category: 'Leather', items: ['Kolhapuri Hand-Stitched Leather Footwear'] },
      { category: 'Metal', items: ['Kopardikar Copper & Brassware'] }
    ]
  },

  // --- CENTRAL ---
  {
    slug: 'chhattisgarh',
    region: 'Central',
    name: 'Chhattisgarh',
    description: 'Tribal heartland of Bell Metal Dhokra casting, Kosa tussar silk, and Godna tattoo painting.',
    crafts: [
      { category: 'Metal', items: ['Bastar Dhokra Lost-Wax Bell Metal', 'Loha Shilpa Wrought Iron Craft'] },
      { category: 'Handloom & Textiles', items: ['Kosa Wild Tussar Silk Weaves'] },
      { category: 'Painting & Folk Art', items: ['Godna Tattoo Painting on Fabric', 'Pithora Tribal Art'] },
      { category: 'Wood', items: ['Bastar Woodcarving & Totems'] }
    ]
  },
  {
    slug: 'madhya-pradesh',
    region: 'Central',
    name: 'Madhya Pradesh',
    description: 'Historic realm of Chanderi sheer sarees, Maheshwari weaves, Bagh block printing, and Gond folk art.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Chanderi Silk & Zari Weaves', 'Maheshwari Cotton-Silk Sarees'] },
      { category: 'Handloom & Textiles', items: ['Bagh Natural Chemical-Free Block Print', 'Nandana Indigo Block Print'] },
      { category: 'Painting & Folk Art', items: ['Gond Tribal Line-and-Dot Paintings'] },
      { category: 'Metal', items: ['Tikamgarh Brass & Bronze Castings'] }
    ]
  },

  // --- NORTHEAST ---
  {
    slug: 'arunachal-pradesh',
    region: 'Northeast',
    name: 'Arunachal Pradesh',
    description: 'Highland realm of Apatani geometric weaves, Monpa handmade paper, and tribal woodcarving.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Apatani Striped Loin-Loom Weaves', 'Sherdukpen Tribal Fabrics'] },
      { category: 'Special/Other', items: ['Monpa Bark Handmade Paper (Shugu)'] },
      { category: 'Wood', items: ['Wancho & Khamti Ritual Woodcarving'] },
      { category: 'Natural Fibre', items: ['Cane & Bamboo Tribal Backpacks (Jamse)'] }
    ]
  },
  {
    slug: 'assam',
    region: 'Northeast',
    name: 'Assam',
    description: 'Valley of golden Muga silk, Eri ahimsa silk, Jaapi bamboo hats, and Majuli traditional masks.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Sualkuchi Golden Muga Silk Mekhela Chador', 'Eri Ahimsa Warm Silk', 'Nishad Bodoland Weaves'] },
      { category: 'Natural Fibre', items: ['Jaapi Conical Bamboo Headgear', 'Cooling Sitalpati Cane Mats'] },
      { category: 'Special/Other', items: ['Majuli Island Clay & Paper-Mâché Mask Art'] }
    ]
  },
  {
    slug: 'manipur',
    region: 'Northeast',
    name: 'Manipur',
    description: 'Land of Shaphee Lanphee lotus weaves, Kauna reed craft, and Longpi black earthenware.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Shaphee Lanphee Warrior Shawls', 'Moirang Phee Temple-Border Weaves', 'Lotus Fibre Weaving'] },
      { category: 'Natural Fibre', items: ['Kauna Water Reed Cushions & Baskets'] },
      { category: 'Pottery/Clay', items: ['Longpi Serpentinite Black Clay Pottery'] }
    ]
  },
  {
    slug: 'meghalaya',
    region: 'Northeast',
    name: 'Meghalaya',
    description: 'Abode of Ryndia organic Eri silk, cane weaving, and Khasi bamboo architecture.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Ryndia Organic Plant-Dyed Eri Silk'] },
      { category: 'Natural Fibre', items: ['Khasi Tlieng Cane Mats', 'Garo Bamboo Baskets (Kopra)'] },
      { category: 'Wood', items: ['Carved Wood Artifacts'] }
    ]
  },
  {
    slug: 'mizoram',
    region: 'Northeast',
    name: 'Mizoram',
    description: 'Highland kingdom of Puan complex striped weaves, cane baskets, and Bamboo dance crafts.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Puanchei & Ngotekherh Traditional Shawls'] },
      { category: 'Natural Fibre', items: ['Thul Bamboo Baskets', 'Vangchhia Cane Crafts'] }
    ]
  },
  {
    slug: 'nagaland',
    region: 'Northeast',
    name: 'Nagaland',
    description: 'Naga warrior shawls, intricate beadwork, and bamboo drinking mugs.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Ao & Angami Naga Warrior Shawls (Tsungkotepsu)'] },
      { category: 'Jewellery', items: ['Naga Glass & Carnelian Tribal Beadwork'] },
      { category: 'Natural Fibre', items: ['Liyang Bamboo Mugs & Sculpted Baskets'] }
    ]
  },
  {
    slug: 'sikkim',
    region: 'Northeast',
    name: 'Sikkim',
    description: 'Alpine realm of Bhutia carpet weaving, Choktse carved tables, and Lepcha handlooms.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Bhutia Hand-Knotted Woollen Carpets', 'Lepcha Traditional Fabrics (Thara)'] },
      { category: 'Wood', items: ['Choktse Foldable Carved Wooden Tables'] },
      { category: 'Painting & Folk Art', items: ['Buddhist Thangka Scroll Paintings'] }
    ]
  },
  {
    slug: 'tripura',
    region: 'Northeast',
    name: 'Tripura',
    description: 'Haven of Risa & Rignai textiles, bamboo furniture, and cane basketry.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Risa & Rignai Tribal Chest-Wraps'] },
      { category: 'Natural Fibre', items: ['Split-Bamboo Screen Murals', 'Cane Furniture & Handbags'] }
    ]
  },

  // --- UNION TERRITORIES ---
  {
    slug: 'andaman-nicobar',
    region: 'Union Territory',
    name: 'Andaman & Nicobar Islands',
    description: 'Island arc of Nicobari mat weaving, shell craft jewellery, and padauk woodcarving.',
    crafts: [
      { category: 'Natural Fibre', items: ['Nicobari Pandanus Mat Weaving'] },
      { category: 'Jewellery', items: ['Mother-of-Pearl & Sea Shell Carvings'] },
      { category: 'Wood', items: ['Andaman Padauk Woodcraft'] }
    ]
  },
  {
    slug: 'chandigarh',
    region: 'Union Territory',
    name: 'Chandigarh',
    description: 'Heritage hub of Phulkari embroidery, Punjabi jutti, and modern pottery collectives.',
    crafts: [
      { category: 'Embroidery', items: ['Urban Phulkari Revival Art'] },
      { category: 'Pottery/Clay', items: ['Architectural Terracotta Ceramics'] }
    ]
  },
  {
    slug: 'daman-diu-dadra',
    region: 'Union Territory',
    name: 'Daman, Diu & Nagar Haveli',
    description: 'Coastal hub of Portuguese-influenced lace embroidery, shell crafts, and palm mat weaving.',
    crafts: [
      { category: 'Embroidery', items: ['Luso-Goan Lace & Cutwork Embroidery'] },
      { category: 'Natural Fibre', items: ['Palm Leaf Weaving & Basketry'] }
    ]
  },
  {
    slug: 'delhi',
    region: 'Union Territory',
    name: 'Delhi (NCT)',
    description: 'Imperial capital of Zardozi gold thread embroidery, Mughal miniature art, and ivory-style wood inlay.',
    crafts: [
      { category: 'Embroidery', items: ['Zardozi Heavy Metallic Embroidery'] },
      { category: 'Painting & Folk Art', items: ['Mughal Style Miniature Painting'] },
      { category: 'Metal', items: ['Old Delhi Brass Inlay & Engraving'] }
    ]
  },
  {
    slug: 'jammu-kashmir',
    region: 'Union Territory',
    name: 'Jammu & Kashmir',
    description: 'Crown land of Pashmina, Kani weave shawls, Papier-mâché, and Walnut woodcarving.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Pashmina Wool Spinning & Weaving', 'Kani Shuttle Shawls'] },
      { category: 'Painting & Folk Art', items: ['Kashmiri Papier-Mâché Miniature Painting'] },
      { category: 'Wood', items: ['Walnut Wood Architectural Carving'] },
      { category: 'Embroidery', items: ['Sozni Fine Needlework', 'Aari Chain Stitch Embroidery'] }
    ]
  },
  {
    slug: 'ladakh',
    region: 'Union Territory',
    name: 'Ladakh',
    description: 'High-altitude sanctuary of Pashmina wool spinning, Thangka scroll painting, and Nomad carpet weaves.',
    crafts: [
      { category: 'Handloom & Textiles', items: ['Pashkya Nomad Pashmina Wool Weaves', 'Snabu Heavy Woollen Cloth'] },
      { category: 'Painting & Folk Art', items: ['Monastery Thangka Pigment Scrolls'] },
      { category: 'Metal', items: ['Ladakhi Brass & Copper Tea Stoves (Raskang)'] }
    ]
  },
  {
    slug: 'lakshadweep',
    region: 'Union Territory',
    name: 'Lakshadweep',
    description: 'Coral archipelago of Coconut shell craft, coir fibre matting, and tortoise shell motifs.',
    crafts: [
      { category: 'Natural Fibre', items: ['Coir Fibre Rope Spinning & Matting'] },
      { category: 'Special/Other', items: ['Coconut Shell Carving & Craftwork'] }
    ]
  },
  {
    slug: 'puducherry',
    region: 'Union Territory',
    name: 'Puducherry',
    description: 'Franco-Tamil enclave of handmade paper, terracotta figures, and natural dye batik.',
    crafts: [
      { category: 'Special/Other', items: ['Auroville Cotton & Silk Batik Dyeing', 'Handmade Rag Paperwork'] },
      { category: 'Pottery/Clay', items: ['Terracotta Statuettes & Glazed Ceramics'] }
    ]
  }
];

export const REGIONS = [
  'North',
  'South',
  'East',
  'West',
  'Central',
  'Northeast',
  'Union Territory'
];

export const CRAFT_TYPES = [
  'Handloom & Textiles',
  'Embroidery',
  'Painting & Folk Art',
  'Wood',
  'Metal',
  'Pottery/Clay',
  'Jewellery',
  'Natural Fibre',
  'Leather',
  'Special/Other'
];

let fileContent = `import i18n from '../i18n/i18n.js';

export const REGIONS = ${JSON.stringify(REGIONS, null, 2)};

export const CRAFT_TYPES = ${JSON.stringify(CRAFT_TYPES, null, 2)};

export const STATES_CRAFTS = [\n`;

rawStatesData.forEach((st, idx) => {
  fileContent += `  {\n`;
  fileContent += `    slug: '${st.slug}',\n`;
  fileContent += `    region: '${st.region}',\n`;
  if (st.heroImage) fileContent += `    heroImage: '${st.heroImage}',\n`;
  fileContent += `    get name() { return i18n.t("buyer.data.states.${st.slug}.name", "${st.name.replace(/"/g, '\\"')}"); },\n`;
  fileContent += `    get description() { return i18n.t("buyer.data.states.${st.slug}.description", "${st.description.replace(/"/g, '\\"')}"); },\n`;
  if (st.tagline) {
    fileContent += `    get tagline() { return i18n.t("buyer.data.states.${st.slug}.tagline", "${st.tagline.replace(/"/g, '\\"')}"); },\n`;
  }
  if (st.quote) {
    fileContent += `    get quote() { return i18n.t("buyer.data.states.${st.slug}.quote", "${st.quote.replace(/"/g, '\\"')}"); },\n`;
  }
  if (st.categories) {
    fileContent += `    get categories() {\n`;
    fileContent += `      return [\n`;
    fileContent += `        i18n.t("buyer.stateExplore.catCraft", "Craft"),\n`;
    fileContent += `        i18n.t("buyer.stateExplore.catCulture", "Culture"),\n`;
    fileContent += `        i18n.t("buyer.stateExplore.catHeritage", "Heritage"),\n`;
    fileContent += `        i18n.t("buyer.stateExplore.catArtisans", "Artisans")\n`;
    fileContent += `      ];\n`;
    fileContent += `    },\n`;
  }
  fileContent += `    crafts: ${JSON.stringify(st.crafts, null, 6)}\n`;
  fileContent += `  }${idx < rawStatesData.length - 1 ? ',' : ''}\n`;
});

fileContent += `];

export function getStateBySlug(slug) {
  return STATES_CRAFTS.find(s => s.slug === slug);
}
`;

fs.writeFileSync(statesCraftsFilePath, fileContent, 'utf8');
console.log('Rebuilt statesCrafts.js cleanly!');
