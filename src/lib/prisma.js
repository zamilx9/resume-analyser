import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.APP_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.APP_ENV !== "production")
  globalForPrisma.prisma = prisma;

export default prisma;

