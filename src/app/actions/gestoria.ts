"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getGestoriaData(period: string = "TRIMESTRE", customStart?: string, customEnd?: string, profileFilter: string = "GENERAL") {
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

  // Filtro de negocio para Invoices (Ventas)
  const invoiceWhere: any = { date: { gte: startDate, lte: endDate } };
  if (profileFilter !== "GENERAL") {
    invoiceWhere.businessProfile = profileFilter;
  }
  
  const invoices = await prisma.invoice.findMany({ where: invoiceWhere });
  
  const emitidas = invoices.reduce((acc, inv) => {
    acc.base += inv.subtotal;
    acc.iva += inv.vat;
    acc.total += inv.total;
    return acc;
  }, { base: 0, iva: 0, total: 0 });

  // FACTURAS RECIBIDAS (COMPRAS DE MERCANCÍA - Solo Vermut/General por ahora)
  let purchases: any[] = [];
  if (profileFilter !== "GRANEL_PREMIUM") {
    purchases = await prisma.purchase.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    });
  }
  
  const recibidas = purchases.reduce((acc, p) => {
    const base = p.total / 1.21;
    const iva = p.total - base;
    acc.base += base;
    acc.iva += iva;
    acc.total += p.total;
    return acc;
  }, { base: 0, iva: 0, total: 0 });

  // GASTOS GENERALES
  const expenseWhere: any = { date: { gte: startDate, lte: endDate } };
  if (profileFilter !== "GENERAL") {
    expenseWhere.businessProfile = profileFilter;
  }
  
  const expenses = await prisma.expense.findMany({ where: expenseWhere });
  
  const gastos = expenses.reduce((acc, e) => {
    acc.base += e.baseAmount;
    acc.iva += e.vatAmount;
    acc.total += e.amount;
    return acc;
  }, { base: 0, iva: 0, total: 0 });

  const soportado = {
    base: recibidas.base + gastos.base,
    iva: recibidas.iva + gastos.iva,
    total: recibidas.total + gastos.total
  };

  const diferenciaIva = emitidas.iva - soportado.iva;

  return {
    period,
    emitidas,
    recibidas,
    gastos,
    soportado,
    diferenciaIva
  };
}

