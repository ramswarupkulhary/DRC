import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makeClient() {
  const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma || makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
