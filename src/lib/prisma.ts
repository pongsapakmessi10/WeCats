import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    const urlObj = new URL(dbUrl);
    const authToken = urlObj.searchParams.get('authToken') || process.env.TURSO_AUTH_TOKEN || undefined;
    const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

    const adapter = new PrismaLibSql({
      url: cleanUrl,
      authToken,
    });

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
