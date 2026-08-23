import { requireAuth } from "@/lib/auth";
"use server";

import { prisma } from "@/lib/prisma";

export async function getNegocioDashboard(period: string = "MES") {
  await requireAuth();
  const now = new Date();
  let startDate = new Date();
  
  if (period === "MES") {
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
    where: { date: { gte: startDate } },
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
    const invTotal = o.invoice ? o.invoice.total : 0; // PVP con IVA, o podemos usar subtotal
    const baseTotal = o.invoice ? o.invoice.subtotal : 0;
    
    facturacion += baseTotal;
    
    const botVentas = (o.boxesRojo + o.boxesBlanco) * 6; // Assuming boxes are stored as quantities
    const botPromo = o.promoRojo + o.promoBlanco;
    
    botellasVendidas += botVentas;
    botellasPromo += botPromo;
    
    // Coste real histórico guardado en el pedido
    const costeTotalOp = (botVentas + botPromo) * o.productCost;
    costeProductoVendido += costeTotalOp;
    
    const clientType = o.client?.type || "PARTICULAR";
    if (canalStats[clientType as keyof typeof canalStats]) {
      canalStats[clientType as keyof typeof canalStats].facturacion += baseTotal;
      canalStats[clientType as keyof typeof canalStats].botellas += botVentas + botPromo;
      canalStats[clientType as keyof typeof canalStats].coste += costeTotalOp;
    }
  });

  // 2. GASTOS
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate } }
  });
  const gastosTotales = expenses.reduce((sum, e) => sum + e.baseAmount, 0);

  // 3. PENDIENTE DE COBRO
  const receivables = await prisma.transaction.findMany({
    where: { type: "RECEIVABLE", date: { gte: startDate } },
    include: { client: true }
  });
  let pendienteCobro = 0;
  receivables.forEach(r => {
    const pend = r.amount - r.paidAmount;
    if (pend > 0) {
      pendienteCobro += pend;
      const clientType = r.client?.type || "PARTICULAR";
      if (canalStats[clientType as keyof typeof canalStats]) {
        canalStats[clientType as keyof typeof canalStats].pendiente += pend;
      }
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
