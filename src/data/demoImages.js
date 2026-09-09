const categoryImages = {
  'Pottery': '/images/demo/pottery.jpg',
  'Pottery & Ceramics': '/images/demo/pottery.jpg',
  'Folk Painting': '/images/demo/folk-art.jpg',
  'Metal Craft': '/images/demo/metal.jpg',
  'Handloom': '/images/demo/handloom-textiles.jpg',
  'Embroidery': '/images/demo/embroidery.jpg',
  'Handloom & Textiles': '/images/demo/handloom-textiles.jpg',
  'Painting & Folk Art': '/images/demo/folk-art.jpg',
  'Metal': '/images/demo/metal.jpg',
  'Pottery/Clay': '/images/demo/pottery.jpg',
};
export function categoryImage(product) {
  return categoryImages[typeof product === 'string' ? product : (product?.craftCategory || product?.category)] || product?.images?.[0] || product?.image || product?.productImage;
}
// Demo portrait assignments, independent of uploaded profile photos.
const femaleDemoNames = ['smt. ananya devi', 'ruma pramanik', 'anita heritage threads', 'anita'];
export function artisanPortrait(artisan) {
  const name = String(artisan?.artisanName || artisan?.fullName || artisan?.name || '').toLowerCase();
  const gender = artisan?.demoPortrait || artisan?.gender;
  const female = gender === 'female' || (!gender && femaleDemoNames.some(n => name === n || name.startsWith(n + ' ')));
  return `/images/demo/${female ? 'female' : 'male'}.jpeg`;
}
