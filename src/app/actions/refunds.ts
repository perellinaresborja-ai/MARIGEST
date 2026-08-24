"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRefund(
  originalInvoiceId: string, 
  linesToRefund: { lineId: string, quantity: number }[],
  returnStock: boolean
) {
  await requireAuth();

  return await prisma.$transaction(async (tx) => {
    // 1. Obtener la factura original con todas sus relaciones
    const originalInvoice = await tx.invoice.findUnique({
      where: { id: originalInvoiceId },
      include: {
        lines: true,
        order: {
          include: { client: true }
        }
      }
    });

    if (!originalInvoice) throw new Error("Factura original no encontrada");
    if (originalInvoice.type !== "NORMAL") throw new Error("No se puede hacer un abono de una rectificativa");

    // 2. Validar cantidades y calcular importes del abono
    let refundSubtotal = 0;
    
    const refundLinesData = [];
    
    let totalBotellasRojo = 0;
    let totalBotellasBlanco = 0;

    for (const item of linesToRefund) {
      if (item.quantity <= 0) continue;

      const line = originalInvoice.lines.find(l => l.id === item.lineId);
      if (!line) throw new Error(`Línea ${item.lineId} no encontrada`);

      const availableToRefund = line.quantity - line.refundedQuantity;
      if (item.quantity > availableToRefund) {
        throw new Error(`No puedes abonar más cantidad de la disponible en la línea: ${line.description}`);
      }

      // Actualizar la cantidad abonada en la línea original
      await tx.invoiceLine.update({
        where: { id: line.id },
        data: { refundedQuantity: line.refundedQuantity + item.quantity }
      });

      // Calcular importes de la rectificación (en negativo)
      const lineRefundTotal = -(item.quantity * line.unitPrice);
      refundSubtotal += lineRefundTotal;

      refundLinesData.push({
        description: `ABONO: ${line.description}`,
        quantity: -item.quantity, // En la rectificativa las cantidades se suelen poner en negativo
        unitPrice: line.unitPrice,
        total: lineRefundTotal
      });
      
      if (returnStock) {
        if (line.description.toLowerCase().includes("rojo")) {
          totalBotellasRojo += item.quantity;
        } else if (line.description.toLowerCase().includes("blanco")) {
          totalBotellasBlanco += item.quantity;
        }
      }
    }

    if (refundLinesData.length === 0) {
      throw new Error("No se han especificado cantidades a abonar");
    }

    // Calcular IVA
    const vatRate = originalInvoice.subtotal > 0 ? (originalInvoice.vat / originalInvoice.subtotal) : 0.21;
    const refundVat = refundSubtotal * vatRate;
    const refundTotal = refundSubtotal + refundVat;

    // 3. Generar número R-XXXXXX
    const lastRectificativa = await tx.invoice.findFirst({
      where: { number: { startsWith: "R-" } },
      orderBy: { number: "desc" }
    });
    
    let nextNumber = "R-026001";
    if (lastRectificativa) {
      const lastSeq = parseInt(lastRectificativa.number.replace("R-", ""));
      if (lastSeq >= 26001) {
        nextNumber = `R-${String(lastSeq + 1).padStart(6, '0')}`;
      }
    }

    // 4. Crear la Factura Rectificativa
    const rectificativa = await tx.invoice.create({
      data: {
        number: nextNumber,
        type: "RECTIFICATIVA",
        originalInvoiceId: originalInvoice.id,
        subtotal: refundSubtotal,
        vat: refundVat,
        total: refundTotal,
        dueDate: new Date(),
        status: "ISSUED",
        lines: {
          create: refundLinesData
        }
      }
    });

    // 5. Tesorería
    if (originalInvoice.order?.clientId) {
      await tx.transaction.create({
        data: {
          type: "RECEIVABLE", 
          status: "PENDING",
          amount: refundTotal, // Es un valor negativo!
          dueDate: new Date(),
          clientId: originalInvoice.order.clientId,
          referenceId: rectificativa.id,
          expectedMethod: "ABONO"
        }
      });
    }

    // 6. Stock
    if (returnStock && (totalBotellasRojo > 0 || totalBotellasBlanco > 0)) {
      if (totalBotellasRojo > 0) {
        const pRojo = await tx.product.findUnique({ where: { type: "ROJO" } });
        if (pRojo) {
          await tx.stockMovement.create({
            data: {
              productId: pRojo.id,
              quantity: totalBotellasRojo,
              type: "RETURN",
              reason: `Devolución Abono ${rectificativa.number}`,
              referenceId: rectificativa.id
            }
          });
        }
      }
      if (totalBotellasBlanco > 0) {
        const pBlanco = await tx.product.findUnique({ where: { type: "BLANCO" } });
        if (pBlanco) {
          await tx.stockMovement.create({
            data: {
              productId: pBlanco.id,
              quantity: totalBotellasBlanco,
              type: "RETURN",
              reason: `Devolución Abono ${rectificativa.number}`,
              referenceId: rectificativa.id
            }
          });
        }
      }
    }

    return { success: true, rectificativaId: rectificativa.id };
  });
}
