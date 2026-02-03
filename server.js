// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const exphbs = require('express-handlebars');
const session = require('express-session');
const admin = require('firebase-admin');
const multer = require('multer');

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('public/uploads'));

// File upload middleware
const upload = multer({
  dest: 'public/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Ensure uploads directory exists
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// Session middleware
app.use(session({
  secret: 'grow-synergy-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Firebase Admin SDK
let db;
let firebaseInitError = null;

try {
  // Try environment variables first (recommended for hosting)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      db = admin.firestore();
      console.log('🔥 Firebase Admin SDK initialized successfully from environment variables');
      console.log(`📊 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`📧 Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    } catch (envError) {
      firebaseInitError = `Environment variables error: ${envError.message}`;
      console.error('❌ Firebase Admin SDK environment variables error:', envError);
      console.error('🔍 Environment variables check:');
      console.error(`  - FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING'}`);
      console.error(`  - FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING'}`);
      console.error(`  - FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'MISSING'}`);
      throw envError;
    }
  } 
  // Production fallback: try service account file first (easiest for Hostinger)
  else if (process.env.NODE_ENV === 'production') {
    console.log('🏭 Production mode: Trying service account file');
    const serviceAccountPath = path.join(__dirname, 'config', 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: 'company-profile-grow-synergy'
        });
        db = admin.firestore();
        console.log('🔥 Firebase Admin SDK initialized successfully from config/service-account.json');
      } catch (fileError) {
        firebaseInitError = `Service account file error: ${fileError.message}`;
        console.error('❌ Firebase Admin SDK service account file error:', fileError);
        throw fileError;
      }
    } else {
      console.log('⚠️ Service account file not found at config/firebase-service-account.json, trying hardcoded credentials');
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: "company-profile-grow-synergy",
            clientEmail: "firebase-adminsdk-fbsvc@company-profile-grow-synergy.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChvzANtK317wFA\nQAT8w1linwKx+T2b2Syug/G/8Zaw/osfAHJhanGuaqA/9NZMdCsQ19bOsyq0/Moq\nhHe7Ma4um/JptIBFtWOfkTvEtYDzYRxKPhiOMWVRDTNbkmSD7wWlB4o+kOnNYifD\nCTFN1Zn/dOZA7rgG+VZlLTVbJ4pjfVv0FMYNt575akY6Be4LqTvGOsMW8gGrNedb\nP5YVqpYW1YPO6sLuxweaTseR3kwJ1wPdqq3h70rcU+wHvHYrtZrdQMtfDlhGpMnS\nhaCBH9sQG5H3/egN2DdvFqzJ50/2NFBBIOFmsBUxxD3Z8VNGCZrFYvMrOi0/gLt9\nDCIZtABpAgMBAAECggEAIeUEJ2Mc70QKAZJI2UUAhrOmp3AA8pdEjz+UGfKA7w8w\nTStVTMe3EeNDOJPQko3ndmyclY0jHnE41kcTJhWnmBnS50bNeI4l1crj+PlGD/pi\nKMaxc56zShRXllFroeAlUStu02SfsgvnJC5ZeCOSVV+EXsgHpWJ7sdES9Mqo6+cD\n4W87/eUqR4vM+aBOBvtzsxyZCbJ8/wC4aTIQA4/uyElwqeUZy0yYH6BylUchRjXX\nV/PB37kiK2BDxJXxazr+YdBXfXCan2GsqCZF+SD7qYrkQgEmzjQ7oPou37fW6BS3\nBnyhVk+B8DjJOiCyk+GWyjsqxPJmEYrdrf2JKGRQuQKBgQDjDmvlmnKgvs0e5CXc\nZn0n3o1TeG+WAl1Ydv45ZtouuZwdXw+NesMgv9ddc3Z+gqmo0MVXwsKptqxcMSfs\nJ+tB9idC1CPKhs9r3wbpD3rO8iDHsk9pCqykFJyCN5be69m2J9ECc/GFmqoWKUQC\nKIaxB8sJ74aU+EOh+G4vWUo+pQKBgQC2XYHHknFh3jrVa8EJ81xAOMIiMK3IwClF\n+w2fDNtNVBrXAqLpKyklo9RmJOXSQaLuEBwFjsQO2LeGWlsNNCoOGg8PoB47xLr7\nB26u9HlnhUQURI45O/LYoIqN2lshLS537U7eGebZCf+TFttKOeN1ZiH7SzUUxTGw\nAYExQ5izdQKBgGhT+w3P7rWflh6IlED2MrG8F9Hvt84EniGE44E6miv4CxyPzlSi\nwL/uhiWhZSPyI8S20MZnbgyPLBlcWMyw9u8jDJ0vXpazZOFa5BD4lOQ76wX3D3fj\neLoX4mYO5trdIfcJyobHAYXzMA3oviADwQfc3dVd4sfWXzUwMmi9LVklAoGAb1X5\nJKmQVUrCqoeFrBiKap78Trlfb995k0Lplv/XZ4eAd2Ihqa7zCQrTYqUGNm5iFWt6\nYB5ALjw7F2hUjGQbhM5+AXEk5CKAcT+hYGjbMctXu/P6zJB/+6dPz7jOyBt4cjlM\nXCZ+HGWRRfC/Yrqi1orLFktdFdgqNKVGhZgaQv0CgYEA3m05DNSVLlBqzlcrW1Il\neU46DosygQnN2XSirEBkFC+l3I7g1j3emA3RUYidmaODsCSYP5DOtSI0yYlQPe09\n94OsnInN6KKxHIrH95haq4SUXCDcplAhKQAQ98ujUU0ewdELM2Cd40DZWorJMZy+\nalIgNfNHfcvffHxnUQr6oz8=\n-----END PRIVATE KEY-----"
          }),
          projectId: "company-profile-grow-synergy"
        });
        db = admin.firestore();
        console.log('🔥 Firebase Admin SDK initialized successfully with hardcoded credentials');
      } catch (fallbackError) {
        firebaseInitError = `Production fallback error: ${fallbackError.message}`;
        console.error('❌ Firebase Admin SDK production fallback error:', fallbackError);
        throw fallbackError;
      }
    }
  }// Fallback to service account file
  else {
    const serviceAccountPath = path.join(__dirname, 'company-profile-grow-synergy-firebase-adminsdk.json');
    
    console.log('🔍 Current directory (__dirname):', __dirname);
    console.log('🔍 Checking service account file:', serviceAccountPath);
    console.log('🔍 File exists:', fs.existsSync(serviceAccountPath));
    
    // List all files in current directory for debugging
    try {
      const files = fs.readdirSync(__dirname);
      console.log('📁 Files in directory:', files.filter(f => f.includes('firebase')));
    } catch (err) {
      console.log('❌ Cannot read directory:', err.message);
    }
    
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = require(serviceAccountPath);
        console.log('📄 Service account file loaded, keys:', Object.keys(serviceAccount));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: 'company-profile-grow-synergy'
        });
        db = admin.firestore();
        console.log('🔥 Firebase Admin SDK initialized successfully from service account file');
      } catch (fileError) {
        firebaseInitError = `Service account file error: ${fileError.message}`;
        console.error('❌ Firebase Admin SDK service account file error:', fileError);
        throw fileError;
      }
    } else {
      firebaseInitError = 'No service account file found';
      console.warn('⚠️ Firebase Admin SDK: No environment variables or service account file found. Using mock mode.');
      console.warn('Expected file:', serviceAccountPath);
      console.warn('Required environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      // Create mock db for development
      db = {
        collection: () => ({
          get: async () => ({ docs: [] }),
          add: async () => ({ get: async () => ({ id: 'mock-id', data: () => ({}) }) }),
          doc: () => ({
            get: async () => ({ exists: false, id: 'mock-id', data: () => ({}) }),
            update: async () => {},
            delete: async () => {}
          }),
        }),
      };
    }
  }
} catch (error) {
  firebaseInitError = `Initialization error: ${error.message}`;
  console.error('❌ Firebase Admin SDK initialization failed:', error);
  console.warn('⚠️ Using mock mode for development');
  // Create mock db for development
  db = {
    collection: () => ({
      get: async () => ({ docs: [] }),
      add: async () => ({ get: async () => ({ id: 'mock-id', data: () => ({}) }) }),
      doc: () => ({
        get: async () => ({ exists: false, id: 'mock-id', data: () => ({}) }),
        update: async () => {},
        delete: async () => {}
      }),
    }),
  };
}

// Handlebars setup
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: false,
  layoutsDir: path.join(__dirname, 'src/views'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    }),
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
  });
});

// Home route - redirects to main page
app.get('/home', (req, res) => {
  res.redirect('/');
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
    }),
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
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
    }),
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
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
    }),
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
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
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
  });
});

// About page route
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Tentang Kami - GROW SYNERGY INDONESIA',
    description: 'Tentang Grow Synergy Indonesia - Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    keywords: 'tentang kami, grow synergy indonesia, data analitik, pelatihan, kursus',
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'Tentang Kami - GROW SYNERGY INDONESIA',
    ogDescription: 'Tentang Grow Synergy Indonesia - Platform pembelajaran data analitik terbaik di Indonesia',
    ogImage: 'https://grow-synergy-indonesia.com/images/og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com/about',
    ogType: 'website',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Tentang Kami - GROW SYNERGY INDONESIA',
    twitterDescription: 'Tentang Grow Synergy Indonesia',
    twitterImage: 'https://grow-synergy-indonesia.com/images/twitter-image.jpg',
    canonical: 'https://grow-synergy-indonesia.com/about',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
  });
});

// Blog detail route
app.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;
  
  // Mock blog data - in real implementation, this would come from database
  const blogPosts = {
    'panduan-lengkap-data-analitik-pemula': {
      id: 'panduan-lengkap-data-analitik-pemula',
      title: 'Panduan Lengkap Data Analitik untuk Pemula',
      slug: 'panduan-lengkap-data-analitik-pemula',
      description: 'Panduan lengkap untuk memulai karir di bidang data analitik dengan langkah-langkah praktis dan tools yang harus dikuasai.',
      content: `
        <h2>Apa itu Data Analitik?</h2>
        <p>Data analitik adalah proses memeriksa, membersihkan, mengubah, dan memodelkan data untuk menemukan informasi yang berguna, menyimpulkan kesimpulan, dan mendukung pengambilan keputusan.</p>
        
        <h2>Langkah 1: Pahami Dasar-Dasar Statistik</h2>
        <p>Sebelum terjun ke data analitik, penting untuk memahami konsep dasar statistik seperti mean, median, modus, standar deviasi, dan konsep probabilitas.</p>
        
        <h2>Langkah 2: Kuasai Tools Dasar</h2>
        <p>Beberapa tools yang harus dikuasai:</p>
        <ul>
          <li><strong>Excel/Google Sheets:</strong> Untuk data cleaning dan analisis dasar</li>
          <li><strong>SQL:</strong> Untuk mengambil dan memanipulasi data dari database</li>
          <li><strong>Python:</strong> Untuk analisis data yang lebih kompleks</li>
          <li><strong>Tableau/Power BI:</strong> Untuk data visualization</li>
        </ul>
        
        <h2>Langkah 3: Praktik dengan Proyek Real</h2>
        <p>Teori saja tidak cukup. Mulailah dengan proyek-proyek sederhana seperti analisis penjualan toko online atau prediksi churn customer.</p>
        
        <h2>Langkah 4: Terus Belajar dan Berkembang</h2>
        <p>Data analitik adalah bidang yang terus berkembang. Ikuti tren terbaru, belajar machine learning, dan jangan pernah berhenti belajar.</p>
      `,
      author: 'Tim GROW SYNERGY INDONESIA',
      date: '15 Januari 2024',
      readTime: '8',
      category: 'Tutorial',
      image: 'https://picsum.photos/seed/data-analytics-guide/1200/600.jpg',
      tags: ['data analitik', 'pemula', 'tutorial', 'python', 'sql']
    },
    'tips-karir-data-scientist-indonesia': {
      id: 'tips-karir-data-scientist-indonesia',
      title: 'Tips Karir Data Scientist di Indonesia',
      slug: 'tips-karir-data-scientist-indonesia',
      description: 'Tips dan strategi untuk sukses berkarir sebagai data scientist di Indonesia, dari pendidikan hingga networking.',
      content: `
        <h2>Pendidikan yang Tepat</h2>
        <p>Data scientist membutuhkan kombinasi keahlian teknis dan bisnis. Pendidikan yang relevan meliputi:</p>
        <ul>
          <li>S1 Teknik Informatika, Matematika, atau Statistika</li>
          <li>S2 Data Science atau bidang terkait</li>
          <li>Sertifikasi profesional dari platform terkemuka</li>
        </ul>
        
        <h2>Skills yang Harus Dikuasai</h2>
        <p>Beberapa skills krusial untuk data scientist:</p>
        <ul>
          <li><strong>Programming:</strong> Python, R, SQL</li>
          <li><strong>Machine Learning:</strong> Scikit-learn, TensorFlow, PyTorch</li>
          <li><strong>Data Visualization:</strong> Tableau, Power BI, Matplotlib</li>
          <li><strong>Business Acumen:</strong> Memahami bisnis dan domain knowledge</li>
        </ul>
        
        <h2>Networking dan Komunitas</h2>
        <p>Bergabung dengan komunitas data scientist Indonesia sangat penting:</p>
        <ul>
          <li>Ikuti meetup dan conference</li>
          <li>Bergabung di grup WhatsApp dan Telegram</li>
          <li>Aktif di LinkedIn dan GitHub</li>
        </ul>
      `,
      author: 'Sarah Putri, S.Kom., M.T.',
      date: '20 Januari 2024',
      readTime: '6',
      category: 'Karir',
      image: 'https://picsum.photos/seed/data-scientist-career/1200/600.jpg',
      tags: ['karir', 'data scientist', 'networking', 'indonesia']
    }
  };
  
  const blog = blogPosts[slug];
  
  if (!blog) {
    return res.status(404).render('404', {
      title: 'Blog Post Not Found',
      message: 'Maaf, artikel yang Anda cari tidak ditemukan.'
    });
  }
  
  // Get related blogs (exclude current blog)
  const relatedBlogs = Object.values(blogPosts)
    .filter(post => post.id !== blog.id)
    .slice(0, 3);
  
  res.render('blog-detail', {
    title: `${blog.title} - Blog GROW SYNERGY INDONESIA`,
    description: blog.description,
    keywords: blog.tags.join(', '),
    author: 'GROW SYNERGY INDONESIA',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: blog.title,
    ogDescription: blog.description,
    ogImage: blog.image,
    ogUrl: `https://grow-synergy-indonesia.com/blog/${slug}`,
    ogType: 'article',
    ogSiteName: 'GROW SYNERGY INDONESIA',
    twitterCard: 'summary_large_image',
    twitterTitle: blog.title,
    twitterDescription: blog.description,
    twitterImage: blog.image,
    canonical: `https://grow-synergy-indonesia.com/blog/${slug}`,
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    blog: blog,
    relatedBlogs: relatedBlogs,
    // Firebase configuration
    firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
    firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
    firebaseProjectId: "company-profile-grow-synergy",
    firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
    firebaseMessagingSenderId: "584312572709",
    firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
    firebaseMeasurementId: "G-PKLP3Y3F4F"
  });
});

// Admin Login Routes
app.get('/admin/login', (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - GROW SYNERGY INDONESIA',
    error: null
  });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication (in production, use proper hashing and database)
  const validCredentials = {
    'admin@growsynergy.com': 'admin123',
    'admin@grow-synergy.com': 'Mieayam1',
    'grow.synergy.id@gmail.com': 'admin123'
  };
  
  if (validCredentials[username] && validCredentials[username] === password) {
    // Set session (in production, use proper session management)
    req.session = req.session || {};
    req.session.isAuthenticated = true;
    req.session.user = username;
    
    // Redirect to dashboard
    res.redirect('/admin/dashboard');
  } else {
    // Show error
    res.render('admin/login', {
      title: 'Admin Login - GROW SYNERGY INDONESIA',
      error: 'Email atau password salah. Silakan coba lagi.'
    });
  }
});

app.get('/admin/dashboard', (req, res) => {
  // Check if authenticated (in production, use proper middleware)
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      console.log('🔍 Starting to fetch data from Firestore...');
      
      const [expertsSnapshot, portfoliosSnapshot, academiesSnapshot, blogsSnapshot, testimonialsSnapshot, heroSnapshot, aboutSnapshot] = await Promise.all([
        db.collection('experts').get(),
        db.collection('portfolios').get(),
        db.collection('academies').get(),
        db.collection('blogs').get(),
        db.collection('testimonials').get(),
        db.collection('heroSection').get(),
        db.collection('aboutSection').get()
      ]);

      const experts = expertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const portfolios = portfoliosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const academies = academiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const testimonials = testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const heroSections = heroSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const aboutSections = aboutSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('📊 Firestore Data Summary:');
      console.log(`  - Experts: ${experts.length} documents`);
      console.log(`  - Portfolios: ${portfolios.length} documents`);
      console.log(`  - Academies: ${academies.length} documents`);
      console.log(`  - Blogs: ${blogs.length} documents`);
      console.log(`  - Testimonials: ${testimonials.length} documents`);
      console.log(`  - Hero Sections: ${heroSections.length} documents`);
      console.log(`  - About Sections: ${aboutSections.length} documents`);

      if (experts.length > 0) {
        console.log('👤 Sample Expert:', experts[0]);
      }

      console.log('🎯 Rendering dashboard with data:');
      console.log('  - Stats object:', {
        experts: experts.length,
        portfolios: portfolios.length,
        academies: academies.length,
        blogs: blogs.length,
        testimonials: testimonials.length,
        heroSections: heroSections.length
      });
      console.log('  - Data object keys:', Object.keys({
        experts,
        portfolios,
        academies,
        blogs,
        testimonials,
        heroSections
      }));

      res.render('admin/dashboard', {
        title: 'Admin Dashboard - GROW SYNERGY INDONESIA',
        user: req.session.user,
        username: req.session.user,
        experts,
        portfolios,
        academies,
        blogs,
        testimonials,
        heroSections,
        aboutSections,
        stats: {
          experts: experts.length,
          portfolios: portfolios.length,
          academies: academies.length,
          blogs: blogs.length,
          testimonials: testimonials.length,
          heroSections: heroSections.length,
          aboutSections: aboutSections.length
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.render('admin/dashboard', {
        title: 'Admin Dashboard - GROW SYNERGY INDONESIA',
        user: req.session.user,
        username: req.session.user,
        experts: [],
        portfolios: [],
        academies: [],
        blogs: [],
        testimonials: [],
        heroSections: [],
        aboutSections: [],
        stats: {
          experts: 0,
          portfolios: 0,
          academies: 0,
          blogs: 0,
          testimonials: 0,
          heroSections: 0,
          aboutSections: 0
        },
        error: 'Failed to load data from Firestore'
      });
    }
  };

  fetchData();
});

app.get('/admin/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect to login page
    res.redirect('/admin/login');
  });
});

// Template debug route
app.get('/admin/debug-template', async (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  try {
    console.log('🔍 Debug route: Starting data fetch...');
    
    // Use the same Firebase connection as dashboard
    const [expertsSnapshot, portfoliosSnapshot, academiesSnapshot, blogsSnapshot, testimonialsSnapshot, heroSnapshot] = await Promise.all([
      db.collection('experts').get(),
      db.collection('portfolios').get(),
      db.collection('academies').get(),
      db.collection('blogs').get(),
      db.collection('testimonials').get(),
      db.collection('heroSection').get()
    ]);

    const experts = expertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const portfolios = portfoliosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const academies = academiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const testimonials = testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const heroSections = heroSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('📊 Debug route: Data fetched successfully');
    console.log(`  - Experts: ${experts.length}`);
    console.log(`  - Portfolios: ${portfolios.length}`);
    console.log(`  - Academies: ${academies.length}`);

    const debugData = {
      success: true,
      message: 'Template rendering debug info',
      timestamp: new Date().toISOString(),
      data: {
        experts: {
          count: experts.length,
          sample: experts.length > 0 ? experts[0] : null
        },
        portfolios: {
          count: portfolios.length,
          sample: portfolios.length > 0 ? portfolios[0] : null
        },
        academies: {
          count: academies.length,
          sample: academies.length > 0 ? academies[0] : null
        },
        blogs: {
          count: blogs.length,
          sample: blogs.length > 0 ? blogs[0] : null
        },
        testimonials: {
          count: testimonials.length,
          sample: testimonials.length > 0 ? testimonials[0] : null
        },
        heroSections: {
          count: heroSections.length,
          sample: heroSections.length > 0 ? heroSections[0] : null
        }
      },
      stats: {
        experts: experts.length,
        portfolios: portfolios.length,
        academies: academies.length,
        blogs: blogs.length,
        testimonials: testimonials.length,
        heroSections: heroSections.length
      },
      firebaseStatus: {
        initialized: !!admin.apps.length,
        dbAvailable: !!db,
        isMock: !!(db && db.collection && typeof db.collection === 'function'),
        initError: firebaseInitError
      }
    };
    
    res.json(debugData);
  } catch (error) {
    console.error('❌ Debug route error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      firebaseStatus: {
        initialized: !!admin.apps.length,
        dbAvailable: !!db
      }
    });
  }
});

// Environment variables debug route
app.get('/admin/debug-env', (req, res) => {
  const envStatus = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '✅ Set (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  res.json(envStatus);
});

// Public debug route to test Firebase connection
app.get('/debug-firebase', async (req, res) => {
  try {
    console.log('🔍 Public debug: Testing Firebase connection...');
    
    const [expertsSnapshot, portfoliosSnapshot, academiesSnapshot] = await Promise.all([
      db.collection('experts').limit(3).get(),
      db.collection('portfolios').limit(3).get(),
      db.collection('academies').limit(3).get()
    ]);

    const experts = expertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const portfolios = portfoliosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const academies = academiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      message: 'Firebase connection test successful',
      timestamp: new Date().toISOString(),
      firebaseStatus: {
        initialized: !!admin.apps.length,
        dbAvailable: !!db,
        isMock: !!(db && db.collection && typeof db.collection === 'function')
      },
      data: {
        experts: {
          count: experts.length,
          sample: experts.length > 0 ? experts[0] : null
        },
        portfolios: {
          count: portfolios.length,
          sample: portfolios.length > 0 ? portfolios[0] : null
        },
        academies: {
          count: academies.length,
          sample: academies.length > 0 ? academies[0] : null
        }
      }
    });
  } catch (error) {
    console.error('❌ Public debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      firebaseStatus: {
        initialized: !!admin.apps.length,
        dbAvailable: !!db
      }
    });
  }
});

// Debug route for Firestore connection
app.get('/admin/debug-firestore', async (req, res) => {
  try {
    const debugInfo = {
      firebaseInitialized: !!admin.apps.length,
      collections: {},
      errors: []
    };

    // Test connection to each collection
    const collections = ['experts', 'portfolios', 'academies', 'blogs', 'testimonials', 'heroSection'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        debugInfo.collections[collectionName] = {
          documentCount: snapshot.docs.length,
          sampleData: snapshot.docs.length > 0 ? {
            id: snapshot.docs[0].id,
            data: snapshot.docs[0].data()
          } : null
        };
      } catch (error) {
        debugInfo.collections[collectionName] = {
          error: error.message
        };
        debugInfo.errors.push(`${collectionName}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      debug: debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Seed data route for Firestore
app.get('/admin/seed-firestore', async (req, res) => {
  try {
    const sampleData = {
      experts: [
        {
          name: 'Dr. Ahmad Wijaya, M.Sc.',
          title: 'Data Science Expert & Founder',
          category: 'Data Science',
          experience: '10+ tahun',
          rating: '4.9',
          reviewCount: '156',
          image: '/images/experts/ahmad-wijaya.jpg',
          description: 'Expert dengan 10+ tahun pengalaman di bidang data science dan machine learning.'
        },
        {
          name: 'Sarah Putri, S.Kom., M.T.',
          title: 'Business Intelligence Specialist',
          category: 'Business Intelligence',
          experience: '8+ tahun',
          rating: '4.8',
          reviewCount: '124',
          image: '/images/experts/sarah-putri.jpg',
          description: 'Spesialis dalam business intelligence dan data visualization.'
        }
      ],
      portfolios: [
        {
          title: 'Retail Analytics Dashboard',
          category: 'Dashboard',
          client: 'PT. Retail Maju Indonesia',
          description: 'Dashboard real-time untuk monitoring sales dan inventory.',
          image: '/images/portfolios/retail-dashboard.jpg',
          impact: 'Meningkatkan efisiensi monitoring 40%'
        },
        {
          title: 'Customer Segmentation Analysis',
          category: 'Analytics',
          client: 'PT. E-Commerce Indonesia',
          description: 'Analisis segmentasi customer menggunakan machine learning.',
          image: '/images/portfolios/customer-segmentation.jpg',
          impact: 'Meningkatkan konversi 25%'
        }
      ],
      academies: [
        {
          title: 'Data Analyst Fundamentals',
          level: 'Pemula',
          duration: '3 bulan',
          price: 'Rp 5.000.000',
          rating: '4.8',
          students: 150,
          description: 'Kursus dasar-dasar analisis data dengan tools modern.',
          image: '/images/academies/data-analyst.jpg'
        },
        {
          title: 'Business Intelligence Professional',
          level: 'Menengah',
          duration: '4 bulan',
          price: 'Rp 8.000.000',
          rating: '4.9',
          students: 89,
          description: 'Pelajari business intelligence dari dasar hingga expert level.',
          image: '/images/academies/bi-professional.jpg'
        }
      ],
      blogs: [
        {
          title: 'Panduan Lengkap Data Analitik untuk Pemula',
          category: 'tutorial',
          author: 'Dr. Ahmad Wijaya',
          date: '2024-01-15',
          readTime: '10',
          description: 'Panduan lengkap untuk memulai karir di bidang data analitik.',
          image: '/images/blogs/data-analitik-pemula.jpg',
          content: 'Data analitik adalah proses menginspeksi, membersihkan, dan memodelkan data...'
        },
        {
          title: 'Tips Karir Data Scientist di Indonesia',
          category: 'career',
          author: 'Sarah Putri',
          date: '2024-01-20',
          readTime: '8',
          description: 'Tips dan trik untuk sukses berkarir sebagai data scientist.',
          image: '/images/blogs/career-data-scientist.jpg',
          content: 'Karir data scientist di Indonesia semakin menjanjikan...'
        }
      ],
      testimonials: [
        {
          name: 'Andi Pratama',
          position: 'Data Analyst',
          company: 'Tech Company Indonesia',
          rating: '5',
          testimonial: 'Excellent training program! Sangat membantu karir saya.',
          image: '/images/testimonials/andi-pratama.jpg'
        },
        {
          name: 'Siti Nurhaliza',
          position: 'Business Intelligence Manager',
          company: 'Retail Corp',
          rating: '5',
          testimonial: 'Very practical and useful. Highly recommended!',
          image: '/images/testimonials/siti-nurhaliza.jpg'
        }
      ],
      heroSection: [
        {
          title: 'Transformasi Karir dengan Data Analitik',
          subtitle: 'GROW SYNERGY INDONESIA',
          description: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
          backgroundImage: '/images/hero1.jpg',
          buttonText1: 'Mulai Belajar',
          buttonText2: 'Konsultasi Gratis'
        }
      ]
    };

    const results = {};
    
    for (const [collection, data] of Object.entries(sampleData)) {
      if (Array.isArray(data)) {
        results[collection] = [];
        for (const item of data) {
          const docRef = await db.collection(collection).add(item);
          results[collection].push({ id: docRef.id, ...item });
        }
      } else {
        const docRef = await db.collection(collection).add(data);
        results[collection] = { id: docRef.id, ...data };
      }
    }

    res.json({
      success: true,
      message: 'Sample data successfully added to Firestore',
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin API Routes
app.get('/api/admin/maintenance/status', (req, res) => {
  res.json({
    enabled: false,
    message: 'System is operating normally'
  });
});

// Admin Page Routes
app.get('/admin/hero-section', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch hero sections from Firestore
  db.collection('heroSection').get()
    .then(snapshot => {
      const heroSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/hero-section', {
        title: 'Hero Section Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        heroSections
      });
    })
    .catch(error => {
      console.error('Error fetching hero sections:', error);
      res.render('admin/hero-section', {
        title: 'Hero Section Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        heroSections: [],
        error: 'Failed to load hero sections'
      });
    });
});

app.get('/admin/about-section', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch about sections from Firestore
  db.collection('aboutSection').get()
    .then(snapshot => {
      const aboutSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/about-section', {
        title: 'About Section Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        aboutSections
      });
    })
    .catch(error => {
      console.error('Error fetching about sections:', error);
      res.render('admin/about-section', {
        title: 'About Section Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        aboutSections: [],
        error: 'Failed to load about sections'
      });
    });
});

app.get('/admin/experts', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch experts from Firestore
  db.collection('experts').get()
    .then(snapshot => {
      const experts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/experts', {
        title: 'Experts Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        experts
      });
    })
    .catch(error => {
      console.error('Error fetching experts:', error);
      res.render('admin/experts', {
        title: 'Experts Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        experts: [],
        error: 'Failed to load experts'
      });
    });
});

app.get('/admin/portfolios', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch portfolios from Firestore
  db.collection('portfolios').get()
    .then(snapshot => {
      const portfolios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/portfolios', {
        title: 'Portfolio Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        portfolios
      });
    })
    .catch(error => {
      console.error('Error fetching portfolios:', error);
      res.render('admin/portfolios', {
        title: 'Portfolio Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        portfolios: [],
        error: 'Failed to load portfolios'
      });
    });
});

app.get('/admin/academies', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch academies from Firestore
  db.collection('academies').get()
    .then(snapshot => {
      const academies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/academies', {
        title: 'Academy Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        academies
      });
    })
    .catch(error => {
      console.error('Error fetching academies:', error);
      res.render('admin/academies', {
        title: 'Academy Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        academies: [],
        error: 'Failed to load academies'
      });
    });
});

app.get('/admin/testimonials', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch testimonials from Firestore
  db.collection('testimonials').get()
    .then(snapshot => {
      const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/testimonials', {
        title: 'Testimonials Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        testimonials,
        // Firebase configuration
        firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
        firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
        firebaseProjectId: "company-profile-grow-synergy",
        firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
        firebaseMessagingSenderId: "584312572709",
        firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
        firebaseMeasurementId: "G-PKLP3Y3F4F"
      });
    })
    .catch(error => {
      console.error('Error fetching testimonials:', error);
      res.render('admin/testimonials', {
        title: 'Testimonials Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        testimonials: [],
        error: 'Failed to load testimonials',
        // Firebase configuration
        firebaseApiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
        firebaseAuthDomain: "company-profile-grow-synergy.firebaseapp.com",
        firebaseProjectId: "company-profile-grow-synergy",
        firebaseStorageBucket: "company-profile-grow-synergy.appspot.com",
        firebaseMessagingSenderId: "584312572709",
        firebaseAppId: "1:584312572709:web:1e0ad87867af7b878668cc",
        firebaseMeasurementId: "G-PKLP3Y3F4F"
      });
    });
});

app.get('/admin/blogs', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  // Fetch blogs from Firestore
  db.collection('blogs').get()
    .then(snapshot => {
      const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.render('admin/blogs', {
        title: 'Blog Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        blogs
      });
    })
    .catch(error => {
      console.error('Error fetching blogs:', error);
      res.render('admin/blogs', {
        title: 'Blog Management - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        blogs: [],
        error: 'Failed to load blogs'
      });
    });
});

// Admin Form Routes
app.get('/admin/hero-section-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/hero-section-form', {
    title: 'Add Hero Section - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/about-section-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/about-section-form', {
    title: 'Add About Section - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

// Experts CRUD Routes
app.post('/admin/experts-form', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const expertData = req.body;
  console.log('📝 Creating expert with data:', expertData);
  console.log('📝 Request body keys:', Object.keys(req.body));
  console.log('📝 Form data received:', JSON.stringify(req.body, null, 2));
  
  // Handle image upload
  if (req.file) {
    expertData.image = `/uploads/${req.file.filename}`;
    console.log('📝 Image uploaded:', req.file.filename);
  }
  
  db.collection('experts').add(expertData)
    .then(docRef => {
      console.log('Expert created with ID:', docRef.id);
      res.redirect('/admin/experts');
    })
    .catch(error => {
      console.error('Error creating expert:', error);
      res.status(500).send('Error creating expert');
    });
});

app.get('/admin/experts/edit/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const expertId = req.params.id;
  
  db.collection('experts').doc(expertId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.redirect('/admin/experts');
      }
      
      res.render('admin/experts-edit', {
        title: 'Edit Expert - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        expert: { id: doc.id, ...doc.data() }
      });
    })
    .catch(error => {
      console.error('Error fetching expert:', error);
      res.redirect('/admin/experts');
    });
});

app.post('/admin/experts/edit/:id', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const expertId = req.params.id;
  const expertData = req.body;
  
  console.log('📝 Updating expert:', expertId);
  console.log('📝 Expert data:', expertData);
  
  // Handle image upload
  if (req.file) {
    expertData.image = `/uploads/${req.file.filename}`;
    console.log('📝 New image uploaded:', req.file.filename);
  }
  
  db.collection('experts').doc(expertId).update(expertData)
    .then(() => {
      console.log('Expert updated:', expertId);
      res.redirect('/admin/experts');
    })
    .catch(error => {
      console.error('Error updating expert:', error);
      res.status(500).send('Error updating expert');
    });
});

app.delete('/admin/experts/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const expertId = req.params.id;
  
  db.collection('experts').doc(expertId).delete()
    .then(() => {
      console.log('Expert deleted:', expertId);
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting expert:', error);
      res.status(500).json({ error: 'Error deleting expert' });
    });
});

app.get('/admin/about-section-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/about-section-edit', {
    title: 'Edit About Section - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/experts-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/experts-form', {
    title: 'Add Expert - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/experts-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/experts-edit', {
    title: 'Edit Expert - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/portfolios-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/portfolios-form', {
    title: 'Add Portfolio - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/portfolios-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/portfolios-edit', {
    title: 'Edit Portfolio - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/academies-form-fixed', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/academies-form-fixed', {
    title: 'Add Academy - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/academies-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/academies-edit', {
    title: 'Edit Academy - Admin Dashboard',
    user: req.session.user,
    username: req.session.user,
    item: null
  });
});

app.get('/admin/blogs-form', (req, res) => {
  try {
    if (!req.session || !req.session.isAuthenticated) {
      return res.redirect('/admin/login');
    }
    console.log('Rendering blogs-form for user:', req.session.user);
    res.render('admin/blogs-form', {
      title: 'Add Blog - Admin Dashboard',
      user: req.session.user,
      username: req.session.user,
      item: null  // For create form (no existing item)
    });
  } catch (error) {
    console.error('Error rendering blogs-form:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

// Admin Create Routes (Redirect to forms)
app.get('/admin/experts/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/experts-form');
});

app.get('/admin/portfolios/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/portfolios-form');
});

app.get('/admin/academies/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/academies-form-fixed');
});

app.get('/admin/blogs/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/blogs-form');
});

app.get('/admin/hero-section/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/hero-section-form');
});

app.get('/admin/about-section/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/about-section-form');
});

// Portfolios CRUD Routes
app.post('/admin/portfolios-form', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const portfolioData = req.body;
  console.log('📝 Creating portfolio with data:', portfolioData);
  console.log('📝 Request body keys:', Object.keys(req.body));
  console.log('📝 Form data received:', JSON.stringify(req.body, null, 2));
  
  // Handle image upload
  if (req.file) {
    portfolioData.image = `/uploads/${req.file.filename}`;
    console.log('📝 Image uploaded:', req.file.filename);
  }
  
  db.collection('portfolios').add(portfolioData)
    .then(docRef => {
      console.log('Portfolio created with ID:', docRef.id);
      res.redirect('/admin/portfolios');
    })
    .catch(error => {
      console.error('Error creating portfolio:', error);
      res.status(500).send('Error creating portfolio');
    });
});

app.get('/admin/portfolios/edit/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const portfolioId = req.params.id;
  
  db.collection('portfolios').doc(portfolioId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.redirect('/admin/portfolios');
      }
      
      res.render('admin/portfolios-edit', {
        title: 'Edit Portfolio - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        portfolio: { id: doc.id, ...doc.data() }
      });
    })
    .catch(error => {
      console.error('Error fetching portfolio:', error);
      res.redirect('/admin/portfolios');
    });
});

app.post('/admin/portfolios/edit/:id', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const portfolioId = req.params.id;
  const portfolioData = req.body;
  
  console.log('📝 Updating portfolio:', portfolioId);
  console.log('📝 Portfolio data:', portfolioData);
  
  // Handle image upload
  if (req.file) {
    portfolioData.image = `/uploads/${req.file.filename}`;
    console.log('📝 New image uploaded:', req.file.filename);
  }
  
  db.collection('portfolios').doc(portfolioId).update(portfolioData)
    .then(() => {
      console.log('Portfolio updated:', portfolioId);
      res.redirect('/admin/portfolios');
    })
    .catch(error => {
      console.error('Error updating portfolio:', error);
      res.status(500).send('Error updating portfolio');
    });
});

app.delete('/admin/portfolios/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const portfolioId = req.params.id;
  
  db.collection('portfolios').doc(portfolioId).delete()
    .then(() => {
      console.log('Portfolio deleted:', portfolioId);
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting portfolio:', error);
      res.status(500).json({ error: 'Error deleting portfolio' });
    });
});

app.get('/admin/testimonials/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/testimonials-form');
});

// Academies CRUD Routes
app.post('/admin/academies-form-fixed', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const academyData = req.body;
  console.log('📝 Creating academy with data:', academyData);
  console.log('📝 Request body keys:', Object.keys(req.body));
  console.log('📝 Form data received:', JSON.stringify(req.body, null, 2));
  
  // Handle image upload
  if (req.file) {
    academyData.image = `/uploads/${req.file.filename}`;
    console.log('📝 Image uploaded:', req.file.filename);
  }
  
  db.collection('academies').add(academyData)
    .then(docRef => {
      console.log('Academy created with ID:', docRef.id);
      res.redirect('/admin/academies');
    })
    .catch(error => {
      console.error('Error creating academy:', error);
      res.status(500).send('Error creating academy');
    });
});

app.get('/admin/academies/edit/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const academyId = req.params.id;
  
  db.collection('academies').doc(academyId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.redirect('/admin/academies');
      }
      
      res.render('admin/academies-edit', {
        title: 'Edit Academy - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        academy: { id: doc.id, ...doc.data() }
      });
    })
    .catch(error => {
      console.error('Error fetching academy:', error);
      res.redirect('/admin/academies');
    });
});

app.post('/admin/academies/edit/:id', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const academyId = req.params.id;
  const academyData = req.body;
  
  console.log('📝 Updating academy:', academyId);
  console.log('📝 Academy data:', academyData);
  
  // Handle image upload
  if (req.file) {
    academyData.image = `/uploads/${req.file.filename}`;
    console.log('📝 New image uploaded:', req.file.filename);
  }
  
  db.collection('academies').doc(academyId).update(academyData)
    .then(() => {
      console.log('Academy updated:', academyId);
      res.redirect('/admin/academies');
    })
    .catch(error => {
      console.error('Error updating academy:', error);
      res.status(500).send('Error updating academy');
    });
});

app.delete('/admin/academies/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const academyId = req.params.id;
  
  db.collection('academies').doc(academyId).delete()
    .then(() => {
      console.log('Academy deleted:', academyId);
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting academy:', error);
      res.status(500).json({ error: 'Error deleting academy' });
    });
});

// Hero Section CRUD Routes
app.get('/admin/hero-section/edit/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const heroId = req.params.id;
  
  db.collection('heroSection').doc(heroId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.redirect('/admin/hero-section');
      }
      
      res.render('admin/hero-section-edit', {
        title: 'Edit Hero Section - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        heroSection: { id: doc.id, ...doc.data() }
      });
    })
    .catch(error => {
      console.error('Error fetching hero section:', error);
      res.redirect('/admin/hero-section');
    });
});

app.post('/admin/hero-section/edit/:id', upload.single('backgroundImage'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const heroId = req.params.id;
  const heroData = req.body;
  
  console.log('📝 Updating hero section:', heroId);
  console.log('📝 Hero data:', heroData);
  
  // Handle image upload
  if (req.file) {
    heroData.backgroundImage = `/uploads/${req.file.filename}`;
    console.log('📝 New image uploaded:', req.file.filename);
  }
  
  db.collection('heroSection').doc(heroId).update(heroData)
    .then(() => {
      console.log('Hero section updated:', heroId);
      res.redirect('/admin/hero-section');
    })
    .catch(error => {
      console.error('Error updating hero section:', error);
      res.status(500).send('Error updating hero section');
    });
});

app.delete('/admin/hero-section/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const heroId = req.params.id;
  
  db.collection('heroSection').doc(heroId).delete()
    .then(() => {
      console.log('Hero section deleted:', heroId);
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting hero section:', error);
      res.status(500).json({ error: 'Error deleting hero section' });
    });
});

// About Section CRUD Routes
app.get('/admin/about-section/edit/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const aboutId = req.params.id;
  
  db.collection('aboutSection').doc(aboutId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.redirect('/admin/about-section');
      }
      
      res.render('admin/about-section-edit', {
        title: 'Edit About Section - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        aboutSection: { id: doc.id, ...doc.data() }
      });
    })
    .catch(error => {
      console.error('Error fetching about section:', error);
      res.redirect('/admin/about-section');
    });
});

app.post('/admin/about-section/edit/:id', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const aboutId = req.params.id;
  const aboutData = req.body;
  
  console.log('📝 Updating about section:', aboutId);
  console.log('📝 About data:', aboutData);
  
  // Handle image upload
  if (req.file) {
    aboutData.image = `/uploads/${req.file.filename}`;
    console.log('📝 New image uploaded:', req.file.filename);
  }
  
  db.collection('aboutSection').doc(aboutId).update(aboutData)
    .then(() => {
      console.log('About section updated:', aboutId);
      res.redirect('/admin/about-section');
    })
    .catch(error => {
      console.error('Error updating about section:', error);
      res.status(500).send('Error updating about section');
    });
});

app.delete('/admin/about-section/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const aboutId = req.params.id;
  
  db.collection('aboutSection').doc(aboutId).delete()
    .then(() => {
      console.log('About section deleted:', aboutId);
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting about section:', error);
      res.status(500).json({ error: 'Error deleting about section' });
    });
});

// Blogs CRUD Routes
app.post('/admin/blogs/create', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const blogData = req.body;
  console.log('📝 Creating blog with data:', blogData);
  console.log('📝 Request body keys:', Object.keys(req.body));
  console.log('📝 Form data received:', JSON.stringify(req.body, null, 2));
  
  // Handle image upload
  if (req.file) {
    blogData.image = `/uploads/${req.file.filename}`;
    console.log('📝 Image uploaded:', req.file.filename);
  }
  
  db.collection('blogs').add(blogData)
    .then(docRef => {
      console.log('Blog created with ID:', docRef.id);
      res.redirect('/admin/blogs');
    })
    .catch(error => {
      console.error('Error creating blog:', error);
      res.status(500).send('Error creating blog');
    });
});

app.get('/admin/blogs/edit/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const blogId = req.params.id;
  
  db.collection('blogs').doc(blogId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.redirect('/admin/blogs');
      }
      
      res.render('admin/blogs-edit', {
        title: 'Edit Blog - Admin Dashboard',
        user: req.session.user,
        username: req.session.user,
        blog: { id: doc.id, ...doc.data() }
      });
    })
    .catch(error => {
      console.error('Error fetching blog:', error);
      res.redirect('/admin/blogs');
    });
});

app.post('/admin/blogs/edit/:id', upload.single('image'), (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  const blogId = req.params.id;
  const blogData = req.body;
  
  console.log('📝 Updating blog:', blogId);
  console.log('📝 Blog data:', blogData);
  
  // Handle image upload
  if (req.file) {
    blogData.image = `/uploads/${req.file.filename}`;
    console.log('📝 New image uploaded:', req.file.filename);
  }
  
  // Handle checkbox
  blogData.featured = req.body.featured === 'true';
  
  db.collection('blogs').doc(blogId).update(blogData)
    .then(() => {
      console.log('Blog updated:', blogId);
      res.redirect('/admin/blogs');
    })
    .catch(error => {
      console.error('Error updating blog:', error);
      res.status(500).send('Error updating blog');
    });
});

app.delete('/admin/blogs/:id', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const blogId = req.params.id;
  
  db.collection('blogs').doc(blogId).delete()
    .then(() => {
      console.log('Blog deleted:', blogId);
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Error deleting blog' });
    });
});

// API Routes
app.get('/api/hero-section', (req, res) => {
  console.log('🔥 Hero section API request received');
  const heroData = {
    backgroundImage: '/images/hero1.jpg',
    title: 'Transformasi Karir dengan Data Analitik',
    subtitle: 'GROW SYNERGY INDONESIA',
    description: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
    buttonText1: 'Mulai Belajar',
    buttonText2: 'Konsultasi Gratis'
  };
  res.json(heroData);
});

app.get('/api/firebase/data', (req, res) => {
  console.log('🔥 Firebase data request received');
  // Enhanced mock data for production use
  const mockData = {
    hero: {
      backgroundImage: '/images/hero1.jpg',
      title: 'Transformasi Karir dengan Data Analitik',
      description: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
      subtitle: 'Pelatihan intensif dengan mentor profesional dan proyek real-world',
      buttonText1: 'Mulai Belajar',
      buttonText2: 'Konsultasi Gratis'
    },
    about: {
      title: 'Tentang GROW SYNERGY INDONESIA',
      description: 'GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik terbaik di Indonesia. Kami menyediakan pelatihan intensif dengan instruktur profesional dan proyek real-world.',
      image: 'https://picsum.photos/seed/about-grow-synergy/600/400.jpg',
      features: [
        'Instruktur Profesional dengan 10+ tahun pengalaman',
        'Sertifikat Bersertifikat BNSP yang diakui industri',
        'Proyek Real-World dari perusahaan ternama',
        'Mentorship 1-on-1 untuk karir Anda',
        '100% Garansi Kerja untuk lulusan terbaik'
      ],
      stats: {
        students: '1000+',
        courses: '50+',
        instructors: '20+',
        successRate: '95%',
        partners: '15+'
      },
      buttonText1: 'Lihat Kursus',
      buttonText2: 'Testimoni Alumni'
    },
    experts: [
      {
        id: 'expert-1',
        name: 'Dr. Ahmad Wijaya, M.Sc.',
        title: 'Data Science Expert & Founder',
        organization: 'GROW SYNERGY INDONESIA',
        image: 'https://picsum.photos/seed/ahmad-wijaya/300/300.jpg',
        bio: 'Expert dengan 10+ tahun pengalaman di bidang data science dan machine learning. Alumni dari universitas ternama dengan publikasi internasional.',
        specialties: ['Data Science', 'Machine Learning', 'Python', 'SQL', 'Tableau'],
        experience: '10+ tahun',
        rating: 4.9,
        reviewCount: 156,
        education: 'S2, Data Science - Stanford University',
        certifications: ['Google Cloud Certified', 'AWS Certified Data Scientist']
      },
      {
        id: 'expert-2',
        name: 'Sarah Putri, S.Kom., M.T.',
        title: 'Business Intelligence Specialist',
        organization: 'GROW SYNERGY INDONESIA',
        image: 'https://picsum.photos/seed/sarah-putri/300/300.jpg',
        bio: 'Spesialis dalam business intelligence dan data visualization dengan pengalaman di berbagai industri seperti banking, retail, dan e-commerce.',
        specialties: ['Business Intelligence', 'Tableau', 'Power BI', 'Data Visualization', 'SQL'],
        experience: '8+ tahun',
        rating: 4.8,
        reviewCount: 124,
        education: 'S2, Information Systems - UIUC',
        certifications: ['Microsoft Certified BI Professional', 'Tableau Certified Associate']
      },
      {
        id: 'expert-3',
        name: 'Budi Santoso, S.E., M.M.',
        title: 'Data Analytics Consultant',
        organization: 'GROW SYNERGY INDONESIA',
        image: 'https://picsum.photos/seed/budi-santoso/300/300.jpg',
        bio: 'Konsultan data analytics dengan fokus pada implementasi solusi bisnis berbasis data. Berpengalaman membantu perusahaan mengoptimalkan proses bisnis.',
        specialties: ['Data Analytics', 'Business Analysis', 'R', 'Python', 'Excel', 'Power BI'],
        experience: '12+ tahun',
        rating: 4.7,
        reviewCount: 98,
        education: 'MBA, Business Analytics - University of Indonesia',
        certifications: ['SAS Certified Data Scientist', 'IBM Data Science Professional']
      },
      {
        id: 'expert-4',
        name: 'Maya Sari, S.Des.',
        title: 'UX/UI Design Specialist',
        organization: 'GROW SYNERGY INDONESIA',
        image: 'https://picsum.photos/seed/maya-sari/300/300.jpg',
        bio: 'Designer dengan fokus pada user experience untuk aplikasi data analytics dan dashboard. Membuat data kompleks menjadi mudah dipahami.',
        specialties: ['UX Design', 'UI Design', 'Figma', 'Adobe XD', 'Data Visualization'],
        experience: '6+ tahun',
        rating: 4.8,
        reviewCount: 87,
        education: 'S1, Design - BINUS',
        certifications: ['Google UX Design Certificate', 'Adobe Certified Expert']
      },
      {
        id: 'expert-5',
        name: 'Rizki Firmansyah, S.Kom.',
        title: 'Full Stack Developer',
        organization: 'GROW SYNERGY INDONESIA',
        image: 'https://picsum.photos/seed/rizki-firmansyah/300/300.jpg',
        bio: 'Full stack developer dengan expertise dalam membangun aplikasi web dan mobile untuk solusi data analytics dan business intelligence.',
        specialties: ['Web Development', 'Mobile Development', 'JavaScript', 'React', 'Node.js', 'Python'],
        experience: '7+ tahun',
        rating: 4.6,
        reviewCount: 76,
        education: 'S1, Computer Science - ITS',
        certifications: ['AWS Certified Developer', 'Google Cloud Developer']
      }
    ],
    portfolios: [
      {
        id: 'portfolio-1',
        title: 'Retail Analytics Dashboard',
        category: 'Dashboard',
        description: 'Dashboard real-time untuk monitoring sales dan inventory retail dengan visualisasi interaktif dan alert system otomatis.',
        image: 'https://picsum.photos/seed/retail-dashboard/600/400.jpg',
        technologies: ['Tableau', 'SQL', 'Python', 'D3.js'],
        client: 'PT. Retail Maju Indonesia',
        duration: '3 bulan',
        impact: 'Meningkatkan efisiensi monitoring 40%',
        link: '#'
      },
      {
        id: 'portfolio-2',
        title: 'Customer Segmentation Analysis',
        category: 'Analytics',
        description: 'Analisis segmentasi customer menggunakan machine learning untuk strategi pemasaran yang lebih efektif dan personalisasi pengalaman.',
        image: 'https://picsum.photos/seed/customer-segmentation/600/400.jpg',
        technologies: ['Python', 'Scikit-learn', 'Pandas', 'Jupyter'],
        client: 'PT. E-Commerce Indonesia',
        duration: '2 bulan',
        impact: 'Meningkatkan konversi 25%',
        link: '#'
      },
      {
        id: 'portfolio-3',
        title: 'Supply Chain Optimization',
        category: 'Optimization',
        description: 'Optimasi rantai pasok menggunakan analisis prediktif untuk mengurangi biaya dan meningkatkan efisiensi distribusi.',
        image: 'https://picsum.photos/seed/supply-chain/600/400.jpg',
        technologies: ['Python', 'R', 'SQL', 'Power BI'],
        client: 'PT. Logistics Nusantara',
        duration: '4 bulan',
        impact: 'Mengurangi biaya operasional 30%',
        link: '#'
      },
      {
        id: 'portfolio-4',
        title: 'Financial Risk Assessment Model',
        category: 'Finance',
        description: 'Model penilaian risiko keuangan menggunakan machine learning untuk deteksi fraud dan penilaian kredit otomatis.',
        image: 'https://picsum.photos/seed/financial-risk/600/400.jpg',
        technologies: ['Python', 'TensorFlow', 'SQL', 'Tableau'],
        client: 'PT. Bank Digital Indonesia',
        duration: '6 bulan',
        impact: 'Mengurangi risiko fraud 60%',
        link: '#'
      },
      {
        id: 'portfolio-5',
        title: 'HR Analytics Platform',
        category: 'HR',
        description: 'Platform analitik HR untuk monitoring kinerja karyawan, prediksi turnover, dan optimasi sumber daya manusia.',
        image: 'https://picsum.photos/seed/hr-analytics/600/400.jpg',
        technologies: ['Python', 'Streamlit', 'SQL', 'Power BI'],
        client: 'PT. Human Resources Indonesia',
        duration: '3 bulan',
        impact: 'Mengurangi turnover 20%',
        link: '#'
      }
    ],
    academies: [
      {
        id: 'academy-1',
        title: 'Data Analyst Fundamentals',
        level: 'Pemula',
        duration: '3 bulan',
        description: 'Kursus dasar-dasar analisis data dengan tools modern seperti Excel, SQL, dan Tableau. Cocok untuk pemula.',
        image: 'https://picsum.photos/seed/data-analyst-fundamentals/600/400.jpg',
        price: 'Rp 5.000.000',
        rating: 4.8,
        students: 150,
        schedule: 'Weekend (Sabtu & Minggu)',
        instructor: 'Dr. Ahmad Wijaya, M.Sc.',
        curriculum: ['Excel Advanced', 'SQL Fundamentals', 'Tableau Visualization', 'Data Analysis Basics'],
        certificate: 'BNSP Certified'
      },
      {
        id: 'academy-2',
        title: 'Business Intelligence Professional',
        level: 'Menengah',
        duration: '4 bulan',
        description: 'Pelajari business intelligence dari dasar hingga expert level dengan tools seperti Power BI, Tableau, dan SQL Server.',
        image: 'https://picsum.photos/seed/bi-professional/600/400.jpg',
        price: 'Rp 8.000.000',
        rating: 4.9,
        students: 89,
        schedule: 'Weekday (Senin-Jumat)',
        instructor: 'Sarah Putri, S.Kom., M.T.',
        curriculum: ['Power BI Advanced', 'SQL Server', 'Data Modeling', 'Dashboard Design', 'KPI Development'],
        certificate: 'Microsoft Certified'
      },
      {
        id: 'academy-3',
        title: 'Machine Learning Specialist',
        level: 'Lanjutan',
        duration: '6 bulan',
        description: 'Kursus machine learning komprehensif dari basic hingga advanced dengan Python, TensorFlow, dan real-world projects.',
        image: 'https://picsum.photos/seed/ml-specialist/600/400.jpg',
        price: 'Rp 15.000.000',
        rating: 4.9,
        students: 67,
        schedule: 'Flexible (Online + Offline)',
        instructor: 'Dr. Ahmad Wijaya, M.Sc.',
        curriculum: ['Python ML', 'TensorFlow', 'Neural Networks', 'Deep Learning', 'Computer Vision', 'NLP'],
        certificate: 'Google TensorFlow Developer'
      },
      {
        id: 'academy-4',
        title: 'Data Visualization Expert',
        level: 'Menengah',
        duration: '2 bulan',
        description: 'Kuasai visualisasi data yang efektif dengan D3.js, Tableau, dan Power BI untuk storytelling data yang menarik.',
        image: 'https://picsum.photos/seed/data-viz-expert/600/400.jpg',
        price: 'Rp 6.000.000',
        rating: 4.7,
        students: 45,
        schedule: 'Weekend (Sabtu & Minggu)',
        instructor: 'Maya Sari, S.Des.',
        curriculum: ['D3.js Advanced', 'Tableau Expert', 'Storytelling', 'Interactive Dashboard', 'Color Theory'],
        certificate: 'Tableau Certified'
      },
      {
        id: 'academy-5',
        title: 'SQL Database Mastery',
        level: 'Pemula',
        duration: '2 bulan',
        description: 'Master SQL dari dasar hingga advanced dengan fokus pada query optimization dan database design untuk analisis data.',
        image: 'https://picsum.photos/seed/sql-mastery/600/400.jpg',
        price: 'Rp 4.000.000',
        rating: 4.6,
        students: 98,
        schedule: 'Weekday (Senin-Jumat)',
        instructor: 'Budi Santoso, S.E., M.M.',
        curriculum: ['SQL Fundamentals', 'Advanced Queries', 'Database Design', 'Query Optimization', 'Stored Procedures'],
        certificate: 'Oracle Certified'
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

// Firebase SDK loading route
app.get('/firebase-sdk.js', (req, res) => {
  const firebaseSDK = `
    // Firebase App (the core Firebase SDK) is always required and must be listed first
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
    
    // Add Firebase products that you want to use
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics-compat.js");
    
    console.log('Firebase SDK loaded successfully');
  `;
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(firebaseSDK);
});

// Firebase config route
app.get('/firebase-config.js', (req, res) => {
  const firebaseConfig = `
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded. Please include Firebase scripts before this config.');
      return;
    }

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
      authDomain: "company-profile-grow-synergy.firebaseapp.com",
      projectId: "company-profile-grow-synergy",
      storageBucket: "company-profile-grow-synergy.appspot.com",
      messagingSenderId: "584312572709",
      appId: "1:584312572709:web:1e0ad87867af7b878668cc",
      measurementId: "G-PKLP3Y3F4F"
    };

    // Initialize Firebase only if not already initialized
    if (!firebase.apps.length) {
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

