#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read Firebase service account file
const firebaseConfigPath = path.join(__dirname, '../config/firebase-service-account.json');

if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    
    // Generate .env file content
    const envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Admin Credentials (replace with your actual credentials)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# Firebase Configuration (auto-generated from service account)
FIREBASE_TYPE=${firebaseConfig.type}
FIREBASE_PROJECT_ID=${firebaseConfig.project_id}
FIREBASE_PRIVATE_KEY_ID=${firebaseConfig.private_key_id}
FIREBASE_PRIVATE_KEY="${firebaseConfig.private_key}"
FIREBASE_CLIENT_EMAIL=${firebaseConfig.client_email}
FIREBASE_CLIENT_ID=${firebaseConfig.client_id}
FIREBASE_AUTH_URI=${firebaseConfig.auth_uri}
FIREBASE_TOKEN_URI=${firebaseConfig.token_uri}
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${firebaseConfig.auth_provider_x509_cert_url}
FIREBASE_CLIENT_X509_CERT_URL=${firebaseConfig.client_x509_cert_url}
FIREBASE_DATABASE_URL=https://${firebaseConfig.project_id}-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=${firebaseConfig.project_id}.appspot.com

# Google Analytics (optional)
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Site Configuration
SITE_URL=https://localhost:3001
SITE_NAME=GROW SYNERGY INDONESIA

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;

    // Write to .env file
    const envPath = path.join(__dirname, '../.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file created successfully!');
    console.log('📝 Please update the following values in .env:');
    console.log('   - ADMIN_PASSWORD: Set a secure password');
    console.log('   - SESSION_SECRET: Set a random secret');
    console.log('   - EMAIL_USER and EMAIL_PASS: Configure email (optional)');
    console.log('   - SITE_URL: Update with your actual domain');
    console.log('');
    console.log('🔒 Firebase configuration has been secured!');
    console.log('📁 Firebase service account moved to: config/firebase-service-account.json');
    console.log('🚀 Your project is now ready for secure deployment!');
    
} else {
    console.log('❌ Firebase service account file not found!');
    console.log('📁 Please place your Firebase service account file at: config/firebase-service-account.json');
    console.log('🔗 Download from: Firebase Console > Project Settings > Service Accounts');
}
