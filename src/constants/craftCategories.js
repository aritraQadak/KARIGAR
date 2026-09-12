import { craftCategoryMap } from './craftImageMap.js';

export const CRAFT_CATEGORIES = Object.freeze([
  'Handloom & Textiles','Embroidery','Pottery & Clay','Metal & Dhokra',
  'Painting & Folk Art','Jewellery & Accessories','Wood, Bamboo & Cane',
  'Basketry & Natural Fibres','Stone & Sculpture','Toys & Dolls','Leather Craft',
  'Paper & Eco Crafts','Home & Living',
]);
export const LEGACY_CRAFT_CATEGORIES = Object.freeze({
  'handloom':'Handloom & Textiles','textiles':'Handloom & Textiles',
  'pottery':'Pottery & Clay','pottery/clay':'Pottery & Clay','pottery & ceramics':'Pottery & Clay','clay':'Pottery & Clay',
  'metal':'Metal & Dhokra','metal craft':'Metal & Dhokra','dhokra':'Metal & Dhokra',
  'painting':'Painting & Folk Art','folk painting':'Painting & Folk Art',
  'jewellery':'Jewellery & Accessories','jewelry':'Jewellery & Accessories',
  'wood':'Wood, Bamboo & Cane','woodcraft':'Wood, Bamboo & Cane','bamboo & cane':'Wood, Bamboo & Cane',
  'natural fibre':'Basketry & Natural Fibres','natural fiber':'Basketry & Natural Fibres','basketry':'Basketry & Natural Fibres',
  'stone':'Stone & Sculpture','sculpture':'Stone & Sculpture','toys':'Toys & Dolls',
  'leather':'Leather Craft','paper':'Paper & Eco Crafts','decor':'Home & Living','home decor':'Home & Living',
});

// Lowercase lookup cache for resilient matching
const lowerCategoryMap = Object.freeze(
  Object.fromEntries(
    Object.entries(craftCategoryMap).map(([k, v]) => [k.trim().toLowerCase(), v])
  )
);

export function normalizeCraftCategory(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return '';
  const lower = text.toLowerCase();
  // 1. Direct match with approved category
  const exact = CRAFT_CATEGORIES.find(item => item.toLowerCase() === lower);
  if (exact) return exact;
  // 2. Direct match in craftCategoryMap
  if (craftCategoryMap[text]) return craftCategoryMap[text];
  // 3. Lowercase match in craftCategoryMap
  if (lowerCategoryMap[lower]) return lowerCategoryMap[lower];
  // 4. Legacy category alias
  if (LEGACY_CRAFT_CATEGORIES[lower]) return LEGACY_CRAFT_CATEGORIES[lower];
  return text;
}
export function isCraftCategory(value){return CRAFT_CATEGORIES.includes(normalizeCraftCategory(value));}

