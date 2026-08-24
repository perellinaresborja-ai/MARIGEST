import { ClientType } from "@/generated/prisma/client";

export const VAT_RATE = 0.21;
export const BOX_SIZE = 6;

export const PRICES = {
  DISTRIBUIDOR: 6.40,
  HOSTELERIA: 8.40,
  PARTICULAR_BOTTLE: 10.00,
  PARTICULAR_BOX: 50.00,
};

export function calculateBasePrice(
  type: ClientType,
  totalBottles: number
): number {
  if (type === "PARTICULAR") {
    const boxes = Math.floor(totalBottles / BOX_SIZE);
    const remainder = totalBottles % BOX_SIZE;
    return boxes * PRICES.PARTICULAR_BOX + remainder * PRICES.PARTICULAR_BOTTLE;
  }
  
  if (type === "DISTRIBUIDOR") {
    return totalBottles * PRICES.DISTRIBUIDOR;
  }
  
  if (type === "HOSTELERIA") {
    return totalBottles * PRICES.HOSTELERIA;
  }
  
  return 0;
}
