#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Security Check Before Deployment');
console.log('================================');

// Check for sensitive files that shouldn't be committed
const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'src/config/company-profile-grow-synergy-firebase-adminsdk-fbsvc-ecfa344bdd.json',
    'serviceAccountKey.json',
    'private-key.pem'
];

const gitignorePath = path.join(__dirname, '../.gitignore');
const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';

let issues = [];
let warnings = [];

console.log('\n📋 Checking for sensitive files...');

sensitiveFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        if (gitignoreContent.includes(file) || gitignoreContent.includes(file.replace(/^src\//, ''))) {
            console.log(`✅ ${file} - Properly ignored in .gitignore`);
        } else {
            issues.push(`❌ ${file} - EXISTS but NOT in .gitignore!`);
        }
    } else {
        console.log(`✅ ${file} - Not found (good)`);
    }
});

// Check .env file for default values
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('your_secure_password_here')) {
        warnings.push('⚠️  Default password detected in .env - Please change it!');
    }
    
    if (envContent.includes('your_session_secret_here')) {
        warnings.push('⚠️  Default session secret detected in .env - Please change it!');
    }
    
    if (envContent.includes('GA-XXXXXXXXX')) {
        warnings.push('⚠️  Default Google Analytics ID detected in .env - Please update it!');
    }
}

// Check if Firebase config is still in src
const firebaseConfigInSrc = path.join(__dirname, '../src/config/company-profile-grow-synergy-firebase-adminsdk-fbsvc-ecfa344bdd.json');
if (fs.existsSync(firebaseConfigInSrc)) {
    issues.push('❌ Firebase config still in src/config/ - Move to config/ folder!');
}

console.log('\n📊 Results:');
if (issues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    issues.forEach(issue => console.log(issue));
    console.log('\n❌ Please fix these issues before deploying!');
    process.exit(1);
} else {
    console.log('✅ No critical issues found!');
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(warning));
    console.log('\n💡 Please address these warnings for better security.');
}

console.log('\n🎉 Security check completed!');
console.log('🚀 Your project is ready for secure deployment to GitHub!');
