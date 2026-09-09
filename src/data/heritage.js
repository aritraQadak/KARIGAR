// Editorial lines describe regional traditions; listing counts come from the catalogue.
export const STATE_STORIES = {
  odisha: [
    "Sacred Needles & Whisper Weaves",
    "Where every weave tells a story.",
  ],
  assam: [
    "Golden Silk & River Songs",
    "Along the Brahmaputra, silk catches the morning light.",
  ],
  bihar: [
    "Painted Walls & Living Folklore",
    "A thousand stories bloom in a single Madhubani line.",
  ],
  chhattisgarh: [
    "Forest Forms & Bell Metal",
    "The forest finds its voice in the hands of its makers.",
  ],
  goa: [
    "Coastal Light & Woven Palms",
    "Salt in the air, patient hands at work.",
  ],
  "jammu-kashmir": [
    "Valley Looms & Mountain Light",
    "The warmth of a valley, carried in every thread.",
  ],
  kerala: [
    "Palm Fibres & Golden Borders",
    "Between backwater and loom, tradition flows.",
  ],
  "madhya-pradesh": [
    "Forest Tales & Gossamer Weaves",
    "From painted forests to Chanderi light.",
  ],
  maharashtra: [
    "Paithani Silks & Earthbound Art",
    "Every motif holds a memory of the Deccan.",
  ],
  meghalaya: [
    "Cloud Country & Bamboo Rhythms",
    "Where rain and rooted hands shape everyday beauty.",
  ],
  nagaland: [
    "Woven Identity & Highland Colour",
    "A community remembers itself in cloth.",
  ],
  punjab: [
    "Fields of Gold & Phulkari Blooms",
    "Flowers flourish where the needle wanders.",
  ],
  rajasthan: [
    "Desert Hues & Royal Hands",
    "The desert keeps its brightest colours in craft.",
  ],
  "tamil-nadu": [
    "Temple Silks & Timeless Bronze",
    "From loom to bronze, devotion takes form.",
  ],
  "west-bengal": [
    "Kantha Stories & Clay Reveries",
    "A running stitch carries generations forward.",
  ],
  haryana: [
    "Woven Hearths & Earthen Warmth",
    "Simple threads, made rich by everyday life.",
  ],
  "himachal-pradesh": [
    "Mountain Wool & Chamba Stitches",
    "Highland warmth, woven slowly.",
  ],
  "uttar-pradesh": [
    "Brocade Light & Chikankari Dreams",
    "A quiet stitch, a luminous Banarasi thread.",
  ],
  uttarakhand: [
    "Himalayan Wool & Aipan Lines",
    "The mountains leave their mark in every motif.",
  ],
  "andhra-pradesh": [
    "Kalamkari Tales & Cotton Light",
    "A brush, a cloth, a story still unfolding.",
  ],
  karnataka: [
    "Sandalwood Notes & Silken Gold",
    "Carved with care, woven with memory.",
  ],
  telangana: [
    "Ikat Rhythms & Cheriyal Tales",
    "Colour finds its rhythm before the loom begins.",
  ],
  jharkhand: [
    "Sohrai Earth & Tussar Threads",
    "The earth lends its colours to the maker.",
  ],
  gujarat: [
    "Ajrakh Indigo & Kutch Mirrors",
    "The sky is blue; the cloth remembers.",
  ],
  "arunachal-pradesh": [
    "Highland Looms & Bamboo Lines",
    "A new dawn in colours handed down.",
  ],
  manipur: [
    "Lotus Fibres & Woven Grace",
    "Soft threads carry the strength of a tradition.",
  ],
  mizoram: [
    "Puan Patterns & Hilltop Hues",
    "Every band of colour has a place to belong.",
  ],
  sikkim: [
    "Mountain Carpets & Sacred Scrolls",
    "Stillness becomes a pattern in patient hands.",
  ],
  tripura: [
    "Bamboo Forms & Risa Threads",
    "From the forest, a language of line and weave.",
  ],
  "andaman-nicobar": [
    "Island Fibres & Ocean Forms",
    "Made where the forest meets the sea.",
  ],
  chandigarh: [
    "Modern Lines & Handmade Soul",
    "A planned city, a spontaneous handmade spirit.",
  ],
  "daman-diu-dadra": [
    "Coastal Weaves & Tribal Lines",
    "The shoreline and the forest share a craft.",
  ],
  delhi: [
    "Many Traditions & One Meeting Place",
    "A city where the crafts of India meet.",
  ],
  ladakh: [
    "High Desert Wool & Sacred Colour",
    "Warmth, made slowly at the roof of the world.",
  ],
  lakshadweep: [
    "Coir Threads & Lagoon Light",
    "An island life, gathered into handmade form.",
  ],
  puducherry: [
    "Paper Petals & Coastal Clay",
    "A little coastal calm in every handmade piece.",
  ],
};
const illustrated = new Set([
  "haryana",
  "himachal-pradesh",
  "punjab",
  "rajasthan",
  "uttar-pradesh",
  "uttarakhand",
  "andhra-pradesh",
  "karnataka",
  "kerala",
  "tamil-nadu",
  "telangana",
  "bihar",
  "jharkhand",
  "odisha",
  "west-bengal",
  "goa",
  "maharashtra",
  "chhattisgarh",
  "madhya-pradesh",
  "arunachal-pradesh",
  "assam",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "sikkim",
  "tripura",
  "andaman-nicobar",
  "chandigarh",
  "daman-diu-dadra",
  "delhi",
  "jammu-kashmir",
  "ladakh",
  "lakshadweep",
  "puducherry"
]);
export function stateArtwork(slug) {
  if (slug === "gujarat") return "/images/states/gujarat.jpeg";
  return illustrated.has(slug) ? `/images/states/${slug}.png` : null;
}
// Approximate regional centres, not workshop addresses. Grouped pins avoid invented precision.
export const STATE_CENTRES = {
  haryana: [29.1, 76.1],
  "himachal-pradesh": [31.9, 77.2],
  punjab: [31.1, 75.3],
  rajasthan: [26.6, 73.9],
  "uttar-pradesh": [26.8, 80.9],
  uttarakhand: [30.1, 79.1],
  "andhra-pradesh": [15.9, 79.7],
  karnataka: [15.3, 75.7],
  kerala: [10.5, 76.3],
  "tamil-nadu": [11.1, 78.7],
  telangana: [18.1, 79],
  bihar: [25.5, 85.3],
  jharkhand: [23.6, 85.3],
  odisha: [20.9, 85.1],
  "west-bengal": [23.7, 87.7],
  goa: [15.3, 74.1],
  gujarat: [22.3, 71.2],
  maharashtra: [19.8, 75.7],
  chhattisgarh: [21.3, 81.9],
  "madhya-pradesh": [23.5, 78],
  "arunachal-pradesh": [28.2, 94.7],
  assam: [26.2, 92.9],
  manipur: [24.7, 93.9],
  meghalaya: [25.5, 91.4],
  mizoram: [23.2, 92.9],
  nagaland: [26.2, 94.6],
  sikkim: [27.5, 88.5],
  tripura: [23.9, 91.7],
  "andaman-nicobar": [11.7, 92.7],
  chandigarh: [30.7, 76.8],
  "daman-diu-dadra": [20.3, 73],
  delhi: [28.6, 77.2],
  "jammu-kashmir": [34, 74.8],
  ladakh: [34.2, 77.6],
  lakshadweep: [10.6, 72.6],
  puducherry: [11.9, 79.8],
};
export function normalizeState(value = "") {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (
    {
      "jammu-and-kashmir": "jammu-kashmir",
      kashmir: "jammu-kashmir",
      orissa: "odisha",
      chattisgarh: "chhattisgarh",
      pondicherry: "puducherry",
      "andaman-and-nicobar-islands": "andaman-nicobar",
      "dadra-and-nagar-haveli-and-daman-and-diu": "daman-diu-dadra",
      "nct-of-delhi": "delhi",
    }[slug] || slug
  );
}
export function buildArtisanDirectory(products, registered) {
  const entries = registered.map((s) => ({
    ...s,
    name: s.businessName || s.fullName,
    stateSlug: normalizeState(s.state),
    source: "registered",
    products: [],
  }));
  for (const product of products) {
    const name = product.artisanName;
    let entry = entries.find(
      (s) =>
        s.stateSlug === product.stateSlug &&
        [s.name, s.fullName].some(
          (n) => n?.toLowerCase() === name?.toLowerCase(),
        ),
    );
    if (!entry) {
      entry = {
        id: `catalogue-${product.id}`,
        name,
        fullName: name,
        state: product.stateName,
        stateSlug: product.stateSlug,
        district: product.district,
        craftType: product.craftLineage,
        source: "catalogue",
        products: [],
      };
      entries.push(entry);
    }
    entry.products.push(product);
  }
  return entries;
}
