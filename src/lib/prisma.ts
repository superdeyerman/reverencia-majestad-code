import { PrismaClient } from "@prisma/client";

// Evita múltiples instancias en desarrollo (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

// En desarrollo guarda la instancia global
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}