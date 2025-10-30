/**
 * Prisma database client singleton
 * Following Cursor Clause 4.5 Rules
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * Using singleton pattern to prevent multiple instances
 */
let prisma: PrismaClient;

/**
 * Get Prisma client instance
 * Creates a new instance if one doesn't exist
 * 
 * @returns Prisma client instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Disconnect Prisma client
 * Call this on server shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

// Export default instance
export const db = getPrismaClient();


