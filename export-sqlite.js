const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = {
    users: await prisma.user.findMany(),
    clients: await prisma.client.findMany(),
    products: await prisma.product.findMany(),
    locations: await prisma.location.findMany(),
    orders: await prisma.order.findMany(),
    invoices: await prisma.invoice.findMany(),
    invoiceLines: await prisma.invoiceLine.findMany(),
    deliveryNotes: await prisma.deliveryNote.findMany(),
    stockMovements: await prisma.stockMovement.findMany(),
    suppliers: await prisma.supplier.findMany(),
    purchases: await prisma.purchase.findMany(),
    expenses: await prisma.expense.findMany(),
    events: await prisma.event.findMany(),
    transactions: await prisma.transaction.findMany(),
    paymentMovements: await prisma.paymentMovement.findMany(),
    companySettings: await prisma.companySettings.findMany()
  };

  fs.writeFileSync('backup-data.json', JSON.stringify(data, null, 2));
  console.log('Successfully exported all data to backup-data.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
