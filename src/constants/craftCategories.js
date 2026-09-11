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
export function normalizeCraftCategory(value) {
  const text=typeof value==='string'?value.trim():'';
  return CRAFT_CATEGORIES.find(item=>item.toLowerCase()===text.toLowerCase())||LEGACY_CRAFT_CATEGORIES[text.toLowerCase()]||text;
}
export function isCraftCategory(value){return CRAFT_CATEGORIES.includes(normalizeCraftCategory(value));}
