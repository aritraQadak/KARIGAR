const fs = require('fs');
const path = require('path');

const statesCraftsPath = path.join(__dirname, '..', 'src', 'data', 'statesCrafts.js');
const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.js');

let statesContent = fs.readFileSync(statesCraftsPath, 'utf8');
let productsContent = fs.readFileSync(productsPath, 'utf8');

// Ensure i18n import
if (!statesContent.includes("import i18n from '../i18n/i18n.js'")) {
  statesContent = `import i18n from '../i18n/i18n.js';\n` + statesContent;
}

if (!productsContent.includes("import i18n from '../i18n/i18n.js'")) {
  productsContent = `import i18n from '../i18n/i18n.js';\n` + productsContent;
}

// 1. Refactor statesCrafts.js
// Replace name: 'Name' and description: 'Desc' inside STATES_CRAFTS with getters
const stateRegex = /{\s*name:\s*(['"`])(.*?)\1,\s*slug:\s*(['"`])(.*?)\3,\s*region:\s*(['"`])(.*?)\5,\s*description:\s*(['"`])([\s\S]*?)\7,/g;

statesContent = statesContent.replace(stateRegex, (match, q1, name, q3, slug, q5, region, q7, description) => {
  const cleanDesc = description.replace(/'/g, "\\'");
  const cleanName = name.replace(/'/g, "\\'");
  return `{
    slug: '${slug}',
    region: '${region}',
    get name() { return i18n.t('buyer.data.states.${slug}.name', '${cleanName}'); },
    get description() { return i18n.t('buyer.data.states.${slug}.description', '${cleanDesc}'); },`;
});

// 2. Refactor products.js
// Replace name: '...' and description: '...' inside PRODUCTS with getters
const productItemRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?name:\s*(['"`])([\s\S]*?)\2[\s\S]*?description:\s*(['"`])([\s\S]*?)\4/g;

// Let's refactor PRODUCTS items systematically
const productsObjRegex = /{\s*id:\s*['"]([^'"]+)['"]/g;

productsContent = productsContent.replace(/({\s*id:\s*['"]([^'"]+)['"],[\s\S]*?name:\s*)(['"`])([\s\S]*?)\3([\s\S]*?description:\s*)(['"`])([\s\S]*?)\6/g, (match, prefix, id, qName, nameVal, middle, qDesc, descVal) => {
  const cleanName = nameVal.replace(/'/g, "\\'").replace(/\n/g, ' ');
  const cleanDesc = descVal.replace(/'/g, "\\'").replace(/\n/g, ' ');
  return `${prefix}get name() { return i18n.t('buyer.data.products.${id}.name', '${cleanName}'); },${middle}get description() { return i18n.t('buyer.data.products.${id}.description', '${cleanDesc}'); },`;
});

fs.writeFileSync(statesCraftsPath, statesContent, 'utf8');
fs.writeFileSync(productsPath, productsContent, 'utf8');

console.log('Successfully refactored statesCrafts.js and products.js with i18n getters!');
