import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

/**
 * Positive movement types add stock to a location (from outside the company).
 */
const POSITIVE_MOVEMENTS = [
  "BOTTLING",
  "PURCHASE",
  "REPLACEMENT",
  "RETURN",
  "ADJUSTMENT"
];

/**
 * Negative movement types remove stock from a location (and from the company).
 */
const NEGATIVE_MOVEMENTS = [
  "SALE",
  "SAMPLE",
  "TASTING",
  "PROMOTION",
  "COURTESY",
  "BREAKAGE",
  "SHRINKAGE",
  "EVENT",
  "INTERNAL",
  "OTHER"
];

export async function getProductStock(productId: string, locationId?: string) {
  const movements = await prisma.stockMovement.findMany({
    where: { productId }
  });

  if (locationId) {
    // Stock in a specific location
    let stock = 0;
    for (const mov of movements) {
      if (mov.toLocationId === locationId) {
        stock += mov.quantity;
      }
      if (mov.fromLocationId === locationId) {
        stock -= mov.quantity;
      }
    }
    return stock;
  }

  // Total company stock
  let totalStock = 0;
  for (const mov of movements) {
    if (POSITIVE_MOVEMENTS.includes(mov.type) || (mov.type === MovementType.TRANSFER && !mov.fromLocationId)) {
      totalStock += mov.quantity;
    } else if (NEGATIVE_MOVEMENTS.includes(mov.type)) {
      totalStock -= mov.quantity;
    }
  }
  return totalStock;
}

export async function getStockOverview() {
  const products = await prisma.product.findMany();
  
  // Find or create default location (Almacén Principal)
  let defaultLocation = await prisma.location.findFirst({ where: { isDefault: true } });
  if (!defaultLocation) {
    defaultLocation = await prisma.location.create({
      data: { name: "Almacén Principal", isDefault: true }
    });
  }

  const result = [];
  
  for (const p of products) {
    const total = await getProductStock(p.id);
    const almacen = await getProductStock(p.id, defaultLocation.id);
    const fuera = total - almacen;
    
    result.push({
      ...p,
      total,
      almacen,
      fuera
    });
  }
  
  return result;
}
