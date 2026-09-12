import { getCraftImage, getCraftCategory, categoryImageMap, DEFAULT_CRAFT_IMAGE } from '../constants/craftImageMap.js';

export function categoryImage(product) {
  const craft = typeof product === 'string' ? product : (product?.craftLineage || product?.craftType || product?.craftCategory || product?.category);
  if (craft) {
    const mapped = getCraftImage(craft);
    if (mapped && mapped !== DEFAULT_CRAFT_IMAGE) return mapped;
    if (categoryImageMap[craft]) return categoryImageMap[craft];
  }
  return product?.images?.[0] || product?.image || product?.productImage || DEFAULT_CRAFT_IMAGE;
}

// Demo portrait assignments, prioritizing artisan's craft category image from demo_image
const femaleDemoNames = ['smt. ananya devi', 'ruma pramanik', 'anita heritage threads', 'anita'];
export function artisanPortrait(artisan) {
  const craft = artisan?.craftType || artisan?.craft || artisan?.craftLineage;
  if (craft) {
    return getCraftImage(craft);
  }
  const name = String(artisan?.artisanName || artisan?.fullName || artisan?.name || '').toLowerCase();
  const gender = artisan?.demoPortrait || artisan?.gender;
  const female = gender === 'female' || (!gender && femaleDemoNames.some(n => name === n || name.startsWith(n + ' ')));
  return `/images/demo/${female ? 'female' : 'male'}.jpeg`;
}

export { getCraftImage, getCraftCategory, categoryImageMap, DEFAULT_CRAFT_IMAGE };

