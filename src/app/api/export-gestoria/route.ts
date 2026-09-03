import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "TRIMESTRE";
    const customStart = searchParams.get("start");
    const customEnd = searchParams.get("end");

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
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
    }

    const dateFilter = { gte: startDate, lte: endDate };

    // 1. FACTURAS EMITIDAS
    const invoices = await prisma.invoice.findMany({
      where: { date: dateFilter },
      include: {
        order: {
          include: {
            client: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    const emitidasData = invoices.map(inv => ({
      "Nº Factura": inv.number,
      "Fecha": new Date(inv.date).toLocaleDateString(),
      "Cliente": inv.order?.client?.legalName || inv.order?.client?.commercialName || "Cliente Genérico",
      "Tipo Cliente": inv.order?.client?.type || "-",
      "NIF/CIF": inv.order?.client?.cifNif || "-",
      "Base Imponible": inv.subtotal,
      "IVA": inv.vat,
      "Total": inv.total,
      "Estado": inv.status === "PAID" ? "Cobrada" : "Pendiente",
      "Vencimiento": new Date(inv.dueDate).toLocaleDateString()
    }));

    // 2. FACTURAS RECIBIDAS (Compras + Gastos)
    const purchases = await prisma.purchase.findMany({
      where: { date: dateFilter },
      orderBy: { date: 'asc' }
    });

    const expenses = await prisma.expense.findMany({
      where: { date: dateFilter },
      orderBy: { date: 'asc' }
    });
    
    // Fetch all suppliers to map supplierId manually since there is no relation on Purchase
    const allSuppliers = await prisma.supplier.findMany();
    const supplierMap = new Map(allSuppliers.map(s => [s.id, s]));

    const recibidasData = [
      ...purchases.map(p => {
        // @ts-ignore - total vs amount based on schema
        const amount = p.total || p.amount || 0;
        const base = amount / 1.21;
        const iva = amount - base;
        const sup = supplierMap.get(p.supplierId);
        return {
          "Proveedor": sup?.name || "Sin Proveedor",
          "Fecha": new Date(p.date).toLocaleDateString(),
          "Concepto": "Compra de mercancía",
          "Documento": "",
          "Base Imponible": base,
          "IVA Soportado": iva,
          "Total": amount,
          "Estado": "Pagado"
        };
      }),
      ...expenses.map(e => ({
        "Proveedor": e.supplierName || "Sin Proveedor",
        "Fecha": new Date(e.date).toLocaleDateString(),
        "Concepto": e.concept,
        "Documento": e.documentNo || "",
        "Base Imponible": e.baseAmount,
        "IVA Soportado": e.vatAmount,
        "Total": e.amount,
        "Estado": e.isPaid ? "Pagado" : "Pendiente"
      }))
    ];

    // 3. COBROS Y PAGOS (Transactions y PaymentMovements)
    const transactions = await prisma.transaction.findMany({
      where: { date: dateFilter },
      include: { client: true, supplier: true, payments: true },
      orderBy: { date: 'asc' }
    });

    const cobrosPagosData: any[] = [];
    transactions.forEach(t => {
      if (t.payments && t.payments.length > 0) {
        t.payments.forEach(p => {
          cobrosPagosData.push({
            "Fecha": new Date(p.date).toLocaleDateString(),
            "Tipo": t.type === "RECEIVABLE" ? "COBRO" : "PAGO",
            "Tercero": t.client?.commercialName || t.supplier?.name || "-",
            "Concepto": t.concept || "-",
            "Importe": p.amount,
            "Método": p.method,
            "Documento Relacionado": t.referenceId || "-"
          });
        });
      }
    });

    // 4. RESUMEN FISCAL
    const sumEmitidasBase = emitidasData.reduce((acc, i) => acc + i["Base Imponible"], 0);
    const sumEmitidasIva = emitidasData.reduce((acc, i) => acc + i["IVA"], 0);
    const sumRecibidasBase = recibidasData.reduce((acc, i) => acc + i["Base Imponible"], 0);
    const sumRecibidasIva = recibidasData.reduce((acc, i) => acc + i["IVA Soportado"], 0);

    const resumenData = [
      { "Concepto": "VENTAS (Base Imponible)", "Importe": sumEmitidasBase },
      { "Concepto": "IVA REPERCUTIDO (Devengado)", "Importe": sumEmitidasIva },
      { "Concepto": "", "Importe": null },
      { "Concepto": "COMPRAS Y GASTOS (Base Imponible)", "Importe": sumRecibidasBase },
      { "Concepto": "IVA SOPORTADO (Deducible)", "Importe": sumRecibidasIva },
      { "Concepto": "", "Importe": null },
      { "Concepto": "RESULTADO (Repercutido - Soportado)", "Importe": sumEmitidasIva - sumRecibidasIva }
    ];

    // Build Workbook
    const wb = XLSX.utils.book_new();

    // Add sheets if data exists, otherwise add empty sheet with headers
    const wsEmitidas = emitidasData.length > 0 
      ? XLSX.utils.json_to_sheet(emitidasData) 
      : XLSX.utils.aoa_to_sheet([["Sin movimientos en el periodo seleccionado"]]);
    XLSX.utils.book_append_sheet(wb, wsEmitidas, "Facturas Emitidas");

    const wsRecibidas = recibidasData.length > 0 
      ? XLSX.utils.json_to_sheet(recibidasData) 
      : XLSX.utils.aoa_to_sheet([["Sin movimientos en el periodo seleccionado"]]);
    XLSX.utils.book_append_sheet(wb, wsRecibidas, "Gastos Recibidos");

    const wsCobrosPagos = cobrosPagosData.length > 0 
      ? XLSX.utils.json_to_sheet(cobrosPagosData) 
      : XLSX.utils.aoa_to_sheet([["Sin movimientos en el periodo seleccionado"]]);
    XLSX.utils.book_append_sheet(wb, wsCobrosPagos, "Cobros y Pagos");

    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Fiscal");

    // Write to buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Ensure it's a valid string for filename
    const formattedDate = new Date().toISOString().split("T")[0];

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="MariGest_Gestoria_${formattedDate}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Error generating export", { status: 500 });
  }
}
