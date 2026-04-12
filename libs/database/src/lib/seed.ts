import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data in reverse order of dependencies
  console.log('Clearing existing data...');
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.salesChannel.deleteMany({});
  
  // 2. Create Sales Channel
  console.log('Creating Sales Channel...');
  const channel = await prisma.salesChannel.create({
    data: {
      id: 'system-ai',
      name: 'Trendyol Mağazam'
    }
  });

  // 3. Create Products
  console.log('Creating Products...');
  await prisma.product.createMany({
    data: [
      {
        name: 'Konsantre Cam Suyu',
        sku: 'SKU-001',
        price: 50.0,
        channelId: channel.id,
      },
      {
        name: '5\'li Fırça Seti',
        sku: 'SKU-002',
        price: 166.0,
        channelId: channel.id,
      },
      {
        name: 'Lastik Parlatıcı (400 ml)',
        sku: 'SKU-003',
        price: 190.0,
        channelId: channel.id,
      }
    ]
  });

  // 4. Create Orders
  console.log('Creating Orders...');
  await prisma.order.createMany({
    data: [
      {
        orderNumber: 'ORD-001',
        totalAmount: 166.0,
        status: 'COMPLETED',
        channelId: channel.id,
      },
      {
        orderNumber: 'ORD-002',
        totalAmount: 380.0,
        status: 'COMPLETED',
        channelId: channel.id,
      },
      {
        orderNumber: 'ORD-003',
        totalAmount: 50.0,
        status: 'PENDING',
        channelId: channel.id,
      },
      {
        orderNumber: 'ORD-004',
        totalAmount: 500.0,
        status: 'COMPLETED',
        channelId: channel.id,
      },
      {
        orderNumber: 'ORD-005',
        totalAmount: 190.0,
        status: 'PENDING',
        channelId: channel.id,
      }
    ]
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
