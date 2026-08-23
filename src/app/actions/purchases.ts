import { requireAuth } from "@/lib/auth";
"use server";

import { prisma } from "@/lib/prisma";
import { MovementType, ProductType, TransactionType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createPurchase(data: {
  supplierName: string;
  invoiceNo: string;
  date: Date;
  boxesRojo: number;
  boxesBlanco: number;
  total: number;
  dueDate: Date;
}) {
  const { supplierName, invoiceNo, date, boxesRojo, boxesBlanco, total, dueDate } = data;

  const bottlesRojo = boxesRojo * 6;
  const bottlesBlanco = boxesBlanco * 6;

  const products = await prisma.product.findMany();
  let rojoProduct = products.find((p) => p.type === ProductType.ROJO);
  let blancoProduct = products.find((p) => p.type === ProductType.BLANCO);

  // Si la base de datos está vacía, los creamos automáticamente
  if (!rojoProduct) {
    rojoProduct = await prisma.product.create({ data: { name: "Vermut Rojo", type: ProductType.ROJO, boxSize: 6 } });
  }
  if (!blancoProduct) {
    blancoProduct = await prisma.product.create({ data: { name: "Vermut Blanco", type: ProductType.BLANCO, boxSize: 6 } });
  }

  let defaultLocation = await prisma.location.findFirst({
    where: { isDefault: true },
  });

  if (!defaultLocation) {
    defaultLocation = await prisma.location.create({
      data: { name: "Almacén Principal", isDefault: true }
    });
  }

  await prisma.$transaction(async (tx) => {
    // 1. Find or create Supplier
    let supplier = await tx.supplier.findFirst({
      where: { name: supplierName }
    });

    if (!supplier) {
      supplier = await tx.supplier.create({
        data: { name: supplierName }
      });
    }

    // 2. Create Purchase record
    const purchase = await tx.purchase.create({
      data: {
        supplierId: supplier.id,
        date,
        total,
      }
    });

    // 3. Create Stock Movements (Additions)
    if (bottlesRojo > 0) {
      await tx.stockMovement.create({
        data: {
          productId: rojoProduct.id,
          quantity: bottlesRojo,
          type: MovementType.PURCHASE,
          toLocationId: defaultLocation.id,
          referenceId: purchase.id,
          date
        }
      });
    }

    if (bottlesBlanco > 0) {
      await tx.stockMovement.create({
        data: {
          productId: blancoProduct.id,
          quantity: bottlesBlanco,
          type: MovementType.PURCHASE,
          toLocationId: defaultLocation.id,
          referenceId: purchase.id,
          date
        }
      });
    }

    // 4. Create Payable Transaction (A PAGAR)
    await tx.transaction.create({
      data: {
        type: TransactionType.PAYABLE,
        status: TransactionStatus.PENDING,
        amount: total,
        dueDate,
        date,
        supplierId: supplier.id,
        referenceId: purchase.id // Or invoiceNo
      }
    });
  });

  revalidatePath("/producto", "layout");
  revalidatePath("/", "layout");
  return { success: true };
}
