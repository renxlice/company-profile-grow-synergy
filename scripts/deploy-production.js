#!/usr/bin/env node

// Production deployment script for Hostinger
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...\n');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  // 1. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --production', { stdio: 'inherit' });
  
  // 2. Build assets if needed
  console.log('🔨 Building assets...');
  if (fs.existsSync('scripts/build-assets.js')) {
    execSync('node scripts/build-assets.js', { stdio: 'inherit' });
  }
  
  // 3. Create production environment file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating template...');
    const envTemplate = `# Production Environment Variables
NODE_ENV=production
PORT=3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour-Private-Key\\n-----END PRIVATE KEY-----\\n"

# Google Analytics
GOOGLE_ANALYTICS_ID=your-ga-id

# Site Configuration
SITE_URL=https://yourdomain.com
SITE_NAME=GROW SYNERGY INDONESIA
`;
    fs.writeFileSync(envPath, envTemplate);
    console.log('📝 .env template created. Please update with your actual values.');
  }
  
  // 4. Ensure uploads directories exist
  const uploadDirs = ['uploads', 'public/uploads'];
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // 5. Set file permissions for Hostinger
  console.log('🔒 Setting file permissions...');
  execSync('chmod -R 755 public/ uploads/', { stdio: 'inherit' });
  
  console.log('\n✅ Production setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update .env file with your actual configuration');
  console.log('2. Upload files to Hostinger');
  console.log('3. Run: npm run start:prod:silent');
  console.log('\n🌐 Your app will be available at: http://localhost:3000');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
