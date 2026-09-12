import fs from 'fs';
import { DEMO_ARTISANS } from '../prisma/artisanData.js';

// The 13 approved categories
export const CATEGORIES = {
  HANDLOOM: 'Handloom & Textiles',
  EMBROIDERY: 'Embroidery',
  POTTERY: 'Pottery & Clay',
  METAL: 'Metal & Dhokra',
  PAINTING: 'Painting & Folk Art',
  JEWELLERY: 'Jewellery & Accessories',
  WOOD: 'Wood, Bamboo & Cane',
  BASKETRY: 'Basketry & Natural Fibres',
  STONE: 'Stone & Sculpture',
  TOYS: 'Toys & Dolls',
  LEATHER: 'Leather Craft',
  PAPER: 'Paper & Eco Crafts',
  HOME: 'Home & Living'
};

// Exact filenames on disk in demo_image/
export const categoryImageMap = {
  [CATEGORIES.HANDLOOM]: '/demo_image/Handloom & Textiles.jpg',
  [CATEGORIES.EMBROIDERY]: '/demo_image/Embroidery.jpg',
  [CATEGORIES.POTTERY]: '/demo_image/pottery & clay.jpg',
  [CATEGORIES.METAL]: '/demo_image/metal & dhokra.jpg',
  [CATEGORIES.PAINTING]: '/demo_image/Painting & folk art.jpg',
  [CATEGORIES.JEWELLERY]: '/demo_image/Jewellery & Accessories.jpg',
  [CATEGORIES.WOOD]: '/demo_image/wood bamboo and cane.jpg',
  [CATEGORIES.BASKETRY]: '/demo_image/basketry and natural fibres.jpg',
  [CATEGORIES.STONE]: '/demo_image/stone and sculpture.jpg',
  [CATEGORIES.TOYS]: '/demo_image/toys and dolls.jpg',
  [CATEGORIES.LEATHER]: '/demo_image/leather craft.jpg',
  [CATEGORIES.PAPER]: '/demo_image/paper and eco crafts.jpg',
  [CATEGORIES.HOME]: '/demo_image/home and living.jpg'
};

// Categorize every single craft type
export function categorize(craft) {
  // Handloom & Textiles
  if ([
    'Jamdani', 'Jamdani Weave', 'Baluchari & Swarnachari', 'Kani Pashmina', 'Chanderi Weave', 'Banarasi Brocade',
    'Tant', 'Patola', 'Patan Patola', 'Bandhani', 'Sambalpuri Ikat', 'Muga Silk', 
    'Kanchipuram Silk', 'Banarasi', 'Dharmavaram Silk', 'Uppada Jamdani', 'Machilipatnam Block Print', 
    'Venkatagiri Handloom', 'Apatani Handloom Weaving', 'Mishmi Handwoven Textile', 'Tangsa Tribal Weaving', 
    'Monpa Wool Weaving', 'Eri Silk', 'Handwoven Textile', 'Traditional Assamese Weaving', 
    'Bhagalpuri Tussar Silk', 'Bawan Buti Weaving', 'Kosa Silk Weaving', 'Batik Textile Art', 
    'Ajrakh Block Print', 'Tangaliya Weaving', 'Namda Wool Felt Craft', 'Panipat Handloom Durries', 
    'Khes Weaving', 'Kullu Shawl Weaving', 'Kinnauri Handloom Weaving', 'Lahauli Wool Knitted Craft', 
    'Tussar Silk Handloom', 'Ilkal Saree Weaving', 'Guledgudda Khana Weaving', 'Udupi Handloom', 
    'Navalgund Durrie Weaving', 'Balaramapuram Handloom', 'Kannur Home Textiles', 'Chanderi Weaving', 
    'Bagh Block Print', 'Maheshwari Handloom', 'Batik Textile Craft', 'Nandana Block Printing', 
    'Paithani Silk Weaving', 'Solapur Chaddar Weaving', 'Karvath Kati Tussar Weaving', 'Himroo Weaving', 
    'Mashru Textile Weaving', 'Wangkhei Phee Handloom', 'Moirang Phee Weaving', 'Ryndia Eri Silk', 
    'Garo Dakmanda Weaving', 'Endi Silk Spinning', 'Puan Weaving', 'Handloom Shawl Weaving', 
    'Naga Shawl Weaving', 'Ao Striped Skirt Weaving', 'Lotha Handspun Weaving', 'Chakesang Backstrap Weaving', 
    'Bomkai Handloom Weaving', 'Traditional Durrie Weaving', 'Bagru Block Print', 'Kota Doria', 
    'Sanganeri Block Print', 'Lepcha Handloom Weaving', 'Tibetan Woollen Carpets', 'Woollen Blanket Weaving', 
    'Madurai Sungudi', 'Salem Handloom Weaving', 'Pochampally Ikat', 'Gadwal Saree Weaving', 
    'Siddipet Gollabhama Weaving', 'Warangal Durrie Weaving', 'Telia Rumal Double Ikat', 
    'Risa Handwoven Breastcloth', 'Eri Silk Weaving', 'Handloom Pachra Weaving', 'Bhadohi Woollen Carpets', 
    'Mirzapur Durrie Weaving', 'Thulma Woollen Weaving', 'Pankhi Woollen Shawls', 'Almora Tweed Weaving', 
    'Handwoven Fishnet Craft', 'Hand-Knotted Silk Carpets', 'Hand Block Printed Textile', 
    'Pashmina Weaving', 'Kani Shawl Weaving', 'Pashmina Raw Wool Spinning', 'Woollen Rug Weaving', 
    'Pattu Wool Weaving', 'Batik Island Textile', 'Handloom Cotton Linen'
  ].includes(craft)) {
    return CATEGORIES.HANDLOOM;
  }

  // Embroidery
  if ([
    'Nakshi Kantha', 'Kutch Embroidery', 'Phulkari', 'Chikankari', 'Kantha', 'Kasuti', 'Chamba Rumal', 
    'Sujani Embroidery', 'Ahir Embroidery', 'Parsi Gara Embroidery', 'Kashmiri Aari Embroidery', 
    'Zardozi', 'Rabari Embroidery', 'Khatwa Appliqué', 'Toda Embroidery', 'Kashida Embroidery', 
    'Zardozi Embroidery', 'Lambadi Embroidery', 'Applique & Patchwork', 'Fine Needlework Embroidery'
  ].includes(craft)) {
    return CATEGORIES.EMBROIDERY;
  }

  // Pottery & Clay
  if ([
    'Jaipur Blue Pottery', 'Bankura Terracotta', 'Krishnanagar Clay', 'Khurja Pottery', 'Blue Pottery', 
    'Terracotta', 'Clay Craft', 'Regional Pottery', 'Panchmura Terracotta', 'Molela Terracotta', 
    'Black Clay Pottery', 'Gorakhpur Terracotta', 'Longpi Black Pottery', 'Larnai Black Clay Pottery', 
    'Puducherry Terracotta', 'Terracotta Craft', 'Studio Stoneware Pottery', 'Clay Terracotta Idols', 
    'Glazed Pottery', 'Handmade Ceramic Pottery'
  ].includes(craft)) {
    return CATEGORIES.POTTERY;
  }

  // Metal & Dhokra
  if ([
    'Bengal Dhokra', 'Bastar Dhokra', 'Bell Metal Work', 'Budithi Bell Metal Craft', 
    'Brass Lamp Metal Craft', 'Copper Coated Bell Craft', 'Brass Utensil Craft', 
    'Metal Bell & Temple Craft', 'Mohra Metal Sculpture', 'Tribal Dhokra', 'Bidriware', 
    'Aranmula Metal Mirror', 'Bell Metal Lamp Craft', 'Bell Metal Dhokra', 'Tikamgarh Brass Craft', 
    'Hand-Beaten Copperware', 'Bell Metal Utensil Craft', 'Bell Metal Craft', 'Tribal Metal Forging', 
    'Tribal Metal Craft', 'Odisha Dhokra', 'Hand-Hammered Metal Craft', 'Traditional Silver Metalwork', 
    'Nachiarkoil Brass Lamps', 'Thanjavur Art Plates', 'Pembarthi Sheet Metal Craft', 
    'Adilabad Dhokra', 'Moradabad Brass Craft', 'Copper Vessel Metal Craft', 
    'Hand-Hammered Brassware', 'Brass Metal Lamp Craft', 'Copper Engraving', 
    'Ladakhi Metal Teapot Craft', 'Bronze Icon Casting', 'Wrought Iron Craft'
  ].includes(craft)) {
    return CATEGORIES.METAL;
  }

  // Painting & Folk Art
  if ([
    'Kalighat Painting', 'Pattachitra', 'Madhubani', 'Madhubani Painting', 'Odisha Pattachitra', 
    'Phad Painting', 'Gond Painting', 'Warli Painting', 'Kalamkari Painting', 
    'Manjusha Painting', 'Godna Painting', 'Rogan Painting', 'Kangra Miniature Painting', 
    'Thangka Painting', 'Sohrai Painting', 'Pyatkar Scroll Painting', 'Ganjifa Card Art', 
    'Kerala Mural Painting', 'Cheriyal Scroll Painting', 'Aipan Painting', 
    'Mughal Miniature Painting', 'Thanjavur Gold Leaf Painting', 'Pichwai Painting', 'Tikuli Craft'
  ].includes(craft)) {
    return CATEGORIES.PAINTING;
  }

  // Jewellery & Accessories
  if ([
    'Kundan Jewellery', 'Meenakari Jewellery', 'Tribal Jewellery', 'Dhokra Jewellery', 'Silver Filigree', 
    'Traditional Jewellery', 'Kundan & Meenakari Jewellery', 
    'Kundan', 'Meenakari', 'Silver Filigree Work', 'Tribal Jewelry',
    'Jewellery', 'Jewelry', 'Jewellery & Accessories', 'Jewelry & Accessories',
    'Wancho Bead Jewellery', 'Cowrie Shell Jewellery', 'Sea Shell Craft', 
    'Lac Bangle Craft', 'Garo Beaded Jewellery', 'Traditional Beaded Headdress', 
    'Traditional Beaded Jewellery', 'Natural Shell & Feather Craft', 'Parandi Tassel Craft', 
    'Beaded Mala Craft', 'Tribal Bead Jewellery', 'Mother of Pearl Jewellery', 
    'Polished Sea Shell Craft', 'Beaded Perak Headdress', 
    'Coral Shell Jewellery', 'Coconut Shell Jewellery'
  ].includes(craft)) {
    return CATEGORIES.JEWELLERY;
  }

  // Wood, Bamboo & Cane
  if ([
    'Bamboo Furniture', 'Cane Baskets', 'Bamboo Craft', 'Cane Craft', 'Wood Carving', 'Wooden Handicraft',
    'Cuncolim Wooden Craft', 'Coconut Shell Craft', 'Sankheda Lacquered Woodcraft', 'Bone & Wood Inlay', 
    'Mudha Cane Furniture', 'Himachali Wood Carving', 'Tribal Wood Carving', 
    'Mysore Rosewood Inlay', 'Nettur Petti Woodcraft', 'Bamboo Reeds Craft', 
    'Bastar Wood Carving', 'Cane & Bamboo Furniture', 'Traditional Wood Carving', 
    'Konyak Wood Carving', 'Hoshiarpur Wood Inlay', 'Sheesham Wood Carving', 
    'Choktse Wooden Tables', 'Wooden Mask Carving', 'Bobbili Veena Woodcraft', 
    'Sherdukpen Wood Carving', 'Nyishi Cane & Bamboo Craft', 'Khampti Wooden Mask Craft', 
    'Bamboo Splint Craft', 'Saharanpur Wood Carving', 'Likhai Wood Carving', 
    'Garhwal Wood Carving', 'Padauk Wood Carving', 'Architectural Wood Carving', 
    'Hand-Turned Woodcraft', 'Traditional Inlay Craft', 'Wooden Boat Model Craft', 
    'Walnut Wood Carving', 'Khatamband Wood Inlay', 
    'Choktse Wood Carving', 'Miniature Wooden Boat Craft', 'Coconut Wood Furniture', 
    'Cane & Rattan Furniture', 'Tumba Gourd Craft', 'Horn Craft'
  ].includes(craft)) {
    return CATEGORIES.WOOD;
  }

  // Basketry & Natural Fibres
  if ([
    'Bamboo Basketry', 'Cane Basketry', 'Jute Craft', 'Sabai Grass Craft', 
    'Natural Fibre Craft', 'Basket Making', 'Sikki Grass Craft', 'Sisal Natural Fibre Craft', 
    'Sarkanda Grass Craft', 'Natural Grass Slippers Craft', 'Natural Fibre Weaving', 
    'Coir Craft', 'Screwpine Mat Craft', 'Kauna Reed Craft', 'Kouna Reed Basketry', 
    'Khasi Cane Basketry', 'Natural Reed Craft', 'Cane Rain Shield Craft', 
    'Mizo Bamboo Straw Hats', 'Bamboo Fish Basketry', 'Banana Fibre Craft', 
    'Angami Bamboo Basketry', 'Golden Grass Craft', 'Pattamadai Sedge Grass Mats', 
    'Ringal Bamboo Basketry', 'Nettle Natural Fibre Craft', 'Pine Needle Craft', 
    'Nocte Cane Basketry', 'Nicobarese Mat Weaving', 'Palm Frond Basketry', 
    'Coastal Natural Fibre Craft', 'Macramé Fibre Craft', 'Wild Reed Mat Weaving', 
    'Coconut Frond Basketry', 'Willow Wicker Basketry', 'Natural Shrub Basketry', 
    'Yak Wool Braid Craft', 'Coir Fibre Cordage', 'Grass Mat Weaving', 
    'Palm Leaf Thatched Weaving', 'Traditional Net Weaving', 'Cane & Bamboo Basketry'
  ].includes(craft)) {
    return CATEGORIES.BASKETRY;
  }

  // Stone & Sculpture
  if ([
    'Marble Carving', 'Stone Carving', 'Konark-style Stone Craft', 'Mahabalipuram Sculpture', 
    'Traditional Sculpture', 'Durgi Stone Carving', 'Tribal Stone Carving', 
    'Sandstone Screen Carving', 'Bronze Sculpture', 'Soft Stone Carving'
  ].includes(craft)) {
    return CATEGORIES.STONE;
  }

  // Toys & Dolls
  if ([
    'Channapatna Toys', 'Bengal Dolls', 'Kondapalli Toys', 'Wooden Toys', 'Clay Dolls', 'Traditional Dolls', 
    'Patna Wooden Toys', 'Kinhal Wooden Toys', 'Sawantwadi Wooden Toys', 
    'Traditional Potloi Dolls', 'Cow Dung Toy Craft', 'Nirmal Wooden Toys', 'Saraikela Chhau Masks'
  ].includes(craft)) {
    return CATEGORIES.TOYS;
  }

  // Leather Craft
  if ([
    'Mojari', 'Jutti', 'Shantiniketan Leather', 'Shantiniketan Leather Craft', 'Kolhapuri Footwear', 
    'Traditional Leather Craft', 'Leather Puppet Craft', 'Tila Mojari', 
    'Usta Art', 'Leather Sports Craft', 'Handcrafted Leather Craft'
  ].includes(craft)) {
    return CATEGORIES.LEATHER;
  }

  // Paper & Eco Crafts
  if ([
    'Kashmiri Papier-mâché', 'Handmade Paper Craft', 'Paper Décor', 'Eco Craft', 'Jute Eco Craft', 
    'Natural Fibre Eco Craft', 'Monpa Handmade Paper Craft', 'Sitalpati Mat Craft'
  ].includes(craft)) {
    return CATEGORIES.PAPER;
  }

  // Home & Living
  if ([
    'Handwoven Home Textile', 'Terracotta Décor', 'Wooden Décor', 'Metal Décor', 'Cane Furniture', 
    'Handmade Basketry', 'Natural Fibre Décor', 'Traditional Home Textile', 
    'Bamboo Home Décor', 'Jute Fibre Décor', 'Firozabad Glass Craft', 'Marine Driftwood Décor', 
    'Recycled Glass Craft', 'Sea Glass Craft', 'Hand-Rolled Incense Craft'
  ].includes(craft)) {
    return CATEGORIES.HOME;
  }

  return null;
}

// Build craftCategoryMap
const craftCategoryMap = {};
const unmapped = [];
const categoryCrafts = {};

for (const cat of Object.values(CATEGORIES)) {
  categoryCrafts[cat] = new Set();
}

// List of all prompt examples to guarantee 100% coverage of prompt queries
const PROMPT_CRAFTS = [
  'Jamdani', 'Tant', 'Patola', 'Bandhani', 'Sambalpuri Ikat', 'Muga Silk', 'Kanchipuram Silk', 'Banarasi',
  'Kutch Embroidery', 'Phulkari', 'Chikankari', 'Kantha', 'Kasuti',
  'Bankura Terracotta', 'Krishnanagar Clay', 'Khurja Pottery', 'Blue Pottery', 'Terracotta', 'Clay Craft', 'Regional Pottery',
  'Bengal Dhokra', 'Bastar Dhokra', 'Dhokra Jewellery', 'Bell Metal Work', 'Tribal Metal Craft',
  'Kalighat Painting', 'Pattachitra', 'Madhubani', 'Odisha Pattachitra', 'Phad Painting', 'Gond Painting', 'Warli Painting',
  'Kundan Jewellery', 'Meenakari Jewellery', 'Tribal Jewellery', 'Silver Filigree', 'Traditional Jewellery',
  'Bamboo Furniture', 'Cane Baskets', 'Bamboo Craft', 'Cane Craft', 'Wood Carving', 'Wooden Handicraft',
  'Bamboo Basketry', 'Cane Basketry', 'Jute Craft', 'Sabai Grass Craft', 'Natural Fibre Craft', 'Basket Making',
  'Marble Carving', 'Stone Carving', 'Konark-style Stone Craft', 'Mahabalipuram Sculpture', 'Traditional Sculpture',
  'Channapatna Toys', 'Bengal Dolls', 'Kondapalli Toys', 'Wooden Toys', 'Clay Dolls', 'Traditional Dolls',
  'Mojari', 'Jutti', 'Shantiniketan Leather', 'Kolhapuri Footwear', 'Traditional Leather Craft',
  'Kashmiri Papier-mâché', 'Handmade Paper Craft', 'Paper Décor', 'Eco Craft', 'Jute Eco Craft', 'Natural Fibre Eco Craft',
  'Handwoven Home Textile', 'Terracotta Décor', 'Wooden Décor', 'Metal Décor', 'Cane Furniture', 'Handmade Basketry', 'Natural Fibre Décor', 'Traditional Home Textile'
];

for (const craft of PROMPT_CRAFTS) {
  const cat = categorize(craft);
  if (!cat) {
    unmapped.push(craft);
  } else {
    craftCategoryMap[craft] = cat;
    categoryCrafts[cat].add(craft);
  }
}

for (const artisan of DEMO_ARTISANS) {
  const craft = artisan.craftType;
  const cat = categorize(craft);
  if (!cat) {
    unmapped.push(craft);
  } else {
    craftCategoryMap[craft] = cat;
    categoryCrafts[cat].add(craft);
  }
}

if (unmapped.length > 0) {
  console.error('UNMAPPED CRAFTS DETECTED:', [...new Set(unmapped)]);
  process.exit(1);
}

// Verify physical existence of all files
for (const [cat, relPath] of Object.entries(categoryImageMap)) {
  const diskPath = '.' + relPath;
  if (!fs.existsSync(diskPath)) {
    throw new Error(`File does not exist: ${diskPath}`);
  }
}

console.log('All 360 artisans and all prompt examples successfully mapped to their parent categories!');
for (const [cat, set] of Object.entries(categoryCrafts)) {
  console.log(`Category: ${cat} (${categoryImageMap[cat]}) -> ${set.size} distinct craft types`);
}

// Write src/constants/craftImageMap.js
const fileContent = `/**
 * KARIGAR Artisanal Heritage Platform - Central Craft Image & Category Mapping
 * 
 * Maps every specific craftType to its parent Category and the corresponding
 * verified image asset from the existing /demo_image folder.
 */

export const craftCategoryMap = Object.freeze(${JSON.stringify(craftCategoryMap, null, 2)});

export const categoryImageMap = Object.freeze(${JSON.stringify(categoryImageMap, null, 2)});

export const DEFAULT_CRAFT_IMAGE = '/demo_image/Handloom & Textiles.jpg';

/**
 * Returns the parent category name for a given craftType
 * @param {string} craftType 
 * @returns {string} Category name
 */
export function getCraftCategory(craftType) {
  if (!craftType) return 'Handloom & Textiles';
  return craftCategoryMap[craftType] || 'Handloom & Textiles';
}

/**
 * Returns the exact verified image URL for a given craftType by resolving
 * through its parent category.
 * @param {string} craftType 
 * @returns {string} Image path (e.g. '/demo_image/Handloom & Textiles.jpg')
 */
export function getCraftImage(craftType) {
  const category = craftCategoryMap[craftType];
  if (!category) {
    console.warn(\`Unknown craftType: \${craftType}\`);
    return DEFAULT_CRAFT_IMAGE;
  }
  return categoryImageMap[category] || DEFAULT_CRAFT_IMAGE;
}
`;

fs.writeFileSync('./src/constants/craftImageMap.js', fileContent, 'utf8');
console.log('Successfully written to src/constants/craftImageMap.js');

