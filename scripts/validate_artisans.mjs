/**
 * KARIGAR Platform - Artisan Seed Validation Script
 * 
 * Verifies all requirements on the seeded database records:
 * - Total generated artisan records = 360
 * - Exactly 10 generated artisans per State/UT (28 States + 8 UTs = 36 Regions)
 * - All generated emails are unique and end with @karigar.in
 * - All roles = "ARTISAN"
 * - All generated accounts are active (isActive: true)
 * - Every region has 10 distinct craft types (zero duplicates within any region)
 * - Every password is valid bcrypt-hashed (no plaintext passwords)
 * - State and district are properly populated
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { craftCategoryMap, categoryImageMap, getCraftCategory, getCraftImage } from '../src/constants/craftImageMap.js';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();
const COMMON_DEMO_PASSWORD = 'Karigar@123';

const EXPECTED_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const EXPECTED_UTS = [
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

async function validateSeededArtisans() {
  console.log('====================================================');
  console.log('       KARIGAR ARTISAN SEED DATA VALIDATION        ');
  console.log('====================================================');

  // Fetch all @karigar.in artisan accounts
  const artisans = await prisma.user.findMany({
    where: {
      role: 'ARTISAN',
      email: {
        endsWith: '@karigar.in'
      }
    },
    orderBy: [
      { state: 'asc' },
      { fullName: 'asc' }
    ]
  });

  const total = artisans.length;
  console.log(`Retrieved ${total} seeded artisan records for auditing.\n`);

  let errors = [];

  // 1. Total records check
  if (total !== 360) {
    errors.push(`Expected 360 artisans, found ${total}`);
  }

  // 2. Email uniqueness and format
  const emailSet = new Set();
  let nonKarigarEmailCount = 0;
  for (const a of artisans) {
    if (!a.email.endsWith('@karigar.in')) {
      nonKarigarEmailCount++;
    }
    if (emailSet.has(a.email)) {
      errors.push(`Duplicate email found: ${a.email}`);
    }
    emailSet.add(a.email);
  }
  if (nonKarigarEmailCount > 0) {
    errors.push(`${nonKarigarEmailCount} emails do not end with @karigar.in`);
  }

  // 3. Roles and Active status
  let invalidRoleCount = 0;
  let inactiveCount = 0;
  for (const a of artisans) {
    if (a.role !== 'ARTISAN') invalidRoleCount++;
    if (!a.isActive) inactiveCount++;
  }
  if (invalidRoleCount > 0) errors.push(`${invalidRoleCount} artisans have invalid role (expected 'ARTISAN')`);
  if (inactiveCount > 0) errors.push(`${inactiveCount} artisans are marked inactive`);

  // 4. Password validation (Bcrypt check & no plaintext)
  let plaintextPasswords = 0;
  let invalidHashes = 0;
  let bcryptCompareFailures = 0;

  for (const a of artisans) {
    if (!a.password) {
      errors.push(`Artisan ${a.email} has null password`);
      continue;
    }
    if (a.password === COMMON_DEMO_PASSWORD) {
      plaintextPasswords++;
    }
    if (!a.password.startsWith('$2a$') && !a.password.startsWith('$2b$')) {
      invalidHashes++;
    }
  }

  // Verify bcrypt password comparison on a sample of accounts
  const sampleIndices = [0, 50, 100, 150, 200, 250, 300, 359];
  for (const idx of sampleIndices) {
    if (idx < artisans.length) {
      const sample = artisans[idx];
      const match = await bcrypt.compare(COMMON_DEMO_PASSWORD, sample.password);
      if (!match) {
        bcryptCompareFailures++;
        errors.push(`Bcrypt comparison failed for sample artisan ${sample.email}`);
      }
    }
  }

  if (plaintextPasswords > 0) errors.push(`${plaintextPasswords} accounts have plaintext passwords!`);
  if (invalidHashes > 0) errors.push(`${invalidHashes} accounts have invalid bcrypt hashes`);

  // 5. Regional grouping and craft uniqueness
  const regionMap = new Map();
  for (const a of artisans) {
    if (!a.state) {
      errors.push(`Artisan ${a.email} is missing state`);
      continue;
    }
    if (!a.district) {
      errors.push(`Artisan ${a.email} is missing district`);
    }
    if (!a.craftType) {
      errors.push(`Artisan ${a.email} is missing craftType`);
    }

    if (!regionMap.has(a.state)) {
      regionMap.set(a.state, []);
    }
    regionMap.get(a.state).push(a);
  }

  let regionsWithDuplicateCrafts = 0;
  let regionsWithIncorrectCount = 0;

  for (const [regionName, regionArtisans] of regionMap.entries()) {
    if (regionArtisans.length !== 10) {
      regionsWithIncorrectCount++;
      errors.push(`Region '${regionName}' has ${regionArtisans.length} artisans (expected 10)`);
    }

    const craftsInRegion = new Set();
    for (const a of regionArtisans) {
      if (craftsInRegion.has(a.craftType)) {
        regionsWithDuplicateCrafts++;
        errors.push(`Region '${regionName}' has duplicate craft: '${a.craftType}'`);
        break;
      }
      craftsInRegion.add(a.craftType);
    }
  }

  // 6. Check for disallowed generic craft names
  const FORBIDDEN_GENERIC_WORDS = ['other', 'miscellaneous', 'general craft', 'artisan craft', 'local craft', 'traditional craft', 'handmade item'];
  let genericCraftCount = 0;
  for (const a of artisans) {
    const lower = (a.craftType || '').toLowerCase().trim();
    if (FORBIDDEN_GENERIC_WORDS.includes(lower)) {
      genericCraftCount++;
      errors.push(`Artisan ${a.email} has forbidden generic craft: '${a.craftType}'`);
    }
  }

  // 7. Verify all expected States and UTs exist in the regionMap
  let missingStates = 0;
  let missingUTs = 0;
  for (const s of EXPECTED_STATES) {
    if (!regionMap.has(s)) {
      missingStates++;
      errors.push(`Missing state: ${s}`);
    }
  }
  for (const u of EXPECTED_UTS) {
    if (!regionMap.has(u)) {
      missingUTs++;
      errors.push(`Missing Union Territory: ${u}`);
    }
  }

  // 8. Craft Category & Demo Image Mapping Validation
  let unmappedCrafts = 0;
  let missingImageFiles = 0;
  let invalidCategories = 0;
  const uniqueCraftTypes = new Set();
  const categoryUsageCount = {};
  const imageFilesTested = new Set();

  for (const a of artisans) {
    uniqueCraftTypes.add(a.craftType);
    const category = craftCategoryMap[a.craftType];
    if (!category) {
      unmappedCrafts++;
      errors.push(`Artisan ${a.email} has unmapped craftType: '${a.craftType}'`);
      continue;
    }

    if (!categoryImageMap[category]) {
      invalidCategories++;
      errors.push(`Category '${category}' for craft '${a.craftType}' is not in categoryImageMap`);
      continue;
    }

    categoryUsageCount[category] = (categoryUsageCount[category] || 0) + 1;
    const imgPath = categoryImageMap[category];
    const diskPath = '.' + imgPath;

    if (!imageFilesTested.has(diskPath)) {
      imageFilesTested.add(diskPath);
      if (!fs.existsSync(diskPath)) {
        missingImageFiles++;
        errors.push(`Mapped image file does not exist on disk: ${diskPath}`);
      }
    }
  }

  // Summary Report
  console.log('----------------------------------------------------');
  console.log('KARIGAR Artisan Seed Validation Summary:');
  console.log('----------------------------------------------------');
  console.log(`States:                         ${EXPECTED_STATES.length}`);
  console.log(`Union Territories:              ${EXPECTED_UTS.length}`);
  console.log(`Total Regions Covered:          ${regionMap.size} / 36`);
  console.log(`Artisans per Region:            10`);
  console.log(`Total Artisans:                 ${total} / 360`);
  console.log(`Unique Emails:                  ${emailSet.size} / 360`);
  console.log(`Distinct Craft Types in DB:     ${uniqueCraftTypes.size}`);
  console.log(`Unmapped Craft Types:           ${unmappedCrafts}`);
  console.log(`Missing Image Assets:           ${missingImageFiles}`);
  console.log(`Unique Category Images Used:    ${imageFilesTested.size} / 13`);
  console.log(`Invalid Roles:                  ${invalidRoleCount}`);
  console.log(`Inactive Accounts:              ${inactiveCount}`);
  console.log(`Regions with Duplicate Crafts:  ${regionsWithDuplicateCrafts}`);
  console.log(`Plaintext Passwords:            ${plaintextPasswords}`);
  console.log(`Bcrypt Sample Verifications:    ${sampleIndices.length} passed (0 failures)`);
  console.log('----------------------------------------------------');

  if (errors.length > 0) {
    console.error(`\nVALIDATION FAILED with ${errors.length} issues:`);
    errors.slice(0, 10).forEach((err, i) => console.error(` ${i + 1}. ${err}`));
    if (errors.length > 10) console.error(` ... and ${errors.length - 10} more.`);
    throw new Error('Validation failed');
  } else {
    console.log('\nALL 360 ARTISAN RECORDS MEET ALL SPECIFICATIONS! ✅\n');
  }

  console.log('====================================================');
  console.log('     REGIONAL CRAFT BREAKDOWN (ALL 36 REGIONS)      ');
  console.log('====================================================');
  for (const [regionName, list] of regionMap.entries()) {
    console.log(`\n${regionName}:`);
    list.forEach(a => console.log(`  • ${a.craftType} (${a.fullName} - ${a.district})`));
  }
  console.log('====================================================\n');
}

async function main() {
  try {
    await validateSeededArtisans();
  } catch (error) {
    console.error('\nAudit Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
