const fs = require('fs');
const path = require('path');

// Database configuration switcher
function switchDatabase(target) {
  const envPath = path.join(__dirname, '.env');
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  
  console.log(`🔄 Switching to ${target.toUpperCase()} database...\n`);

  try {
    // Read current files
    let envContent = fs.readFileSync(envPath, 'utf8');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');

    if (target === 'railway') {
      // Switch to Railway PostgreSQL
      console.log('📡 Configuring for Railway PostgreSQL...');
      
      // Update .env
      envContent = envContent.replace(
        /DATABASE_URL="file:\.\/dev\.db"/,
        'DATABASE_URL="postgresql://postgres:mifbcOrvwdTcbuzaQcWwezjkiiORPipD@junction.proxy.rlwy.net:47292/railway"'
      );
      
      // Update schema.prisma
      schemaContent = schemaContent.replace(
        /provider = "sqlite"/,
        'provider = "postgresql"'
      );
      
      // Add back PostgreSQL-specific features
      schemaContent = schemaContent.replace(
        /huntDate       DateTime  @map\("hunt_date"\)/,
        'huntDate       DateTime  @map("hunt_date") @db.Date'
      );
      
      console.log('✅ Configured for Railway PostgreSQL');
      console.log('⚠️  Remember to run: npm run db:generate && npm run db:push');
      
    } else if (target === 'sqlite') {
      // Switch to SQLite
      console.log('💾 Configuring for SQLite...');
      
      // Update .env
      envContent = envContent.replace(
        /DATABASE_URL="postgresql:\/\/.*"/,
        'DATABASE_URL="file:./dev.db"'
      );
      
      // Update schema.prisma
      schemaContent = schemaContent.replace(
        /provider = "postgresql"/,
        'provider = "sqlite"'
      );
      
      // Remove PostgreSQL-specific features
      schemaContent = schemaContent.replace(
        /huntDate       DateTime  @map\("hunt_date"\) @db\.Date/,
        'huntDate       DateTime  @map("hunt_date")'
      );
      
      console.log('✅ Configured for SQLite');
      console.log('⚠️  Remember to run: npm run db:generate && npm run db:push');
      
    } else {
      console.log('❌ Invalid target. Use "railway" or "sqlite"');
      return;
    }

    // Write updated files
    fs.writeFileSync(envPath, envContent);
    fs.writeFileSync(schemaPath, schemaContent);
    
    console.log('\n🎉 Database configuration updated!');
    console.log('\n📋 Next steps:');
    console.log('1. npm run db:generate');
    console.log('2. npm run db:push');
    console.log('3. npm run dev (restart server)');
    
  } catch (error) {
    console.error('❌ Error switching database:', error.message);
  }
}

// Get command line argument
const target = process.argv[2];

if (!target) {
  console.log('🔧 Database Switcher');
  console.log('===================');
  console.log('Usage: node switch-database.js [railway|sqlite]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-database.js railway  # Switch to Railway PostgreSQL');
  console.log('  node switch-database.js sqlite   # Switch to SQLite');
} else {
  switchDatabase(target);
}
