const express = require('express');
const path = require('path');

async function bootstrap() {
  try {
    const server = express();
    
    // Static files
    server.use(express.static(path.join(__dirname, 'public')));
    
    // Health check endpoint
    server.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // Test route
    server.get('/test', (req, res) => {
      res.json({ message: 'Test route working!', env: process.env.NODE_ENV });
    });
    
    // Home route (serve the main website)
    server.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Home alias route
    server.get('/home', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // About route
    server.get('/about', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tentang Kami - GROW SYNERGY INDONESIA</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="/css/custom.css" rel="stylesheet">
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
                    <a href="/about" class="text-gray-700 hover:text-blue-600">About</a>
                    <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded">Admin</a>
                  </div>
                </div>
              </div>
            </nav>
            
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <h1 class="text-4xl font-bold text-gray-900 mb-8">Tentang Kami</h1>
              <div class="bg-white rounded-lg shadow p-8">
                <p class="text-lg text-gray-700 mb-4">
                  GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik terkemuka di Indonesia.
                </p>
                <p class="text-gray-600 mb-4">
                  Kami berkomitmen untuk mengembangkan talenta digital Indonesia melalui program pelatihan yang komprehensif dan relevan dengan kebutuhan industri.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">500+</div>
                    <div class="text-gray-600">Peserta</div>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">50+</div>
                    <div class="text-gray-600">Program</div>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">95%</div>
                    <div class="text-gray-600">Kepuasan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    });
    
    // Admin login route
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
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="admin@grow-synergy.com">
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="Mieayam1">
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
    
    // Debug route
    server.get('/debug', (req, res) => {
      res.json({
        message: 'Debug info',
        env: process.env.NODE_ENV,
        port: process.env.PORT,
        site_url: process.env.SITE_URL,
        firebase_project: process.env.FIREBASE_PROJECT_ID,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('Starting server with website routes...');
    
    // Start server
    const port = process.env.PORT || 3001;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Website: http://localhost:${port}/`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`Debug info: http://localhost:${port}/debug`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
