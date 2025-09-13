import { PrismaClient, Transaction } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export type TransactionWithAccount = Transaction & {
  account: {
    id: string;
    name: string;
    currency: string;
  };
};
