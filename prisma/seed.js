/**
 * KARIGAR Platform - Prisma Database Seeding Script
 * 
 * Populates 360 culturally authentic DEMO ARTISAN profiles across:
 * - 28 States of India (10 artisans each)
 * - 8 Union Territories of India (10 artisans each)
 * 
 * Features:
 * - Idempotent upsert by unique email address
 * - All accounts assigned role: "ARTISAN" and isActive: true
 * - Common demo password "Karigar@123" securely hashed using bcrypt (10 rounds)
 * - 10 distinct regional craft types per State/UT
 * - Strictly protects all existing real users, patrons, and admins
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_ARTISANS } from './artisanData.js';

// Fallback to local SQLite database if not explicitly set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();
const COMMON_DEMO_PASSWORD = 'Karigar@123';
const BCRYPT_ROUNDS = 10;

async function seedArtisans() {
  console.log('====================================================');
  console.log('       KARIGAR PLATFORM - DEMO ARTISAN SEED        ');
  console.log('====================================================');
  console.log(`Starting seed process for ${DEMO_ARTISANS.length} artisans across 36 Indian regions...`);

  // Hash common demo password once using bcryptjs
  console.log(`Hashing common demo password with ${BCRYPT_ROUNDS} salt rounds...`);
  const passwordHash = await bcrypt.hash(COMMON_DEMO_PASSWORD, BCRYPT_ROUNDS);
  console.log('Password hash generated successfully.');

  let createdCount = 0;
  let updatedCount = 0;
  const startTime = Date.now();

  for (const artisan of DEMO_ARTISANS) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: artisan.email }
    });

    const userData = {
      fullName: artisan.fullName,
      email: artisan.email,
      mobile: artisan.mobile,
      password: passwordHash,
      role: artisan.role,
      provider: artisan.provider,
      providerAccountId: artisan.providerAccountId,
      avatarUrl: artisan.avatarUrl,
      craftType: artisan.craftType,
      state: artisan.state,
      district: artisan.district,
      yearsOfExperience: artisan.yearsOfExperience,
      businessName: artisan.businessName,
      giTagNumber: artisan.giTagNumber,
      clusterName: artisan.clusterName,
      isVerified: artisan.isVerified,
      isActive: artisan.isActive
    };

    if (existing) {
      // Idempotently update demo artisan without affecting unrelated users
      await prisma.user.update({
        where: { email: artisan.email },
        data: {
          fullName: artisan.fullName,
          password: passwordHash,
          role: artisan.role,
          craftType: artisan.craftType,
          state: artisan.state,
          district: artisan.district,
          yearsOfExperience: artisan.yearsOfExperience,
          businessName: artisan.businessName,
          clusterName: artisan.clusterName,
          isVerified: artisan.isVerified,
          isActive: artisan.isActive
        }
      });
      updatedCount++;
    } else {
      await prisma.user.create({
        data: userData
      });
      createdCount++;
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n--- SEED EXECUTION SUMMARY ---');
  console.log(`Total dataset size: ${DEMO_ARTISANS.length}`);
  console.log(`Newly created:      ${createdCount}`);
  console.log(`Updated (upsert):   ${updatedCount}`);
  console.log(`Completed in:       ${durationSec}s`);
  console.log('====================================================\n');
}

async function main() {
  try {
    await seedArtisans();
  } catch (error) {
    console.error('CRITICAL ERROR during seed execution:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
