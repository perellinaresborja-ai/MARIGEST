"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfYear, endOfMonth, endOfYear, subMonths } from "date-fns";
import { getStockOverview } from "@/lib/stock";

export async function getDashboardData() {
  await requireAuth();
  const now = new Date();
  
  // 1. Ventas (Facturas emitidas o cobradas)
  const currentMonthStart = startOfMonth(now);
  const currentYearStart = startOfYear(now);
  
  const invoices = await prisma.invoice.findMany({
    where: { status: "ISSUED" }
  });

  const ventasMes = invoices
    .filter(i => i.date >= currentMonthStart)
    .reduce((sum, i) => sum + i.total, 0);

  const ventasAno = invoices
    .filter(i => i.date >= currentYearStart)
    .reduce((sum, i) => sum + i.total, 0);

  // 2. Transacciones (Cobros y Pagos)
  const transactions = await prisma.transaction.findMany({
    include: { client: true, supplier: true },
    orderBy: { dueDate: 'asc' }
  });

  const aCobrar = transactions
    .filter(t => t.type === "RECEIVABLE" && t.status !== "PAID");
  const aCobrarTotal = aCobrar.reduce((sum, t) => sum + (t.amount - t.paidAmount), 0);
  
  const vencido = aCobrar.filter(t => new Date(t.dueDate) < now);
  const vencidoTotal = vencido.reduce((sum, t) => sum + (t.amount - t.paidAmount), 0);

  const aPagar = transactions
    .filter(t => t.type === "PAYABLE" && t.status !== "PAID");
  const aPagarTotal = aPagar.reduce((sum, t) => sum + (t.amount - t.paidAmount), 0);

  // 3. Stock
  const stockOverview = await getStockOverview();
  const rojoOverview = stockOverview.find(s => s.type === "ROJO") || { total: 0, almacen: 0, fuera: 0 };
  const blancoOverview = stockOverview.find(s => s.type === "BLANCO") || { total: 0, almacen: 0, fuera: 0 };

  // 4. Actividad reciente
  const recentInvoices = await prisma.invoice.findMany({ take: 5, orderBy: { date: 'desc' }, include: { order: { include: { client: true } } } });
  const recentOrders = await Promise.all(recentInvoices.map(async inv => { let client = inv.order?.client; if (!client) { const t = await prisma.transaction.findFirst({ where: { referenceId: inv.id }, include: { client: true } }); client = t?.client; } return { id: inv.id, date: inv.date, invoiceNumber: inv.number, client, businessProfile: inv.businessProfile }; }));

  // 5. Alertas
  const alertas = [];
  if (vencido.length > 0) {
    alertas.push({ type: "danger", message: `Hay ${vencido.length} cobro(s) vencido(s) por valor de ${vencidoTotal.toFixed(2)} €.` });
  }
  if (rojoOverview.total < 100) {
    alertas.push({ type: "warning", message: `Stock bajo de Vermut Rojo (${rojoOverview.total} botellas).` });
  }
  if (blancoOverview.total < 50) {
    alertas.push({ type: "warning", message: `Stock bajo de Vermut Blanco (${blancoOverview.total} botellas).` });
  }

  // 6. Gráfico de evolución (Últimos 6 meses)
  // Agrupación sencilla de ventas por mes
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(now, 5 - i);
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString('es-ES', { month: 'short' }),
      total: 0
    };
  });

  invoices.forEach(inv => {
    const m = inv.date.getMonth();
    const y = inv.date.getFullYear();
    const slot = months.find(slot => slot.month === m && slot.year === y);
    if (slot) {
      slot.total += inv.total;
    }
  });

  return {
    ventasMes,
    ventasAno,
    aCobrarTotal,
    vencidoTotal,
    aPagarTotal,
    rojo: { total: rojoOverview.total, almacen: rojoOverview.almacen, fuera: rojoOverview.fuera },
    blanco: { total: blancoOverview.total, almacen: blancoOverview.almacen, fuera: blancoOverview.fuera },
    proximosCobros: aCobrar.slice(0, 5),
    proximosPagos: aPagar.slice(0, 5),
    alertas,
    recentOrders,
    chartData: months
  };
}

