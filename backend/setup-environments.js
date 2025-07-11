const fs = require('fs');
const path = require('path');

// Environment setup helper
function setupEnvironment(env) {
  console.log(`🔧 Setting up ${env.toUpperCase()} environment...\n`);

  const envFile = path.join(__dirname, `.env.${env}`);
  const targetEnvFile = path.join(__dirname, '.env');

  try {
    // Check if environment file exists
    if (!fs.existsSync(envFile)) {
      console.log(`❌ Environment file .env.${env} not found`);
      console.log(`📋 Available environments:`);
      
      const envFiles = fs.readdirSync(__dirname)
        .filter(file => file.startsWith('.env.') && file !== '.env.example')
        .map(file => file.replace('.env.', ''));
      
      envFiles.forEach(e => console.log(`   - ${e}`));
      return;
    }

    // Copy environment file to .env
    const envContent = fs.readFileSync(envFile, 'utf8');
    fs.writeFileSync(targetEnvFile, envContent);

    console.log(`✅ Switched to ${env.toUpperCase()} environment`);
    console.log(`📁 Copied .env.${env} → .env`);

    // Show current configuration
    console.log(`\n📋 Current Configuration:`);
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          // Hide sensitive values
          const hiddenKeys = ['PASSWORD', 'SECRET', 'DATABASE_URL'];
          const shouldHide = hiddenKeys.some(k => key.includes(k));
          const displayValue = shouldHide ? '***HIDDEN***' : value.replace(/"/g, '');
          console.log(`   ${key}: ${displayValue}`);
        }
      }
    });

    // Environment-specific instructions
    if (env === 'development') {
      console.log(`\n🚀 Development Environment Ready!`);
      console.log(`📋 Next steps:`);
      console.log(`1. npm run dev (start development server)`);
      console.log(`2. Test API at http://localhost:3000/health`);
    } else if (env === 'production') {
      console.log(`\n🏭 Production Environment Setup`);
      console.log(`⚠️  IMPORTANT: Update production values before deploying!`);
      console.log(`📋 Required updates:`);
      console.log(`1. Set production DATABASE_URL from Railway`);
      console.log(`2. Generate secure JWT_SECRET`);
      console.log(`3. Set production FRONTEND_URL`);
      console.log(`4. Update CORS_ORIGIN for your domain`);
    }

  } catch (error) {
    console.error(`❌ Error setting up environment:`, error.message);
  }
}

// Railway environment helper
function showRailwayInstructions() {
  console.log(`\n🚂 Railway Environment Setup Guide`);
  console.log(`=====================================`);
  console.log(`\n📋 Current Status:`);
  console.log(`✅ Development: Connected to Railway dev environment`);
  console.log(`❓ Production: Not set up yet`);
  
  console.log(`\n🏗️  Setting up Production Environment:`);
  console.log(`1. Go to Railway Dashboard: https://railway.com/dashboard`);
  console.log(`2. Open your Silver Edge project`);
  console.log(`3. Click "New Environment"`);
  console.log(`4. Name it "production"`);
  console.log(`5. Add PostgreSQL service to production environment`);
  console.log(`6. Copy production DATABASE_URL`);
  console.log(`7. Update .env.production file`);
  console.log(`8. Run: node setup-environments.js production`);

  console.log(`\n💡 Benefits of Separate Environments:`);
  console.log(`• Safe testing without affecting production data`);
  console.log(`• Different security settings per environment`);
  console.log(`• Isolated user data and testing`);
  console.log(`• Professional deployment practices`);
}

// Main execution
const env = process.argv[2];

if (!env) {
  console.log(`🔧 Environment Setup Tool`);
  console.log(`========================`);
  console.log(`Usage: node setup-environments.js [environment]`);
  console.log(`\nExamples:`);
  console.log(`  node setup-environments.js development`);
  console.log(`  node setup-environments.js production`);
  console.log(`\nOr get Railway setup instructions:`);
  console.log(`  node setup-environments.js railway`);
} else if (env === 'railway') {
  showRailwayInstructions();
} else {
  setupEnvironment(env);
}
