const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server working!', 
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'public', 'images', 'logo_pt.png');
  res.sendFile(faviconPath, (err) => {
    if (err) res.status(404).send('Favicon not found');
  });
});

// Home route - serve static HTML
app.get('/', (req, res) => {
  console.log('🏠 Serving home page...');
  // Serve the actual index.html file directly
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GROW SYNERGY INDONESIA</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" type="image/x-icon" href="/images/logo_pt.png">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body class="bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-blue-600">GROW SYNERGY</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a href="/" class="text-gray-700 hover:text-blue-600">Home</a>
              <a href="/about" class="text-gray-700 hover:text-blue-600">Tentang</a>
              <a href="/synergy-academy" class="text-gray-700 hover:text-blue-600">Academy</a>
              <a href="/synergy-experts" class="text-gray-700 hover:text-blue-600">Experts</a>
              <a href="/synergy-portfolio" class="text-gray-700 hover:text-blue-600">Portfolio</a>
              <a href="/blog" class="text-gray-700 hover:text-blue-600">Blog</a>
              <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded">Admin</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-gradient text-white py-20 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              Platform Pelatihan Data Analitik Terbaik di Indonesia
            </h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90">
              Kursus Online Bersertifikat BNSP | GROW SYNERGY INDONESIA
            </p>
            <div class="space-y-4">
              <a href="/synergy-academy" class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Mulai Belajar Sekarang
              </a>
              <div class="text-sm opacity-75">
                🎯 1000+ Alumni Berkarir di Top Companies
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-center mb-12">Mengapa Memilih Kami?</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow card-hover">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold">🎓</span>
              </div>
              <h3 class="text-xl font-semibold mb-2">Kurikulum Terstandar</h3>
              <p class="text-gray-600">Materi pembelajaran disusun oleh praktisi industri dengan standar BNSP</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow card-hover">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold">👨‍🏫</span>
              </div>
              <h3 class="text-xl font-semibold mb-2">Mentor Berpengalaman</h3>
              <p class="text-gray-600">Dibimbing oleh expert dengan 10+ tahun pengalaman di data analytics</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow card-hover">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold">💼</span>
              </div>
              <h3 class="text-xl font-semibold mb-2">Garansi Karir</h3>
              <p class="text-gray-600">Dukungan karir hingga Anda mendapatkan pekerjaan impian</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Programs Section -->
      <section class="py-16 bg-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-center mb-12">Program Unggulan</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow card-hover">
              <h3 class="text-xl font-semibold mb-2">Data Analyst Fundamentals</h3>
              <p class="text-gray-600 mb-4">Dasar-dasar analisis data dengan tools modern</p>
              <div class="flex justify-between items-center">
                <span class="text-blue-600 font-semibold">3 bulan</span>
                <a href="/synergy-academy" class="text-blue-600 hover:underline">Detail →</a>
              </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow card-hover">
              <h3 class="text-xl font-semibold mb-2">Advanced SQL & Visualization</h3>
              <p class="text-gray-600 mb-4">Query kompleks dan visualisasi data yang efektif</p>
              <div class="flex justify-between items-center">
                <span class="text-blue-600 font-semibold">2 bulan</span>
                <a href="/synergy-academy" class="text-blue-600 hover:underline">Detail →</a>
              </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow card-hover">
              <h3 class="text-xl font-semibold mb-2">Machine Learning Basics</h3>
              <p class="text-gray-600 mb-4">Pengenalan machine learning dan implementasi</p>
              <div class="flex justify-between items-center">
                <span class="text-blue-600 font-semibold">4 bulan</span>
                <a href="/synergy-academy" class="text-blue-600 hover:underline">Detail →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-blue-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold mb-4">Siap Transformasi Karir Anda?</h2>
          <p class="text-xl mb-8 opacity-90">Bergabung dengan 1000+ alumni yang telah sukses</p>
          <div class="space-x-4">
            <a href="/synergy-academy" class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Daftar Sekarang
            </a>
            <a href="/admin/login" class="inline-block border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Login Admin
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-4 gap-8">
            <div>
              <h3 class="text-lg font-semibold mb-4">GROW SYNERGY</h3>
              <p class="text-gray-400">Platform pembelajaran data analitik terbaik di Indonesia</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Program</h3>
              <ul class="space-y-2 text-gray-400">
                <li><a href="/synergy-academy" class="hover:text-white">Academy</a></li>
                <li><a href="/synergy-experts" class="hover:text-white">Experts</a></li>
                <li><a href="/synergy-portfolio" class="hover:text-white">Portfolio</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Resources</h3>
              <ul class="space-y-2 text-gray-400">
                <li><a href="/blog" class="hover:text-white">Blog</a></li>
                <li><a href="/about" class="hover:text-white">About</a></li>
                <li><a href="/admin/login" class="hover:text-white">Admin</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Contact</h3>
              <ul class="space-y-2 text-gray-400">
                <li>📧 info@grow-synergy.com</li>
                <li>📱 +62 812-3456-7890</li>
                <li>📍 Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2024 GROW SYNERGY INDONESIA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `);
});

// Home route alias
app.get('/home', (req, res) => {
  console.log('🏠 Serving home page (alias)...');
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.redirect('/');
    }
  });
});

// About route
app.get('/about', (req, res) => {
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
          <p class="text-gray-600">GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik terbaik di Indonesia dengan kurikulum terstandar dan mentor berpengalaman.</p>
          <div class="mt-8">
            <h2 class="text-2xl font-semibold mb-4">Visi & Misi</h2>
            <p class="text-gray-600">Menjadi platform pembelajaran data analitik terdepan di Indonesia yang menghasilkan talenta siap kerja.</p>
          </div>
          <a href="/" class="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Synergy Academy route
app.get('/synergy-academy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Synergy Academy - GROW SYNERGY INDONESIA</title>
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
          <h1 class="text-3xl font-bold mb-6">Synergy Academy</h1>
          <p class="text-gray-600">Platform pembelajaran data analitik dengan kurikulum terbaik dan mentor profesional.</p>
          <div class="mt-8 grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Data Analyst Fundamentals</h3>
              <p class="text-gray-600">Dasar-dasar analisis data dengan tools modern</p>
              <span class="text-blue-600 font-semibold">3 bulan</span>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Advanced SQL & Visualization</h3>
              <p class="text-gray-600">Query kompleks dan visualisasi data yang efektif</p>
              <span class="text-blue-600 font-semibold">2 bulan</span>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Machine Learning Basics</h3>
              <p class="text-gray-600">Pengenalan machine learning dan implementasi</p>
              <span class="text-blue-600 font-semibold">4 bulan</span>
            </div>
          </div>
          <a href="/" class="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Synergy Experts route
app.get('/synergy-experts', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Synergy Experts - GROW SYNERGY INDONESIA</title>
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
          <h1 class="text-3xl font-bold mb-6">Synergy Experts</h1>
          <p class="text-gray-600">Tim ahli data analitik dengan pengalaman profesional di berbagai industri.</p>
          <div class="mt-8 grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold text-xl">AW</span>
              </div>
              <h3 class="text-xl font-semibold mb-2">Dr. Ahmad Wijaya</h3>
              <p class="text-gray-600">Data Science Expert</p>
              <p class="text-sm text-gray-500 mt-2">10+ tahun pengalaman</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold text-xl">SP</span>
              </div>
              <h3 class="text-xl font-semibold mb-2">Sarah Putri</h3>
              <p class="text-gray-600">Business Intelligence Specialist</p>
              <p class="text-sm text-gray-500 mt-2">8+ tahun pengalaman</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-blue-600 font-bold text-xl">BS</span>
              </div>
              <h3 class="text-xl font-semibold mb-2">Budi Santoso</h3>
              <p class="text-gray-600">Machine Learning Engineer</p>
              <p class="text-sm text-gray-500 mt-2">7+ tahun pengalaman</p>
            </div>
          </div>
          <a href="/" class="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Synergy Portfolio route
app.get('/synergy-portfolio', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Synergy Portfolio - GROW SYNERGY INDONESIA</title>
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
          <h1 class="text-3xl font-bold mb-6">Synergy Portfolio</h1>
          <p class="text-gray-600">Koleksi proyek dan studi kasus data analitik yang telah kami kerjakan.</p>
          <div class="mt-8 grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Retail Analytics Dashboard</h3>
              <p class="text-gray-600">Dashboard real-time untuk monitoring sales dan inventory</p>
              <div class="mt-4">
                <span class="text-sm text-gray-500">Client:</span>
                <span class="text-sm font-semibold">PT. Retail Maju</span>
              </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Sales Prediction Model</h3>
              <p class="text-gray-600">Machine learning model untuk forecasting sales</p>
              <div class="mt-4">
                <span class="text-sm text-gray-500">Client:</span>
                <span class="text-sm font-semibold">PT. Sales Global</span>
              </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Customer Segmentation</h3>
              <p class="text-gray-600">Analisis clustering untuk customer behavior</p>
              <div class="mt-4">
                <span class="text-sm text-gray-500">Client:</span>
                <span class="text-sm font-semibold">PT. Customer First</span>
              </div>
            </div>
          </div>
          <a href="/" class="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Blog route
app.get('/blog', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blog - GROW SYNERGY INDONESIA</title>
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
          <h1 class="text-3xl font-bold mb-6">Blog</h1>
          <p class="text-gray-600">Artikel dan insights tentang data analitik, machine learning, dan teknologi.</p>
          <div class="mt-8 space-y-6">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Tren Data Analitik 2024</h3>
              <p class="text-gray-600">Pelajari tren terbaru dalam dunia data analitik dan bagaimana memanfaatkannya untuk bisnis Anda.</p>
              <div class="mt-4 text-sm text-gray-500">15 Januari 2024</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Machine Learning untuk Pemula</h3>
              <p class="text-gray-600">Panduan lengkap memulai journey machine learning dari nol hingga mahir.</p>
              <div class="mt-4 text-sm text-gray-500">10 Januari 2024</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-2">Tips Menjadi Data Analyst Sukses</h3>
              <p class="text-gray-600">Kunci sukses dan skills yang dibutuhkan untuk karir sebagai data analyst.</p>
              <div class="mt-4 text-sm text-gray-500">5 Januari 2024</div>
            </div>
          </div>
          <a href="/" class="text-blue-600 hover:underline mt-8 inline-block">← Kembali ke Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Admin login
app.get('/admin/login', (req, res) => {
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Website: http://localhost:${PORT}/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});
