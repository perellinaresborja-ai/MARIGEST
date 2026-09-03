const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  console.log("Iniciando auditoría E2E del backend...");
  try {
    // 1. Limpiar base de datos (como estamos en local, podemos hacerlo para probar, pero mejor no borrar nada que el usuario haya creado).
    // Mejor hacemos consultas.
    
    // 2. Verificar clientes
    const clientsCount = await prisma.client.count();
    console.log(`- Clientes en BD: ${clientsCount}`);
    
    // 3. Crear cliente de prueba si no hay
    const testClient = await prisma.client.create({
      data: {
        commercialName: "Cliente Auditoría",
        type: "PARTICULAR",
        isGranelPremium: true,
        isVermut: true
      }
    });
    console.log(`- Cliente creado correctamente: ${testClient.id}`);
    
    // 4. Probar creación de producto semilla y precio
    const seed = await prisma.seedProduct.create({
      data: { reference: "AUDIT-01", name: "Semilla Test", vat: 21 }
    });
    
    await prisma.clientSeedPrice.create({
      data: { clientId: testClient.id, seedProductId: seed.id, price: 10.5 }
    });
    console.log(`- Catálogo Granel y tarifa cliente creados correctamente.`);
    
    // 5. Probar factura
    const invoice = await prisma.invoice.create({
      data: {
        number: "F-AUDIT-999",
        businessProfile: "GRANEL_PREMIUM",
        subtotal: 10.5,
        vat: 2.20,
        total: 12.70,
        dueDate: new Date(),
        lines: {
          create: [{ description: "Semilla Test", quantity: 1, unitPrice: 10.5, total: 12.70 }]
        }
      }
    });
    
    await prisma.transaction.create({
      data: {
        type: "RECEIVABLE",
        amount: 12.70,
        dueDate: new Date(),
        clientId: testClient.id,
        referenceId: invoice.id,
        businessProfile: "GRANEL_PREMIUM"
      }
    });
    console.log(`- Factura y transacción GRANEL PREMIUM creadas correctamente.`);
    
    // Limpieza
    await prisma.transaction.deleteMany({ where: { referenceId: invoice.id } });
    await prisma.invoiceLine.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    await prisma.clientSeedPrice.deleteMany({ where: { clientId: testClient.id } });
    await prisma.seedProduct.delete({ where: { id: seed.id } });
    await prisma.client.delete({ where: { id: testClient.id } });
    
    console.log("Auditoría de base de datos COMPLETADA CON ÉXITO.");
  } catch (error) {
    console.error("ERROR EN AUDITORÍA:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
