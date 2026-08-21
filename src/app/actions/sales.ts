"use server";

import { prisma } from "@/lib/prisma";
import { calculateBasePrice, VAT_RATE, BOX_SIZE } from "@/lib/pricing";
import { revalidatePath } from "next/cache";

export async function processSale(data: {
  clientId: string;
  boxesRojo: number;
  boxesBlanco: number;
}) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
      include: { agreement: true, paymentTerm: true }
    });

    if (!client) throw new Error("Cliente no encontrado");

    let totalBottlesRojo = data.boxesRojo * BOX_SIZE;
    let totalBottlesBlanco = data.boxesBlanco * BOX_SIZE;
    let totalBottles = totalBottlesRojo + totalBottlesBlanco;
    
    if (totalBottles === 0) throw new Error("Debes incluir al menos una caja");

    let promoRojo = 0;
    let promoBlanco = 0;

    // Calcular promo X + Y
    if (client.agreement && client.agreement.type === "PROMO_X_Y") {
      const { paramX, paramY } = client.agreement;
      if (paramX && paramY) {
        const freeBatches = Math.floor(totalBottles / paramX);
        const freeBottles = freeBatches * paramY;
        
        // Asignar botellas gratis (priorizar rojo para simplificar o mitad y mitad)
        promoRojo = freeBottles; 
        totalBottlesRojo += promoRojo;
        totalBottles += freeBottles;
      }
    }
    
    // Si hay descuentos u otros acuerdos, se implementarían aquí (simplificado para MVP)
    
    const subtotal = calculateBasePrice(client.type, (data.boxesRojo + data.boxesBlanco) * BOX_SIZE);
    
    let finalSubtotal = subtotal;
    if (client.agreement?.type === "DISCOUNT_PERCENT" && client.agreement.paramFloat) {
      finalSubtotal = subtotal * (1 - (client.agreement.paramFloat / 100));
    }
    
    const vat = finalSubtotal * VAT_RATE;
    const total = finalSubtotal + vat;

    const dueDate = new Date();
    if (client.paymentTerm?.days) {
      dueDate.setDate(dueDate.getDate() + client.paymentTerm.days);
    }

    // Buscar o crear productos
    let productRojo = await prisma.product.findFirst({ where: { type: "ROJO" } });
    if (!productRojo) {
      productRojo = await prisma.product.create({ data: { name: "Vermut Rojo", type: "ROJO", boxSize: 6 } });
    }
    
    let productBlanco = await prisma.product.findFirst({ where: { type: "BLANCO" } });
    if (!productBlanco) {
      productBlanco = await prisma.product.create({ data: { name: "Vermut Blanco", type: "BLANCO", boxSize: 6 } });
    }
    
    // Almacén principal
    const almacenes = await prisma.location.findMany();
    let almacen = almacenes.length > 0 ? almacenes[0] : await prisma.location.create({ data: { name: "Almacén Principal", isDefault: true } });

    // Iniciar transacción atómica
    const result = await prisma.$transaction(async (tx) => {
      // 1. Pedido
      const order = await tx.order.create({
        data: {
          clientId: client.id,
          boxesRojo: data.boxesRojo,
          boxesBlanco: data.boxesBlanco,
          bottlesRojo: totalBottlesRojo,
          bottlesBlanco: totalBottlesBlanco,
          promoRojo,
          promoBlanco,
          totalBottles
        }
      });

      // 2. Albarán
      const dNumber = `ALB-${new Date().getTime().toString().slice(-6)}`;
      const deliveryNote = await tx.deliveryNote.create({
        data: { number: dNumber, orderId: order.id }
      });

      // 3. Factura
      // Encontrar último número de factura F-
      const lastInvoice = await tx.invoice.findFirst({
        where: { number: { startsWith: "F-" } },
        orderBy: { number: "desc" }
      });
      let nextNumber = "F-000001";
      if (lastInvoice) {
        const lastSeq = parseInt(lastInvoice.number.replace("F-", ""));
        nextNumber = `F-${String(lastSeq + 1).padStart(6, '0')}`;
      }

      const invoice = await tx.invoice.create({
        data: {
          number: nextNumber,
          orderId: order.id,
          subtotal: finalSubtotal,
          vat,
          total,
          dueDate,
          status: "ISSUED",
          emailStatus: "SENT" // Simulación de envío automático
        }
      });
      
      // Invoice Lines
      if (data.boxesRojo > 0) {
        await tx.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            description: `Vermut Rojo (${data.boxesRojo} cajas = ${data.boxesRojo * BOX_SIZE} botellas)`,
            quantity: data.boxesRojo * BOX_SIZE,
            unitPrice: calculateBasePrice(client.type, BOX_SIZE) / BOX_SIZE,
            total: calculateBasePrice(client.type, data.boxesRojo * BOX_SIZE)
          }
        });
      }
      if (data.boxesBlanco > 0) {
        await tx.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            description: `Vermut Blanco (${data.boxesBlanco} cajas = ${data.boxesBlanco * BOX_SIZE} botellas)`,
            quantity: data.boxesBlanco * BOX_SIZE,
            unitPrice: calculateBasePrice(client.type, BOX_SIZE) / BOX_SIZE,
            total: calculateBasePrice(client.type, data.boxesBlanco * BOX_SIZE)
          }
        });
      }
      
      // 4. Movimientos de Stock
      // For accurate snapshot, we should fetch current stock.
      // But since this is a mock, and the rule says "Las ventas ya generadas deben seguir descontando stock automáticamente", 
      // we update the creation to include stock snapshot if we can.
      
      const currentRojoStock = await tx.stockMovement.aggregate({
        where: { productId: productRojo.id, type: { in: ["BOTTLING", "PURCHASE", "REPLACEMENT", "RETURN", "ADJUSTMENT"] } },
        _sum: { quantity: true }
      }).then(r => r._sum.quantity || 0) - await tx.stockMovement.aggregate({
        where: { productId: productRojo.id, type: { in: ["SALE", "SAMPLE", "TASTING", "PROMOTION", "COURTESY", "BREAKAGE", "SHRINKAGE", "EVENT", "INTERNAL", "OTHER"] } },
        _sum: { quantity: true }
      }).then(r => r._sum.quantity || 0);

      const currentBlancoStock = await tx.stockMovement.aggregate({
        where: { productId: productBlanco.id, type: { in: ["BOTTLING", "PURCHASE", "REPLACEMENT", "RETURN", "ADJUSTMENT"] } },
        _sum: { quantity: true }
      }).then(r => r._sum.quantity || 0) - await tx.stockMovement.aggregate({
        where: { productId: productBlanco.id, type: { in: ["SALE", "SAMPLE", "TASTING", "PROMOTION", "COURTESY", "BREAKAGE", "SHRINKAGE", "EVENT", "INTERNAL", "OTHER"] } },
        _sum: { quantity: true }
      }).then(r => r._sum.quantity || 0);

      if (totalBottlesRojo > 0) {
        await tx.stockMovement.create({
          data: {
            productId: productRojo.id,
            quantity: totalBottlesRojo,
            type: "SALE",
            stockBefore: currentRojoStock,
            stockAfter: currentRojoStock - totalBottlesRojo,
            reason: `Venta a ${client.commercialName} (Fra. ${nextNumber})`,
            user: "Mari",
            fromLocationId: almacen.id,
            referenceId: order.id
          }
        });
      }
      if (totalBottlesBlanco > 0) {
        await tx.stockMovement.create({
          data: {
            productId: productBlanco.id,
            quantity: totalBottlesBlanco,
            type: "SALE",
            stockBefore: currentBlancoStock,
            stockAfter: currentBlancoStock - totalBottlesBlanco,
            reason: `Venta a ${client.commercialName} (Fra. ${nextNumber})`,
            user: "Mari",
            fromLocationId: almacen.id,
            referenceId: order.id
          }
        });
      }

      // 5. Cuenta a cobrar (Tesorería)
      await tx.transaction.create({
        data: {
          type: "RECEIVABLE",
          amount: total,
          dueDate,
          clientId: client.id,
          referenceId: invoice.id
        }
      });

      return { order, invoice };
    });

    revalidatePath("/ventas");
    revalidatePath("/tesoreria");
    
    return { success: true, invoiceNumber: result.invoice.number, invoiceId: result.invoice.id };
  } catch (error: any) {
    console.error("Error en proceso de venta:", error);
    return { success: false, error: error.message };
  }
}
