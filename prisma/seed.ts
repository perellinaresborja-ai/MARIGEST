import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake data to see the UI...');

  // Create products
  const rojo = await prisma.product.upsert({
    where: { type: 'ROJO' },
    update: {},
    create: { name: 'Vermut Rojo Celler Naziha', type: 'ROJO', boxSize: 6 },
  });

  const blanco = await prisma.product.upsert({
    where: { type: 'BLANCO' },
    update: {},
    create: { name: 'Vermut Blanco Celler Naziha', type: 'BLANCO', boxSize: 6 },
  });

  // Create some clients
  const client1 = await prisma.client.create({
    data: {
      commercialName: 'Restaurante El Puerto',
      legalName: 'El Puerto SL',
      type: 'HOSTELERIA',
      phone: '600123456',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      commercialName: 'Distribuciones Costa',
      legalName: 'Costa Dist SL',
      type: 'DISTRIBUIDOR',
      phone: '600654321',
    },
  });

  // Create an invoice
  await prisma.invoice.create({
    data: {
      number: 'F-2026-001',
      date: new Date(),
      subtotal: 100,
      vat: 21,
      total: 121,
      status: 'ISSUED',
      dueDate: new Date(),
      lines: {
        create: [
          {
            description: 'Vermut Rojo - Caja 6',
            quantity: 2,
            unitPrice: 50,
            total: 100,
          },
        ],
      },
    },
  });

  console.log('Done seeding!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
