import { PrismaClient } from './src/generated/prisma/index.js'
const prisma = new PrismaClient()

async function main() {
  await prisma.product.upsert({
    where: { type: 'ROJO' },
    update: { stock: 600 },
    create: {
      name: 'Vermut Rojo',
      type: 'ROJO',
      stock: 600
    }
  });

  await prisma.product.upsert({
    where: { type: 'BLANCO' },
    update: { stock: 300 },
    create: {
      name: 'Vermut Blanco',
      type: 'BLANCO',
      stock: 300
    }
  });

  console.log('Stock inicial cargado: 600 Rojo, 300 Blanco');
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
