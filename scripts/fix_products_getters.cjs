const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.js');
let content = fs.readFileSync(productsPath, 'utf8');

// Fix name: get name() { ... },, -> get name() { ... },
content = content.replace(/name:\s*get\s+name\(\)\s*{[\s\S]*?},,/g, (match) => {
  // Extract id and fallback
  const idMatch = match.match(/buyer\.data\.products\.([^.]+)\.name/);
  const fallbackMatch = match.match(/i18n\.t\('[^']+',\s*['"](.*?)['"]\)/);
  const id = idMatch ? idMatch[1] : '';
  const fallback = fallbackMatch ? fallbackMatch[1].replace(/'/g, "\\'") : '';
  return `get name() { return i18n.t('buyer.data.products.${id}.name', '${fallback}'); },`;
});

// Fix description: get description() { ... },...
content = content.replace(/description:\s*get\s+description\(\)\s*{[\s\S]*?},[0-9)]*\./g, (match) => {
  const idMatch = match.match(/buyer\.data\.products\.([^.]+)\.description/);
  const fallbackMatch = match.match(/i18n\.t\('[^']+',\s*['"](.*?)['"]\)/);
  const id = idMatch ? idMatch[1] : '';
  const fallback = fallbackMatch ? fallbackMatch[1].replace(/'/g, "\\'") : '';
  return `get description() { return i18n.t('buyer.data.products.${id}.description', '${fallback}'); },`;
});

fs.writeFileSync(productsPath, content, 'utf8');
console.log('Fixed products.js syntax.');
