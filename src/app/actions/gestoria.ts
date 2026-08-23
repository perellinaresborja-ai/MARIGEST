import { requireAuth } from "@/lib/auth";
"use server";

import { prisma } from "@/lib/prisma";

export async function getGestoriaData(period: string = "TRIMESTRE") {
  await requireAuth();
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  
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

  // 1. FACTURAS EMITIDAS (VENTAS)
  const invoices = await prisma.invoice.findMany({
    where: { date: { gte: startDate, lte: endDate } }
  });
  
  const emitidas = invoices.reduce((acc, inv) => {
    acc.base += inv.subtotal;
    acc.iva += inv.vat;
    acc.total += inv.total;
    return acc;
  }, { base: 0, iva: 0, total: 0 });

  // 2. FACTURAS RECIBIDAS (COMPRAS DE MERCANCÍA)
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte: startDate, lte: endDate } }
  });
  
  const recibidas = purchases.reduce((acc, p) => {
    // Assuming purchase amount is total. For Gestoria, let's reverse calculate 21% IVA if not specified
    // In a real app we'd have subtotal and tax on purchases too. For now we estimate standard 21%
    const base = p.total / 1.21;
    const iva = p.total - base;
    acc.base += base;
    acc.iva += iva;
    acc.total += p.total;
    return acc;
  }, { base: 0, iva: 0, total: 0 });

  // 3. GASTOS GENERALES
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } }
  });
  
  const gastos = expenses.reduce((acc, e) => {
    acc.base += e.baseAmount;
    acc.iva += e.vatAmount;
    acc.total += e.amount;
    return acc;
  }, { base: 0, iva: 0, total: 0 });

  // SUMAR COMPRAS Y GASTOS COMO "SOPORTADO"
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
