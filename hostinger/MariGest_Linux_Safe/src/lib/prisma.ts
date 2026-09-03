import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// En producción, Prisma resuelve "file:./" relativo a node_modules/.prisma/client
// Usando process.cwd() forzamos a que siempre busque en la raíz del proyecto real.
const dbPath = path.join(process.cwd(), "prisma", "dev.db");

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
