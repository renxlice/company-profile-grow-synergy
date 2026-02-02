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
    
    // Debug route to check file system
    server.get('/debug-files', (req, res) => {
      const fs = require('fs');
      const publicPath = path.join(__dirname, 'public');
      const indexPath = path.join(__dirname, 'public', 'index.html');
      
      let debugInfo = {
        currentDir: __dirname,
        publicPath: publicPath,
        indexPath: indexPath,
        publicExists: false,
        indexExists: false,
        publicContents: [],
        indexContent: null
      };
      
      try {
        debugInfo.publicExists = fs.existsSync(publicPath);
        debugInfo.indexExists = fs.existsSync(indexPath);
        
        if (debugInfo.publicExists) {
          debugInfo.publicContents = fs.readdirSync(publicPath);
        }
        
        if (debugInfo.indexExists) {
          debugInfo.indexContent = fs.readFileSync(indexPath, 'utf8').substring(0, 500);
        }
      } catch (error) {
        debugInfo.error = error.message;
      }
      
      res.json(debugInfo);
    });
    
    // Serve actual homepage content (not iframe wrapper)
    function serveIndexHtml(req, res) {
      console.log('Serving actual homepage content...');
      
      // Serve the real homepage content, not the iframe wrapper
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pelatihan Data Analitik Terbaik di Indonesia #1 | Kursus Online Bersertifikat BNSP | GROW SYNERGY INDONESIA</title>
            <meta name="description" content="Pelatihan data analitik profesional dengan instruktur berpengalaman 10+ tahun. Dapatkan sertifikat BNSP dan karir impian Anda. Daftar sekarang!">
            <meta name="keywords" content="pelatihan data analitik, kursus data analytics, training data science, belajar data analitik indonesia, data analyst course indonesia, pelatihan data analitik terbaik, kursus data analitik online, sertifikat data analitik">
            <meta name="author" content="GROW SYNERGY INDONESIA">
            <meta name="robots" content="index, follow">
            
            <!-- Open Graph Meta Tags -->
            <meta property="og:title" content="Pelatihan Data Analitik Terbaik di Indonesia #1 | GROW SYNERGY">
            <meta property="og:description" content="Platform pembelajaran data analitik #1 dengan instruktur profesional dan sertifikat BNSP bersertifikat">
            <meta property="og:image" content="/images/hero-background.jpg">
            <meta property="og:url" content="https://growsynergyid.com">
            <meta property="og:type" content="website">
            <meta property="og:site_name" content="GROW SYNERGY INDONESIA">
            
            <!-- Twitter Card Meta Tags -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="Pelatihan Data Analitik Terbaik di Indonesia #1">
            <meta name="twitter:description" content="Platform pembelajaran data analitik #1 dengan instruktur profesional dan sertifikat BNSP">
            <meta name="twitter:image" content="/images/hero-background.jpg">
            
            <!-- Canonical URL -->
            <link rel="canonical" href="https://growsynergyid.com">
            
            <!-- Favicon -->
            <link rel="icon" type="image/x-icon" href="/images/logo_pt.png">
            <link rel="shortcut icon" type="image/x-icon" href="/images/logo_pt.png">
            
            <!-- CSS -->
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="/css/custom.css" rel="stylesheet">
            <style>
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                }
                
                body {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                
                .hero-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .text-shadow {
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                
                .card-hover {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                
                .btn-primary {
                    background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                    transition: all 0.3s ease;
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
                }
            </style>
        </head>
        <body>
            <!-- Navigation -->
            <nav class="bg-white shadow-lg fixed w-full z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <img src="/images/logo_pt.png" alt="GROW SYNERGY" class="h-8 w-auto mr-3">
                            <span class="text-xl font-bold text-gray-800">GROW SYNERGY INDONESIA</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="/about" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Tentang Kami</a>
                            <a href="/synergy-experts" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Expert</a>
                            <a href="/synergy-academy" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Academy</a>
                            <a href="/synergy-portfolio" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Portfolio</a>
                            <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Admin</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="hero-gradient text-white py-20 mt-16">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6 text-shadow">
                            Pelatihan Data Analitik Terbaik di Indonesia
                        </h1>
                        <p class="text-xl md:text-2xl mb-8 text-shadow">
                            Dapatkan sertifikat BNSP dan wujudkan karir impian Anda
                        </p>
                        <div class="space-x-4">
                            <a href="/synergy-academy" class="btn-primary text-white px-8 py-3 rounded-full text-lg font-semibold inline-block">
                                Mulai Belajar
                            </a>
                            <a href="/about" class="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold inline-block hover:bg-gray-100">
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="py-20 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Mengapa Memilih GROW SYNERGY?
                        </h2>
                        <p class="text-xl text-gray-600">
                            Platform pembelajaran terbaik untuk mengembangkan karir data analitik Anda
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg">
                            <div class="text-blue-600 text-4xl mb-4">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-4">Instruktur Profesional</h3>
                            <p class="text-gray-600">Belajar dari expert dengan pengalaman 10+ tahun di industri data analitik</p>
                        </div>
                        
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg">
                            <div class="text-blue-600 text-4xl mb-4">
                                <i class="fas fa-certificate"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-4">Sertifikat BNSP</h3>
                            <p class="text-gray-600">Dapatkan sertifikat yang diakui secara nasional dan internasional</p>
                        </div>
                        
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg">
                            <div class="text-blue-600 text-4xl mb-4">
                                <i class="fas fa-laptop-code"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-4">Praktik Langsung</h3>
                            <p class="text-gray-600">Project-based learning dengan kasus real-world dari industri</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 bg-blue-600 text-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">
                        Siap Memulai Karir di Data Analitik?
                    </h2>
                    <p class="text-xl mb-8">
                        Bergabung dengan 500+ alumni yang sudah sukses karirnya
                    </p>
                    <a href="/synergy-academy" class="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold inline-block hover:bg-gray-100">
                        Daftar Sekarang
                    </a>
                </div>
            </section>

            <!-- Footer -->
            <footer class="bg-gray-900 text-white py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div class="flex items-center mb-4">
                                <img src="/images/logo_pt.png" alt="GROW SYNERGY" class="h-8 w-auto mr-3">
                                <span class="text-xl font-bold">GROW SYNERGY</span>
                            </div>
                            <p class="text-gray-400">
                                Platform pembelajaran data analitik terbaik di Indonesia
                            </p>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Program</h4>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="/synergy-academy" class="hover:text-white">Data Analytics</a></li>
                                <li><a href="/synergy-academy" class="hover:text-white">Data Science</a></li>
                                <li><a href="/synergy-academy" class="hover:text-white">Machine Learning</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Perusahaan</h4>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="/about" class="hover:text-white">Tentang Kami</a></li>
                                <li><a href="/synergy-experts" class="hover:text-white">Tim Expert</a></li>
                                <li><a href="/synergy-portfolio" class="hover:text-white">Portfolio</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Kontak</h4>
                            <ul class="space-y-2 text-gray-400">
                                <li><i class="fas fa-envelope mr-2"></i>info@grow-synergy.com</li>
                                <li><i class="fas fa-phone mr-2"></i>+62 812-3456-7890</li>
                                <li><i class="fas fa-map-marker-alt mr-2"></i>Tangerang Selatan</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 GROW SYNERGY INDONESIA. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </body>
        </html>
      `);
    }
    
    // Home route (serve the main website)
    server.get('/', serveIndexHtml);
    
    // Home alias route
    server.get('/home', serveIndexHtml);
    
    // Synergy Academy route
    server.get('/synergy-academy', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Synergy Academy - Program Pelatihan | GROW SYNERGY INDONESIA</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="/css/custom.css" rel="stylesheet">
            <style>
                .hero-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card-hover {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <!-- Navigation -->
            <nav class="bg-white shadow-lg fixed w-full z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <img src="/images/logo_pt.png" alt="GROW SYNERGY" class="h-8 w-auto mr-3">
                            <span class="text-xl font-bold text-gray-800">GROW SYNERGY INDONESIA</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                            <a href="/about" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Tentang Kami</a>
                            <a href="/synergy-experts" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Expert</a>
                            <a href="/synergy-academy" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Academy</a>
                            <a href="/synergy-portfolio" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Portfolio</a>
                            <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Admin</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="hero-gradient text-white py-20 mt-16">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6">
                            Synergy Academy
                        </h1>
                        <p class="text-xl md:text-2xl mb-8">
                            Program Pelatihan Data Analitik Komprehensif
                        </p>
                        <p class="text-lg mb-8">
                            Tingkatkan karir Anda dengan kurikulum terbaru dan instruktur berpengalaman
                        </p>
                    </div>
                </div>
            </section>

            <!-- Programs Section -->
            <section class="py-20 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Program Pelatihan Kami
                        </h2>
                        <p class="text-xl text-gray-600">
                            Pilih program yang sesuai dengan kebutuhan karir Anda
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg">
                            <div class="text-blue-600 text-4xl mb-4">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-4">Data Analytics</h3>
                            <p class="text-gray-600 mb-4">Pelajari fundamental data analitik dengan tools seperti Excel, SQL, dan Tableau</p>
                            <ul class="text-gray-600 text-sm space-y-2">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>40 jam pelatihan</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Sertifikat BNSP</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Portfolio project</li>
                            </ul>
                        </div>
                        
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg">
                            <div class="text-blue-600 text-4xl mb-4">
                                <i class="fas fa-brain"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-4">Data Science</h3>
                            <p class="text-gray-600 mb-4">Dalam ke machine learning, Python, dan advanced statistical analysis</p>
                            <ul class="text-gray-600 text-sm space-y-2">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>60 jam pelatihan</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Sertifikat BNSP</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Real-world projects</li>
                            </ul>
                        </div>
                        
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg">
                            <div class="text-blue-600 text-4xl mb-4">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-4">Machine Learning</h3>
                            <p class="text-gray-600 mb-4">Master advanced ML algorithms, deep learning, dan AI implementation</p>
                            <ul class="text-gray-600 text-sm space-y-2">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>80 jam pelatihan</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Sertifikat BNSP</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Capstone project</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 bg-blue-600 text-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">
                        Siap Memulai Perjalanan Anda?
                    </h2>
                    <p class="text-xl mb-8">
                        Daftar sekarang dan dapatkan diskon early bird
                    </p>
                    <a href="/admin/login" class="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold inline-block hover:bg-gray-100">
                        Daftar Sekarang
                    </a>
                </div>
            </section>
        </body>
        </html>
      `);
    });
    
    // Synergy Experts route
    server.get('/synergy-experts', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Synergy Experts - Tim Instruktur | GROW SYNERGY INDONESIA</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="/css/custom.css" rel="stylesheet">
            <style>
                .hero-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card-hover {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <!-- Navigation -->
            <nav class="bg-white shadow-lg fixed w-full z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <img src="/images/logo_pt.png" alt="GROW SYNERGY" class="h-8 w-auto mr-3">
                            <span class="text-xl font-bold text-gray-800">GROW SYNERGY INDONESIA</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                            <a href="/about" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Tentang Kami</a>
                            <a href="/synergy-experts" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Expert</a>
                            <a href="/synergy-academy" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Academy</a>
                            <a href="/synergy-portfolio" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Portfolio</a>
                            <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Admin</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="hero-gradient text-white py-20 mt-16">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6">
                            Synergy Experts
                        </h1>
                        <p class="text-xl md:text-2xl mb-8">
                            Tim Instruktur Profesional Kami
                        </p>
                        <p class="text-lg mb-8">
                            Belajar dari expert dengan pengalaman 10+ tahun di industri data
                        </p>
                    </div>
                </div>
            </section>

            <!-- Experts Section -->
            <section class="py-20 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Tim Instruktur Kami
                        </h2>
                        <p class="text-xl text-gray-600">
                            Profesional berpengalaman dari berbagai industri
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg text-center">
                            <img src="/images/experts/expert1.jpg" alt="Expert 1" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                            <h3 class="text-xl font-semibold mb-2">Dr. Ahmad Wijaya</h3>
                            <p class="text-blue-600 mb-4">Lead Data Scientist</p>
                            <p class="text-gray-600 mb-4">15+ tahun pengalaman di Google dan Microsoft</p>
                            <div class="flex justify-center space-x-3 text-gray-400">
                                <i class="fab fa-linkedin"></i>
                                <i class="fab fa-github"></i>
                                <i class="fab fa-twitter"></i>
                            </div>
                        </div>
                        
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg text-center">
                            <img src="/images/experts/expert2.jpg" alt="Expert 2" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                            <h3 class="text-xl font-semibold mb-2">Sarah Putri, M.Sc.</h3>
                            <p class="text-blue-600 mb-4">Senior Data Analyst</p>
                            <p class="text-gray-600 mb-4">12+ tahun pengalaman di banking dan fintech</p>
                            <div class="flex justify-center space-x-3 text-gray-400">
                                <i class="fab fa-linkedin"></i>
                                <i class="fab fa-github"></i>
                                <i class="fab fa-twitter"></i>
                            </div>
                        </div>
                        
                        <div class="card-hover bg-white p-8 rounded-lg shadow-lg text-center">
                            <img src="/images/experts/expert3.jpg" alt="Expert 3" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                            <h3 class="text-xl font-semibold mb-2">Budi Santoso, Ph.D.</h3>
                            <p class="text-blue-600 mb-4">ML Engineering Manager</p>
                            <p class="text-gray-600 mb-4">10+ tahun pengalaman di startup unicorn</p>
                            <div class="flex justify-center space-x-3 text-gray-400">
                                <i class="fab fa-linkedin"></i>
                                <i class="fab fa-github"></i>
                                <i class="fab fa-twitter"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </body>
        </html>
      `);
    });
    
    // Synergy Portfolio route
    server.get('/synergy-portfolio', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Synergy Portfolio - Koleksi Project | GROW SYNERGY INDONESIA</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="/css/custom.css" rel="stylesheet">
            <style>
                .hero-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card-hover {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <!-- Navigation -->
            <nav class="bg-white shadow-lg fixed w-full z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <img src="/images/logo_pt.png" alt="GROW SYNERGY" class="h-8 w-auto mr-3">
                            <span class="text-xl font-bold text-gray-800">GROW SYNERGY INDONESIA</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                            <a href="/about" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Tentang Kami</a>
                            <a href="/synergy-experts" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Expert</a>
                            <a href="/synergy-academy" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Academy</a>
                            <a href="/synergy-portfolio" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Portfolio</a>
                            <a href="/admin/login" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Admin</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="hero-gradient text-white py-20 mt-16">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6">
                            Synergy Portfolio
                        </h1>
                        <p class="text-xl md:text-2xl mb-8">
                            Koleksi Project Terbaik
                        </p>
                        <p class="text-lg mb-8">
                            Lihat hasil karya alumni dan project terbaru dari tim kami
                        </p>
                    </div>
                </div>
            </section>

            <!-- Portfolio Section -->
            <section class="py-20 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Project Unggulan
                        </h2>
                        <p class="text-xl text-gray-600">
                            Berbagai project data analitik dan machine learning
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="card-hover bg-white rounded-lg shadow-lg overflow-hidden">
                            <img src="/images/portfolio/project1.jpg" alt="Project 1" class="w-full h-48 object-cover">
                            <div class="p-6">
                                <h3 class="text-xl font-semibold mb-2">Sales Prediction System</h3>
                                <p class="text-gray-600 mb-4">Machine learning model untuk prediksi penjualan retail dengan accuracy 95%</p>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Python</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">TensorFlow</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">SQL</span>
                                </div>
                                <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Lihat Detail →</a>
                            </div>
                        </div>
                        
                        <div class="card-hover bg-white rounded-lg shadow-lg overflow-hidden">
                            <img src="/images/portfolio/project2.jpg" alt="Project 2" class="w-full h-48 object-cover">
                            <div class="p-6">
                                <h3 class="text-xl font-semibold mb-2">Customer Analytics Dashboard</h3>
                                <p class="text-gray-600 mb-4">Interactive dashboard untuk analisis perilaku customer real-time</p>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Tableau</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Power BI</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">D3.js</span>
                                </div>
                                <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Lihat Detail →</a>
                            </div>
                        </div>
                        
                        <div class="card-hover bg-white rounded-lg shadow-lg overflow-hidden">
                            <img src="/images/portfolio/project3.jpg" alt="Project 3" class="w-full h-48 object-cover">
                            <div class="p-6">
                                <h3 class="text-xl font-semibold mb-2">Fraud Detection System</h3>
                                <p class="text-gray-600 mb-4">AI-powered system untuk deteksi fraud transaksi keuangan</p>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Python</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Scikit-learn</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">AWS</span>
                                </div>
                                <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Lihat Detail →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </body>
        </html>
      `);
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
