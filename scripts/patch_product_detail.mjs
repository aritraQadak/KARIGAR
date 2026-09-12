import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const targetFile = path.join(projectRoot, 'src/pages/buyer/ProductDetail.jsx');
let content = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

// 1. Add imports after 'import Button from ...'
const buttonImport = `import Button from '../../components/Button';`;
const newImports = `import Button from '../../components/Button';
import {
  translateState,
  translateCraftType,
  translateDistrict,
  translatePersonName,
  formatLocalizedNumber,
  toLocaleDigits,
  translateCollectionTitle,
  translateCollectionDescription,
  translateProductSpec
} from '../../utils/localizedDisplay.js';`;

if (!content.includes('from \'../../utils/localizedDisplay.js\';')) {
  content = content.replace(buttonImport, newImports);
  console.log('Added imports to ProductDetail.jsx');
}

// 2. Breadcrumbs (lines 60-72)
content = content.replace(
  `to={\`/explore/\${product.stateSlug}\`}>\n              {product.stateName}\n            </Link>`,
  `to={\`/explore/\${product.stateSlug}\`}>\n              {translateState(product.stateName || product.state, i18n.language)}\n            </Link>`
);
content = content.replace(
  `<span className="text-outline">{product.craftLineage}</span>`,
  `<span className="text-outline">{translateCraftType(product.craftLineage || product.craftType, i18n.language)}</span>`
);
content = content.replace(
  `<span className="text-primary font-semibold">{product.id.toUpperCase()}</span>`,
  `<span className="text-primary font-semibold">{toLocaleDigits(product.id.toUpperCase(), i18n.language)}</span>`
);

// 3. District pill and title
content = content.replace(
  `{product.district}`,
  `{translateDistrict(product.district, i18n.language)}`
);

content = content.replace(
  `<h1 className="font-garamond text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 leading-tight font-bold">\n                {product.name}\n              </h1>`,
  `<h1 className="font-garamond text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 leading-tight font-bold">\n                {translateCollectionTitle(product.name, i18n.language)}\n              </h1>`
);

content = content.replace(
  `By {product.artisanName}`,
  `{t('buyer.product.by', 'By')} {translatePersonName(product.artisanName, i18n.language)}`
);

content = content.replace(
  `{product.artisanTitle}`,
  `{product.artisanTitle?.includes('•') ? \`\${product.artisanTitle.split('•')[0]}• \${translateState(product.artisanTitle.split('•')[1].trim(), i18n.language)}\` : product.artisanTitle}`
);

// 4. Rating & validated count
content = content.replace(
  `{product.rating ? (product.rating * 20).toFixed(1) : '99.4'}`,
  `{formatLocalizedNumber((product.rating ? product.rating * 20 : 99.4).toFixed(1), i18n.language)}`
);

content = content.replace(
  `Validated by {product.reviewsCount || 42} Connoisseurs & Curators`,
  `{t('buyer.product.validatedByConnoisseurs', 'Validated by {{count}} Connoisseurs & Curators', { count: formatLocalizedNumber(product.reviewsCount || 42, i18n.language) })}`
);

// 5. Escrow card
content = content.replace(
  `Your payment of {formatCurrency(product.price)} remains safely impounded in the GI Artisan Escrow. Funds are released directly to {product.artisanName} only after you physically receive, inspect, and verify the craft and embedded cryptotag.`,
  `{t('buyer.product.escrowSafelyImpounded', 'Your payment of {{amount}} remains safely impounded in the GI Artisan Escrow. Funds are released directly to {{artisan}} only after you physically receive, inspect, and verify the craft and embedded cryptotag.', { amount: formatCurrency(product.price, i18n.language), artisan: translatePersonName(product.artisanName, i18n.language) })}`
);

// 6. Tab 2 artisan section
content = content.replace(
  `<div className="font-garamond text-2xl font-bold">{product.artisanName}</div>`,
  `<div className="font-garamond text-2xl font-bold">{translatePersonName(product.artisanName, i18n.language)}</div>`
);
content = content.replace(
  `<div className="text-xs opacity-90">{product.district}</div>`,
  `<div className="text-xs opacity-90">{translateDistrict(product.district, i18n.language)}</div>`
);

// 7. Tab 3 certificate details
content = content.replace(
  `Specimen #{product.giTagNumber}`,
  `Specimen #{toLocaleDigits(product.giTagNumber, i18n.language)}`
);
content = content.replace(
  `<span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{product.district}</span>`,
  `<span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{translateDistrict(product.district, i18n.language)}</span>`
);
content = content.replace(
  `<span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{product.artisanName}</span>`,
  `<span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{translatePersonName(product.artisanName, i18n.language)}</span>`
);

// 8. Certificate Modal
content = content.replace(
  `Certificate Specimen #{product.giTagNumber} issued for {product.name} crafted by {product.artisanName}.`,
  `{t('buyer.product.certModalSummary', 'Certificate Specimen #{{giTag}} issued for {{name}} crafted by {{artisan}}.', { giTag: toLocaleDigits(product.giTagNumber, i18n.language), name: translateCollectionTitle(product.name, i18n.language), artisan: translatePersonName(product.artisanName, i18n.language) })}`
);
content = content.replace(
  `<div>ORIGIN: {product.district}</div>`,
  `<div>{t('buyer.product.originLabel', 'ORIGIN')}: {translateDistrict(product.district, i18n.language)}</div>`
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully completed full localization of ProductDetail.jsx!');
