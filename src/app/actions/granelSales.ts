"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSeedProducts() {
  await requireAuth();
  return await prisma.seedProduct.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });
}

export async function getClientPrices(clientId: string) {
  await requireAuth();
  return await prisma.clientSeedPrice.findMany({
    where: { clientId }
  });
}

export async function processGranelSale(data: {
  clientId: string;
  lines: {
    reference: string;
    name: string;
    quantity: number;
    price: number;
    vat: number;
    updatePrice: "SAVE" | "JUST_ONCE";
  }[];
}) {
  await requireAuth();

  try {
    return await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let totalVat = 0;

      const invoiceLines = [];

      for (const line of data.lines) {
        if (line.quantity <= 0 || line.price < 0) {
          throw new Error("Cantidades y precios deben ser positivos.");
        }

        // Check if product exists or create it
        let product = await tx.seedProduct.findUnique({
          where: { reference: line.reference }
        });

        if (!product) {
          product = await tx.seedProduct.create({
            data: {
              reference: line.reference,
              name: line.name,
              vat: line.vat
            }
          });
        }

        // Handle custom price if SAVE requested
        if (line.updatePrice === "SAVE") {
          await tx.clientSeedPrice.upsert({
            where: {
              clientId_seedProductId: {
                clientId: data.clientId,
                seedProductId: product.id
              }
            },
            update: { price: line.price },
            create: {
              clientId: data.clientId,
              seedProductId: product.id,
              price: line.price
            }
          });
        } else {
          // If JUST_ONCE and they never bought it before, we still save it as default if no price existed
          const existingPrice = await tx.clientSeedPrice.findUnique({
             where: {
              clientId_seedProductId: {
                clientId: data.clientId,
                seedProductId: product.id
              }
            }
          });
          if (!existingPrice) {
            await tx.clientSeedPrice.create({
              data: {
                clientId: data.clientId,
                seedProductId: product.id,
                price: line.price
              }
            });
          }
        }

        const lineTotal = line.quantity * line.price;
        subtotal += lineTotal;
        totalVat += lineTotal * (line.vat / 100);

        invoiceLines.push({
          description: `[${line.reference}] ${line.name}`,
          quantity: line.quantity,
          unitPrice: line.price,
          total: lineTotal + (lineTotal * (line.vat / 100))
        });
      }

      const total = subtotal + totalVat;

      // Generate invoice number
      // Assuming a simple global F-YYYY-XXXX format or finding the max number
      const lastInvoice = await tx.invoice.findFirst({
        where: { type: "NORMAL" },
        orderBy: { number: "desc" }
      });
      let nextNum = 1;
      if (lastInvoice && lastInvoice.number.includes("-")) {
        const parts = lastInvoice.number.split("-");
        const lastPart = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastPart)) nextNum = lastPart + 1;
      }
      const year = new Date().getFullYear();
      const invoiceNumber = `F-${year}-${String(nextNum).padStart(3, "0")}`;

      // Calculate dueDate based on client payment terms
      const client = await tx.client.findUnique({
        where: { id: data.clientId },
        include: { paymentTerm: true }
      });
      const days = client?.paymentTerm?.days || 0;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          businessProfile: "GRANEL_PREMIUM",
          subtotal,
          vat: totalVat,
          total,
          dueDate,
          lines: {
            create: invoiceLines
          }
        }
      });

      // Create Transaction
      await tx.transaction.create({
        data: {
          type: "RECEIVABLE",
          amount: total,
          dueDate,
          clientId: data.clientId,
          referenceId: invoice.id,
          businessProfile: "GRANEL_PREMIUM"
        }
      });

      return { success: true, invoiceNumber: invoice.number, invoiceId: invoice.id };
    });
  } catch (error: any) {
    console.error("Granel Sale Error:", error);
    return { success: false, error: error.message };
  }
}
