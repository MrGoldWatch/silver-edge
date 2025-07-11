import { PrismaClient } from '@prisma/client';

// Global Prisma instance to prevent multiple connections in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the instance globally to prevent hot reload issues
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

// Test database connection
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
