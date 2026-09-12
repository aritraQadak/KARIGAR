import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const en = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/hi.json'), 'utf8'));
const bn = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/i18n/bn.json'), 'utf8'));

console.log('EN buyer.data:', JSON.stringify(en.buyer?.data, null, 2));
console.log('HI buyer.data:', JSON.stringify(hi.buyer?.data, null, 2));
console.log('BN buyer.data:', JSON.stringify(bn.buyer?.data, null, 2));
