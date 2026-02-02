#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Firestore Rules Deployment Script');
console.log('==========================================');

// Check if firebase-tools is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI found');
} catch (error) {
  console.log('❌ Firebase CLI not found. Installing...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('✅ Firebase CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Firebase CLI. Please install manually:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }
}

// Check if firestore.rules exists
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ firestore.rules file not found at:', rulesPath);
  process.exit(1);
}

console.log('✅ Firestore rules file found');

// Check if firebase.json exists
const firebaseJsonPath = path.join(__dirname, '..', 'firebase.json');
if (!fs.existsSync(firebaseJsonPath)) {
  console.log('📝 Creating firebase.json configuration...');
  
  const firebaseConfig = {
    firestore: {
      rules: 'firestore.rules'
    },
    hosting: {
      public: 'public',
      ignore: [
        'firebase.json',
        '**/.*',
        '**/node_modules/**'
      ]
    }
  };
  
  fs.writeFileSync(firebaseJsonPath, JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ firebase.json created');
} else {
  console.log('✅ firebase.json found');
}

console.log('\n📋 Deployment Instructions:');
console.log('==========================');
console.log('1. Make sure you are logged in to Firebase:');
console.log('   firebase login');
console.log('\n2. Set your Firebase project:');
console.log('   firebase use grow-synergy-indonesia');
console.log('\n3. Deploy Firestore rules:');
console.log('   firebase deploy --only firestore:rules');
console.log('\n4. Verify deployment:');
console.log('   firebase firestore:rules:list');
console.log('\n🔗 Additional Resources:');
console.log('- Firebase Console: https://console.firebase.google.com/project/grow-synergy-indonesia/firestore');
console.log('- Firestore API: https://console.cloud.google.com/apis/library/firestore.googleapis.com');
console.log('\n⚠️  Troubleshooting:');
console.log('- If you get permission errors, ensure Firestore API is enabled');
console.log('- Check that the project ID matches your Firebase project');
console.log('- Verify your API key has the correct permissions');

// Optional: Auto-deploy if user agrees
const args = process.argv.slice(2);
if (args.includes('--deploy')) {
  console.log('\n🚀 Starting deployment...');
  try {
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Firestore rules deployed successfully!');
  } catch (deployError) {
    console.error('❌ Deployment failed. Please run the commands manually.');
  }
}
