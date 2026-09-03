"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getNegocioDashboard(period: string = "MES", customStart?: string, customEnd?: string, profile?: string) {
  await requireAuth();
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  
  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === "MES") {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "TRIMESTRE") {
    const currentMonth = now.getMonth();
    const startMonth = currentMonth - (currentMonth % 3);
    startDate.setMonth(startMonth, 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "AÑO") {
    startDate.setMonth(0, 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "TODO") {
    startDate = new Date(2000, 0, 1);
  }

  // 1. FACTURACIÓN Y BOTELLAS VENDIDAS
  const orders = await prisma.order.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { invoice: true, client: true }
  });

  let facturacion = 0;
  let botellasVendidas = 0;
  let botellasPromo = 0;
  let costeProductoVendido = 0;
  
  const canalStats = {
    HOSTELERIA: { facturacion: 0, botellas: 0, coste: 0, pendiente: 0 },
    DISTRIBUIDOR: { facturacion: 0, botellas: 0, coste: 0, pendiente: 0 },
    PARTICULAR: { facturacion: 0, botellas: 0, coste: 0, pendiente: 0 }
  };

  orders.forEach(o => {
    const invTotal = o.invoice ? o.invoice.total : 0; 
    const baseTotal = o.invoice ? o.invoice.subtotal : 0;
    
    facturacion += baseTotal;
    
    const botVentas = (o.boxesRojo + o.boxesBlanco) * 6;
    const botPromo = o.promoRojo + o.promoBlanco;
    
    botellasVendidas += botVentas;
    botellasPromo += botPromo;
    
    const costeTotalOp = (botVentas + botPromo) * o.productCost;
    costeProductoVendido += costeTotalOp;
    
    const clientType = o.client?.type || "PARTICULAR";
    if (canalStats[clientType as keyof typeof canalStats]) {
      canalStats[clientType as keyof typeof canalStats].facturacion += baseTotal;
      canalStats[clientType as keyof typeof canalStats].botellas += botVentas + botPromo;
      canalStats[clientType as keyof typeof canalStats].coste += costeTotalOp;
    }
  });

  // 1.b RECTIFICATIVAS (Restar abonos)
  const rectificativas = await prisma.invoice.findMany({
    where: { 
      type: "RECTIFICATIVA", 
      date: { gte: startDate, lte: endDate } 
    },
    include: {
      originalInvoice: {
        include: { order: { include: { client: true } } }
      },
      lines: true
    }
  });

  rectificativas.forEach(r => {
    // r.subtotal is already negative
    facturacion += r.subtotal;
    
    let returnedBottles = 0;
    r.lines.forEach(l => {
      // l.quantity is negative in our implementation
      returnedBottles += Math.abs(l.quantity); 
    });

    // We assume cost is same as original order
    const origCost = r.originalInvoice?.order?.productCost || 4.05;
    const returnedCost = returnedBottles * origCost;
    
    botellasVendidas -= returnedBottles;
    costeProductoVendido -= returnedCost;

    const clientType = r.originalInvoice?.order?.client?.type || "PARTICULAR";
    if (canalStats[clientType as keyof typeof canalStats]) {
      canalStats[clientType as keyof typeof canalStats].facturacion += r.subtotal; // adds negative
      canalStats[clientType as keyof typeof canalStats].botellas -= returnedBottles;
      canalStats[clientType as keyof typeof canalStats].coste -= returnedCost;
    }
  });

  // 2. GASTOS
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } }
  });
  const gastosTotales = expenses.reduce((sum, e) => sum + e.baseAmount, 0);

  // 3. PENDIENTE DE COBRO
  const receivables = await prisma.transaction.findMany({
    where: { type: "RECEIVABLE", date: { gte: startDate, lte: endDate } },
    include: { client: true }
  });
  let pendienteCobro = 0;
  receivables.forEach(r => {
    const pend = r.amount - r.paidAmount;
    pendienteCobro += pend;
    const clientType = r.client?.type || "PARTICULAR";
    if (canalStats[clientType as keyof typeof canalStats]) {
      canalStats[clientType as keyof typeof canalStats].pendiente += pend;
    }
  });

  // MARGEN ESTIMADO
  const margenEstimado = facturacion - costeProductoVendido - gastosTotales;

  return {
    period,
    kpis: {
      facturacion,
      costeProductoVendido,
      gastosTotales,
      margenEstimado,
      botellasVendidas,
      botellasPromo,
      pendienteCobro
    },
    canales: canalStats
  };
}

