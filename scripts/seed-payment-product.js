import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();

const PRODUCT_ID = 'jk-pashmina-01';
const ARTISAN_EMAIL = 'ghulam.hassan.mir@karigar.in';

async function main() {
  const artisan = await prisma.user.findUnique({
    where: { email: ARTISAN_EMAIL },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  if (!artisan) {
    throw new Error('Ghulam Hassan Mir was not found in the database.');
  }

  if (artisan.role !== 'ARTISAN' || !artisan.isActive) {
    throw new Error('The selected artisan is not an active ARTISAN.');
  }

  const product = await prisma.product.upsert({
    where: {
      id: PRODUCT_ID
    },
    update: {
      artisanId: artisan.id,
      publishKey: 'payment-test-jk-pashmina-01',
      title: 'Royal Shahus Kani Weave Pashmina Shawl',
      category: 'Handloom & Textiles',
      price: 85000,
      stock: 10,
      detailsJson: JSON.stringify({
        craftLineage: 'Kani Pashmina',
        state: 'Jammu & Kashmir',
        district: 'Srinagar, Kashmir',
        artisanName: 'Ghulam Hassan Mir',
        giTagStatus: 'GI Certified',
        giTagNumber: 'GI Registered #JK-092',
        description:
          'Hand-woven using traditional Kani weaving techniques with Changthangi grade-A pashmina.'
      }),
      mediaJson: JSON.stringify([]),
      evidenceJson: JSON.stringify({
        source: 'KARIGAR demo catalog',
        paymentTestProduct: true
      })
    },
    create: {
      id: PRODUCT_ID,
      artisanId: artisan.id,
      publishKey: 'payment-test-jk-pashmina-01',
      title: 'Royal Shahus Kani Weave Pashmina Shawl',
      category: 'Handloom & Textiles',
      price: 85000,
      stock: 10,
      detailsJson: JSON.stringify({
        craftLineage: 'Kani Pashmina',
        state: 'Jammu & Kashmir',
        district: 'Srinagar, Kashmir',
        artisanName: 'Ghulam Hassan Mir',
        giTagStatus: 'GI Certified',
        giTagNumber: 'GI Registered #JK-092',
        description:
          'Hand-woven using traditional Kani weaving techniques with Changthangi grade-A pashmina.'
      }),
      mediaJson: JSON.stringify([]),
      evidenceJson: JSON.stringify({
        source: 'KARIGAR demo catalog',
        paymentTestProduct: true
      })
    }
  });

  console.log('Payment test product ready:');
  console.log({
    id: product.id,
    title: product.title,
    price: product.price,
    stock: product.stock,
    artisan: artisan.fullName
  });
}

main()
  .catch((error) => {
    console.error('Failed to seed payment test product:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });