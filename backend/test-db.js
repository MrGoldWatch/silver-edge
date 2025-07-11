const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseConnection() {
  console.log('🔍 Testing Railway PostgreSQL connection...');
  console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));
  
  try {
    // Test connection
    console.log('\n1️⃣ Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    // Test simple query (SQLite compatible)
    console.log('\n2️⃣ Testing simple query...');
    const result = await prisma.$queryRaw`SELECT datetime('now') as current_time, sqlite_version() as sqlite_version`;
    console.log('✅ Query successful:', result);
    
    // Test if tables exist (SQLite compatible)
    console.log('\n3️⃣ Checking if tables exist...');
    const tables = await prisma.$queryRaw`
      SELECT name as table_name
      FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    `;
    console.log('📋 Existing tables:', tables);
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // Provide helpful suggestions
    console.log('\n💡 Troubleshooting suggestions:');
    console.log('1. Check if Railway PostgreSQL service is running');
    console.log('2. Verify DATABASE_URL in .env file');
    console.log('3. Check Railway dashboard for service status');
    console.log('4. Ensure your Railway account has sufficient credits');
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testDatabaseConnection();
