import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const content = fs.readFileSync(path.join(projectRoot, 'src/data/products.js'), 'utf8');

const regex = /id:\s*['"]([^'"]+)['"][\s\S]*?name\(\)\s*\{\s*return\s*i18n\.t\([^,]+,\s*['"]([^'"]+)['"]\)/g;
let match;
const products = [];
while ((match = regex.exec(content)) !== null) {
  products.push({ id: match[1], name: match[2] });
}

console.log('Extracted Products from products.js:');
console.log(JSON.stringify(products, null, 2));
