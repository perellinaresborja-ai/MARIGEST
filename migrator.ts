const { PrismaClient: PostgresClient } = require('@prisma/client');
const { PrismaClient: SQLiteClient } = require('./prisma/client-sqlite');

async function main() {
  const sqlite = new SQLiteClient({
    datasourceUrl: "file:./dev.backup.db"
  });
  const pg = new PostgresClient();

  console.log("Starting migration from SQLite to PostgreSQL...");

  // 1. Settings
  const settings = await sqlite.companySettings.findMany();
  for (const s of settings) {
    await pg.companySettings.create({ data: s });
  }
  console.log(`Migrated ${settings.length} CompanySettings`);

  // 2. Locations
  const locations = await sqlite.location.findMany();
  for (const l of locations) {
    await pg.location.create({ data: l });
  }
  console.log(`Migrated ${locations.length} Locations`);

  // 3. Products
  const products = await sqlite.product.findMany();
  for (const p of products) {
    await pg.product.create({ data: p });
  }
  console.log(`Migrated ${products.length} Products`);

  // 4. Clients & PaymentTerms & Agreements
  const clients = await sqlite.client.findMany();
  for (const c of clients) {
    await pg.client.create({ data: c });
  }
  console.log(`Migrated ${clients.length} Clients`);

  // 5. Suppliers
  const suppliers = await sqlite.supplier.findMany();
  for (const s of suppliers) {
    await pg.supplier.create({ data: s });
  }
  console.log(`Migrated ${suppliers.length} Suppliers`);

  // 6. Orders
  const orders = await sqlite.order.findMany();
  for (const o of orders) {
    await pg.order.create({ data: o });
  }
  console.log(`Migrated ${orders.length} Orders`);

  // 7. Invoices
  const invoices = await sqlite.invoice.findMany();
  for (const i of invoices) {
    await pg.invoice.create({ data: i });
  }
  console.log(`Migrated ${invoices.length} Invoices`);

  // 8. InvoiceLines
  const invoiceLines = await sqlite.invoiceLine.findMany();
  for (const il of invoiceLines) {
    await pg.invoiceLine.create({ data: il });
  }
  console.log(`Migrated ${invoiceLines.length} InvoiceLines`);

  // 9. DeliveryNotes
  const deliveryNotes = await sqlite.deliveryNote.findMany();
  for (const dn of deliveryNotes) {
    await pg.deliveryNote.create({ data: dn });
  }
  console.log(`Migrated ${deliveryNotes.length} DeliveryNotes`);

  // 10. StockMovements
  const stockMovements = await sqlite.stockMovement.findMany();
  for (const sm of stockMovements) {
    await pg.stockMovement.create({ data: sm });
  }
  console.log(`Migrated ${stockMovements.length} StockMovements`);

  // 11. Purchases
  const purchases = await sqlite.purchase.findMany();
  for (const p of purchases) {
    await pg.purchase.create({ data: p });
  }
  console.log(`Migrated ${purchases.length} Purchases`);

  // 12. Expenses
  const expenses = await sqlite.expense.findMany();
  for (const e of expenses) {
    await pg.expense.create({ data: e });
  }
  console.log(`Migrated ${expenses.length} Expenses`);

  // 13. Events
  const events = await sqlite.event.findMany();
  for (const ev of events) {
    await pg.event.create({ data: ev });
  }
  console.log(`Migrated ${events.length} Events`);

  // 14. Transactions
  const transactions = await sqlite.transaction.findMany();
  for (const t of transactions) {
    await pg.transaction.create({ data: t });
  }
  console.log(`Migrated ${transactions.length} Transactions`);

  // 15. PaymentMovements
  const paymentMovements = await sqlite.paymentMovement.findMany();
  for (const pm of paymentMovements) {
    await pg.paymentMovement.create({ data: pm });
  }
  console.log(`Migrated ${paymentMovements.length} PaymentMovements`);

  console.log("Migration complete!");
}

main().catch(console.error).finally(() => process.exit(0));
