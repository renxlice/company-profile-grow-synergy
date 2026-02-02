const express = require('express');
const path = require('path');
const fs = require('fs');

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
    message: 'Express server working perfectly!', 
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

// Read and serve index.hbs content as static HTML
function getIndexHbsContent() {
  try {
    const indexPath = path.join(__dirname, 'src', 'views', 'index.hbs');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      
      // Replace Handlebars variables with static content
      content = content.replace(/\{\{title\}\}/g, 'Pelatihan Data Analitik Terbaik di Indonesia #1 | Kursus Online Bersertifikat BNSP | GROW SYNERGY INDONESIA');
      content = content.replace(/\{\{description\}\}/g, 'Platform pelatihan data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat BNSP. Kursus online dari beginner hingga advanced.');
      content = content.replace(/\{\{keywords\}\}/g, 'pelatihan data analitik, kursus data analitik, data science training, business intelligence course, kursus online bersertifikat');
      content = content.replace(/\{\{author\}\}/g, 'GROW SYNERGY INDONESIA');
      content = content.replace(/\{\{ogTitle\}\}/g, 'Pelatihan Data Analitik Terbaik di Indonesia #1 | GROW SYNERGY INDONESIA');
      content = content.replace(/\{\{ogDescription\}\}/g, 'Platform pelatihan data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat BNSP');
      content = content.replace(/\{\{ogImage\}\}/g, '/images/logo_pt.png');
      content = content.replace(/\{\{ogUrl\}\}/g, 'https://growsynergyid.com/');
      content = content.replace(/\{\{ogType\}\}/g, 'website');
      content = content.replace(/\{\{ogSiteName\}\}/g, 'GROW SYNERGY INDONESIA');
      content = content.replace(/\{\{twitterCard\}\}/g, 'summary_large_image');
      content = content.replace(/\{\{twitterTitle\}\}/g, 'Pelatihan Data Analitik Terbaik di Indonesia #1 | GROW SYNERGY INDONESIA');
      content = content.replace(/\{\{twitterDescription\}\}/g, 'Platform pelatihan data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat BNSP');
      content = content.replace(/\{\{twitterImage\}\}/g, '/images/logo_pt.png');
      content = content.replace(/\{\{canonical\}\}/g, 'https://growsynergyid.com/');
      content = content.replace(/\{\{siteName\}\}/g, 'GROW SYNERGY INDONESIA');
      content = content.replace(/\{\{googleAnalyticsId\}\}/g, 'G-XXXXXXXXXX');
      
      // Remove conditional blocks
      content = content.replace(/\{\{#if googleAnalyticsId\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      
      // Add Firebase SDK scripts and initialization
      content = content.replace('</head>', `
        <!-- Firebase SDK -->
        <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics-compat.js"></script>
        <script src="/firebase-config.js"></script>
        </head>
      `);
      
      // Fix image paths - keep existing images
      content = content.replace(/src="\/images\/asdatin\.png"/g, 'src="/images/asdatin.png"');
      content = content.replace(/src="\/images\/ideaslab\.png"/g, 'src="/images/ideaslab.png"');
      content = content.replace(/src="\/images\/kompis\.jpg"/g, 'src="/images/kompis.jpg"');
      content = content.replace(/src="\/images\/lambang_kota_tangerang_selatan\.png"/g, 'src="/images/lambang_kota_tangerang_selatan.png"');
      content = content.replace(/src="\/images\/sinarmas\.jpg"/g, 'src="/images/sinarmas.jpg"');
      content = content.replace(/src="\/images\/lembaga_sertifikasi_ti_bd\.png"/g, 'src="/images/lembaga_sertifikasi_ti_bd.png"');
      
      // Fix hero background image
      content = content.replace(/src="\/images\/hero-background\.jpg"/g, 'src="/images/hero-background.jpg"');
      
      // Fix backgroundImage reference
      content = content.replace(/this\.backgroundImage/g, 'backgroundImage');
      content = content.replace(/\{\{backgroundImage\}\}/g, '/images/hero-background.jpg');
      
      // Add floating WhatsApp button with logo
      content = content.replace('</body>', `
        <!-- Floating WhatsApp Button -->
        <div class="fixed bottom-8 right-8 z-50">
          <a href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20program%20data%20analitik%20di%20GROW%20SYNERGY%20INDONESIA" 
             target="_blank" 
             class="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382zm-1.472 1.653c-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382z"/>
              <path d="M8.278 3.664c-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382zm-1.472 1.653c-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382-.297-.149-1.358-.278-2.52-.382-1.663-.09-3.268-.09-4.871 0-1.623.09-3.208.292-4.871.382-1.162.104-2.223.233-3.52.382-1.297.149-2.223.233-3.52.382z"/>
              <path d="M20.517 3.483a15.09 15.09 0 0 0-11.592-2.65A15.085 15.085 0 0 0 4.5 5.058a11.36 11.36 0 0 0 6.378 5.078.75.75 0 0 1 .498.565l.19 1.132a.75.75 0 0 0 1.492-.149l.19-1.131a.75.75 0 0 1 .498-.564 11.36 11.36 0 0 0 6.378-5.078 15.045 15.045 0 0 0-2.65-11.592z"/>
              <path d="M6.662 3.413c-.81.77-1.439 1.724-1.856 2.84A12.042 12.042 0 0 0 4.094 9.5c0 1.228.242 2.409.68 3.513.418 1.116 1.047 2.07 1.856 2.84a11.362 11.362 0 0 0 3.513 1.856c1.104.438 2.285.68 3.513.68 1.228 0 2.409-.242 3.513-.68a11.362 11.362 0 0 0 3.513-1.856c.81-.77 1.439-1.724 1.856-2.84A12.042 12.042 0 0 0 21.906 9.5c0-1.228-.242-2.409-.68-3.513a11.362 11.362 0 0 0-1.856-2.84 11.362 11.362 0 0 0-3.513-1.856A12.042 12.042 0 0 0 12.342 1.5c-1.228 0-2.409.242-3.513.68a11.362 11.362 0 0 0-3.513 1.856c-.81.77-1.439 1.724-1.856 2.84z"/>
              <path d="M12.342 8.413a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25z"/>
              <path d="M12.342 12.413a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25z"/>
            </svg>
          </a>
        </div>
        
        <!-- Hero Section Centering Fix -->
        <style>
          .hero-section {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            min-height: 100vh !important;
            position: relative !important;
          }
          
          .hero-content {
            max-width: 800px !important;
            padding: 2rem !important;
            z-index: 10 !important;
            position: relative !important;
          }
          
          .hero-title {
            font-size: 3.5rem !important;
            font-weight: 700 !important;
            margin-bottom: 1.5rem !important;
            line-height: 1.2 !important;
          }
          
          .hero-subtitle {
            font-size: 1.5rem !important;
            margin-bottom: 2rem !important;
            line-height: 1.6 !important;
          }
          
          .hero-description {
            font-size: 1.1rem !important;
            margin-bottom: 2rem !important;
            line-height: 1.7 !important;
          }
          
          .background-image {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            z-index: 1 !important;
          }
          
          .hero-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: 2 !important;
          }
        </style>
        
        <!-- Data Loading Script -->
        <script>
          // Wait for Firebase to be ready
          function waitForFirebase() {
            return new Promise((resolve) => {
              if (window.firebase && window.db) {
                resolve();
              } else {
                setTimeout(() => waitForFirebase().then(resolve), 100);
              }
            });
          }
          
          // Load data from API
          async function loadDataFromAPI() {
            try {
              console.log('🔥 Loading data from API...');
              const response = await fetch('/api/firebase/data');
              const data = await response.json();
              console.log('✅ Data loaded:', data);
              
              // Update all sections with data
              if (data.hero) updateHeroSection([data.hero]);
              if (data.about) updateAboutSection([data.about]);
              if (data.experts) updateExpertsSection(data.experts);
              if (data.portfolio) updatePortfolioSection(data.portfolio);
              if (data.academy) updateAcademySection(data.academy);
              
              console.log('🎉 All sections updated with data!');
            } catch (error) {
              console.error('❌ Error loading data:', error);
            }
          }
          
          // Initialize when page loads
          document.addEventListener('DOMContentLoaded', async () => {
            console.log('🚀 Page loaded, waiting for Firebase...');
            await waitForFirebase();
            console.log('✅ Firebase ready, loading data...');
            loadDataFromAPI();
          });
        </script>
        </body>
      `);
      
      // Re-enable Firebase for production mode
      if (process.env.NODE_ENV === 'production') {
        // Keep Firebase references for production
        content = content.replace(/\/\/ Firebase disabled in static mode/g, 'firebase');
        content = content.replace(/\/\/ Firestore disabled in static mode/g, 'firestore');
        content = content.replace(/\/\/ Analytics disabled in static mode/g, 'analytics');
        content = content.replace(/\/\/ Database disabled in static mode/g, 'db');
        
        // Re-enable dynamic content loading
        content = content.replace(/\/\/ Dynamic content disabled in static mode/g, 'loadDynamicContent');
        content = content.replace(/updateHeroSection\(\);/g, 'updateHeroSection();');
        content = content.replace(/updateAboutSection\);/g, 'updateAboutSection();');
        content = content.replace(/updateExpertsSection\);/g, 'updateExpertsSection();');
        content = content.replace(/updatePortfolioSection\);/g, 'updatePortfolioSection();');
        content = content.replace(/updateAcademySection\);/g, 'updateAcademySection();');
        content = content.replace(/updateBlogSection\);/g, 'updateBlogSection();');
        content = content.replace(/updateTestimonialsSection\);/g, 'updateTestimonialsSection();');
        
        // Re-enable event listeners
        content = content.replace(/\/\/ Event listeners disabled in static mode/g, 'document.addEventListener');
        content = content.replace(/\/\/ Event listeners disabled in static mode/g, 'window.addEventListener');
        
        console.log('🔥 Firebase enabled for production mode');
      } else {
        // Keep Firebase disabled for development
        console.log('🔥 Firebase disabled in development mode');
      }
      
      return content;
    } else {
      // Fallback if index.hbs doesn't exist
      return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GROW SYNERGY INDONESIA</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-50">
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <h1 class="text-4xl font-bold text-blue-600 mb-4">GROW SYNERGY INDONESIA</h1>
                    <p class="text-gray-600 mb-8">Platform Pelatihan Data Analitik Terbaik di Indonesia</p>
                    <div class="space-y-4">
                        <a href="/about" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Tentang Kami</a>
                        <a href="/synergy-academy" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Synergy Academy</a>
                        <a href="/synergy-experts" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Synergy Experts</a>
                        <a href="/synergy-portfolio" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Synergy Portfolio</a>
                        <a href="/blog" class="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Blog</a>
                        <a href="/admin/login" class="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Admin Login</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;
    }
  } catch (error) {
    console.error('Error reading index.hbs:', error);
    return '<html><body><h1>Error loading page</h1></body></html>';
  }
}

// Home route - serve index.hbs content
app.get('/', (req, res) => {
  console.log('🏠 Serving index.hbs content...');
  const content = getIndexHbsContent();
  res.send(content);
});

// Home route alias
app.get('/home', (req, res) => {
  console.log('🏠 Serving home page (alias)...');
  res.redirect('/');
});

// Add API route for analytics tracking
app.post('/api/analytics/track', (req, res) => {
  console.log('📊 Analytics tracking request received');
  res.json({ status: 'success', message: 'Analytics tracked' });
});

// Add API route for Firebase data
app.get('/api/firebase/data', (req, res) => {
  console.log('🔥 Firebase data request received');
  
  // Mock data for now (will be replaced with actual Firebase data)
  const mockData = {
    hero: {
      backgroundImage: '/images/hero-background.jpg',
      title: 'Transformasi Karir dengan Data Analitik',
      description: 'Pelatihan intensif dengan mentor profesional dan proyek real-world',
      buttonText1: 'Mulai Belajar Sekarang',
      buttonText2: 'Download Kurikulum'
    },
    about: {
      title: 'Tentang Kami',
      description: 'GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik terbaik di Indonesia dengan kurikulum terstandar dan mentor berpengalaman.',
      content: 'Menjadi platform pembelajaran data analitik terdepan di Indonesia yang menghasilkan talenta siap kerja.',
      buttonText1: 'Hubungi Kami',
      buttonText2: 'Lihat Portfolio'
    },
    experts: [
      {
        id: 'expert1',
        name: 'Dr. Ahmad Wijaya',
        position: 'Data Science Expert',
        experience: '10+ Tahun Pengalaman',
        rating: 4.8,
        reviewCount: 156,
        description: 'Expert dalam machine learning dan data science dengan pengalaman 10+ tahun di berbagai industri.',
        image: 'https://picsum.photos/seed/ahmad/200/200.jpg'
      },
      {
        id: 'expert2',
        name: 'Sarah Putri',
        position: 'Business Intelligence Specialist',
        experience: '8+ Tahun Pengalaman',
        rating: 4.9,
        reviewCount: 203,
        description: 'Spesialis dalam business intelligence dan data visualization dengan track record yang sangat baik.',
        image: 'https://picsum.photos/seed/sarah/200/200.jpg'
      },
      {
        id: 'expert3',
        name: 'Budi Santoso',
        position: 'Machine Learning Engineer',
        experience: '7+ Tahun Pengalaman',
        rating: 4.7,
        reviewCount: 142,
        description: 'Expert dalam machine learning dan artificial intelligence dengan fokus pada implementasi bisnis.',
        image: 'https://picsum.photos/seed/budi/200/200.jpg'
      }
    ],
    portfolio: [
      {
        id: 'portfolio1',
        title: 'Retail Analytics Dashboard',
        description: 'Dashboard real-time untuk monitoring sales dan inventory',
        category: 'Dashboard',
        tags: ['React', 'Node.js', 'MongoDB'],
        image: 'https://picsum.photos/seed/retail/400/300.jpg',
        client: 'PT. Retail Maju'
      },
      {
        id: 'portfolio2',
        title: 'Sales Prediction Model',
        description: 'Machine learning model untuk forecasting sales',
        category: 'Machine Learning',
        tags: ['Python', 'TensorFlow', 'Scikit-learn'],
        image: 'https://picsum.photos/seed/sales/400/300.jpg',
        client: 'PT. Sales Global'
      },
      {
        id: 'portfolio3',
        title: 'Customer Segmentation',
        description: 'Analisis clustering untuk customer behavior',
        category: 'Data Analysis',
        tags: ['Python', 'Pandas', 'Tableau'],
        image: 'https://picsum.photos/seed/customer/400/300.jpg',
        client: 'PT. Customer First'
      }
    ],
    academy: [
      {
        id: 'academy1',
        title: 'Data Analyst Fundamentals',
        description: 'Dasar-dasar analisis data dengan tools modern',
        duration: '3 bulan',
        level: 'Pemula',
        schedule: 'Full Time',
        format: 'Online',
        rating: 4.8,
        students: 2500,
        image: 'https://picsum.photos/seed/academy1/400/300.jpg'
      },
      {
        id: 'academy2',
        title: 'Advanced SQL & Visualization',
        description: 'Query kompleks dan visualisasi data yang efektif',
        duration: '2 bulan',
        level: 'Menengah',
        schedule: 'Full Time',
        format: 'Online',
        rating: 4.9,
        students: 1800,
        image: 'https://picsum.photos/seed/academy2/400/300.jpg'
      },
      {
        id: 'academy3',
        title: 'Machine Learning Basics',
        description: 'Pengenalan machine learning dan implementasi',
        duration: '4 bulan',
        level: 'Menengah',
        schedule: 'Full Time',
        format: 'Online',
        rating: 4.7,
        students: 1200,
        image: 'https://picsum.photos/seed/academy3/400/300.jpg'
      }
    ]
  };
  
  res.json(mockData);
});

// Add Firebase initialization script
app.get('/firebase-config.js', (req, res) => {
  const firebaseConfig = `
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
      authDomain: "company-profile-grow-synergy.firebaseapp.com",
      projectId: "company-profile-grow-synergy",
      storageBucket: "company-profile-grow-synergy.appspot.com",
      messagingSenderId: "584312572709",
      appId: "1:584312572709:web:1e0ad87867af7b878668cc"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const analytics = firebase.analytics();
    
    // Export for use in other scripts
    window.firebase = firebase;
    window.db = db;
    window.analytics = analytics;
  `;
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(firebaseConfig);
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
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Website: http://localhost:${PORT}/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📄 Serving index.hbs content directly`);
});
