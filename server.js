const express = require('express');
const path = require('path');
const fs = require('fs');
const exphbs = require('express-handlebars');

const app = express();

// Handlebars setup
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: false,
  layoutsDir: path.join(__dirname, 'src/views')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Favicon route
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'public', 'images', 'logo_pt.png');
  res.sendFile(faviconPath, (err) => {
    if (err) res.status(404).send('Favicon not found');
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'GROW SYNERGY INDONESIA - Platform Data Analitik Terbaik',
    description: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    keywords: 'data analitik, platform pembelajaran, kursus data science, bootcamp data analyst',
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'GROW SYNERGY INDONESIA - Platform Data Analitik Terbaik',
    ogDescription: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    ogImage: 'https://grow-synergy-indonesia.com/images/og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com',
    ogType: 'website',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: 'GROW SYNERGY INDONESIA - Platform Data Analitik Terbaik',
    twitterDescription: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    twitterImage: 'https://grow-synergy-indonesia.com/images/twitter-image.jpg',
    canonical: 'https://grow-synergy-indonesia.com',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    structuredDataJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "GROW SYNERGY INDONESIA",
      "description": "Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.",
      "url": "https://grow-synergy-indonesia.com",
      "provider": {
        "@type": "Organization",
        "name": "GROW SYNERGY INDONESIA",
        "url": "https://grow-synergy-indonesia.com"
      }
    })
  });
});

app.get('/synergy-experts', (req, res) => {
  res.render('synergy-experts', {
    title: 'Synergy Experts - Instruktur Data Analitik Profesional | GROW SYNERGY INDONESIA',
    description: 'Temukan instruktur data analitik berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia.',
    keywords: 'instruktur data analitik, expert trainer, data science instructor',
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'Synergy Experts - Instruktur Data Analitik Profesional',
    ogDescription: 'Instruktur berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia.',
    ogImage: 'https://grow-synergy-indonesia.com/images/synergy-experts-og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com/synergy-experts',
    ogType: 'website',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Synergy Experts - Instruktur Data Analitik Profesional',
    twitterDescription: 'Instruktur berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia.',
    twitterImage: 'https://grow-synergy-indonesia.com/images/synergy-experts-twitter-image.jpg',
    canonical: 'https://grow-synergy-indonesia.com/synergy-experts',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    structuredDataJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Synergy Experts - GROW SYNERGY INDONESIA",
      "description": "Instruktur data analitik berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia.",
      "url": "https://grow-synergy-indonesia.com/synergy-experts",
      "provider": {
        "@type": "Organization",
        "name": "GROW SYNERGY INDONESIA",
        "url": "https://grow-synergy-indonesia.com"
      }
    })
  });
});

app.get('/synergy-portfolio', (req, res) => {
  res.render('synergy-portfolio', {
    title: 'Synergy Portfolio - Portfolio Alumni | GROW SYNERGY INDONESIA',
    description: 'Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA.',
    keywords: 'portfolio alumni, karya alumni, proyek data analitik',
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'Synergy Portfolio - Portfolio Alumni',
    ogDescription: 'Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA.',
    ogImage: 'https://grow-synergy-indonesia.com/images/synergy-portfolio-og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com/synergy-portfolio',
    ogType: 'website',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Synergy Portfolio - Portfolio Alumni',
    twitterDescription: 'Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA.',
    twitterImage: 'https://grow-synergy-indonesia.com/images/synergy-portfolio-twitter-image.jpg',
    canonical: 'https://grow-synergy-indonesia.com/synergy-portfolio',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    structuredDataJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Synergy Portfolio - GROW SYNERGY INDONESIA",
      "description": "Portfolio alumni terbaik dari program pelatihan data analitik GROW SYNERGY INDONESIA.",
      "url": "https://grow-synergy-indonesia.com/synergy-portfolio",
      "provider": {
        "@type": "Organization",
        "name": "GROW SYNERGY INDONESIA",
        "url": "https://grow-synergy-indonesia.com"
      }
    })
  });
});

app.get('/synergy-academy', (req, res) => {
  res.render('synergy-academy', {
    title: 'Synergy Academy - Kursus Data Analitik | GROW SYNERGY INDONESIA',
    description: 'Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    keywords: 'kursus data analitik, pelatihan data science, bootcamp data analyst',
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'Synergy Academy - Kursus Data Analitik',
    ogDescription: 'Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    ogImage: 'https://grow-synergy-indonesia.com/images/synergy-academy-og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com/synergy-academy',
    ogType: 'website',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Synergy Academy - Kursus Data Analitik',
    twitterDescription: 'Kursus data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
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
});

app.get('/blog', (req, res) => {
  res.render('blog', {
    title: 'Blog Data Analitik | Tips, Tutorial & Insights Indonesia',
    description: 'Blog data analitik terbaik di Indonesia. Dapatkan tips, tutorial, dan insights tentang data science.',
    keywords: 'blog data analitik, tutorial data science, tips data analyst',
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'Blog Data Analitik | Tips, Tutorial & Insights Indonesia',
    ogDescription: 'Blog data analitik terbaik di Indonesia dengan tips, tutorial, dan insights tentang data science.',
    ogImage: 'https://grow-synergy-indonesia.com/images/blog-og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com/blog',
    ogType: 'website',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Blog Data Analitik | Tips & Tutorial Indonesia',
    twitterDescription: 'Blog data analitik dengan tips, tutorial, dan insights untuk karir data analyst',
    twitterImage: 'https://grow-synergy-indonesia.com/images/blog-twitter-image.jpg',
    canonical: 'https://grow-synergy-indonesia.com/blog',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null
  });
});

// API Routes
app.get('/api/firebase/data', (req, res) => {
  console.log('🔥 Firebase data request received');
  // Mock data for now
  const mockData = {
    hero: {
      backgroundImage: '/images/hero-background.jpg',
      title: 'Transformasi Karir dengan Data Analitik',
      description: 'Pelatihan intensif dengan mentor profesional dan proyek real-world'
    },
    experts: [
      {
        id: 'expert1',
        name: 'Dr. Ahmad Wijaya',
        category: 'Data Science',
        role: 'Dosen',
        organization: 'Founder Grow Synergy',
        image: 'https://picsum.photos/seed/ahmad-wijaya/200/200.jpg'
      },
      {
        id: 'expert2',
        name: 'Sarah Putri',
        category: 'Data Science',
        role: 'Dosen',
        organization: 'Founder Grow Synergy',
        image: 'https://picsum.photos/seed/sarah-putri/200/200.jpg'
      }
    ],
    portfolios: [
      {
        id: 'portfolio1',
        title: 'Retail Analytics Dashboard',
        description: 'Dashboard real-time untuk monitoring sales dan inventory',
        category: 'Dashboard',
        image: 'https://picsum.photos/seed/retail/400/300.jpg'
      }
    ],
    academies: [
      {
        id: 'academy1',
        title: 'Data Analyst Fundamentals',
        description: 'Dasar-dasar analisis data dengan tools modern',
        duration: '3 bulan',
        level: 'Pemula',
        image: 'https://picsum.photos/seed/academy1/400/300.jpg'
      }
    ],
    blogs: [
      {
        id: 'blog1',
        title: 'Panduan Lengkap Data Analitik untuk Pemula',
        excerpt: 'Pelajari dasar-dasar data analitik langkah demi langkah',
        author: 'GROW SYNERGY Team',
        date: new Date().toISOString(),
        image: 'https://picsum.photos/seed/blog1/400/300.jpg',
        tags: ['data analitik', 'tutorial', 'pemula']
      }
    ]
  };
  
  res.json(mockData);
});

app.post('/api/analytics/track', (req, res) => {
  console.log('📊 Analytics tracking request received');
  // Mock analytics tracking
  res.json({ success: true, message: 'Analytics tracked' });
});

// Firebase config route
app.get('/firebase-config.js', (req, res) => {
  const firebaseConfig = `
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDummyKeyForTesting",
      authDomain: "grow-synergy-indonesia.firebaseapp.com",
      projectId: "grow-synergy-indonesia",
      storageBucket: "grow-synergy-indonesia.appspot.com",
      messagingSenderId: "1004183204068",
      appId: "1:1004183204068:web:a26f30a911a37c9a6331a1",
      measurementId: "G-49J1K6Y9WJ"
    };

    // Initialize Firebase only if not already initialized
    if (!window.firebase || !window.firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      console.log('Firebase already initialized, skipping...');
    }
    
    // Initialize services
    if (!window.db) {
      window.db = firebase.firestore();
      console.log('Firestore initialized');
    }
    
    if (!window.analytics) {
      window.analytics = firebase.analytics();
      console.log('Analytics initialized');
    }
  `;
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(firebaseConfig);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});

