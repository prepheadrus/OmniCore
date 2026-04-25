
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the first available channel
  const channel = await prisma.salesChannel.findFirst();
  if (!channel) {
    console.error('No sales channel found!');
    process.exit(1);
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: 'FATİH AYAZ - AYAZ KARDEŞLER MÜHENDİSLİK',
      taxNumber: '12469218070',
      taxOffice: 'KIZILBEY VERGİ DAİRESİ MÜDÜRLÜĞÜ',
      streetAddress: 'ANAFARTALAR MAH. MEHMET KARAGÖZ CAD. 5/145',
      city: 'ANKARA',
      district: 'ALTINDAĞ',
      contactPhone: '0312 324 42 50',
      contactEmail: 'fatihayaz86@msn.com',
      iban: 'TR77 0020 5000 0944 0296 2000 01',
      bankName: 'KUVEYT TÜRK',
      channelId: channel.id,
      isActive: true,
      currency: 'TRY'
    }
  });

  console.log('SUCCESS:' + JSON.stringify(supplier));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
