#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Copying assets to dist folder...');

// Source and destination directories
const srcDir = path.join(__dirname, '../src');
const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

// Create dist directories if they don't exist
const distSrcDir = path.join(distDir, 'src');
const distViewsDir = path.join(distSrcDir, 'views');
const distPublicDir = path.join(distDir, 'public');

// Ensure directories exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(distSrcDir)) {
    fs.mkdirSync(distSrcDir, { recursive: true });
}
if (!fs.existsSync(distViewsDir)) {
    fs.mkdirSync(distViewsDir, { recursive: true });
}
if (!fs.existsSync(distPublicDir)) {
    fs.mkdirSync(distPublicDir, { recursive: true });
}

// Function to copy directory recursively
function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`⚠️  Source directory does not exist: ${src}`);
        return;
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied: ${entry.name}`);
        }
    }
}

// Copy views
console.log('\n📁 Copying views...');
copyDirectory(path.join(srcDir, 'views'), distViewsDir);

// Copy public files
console.log('\n📁 Copying public files...');
copyDirectory(publicDir, distPublicDir);

// Copy config files that might be needed
console.log('\n📁 Copying config files...');
const configSrcDir = path.join(srcDir, 'config');
const configDistDir = path.join(distDir, 'config');

if (fs.existsSync(configSrcDir)) {
    copyDirectory(configSrcDir, configDistDir);
}

console.log('\n✅ Assets copied successfully!');
console.log('🚀 Your application is ready for production deployment!');
