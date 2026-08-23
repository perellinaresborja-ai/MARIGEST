"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getProductStock } from "@/lib/stock";

export async function addStockMovement(data: {
  productId: string;
  type: string;
  quantity: number;
  reason?: string;
  user?: string;
  fromLocationId?: string;
  toLocationId?: string;
  referenceId?: string;
}) {
  try {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error("Producto no encontrado");

    if (data.quantity <= 0) {
      throw new Error("La cantidad debe ser mayor que 0");
    }

    // Get current stock
    const currentStock = await getProductStock(data.productId);
    
    // Calculate new stock based on type
    const POSITIVE_MOVEMENTS = ["BOTTLING", "PURCHASE", "REPLACEMENT", "RETURN", "ADJUSTMENT"];
    const NEGATIVE_MOVEMENTS = ["SALE", "SAMPLE", "TASTING", "PROMOTION", "COURTESY", "BREAKAGE", "SHRINKAGE", "EVENT", "INTERNAL", "OTHER"];
    
    let effect = 0;
    if (POSITIVE_MOVEMENTS.includes(data.type)) {
      effect = data.quantity;
    } else if (NEGATIVE_MOVEMENTS.includes(data.type)) {
      effect = -data.quantity;
    } else if (data.type === "TRANSFER") {
      effect = 0; // Total company stock doesn't change on transfer
    }

    const newStock = currentStock + effect;

    // Enforce rule: No negative stock unless ADJUSTMENT
    if (newStock < 0 && data.type !== "ADJUSTMENT") {
      throw new Error(`Stock insuficiente. Intentas sacar ${data.quantity} pero solo hay ${currentStock} botellas.`);
    }

    // Determine default location if none provided
    let locationId = data.fromLocationId;
    if (!locationId && NEGATIVE_MOVEMENTS.includes(data.type)) {
      const defaultLoc = await prisma.location.findFirst({ where: { isDefault: true } });
      locationId = defaultLoc?.id;
    }
    
    let destLocationId = data.toLocationId;
    if (!destLocationId && POSITIVE_MOVEMENTS.includes(data.type)) {
      const defaultLoc = await prisma.location.findFirst({ where: { isDefault: true } });
      destLocationId = defaultLoc?.id;
    }

    const movement = await prisma.$transaction(async (tx) => {
      // Create movement with stock snapshot
      const mov = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type as any,
          quantity: data.quantity,
          stockBefore: currentStock,
          stockAfter: newStock,
          reason: data.reason,
          user: data.user || "Mari",
          fromLocationId: locationId,
          toLocationId: destLocationId,
          referenceId: data.referenceId
        }
      });

      // We still update the cached stock field on Product just in case some legacy code reads it
      await tx.product.update({
        where: { id: data.productId },
        data: { stock: newStock }
      });

      return mov;
    });

    revalidatePath("/producto");
    revalidatePath("/");
    
    return { success: true, movement };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStockMovements(take = 50) {
  await requireAuth();
  return await prisma.stockMovement.findMany({
    orderBy: { date: "desc" },
    take,
    include: { product: true, fromLocation: true, toLocation: true }
  });
}
