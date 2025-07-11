const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Railway PostgreSQL connection helper
async function setupRailwayDatabase() {
  console.log('🚂 Railway PostgreSQL Setup & Diagnostics');
  console.log('==========================================\n');

  // Check environment variables
  console.log('1️⃣ Checking Environment Variables:');
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL not found in .env file');
    return false;
  }
  
  // Parse DATABASE_URL to show connection details (hide password)
  try {
    const url = new URL(dbUrl);
    console.log('✅ DATABASE_URL found:');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   User: ${url.username}`);
    console.log(`   Password: ${'*'.repeat(8)}\n`);
  } catch (error) {
    console.log('❌ Invalid DATABASE_URL format');
    return false;
  }

  // Test connection
  console.log('2️⃣ Testing Railway Connection:');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('   Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connected to Railway PostgreSQL successfully!\n');

    // Test database operations
    console.log('3️⃣ Testing Database Operations:');
    
    // Check PostgreSQL version
    const version = await prisma.$queryRaw`SELECT version() as version`;
    console.log('✅ PostgreSQL Version:', version[0].version.split(' ')[0] + ' ' + version[0].version.split(' ')[1]);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tables found:', tables.length);
    tables.forEach(table => console.log(`   - ${table.table_name}`));

    console.log('\n🎉 Railway PostgreSQL is working perfectly!');
    return true;

  } catch (error) {
    console.log('❌ Railway connection failed:');
    console.log('   Error:', error.message);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Troubleshooting Steps:');
      console.log('1. Check Railway dashboard - PostgreSQL service might be paused');
      console.log('2. Verify your Railway account has sufficient credits');
      console.log('3. Check if you need to upgrade from Trial to Hobby plan');
      console.log('4. Get fresh DATABASE_URL from Railway Variables tab');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication Issue:');
      console.log('1. Get fresh DATABASE_URL from Railway dashboard');
      console.log('2. Check Variables tab in your PostgreSQL service');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Network Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Try again in a few minutes');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Railway service management helper
function showRailwayInstructions() {
  console.log('\n📋 Railway Setup Instructions:');
  console.log('================================');
  console.log('1. Go to: https://railway.com/dashboard');
  console.log('2. Find your Silver Edge project');
  console.log('3. Check PostgreSQL service status');
  console.log('4. If paused, click "Resume" or "Restart"');
  console.log('5. Go to Variables tab and copy DATABASE_URL');
  console.log('6. Update your .env file with new DATABASE_URL');
  console.log('7. Run this script again to test\n');
  
  console.log('💰 Billing Check:');
  console.log('- Free Trial: $5 credits (30 days)');
  console.log('- Hobby Plan: $5/month minimum');
  console.log('- Check Account -> Billing for credit balance');
  console.log('- Add payment method if needed\n');
}

// Main execution
async function main() {
  const success = await setupRailwayDatabase();
  
  if (!success) {
    showRailwayInstructions();
  }
}

main().catch(console.error);
