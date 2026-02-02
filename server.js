const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const path = require('path');

async function bootstrap() {
  const server = express();
  
  // Serve static files
  server.use('/css', express.static(path.join(__dirname, 'public', 'css')));
  server.use('/js', express.static(path.join(__dirname, 'public', 'js')));
  server.use('/images', express.static(path.join(__dirname, 'public', 'images')));
  server.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
  
  // Health check endpoint
  server.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // Test route
  server.get('/test', (req, res) => {
    res.json({ message: 'Test route working!', env: process.env.NODE_ENV });
  });
  
  // Favicon route
  server.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(__dirname, 'public', 'images', 'logo_pt.png');
    res.sendFile(faviconPath, (err) => {
      if (err) {
        res.status(404).send('Favicon not found');
      }
    });
  });
  
  try {
    console.log('🚀 Starting NestJS application...');
    console.log('📋 Environment check:');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
    console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
    console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');
    
    // Import and create NestJS app
    const { AppModule } = require('./dist/app.module');
    const adapter = new ExpressAdapter(server);
    
    const app = await NestFactory.create(AppModule, adapter);
    
    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    // Set global prefix
    app.setGlobalPrefix('');
    
    console.log('📦 NestJS app created, initializing...');
    
    await app.init();
    
    console.log('✅ NestJS initialized successfully!');
    
  } catch (error) {
    console.error('❌ NestJS initialization failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    console.log('🔄 Falling back to Express-only mode...');
    
    // Fallback routes if NestJS fails
    server.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>GROW SYNERGY INDONESIA</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="min-h-screen bg-blue-50 flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-4xl font-bold text-blue-600 mb-4">GROW SYNERGY INDONESIA</h1>
              <p class="text-gray-600 mb-8">Platform Pelatihan Data Analitik Terbaik di Indonesia</p>
              <div class="space-y-4">
                <a href="/about" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Tentang Kami</a>
                <a href="/synergy-academy" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Synergy Academy</a>
                <a href="/synergy-experts" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Synergy Experts</a>
                <a href="/synergy-portfolio" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Synergy Portfolio</a>
                <a href="/admin/login" class="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Admin Login</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    });
    
    server.get('/about', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tentang Kami - GROW SYNERGY INDONESIA</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="min-h-screen bg-gray-50">
            <nav class="bg-white shadow">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                  <div class="flex items-center">
                    <h1 class="text-xl font-bold text-blue-600">GROW SYNERGY</h1>
                  </div>
                  <div class="flex items-center space-x-4">
                    <a href="/" class="text-gray-700 hover:text-blue-600">Home</a>
                    <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded">Admin</a>
                  </div>
                </div>
              </div>
            </nav>
            <div class="max-w-7xl mx-auto px-4 py-12">
              <h1 class="text-3xl font-bold mb-6">Tentang Kami</h1>
              <p class="text-gray-600">GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik terbaik di Indonesia.</p>
              <a href="/" class="text-blue-600 hover:underline">← Kembali ke Home</a>
            </div>
          </div>
        </body>
        </html>
      `);
    });
    
    server.get('/admin/login', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admin Login - GROW SYNERGY</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold text-center mb-6">Admin Login</h2>
            <form>
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@grow-synergy.com" required>
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter password" required>
              </div>
              <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Login</button>
            </form>
            <div class="mt-4 text-center">
              <a href="/" class="text-blue-600 hover:underline">Back to Home</a>
            </div>
          </div>
        </body>
        </html>
      `);
    });
  }
  
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
