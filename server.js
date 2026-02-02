const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

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
      
      // Remove all Handlebars template variables that interfere with layout
      content = content.replace(/\{\{#if heroSections\}\}/g, '');
      content = content.replace(/\{\{#each heroSections\}\}/g, '');
      content = content.replace(/\{\{\/each\}\}/g, '');
      content = content.replace(/\{\{\/if\}\}/g, '');
      content = content.replace(/\{\{#if\}\}/g, '');
      content = content.replace(/\{\{#unless\}\}/g, '');
      content = content.replace(/\{\{\/unless\}\}/g, '');
      content = content.replace(/\{\{#each\}\}/g, '');
      content = content.replace(/\{\{#with\}\}/g, '');
      content = content.replace(/\{\{\/with\}\}/g, '');
      content = content.replace(/\{\{#unless heroSections\}\}/g, '');
      content = content.replace(/\{\{#if aboutSections\}\}/g, '');
      content = content.replace(/\{\{#each aboutSections\}\}/g, '');
      content = content.replace(/\{\{#unless aboutSections\}\}/g, '');
      content = content.replace(/\{\{#if experts\}\}/g, '');
      content = content.replace(/\{\{#each experts\}\}/g, '');
      content = content.replace(/\{\{#unless experts\}\}/g, '');
      content = content.replace(/\{\{#if portfolios\}\}/g, '');
      content = content.replace(/\{\{#each portfolios\}\}/g, '');
      content = content.replace(/\{\{#unless portfolios\}\}/g, '');
      content = content.replace(/\{\{#if academies\}\}/g, '');
      content = content.replace(/\{\{#each academies\}\}/g, '');
      content = content.replace(/\{\{#unless academies\}\}/g, '');
      content = content.replace(/\{\{#if blogs\}\}/g, '');
      content = content.replace(/\{\{#each blogs\}\}/g, '');
      content = content.replace(/\{\{#unless blogs\}\}/g, '');
      
      // Remove any remaining Handlebars blocks
      content = content.replace(/\{\{#[^}]*\}\}/g, '');
      content = content.replace(/\{\{\/[^}]*\}\}/g, '');
      content = content.replace(/\{\{[^}]*\}\}/g, '');
      
      // Remove image template variables
      content = content.replace(/\{\{image\}\}/g, '/images/hero-background.jpg');
      content = content.replace(/\{\{this\.backgroundImage\}\}/g, '/images/hero-background.jpg');
      content = content.replace(/\{\{backgroundImage\}\}/g, '/images/hero-background.jpg');
      content = content.replace(/\{\{[^}]*image[^}]*\}\}/g, '/images/hero-background.jpg');
      
      // Remove conditional blocks
      content = content.replace(/\{\{#if googleAnalyticsId\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      
      // Remove Firebase duplicate warning by checking if already loaded
      content = content.replace(/<!-- Firebase SDK -->[\s\S]*?<\/head>/, (match) => {
        if (content.includes('firebase-app-compat.js')) {
          return '</head>';
        }
        return match;
      });
      
      // Add Firebase SDK scripts and initialization only once
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
      
      // Add floating WhatsApp button with proper logo
      content = content.replace('</body>', `
        <!-- WhatsApp Floating Button -->
        <div class="whatsapp-float" id="whatsapp-float">
          <a href="https://wa.me/6285697490726?text=Halo%20GROW%20SYNERGY%20INDONESIA%2C%20saya%20ingin%20bertanya" 
             target="_blank" 
             rel="noopener noreferrer"
             class="whatsapp-link"
             title="Hubungi kami via WhatsApp">
            <!-- WhatsApp Logo SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="50px" height="50px" fill-rule="evenodd" clip-rule="evenodd">
              <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"/>
              <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"/>
              <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"/>
              <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"/>
              <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"/>
            </svg>
          </a>
        </div>
        
        <!-- Hero Section Centering Fix -->
        <style>
          /* Force hero section centering */
          .hero-section {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            min-height: 100vh !important;
            position: relative !important;
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
          }
          
          /* Force hero content centering */
          .hero-content {
            max-width: 800px !important;
            width: 100% !important;
            padding: 2rem !important;
            z-index: 10 !important;
            position: relative !important;
            margin: 0 auto !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          /* Force all hero text centering */
          .hero-title {
            font-size: 3.5rem !important;
            font-weight: 700 !important;
            margin-bottom: 1.5rem !important;
            line-height: 1.2 !important;
            text-align: center !important;
            width: 100% !important;
            display: block !important;
          }
          
          .hero-subtitle {
            font-size: 1.5rem !important;
            margin-bottom: 2rem !important;
            line-height: 1.6 !important;
            text-align: center !important;
            width: 100% !important;
            display: block !important;
          }
          
          .hero-description {
            font-size: 1.1rem !important;
            margin-bottom: 2rem !important;
            line-height: 1.7 !important;
            text-align: center !important;
            width: 100% !important;
            display: block !important;
          }
          
          /* Background image */
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
          
          /* Force all containers to center */
          .hero-section .container,
          .hero-section .container-fluid,
          .hero-section .row,
          .hero-section .col,
          .hero-section div {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          
          /* Override any existing styles */
          .hero-section * {
            text-align: center !important;
            justify-content: center !important;
            align-items: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          /* WhatsApp Button Styles */
          .whatsapp-float {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9999 !important;
          }
          
          .whatsapp-link {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 70px !important;
            height: 70px !important;
            background: #25D366 !important;
            border-radius: 50% !important;
            box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4) !important;
            transition: all 0.3s ease !important;
            text-decoration: none !important;
          }
          
          .whatsapp-link:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6) !important;
          }
          
          .whatsapp-link svg {
            width: 50px !important;
            height: 50px !important;
          }
          
          /* Ensure no overflow */
          body, html {
            overflow-x: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
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

// Add API route for hero section
app.get('/api/hero-section', (req, res) => {
  console.log('🎨 Hero section data request received');
  
  // Mock hero data for now (will be replaced with actual Firebase data)
  const mockHeroData = [
    {
      id: 'hero-1',
      backgroundImage: '/images/hero-background.jpg',
      title: 'Transformasi Karir dengan Data Analitik',
      subtitle: 'Platform Pembelajaran Terbaik',
      description: 'Pelatihan intensif dengan mentor profesional dan proyek real-world untuk karir Anda',
      buttonText1: 'Mulai Belajar Sekarang',
      buttonText2: 'Download Kurikulum'
    }
  ];
  
  res.json(mockHeroData);
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

// Synergy Experts route - serve synergy-experts.hbs with proper Handlebars rendering
app.get('/synergy-experts', (req, res) => {
  console.log('👥 Serving synergy-experts page with Handlebars rendering...');
  try {
    res.render('synergy-experts', {
      title: 'Synergy Experts - Instruktur Data Analitik Profesional | GROW SYNERGY INDONESIA',
      description: 'Temukan instruktur data analitik berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia. Expert trainer dengan sertifikat internasional.',
      keywords: 'instruktur data analitik, expert trainer, data science instructor, mentor data analyst, kursus data analitik',
      author: 'GROW SYNERGY INDONESIA',
      robots: 'index, follow',
      googlebot: 'index, follow',
      ogTitle: 'Synergy Experts - Instruktur Data Analitik Profesional',
      ogDescription: 'Instruktur berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia',
      ogImage: 'https://grow-synergy-indonesia.com/images/synergy-experts-og-image.jpg',
      ogUrl: 'https://grow-synergy-indonesia.com/synergy-experts',
      ogType: 'website',
      ogSiteName: 'GROW SYNERGY INDONESIA',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Experts - Instruktur Data Analitik Profesional',
      twitterDescription: 'Instruktur berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia',
      twitterImage: 'https://grow-synergy-indonesia.com/images/synergy-experts-twitter-image.jpg',
      canonical: 'https://grow-synergy-indonesia.com/synergy-experts',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
      structuredDataJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Synergy Experts - GROW SYNERGY INDONESIA",
        "description": "Instruktur data analitik berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia",
        "url": "https://grow-synergy-indonesia.com/synergy-experts",
        "provider": {
          "@type": "Organization",
          "name": "GROW SYNERGY INDONESIA",
          "url": "https://grow-synergy-indonesia.com"
        }
      })
    });
  } catch (error) {
    console.error('Error serving synergy-experts:', error);
    res.status(500).send('Error loading page');
  }
});

// Synergy Portfolio route - serve synergy-portfolio.hbs with proper Handlebars rendering
app.get('/synergy-portfolio', (req, res) => {
  console.log('💼 Serving synergy-portfolio page with Handlebars rendering...');
  try {
    res.render('synergy-portfolio', {
      title: 'Synergy Portfolio - Portfolio Alumni | GROW SYNERGY INDONESIA',
      description: 'Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA. Karya dan proyek inovatif dari talenta digital Indonesia.',
      keywords: 'portfolio alumni, karya alumni, proyek data analitik, portfolio data science, alumni grow synergy',
      author: 'GROW SYNERGY INDONESIA',
      robots: 'index, follow',
      googlebot: 'index, follow',
      ogTitle: 'Synergy Portfolio - Portfolio Alumni',
      ogDescription: 'Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA',
      ogImage: 'https://grow-synergy-indonesia.com/images/synergy-portfolio-og-image.jpg',
      ogUrl: 'https://grow-synergy-indonesia.com/synergy-portfolio',
      ogType: 'website',
      ogSiteName: 'GROW SYNERGY INDONESIA',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Portfolio - Portfolio Alumni',
      twitterDescription: 'Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA',
      twitterImage: 'https://grow-synergy-indonesia.com/images/synergy-portfolio-twitter-image.jpg',
      canonical: 'https://grow-synergy-indonesia.com/synergy-portfolio',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
      structuredDataJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Synergy Portfolio - GROW SYNERGY INDONESIA",
        "description": "Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA",
        "url": "https://grow-synergy-indonesia.com/synergy-portfolio",
        "provider": {
          "@type": "Organization",
          "name": "GROW SYNERGY INDONESIA",
          "url": "https://grow-synergy-indonesia.com"
        }
      })
    });
  } catch (error) {
    console.error('Error serving synergy-portfolio:', error);
    res.status(500).send('Error loading page');
  }
});

// Synergy Academy route - serve synergy-academy.hbs with proper Handlebars rendering
app.get('/synergy-academy', (req, res) => {
  console.log('� Serving synergy-academy page with Handlebars rendering...');
  try {
    res.render('synergy-academy', {
      title: 'Synergy Academy - Kursus Data Analitik | GROW SYNERGY INDONESIA',
      description: 'Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat. Pelatihan intensif data science dan machine learning.',
      keywords: 'kursus data analitik, pelatihan data science, bootcamp data analyst, training machine learning, kursus big data',
      author: 'GROW SYNERGY INDONESIA',
      robots: 'index, follow',
      googlebot: 'index, follow',
      ogTitle: 'Synergy Academy - Kursus Data Analitik',
      ogDescription: 'Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat',
      ogImage: 'https://grow-synergy-indonesia.com/images/synergy-academy-og-image.jpg',
      ogUrl: 'https://grow-synergy-indonesia.com/synergy-academy',
      ogType: 'website',
      ogSiteName: 'GROW SYNERGY INDONESIA',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Academy - Kursus Data Analitik',
      twitterDescription: 'Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat',
      twitterImage: 'https://grow-synergy-indonesia.com/images/synergy-academy-twitter-image.jpg',
      canonical: 'https://grow-synergy-indonesia.com/synergy-academy',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
      structuredDataJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Synergy Academy - GROW SYNERGY INDONESIA",
        "description": "Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat",
        "url": "https://grow-synergy-indonesia.com/synergy-academy",
        "provider": {
          "@type": "Organization",
          "name": "GROW SYNERGY INDONESIA",
          "url": "https://grow-synergy-indonesia.com"
        }
      })
    });
  } catch (error) {
    console.error('Error serving synergy-academy:', error);
    res.status(500).send('Error loading page');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});
