const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const enPath = path.join(srcDir, 'i18n', 'en.json');
const hiPath = path.join(srcDir, 'i18n', 'hi.json');
const bnPath = path.join(srcDir, 'i18n', 'bn.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

// Helper to set deep property
function setDeep(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== 'object') {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

console.log('Script file created for i18n data migration.');
