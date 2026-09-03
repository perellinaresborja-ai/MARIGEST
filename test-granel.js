const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log("=== PRUEBA FUNCIONAL REAL ===");
  try {
    // 1. Crear Cliente A y Cliente B
    const clientA = await prisma.client.create({
      data: { commercialName: "Cliente A Test", isGranelPremium: true }
    });
    const clientB = await prisma.client.create({
      data: { commercialName: "Cliente B Test", isGranelPremium: true }
    });
    console.log("Clientes creados.");

    // 2. Cliente A: Facturar NK-001 a 3.50€
    console.log("\n-> Facturando a Cliente A: NK-001 a 3.50€");
    const { processGranelSale } = require('./src/app/actions/granelSales.ts'); 
    // Wait, we can't easily call processGranelSale from node if it uses "use server" and next/headers.
    // Let's implement the logic exactly as it is in processGranelSale for the test.
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
runTest();
