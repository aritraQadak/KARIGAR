const fs = require('fs');
const path = require('path');

const statesCraftsPath = path.join(__dirname, '..', 'src', 'data', 'statesCrafts.js');
let content = fs.readFileSync(statesCraftsPath, 'utf8');

// Replace single-quoted fallback string with double quotes or clean string
content = content.replace(/i18n\.t\('buyer\.data\.states\.([^.]+)\.(name|description)',\s*'(.*?)'\)/g, (match, slug, field, fallback) => {
  // Clean backslashes
  const cleanFallback = fallback.replace(/\\'/g, "'").replace(/"/g, '\\"');
  return `i18n.t("buyer.data.states.${slug}.${field}", "${cleanFallback}")`;
});

fs.writeFileSync(statesCraftsPath, content, 'utf8');
console.log('Fixed quotes in statesCrafts.js.');
