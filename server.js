// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const exphbs = require('express-handlebars');
const session = require('express-session');
const admin = require('firebase-admin');
const multer = require('multer');
const adminAuthRoutes = require('./src/routes/adminAuth');
const adminRoutes = require('./src/routes/adminRoutes');
const { maintenanceMiddleware } = require('./src/middleware/maintenance');

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - Support both old and new upload paths for backward compatibility
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('public/uploads'));

// File upload middleware with Base64 encoding for production
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

// Convert uploaded file to Base64 for persistent storage
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    
    const fs = require('fs');
    fs.readFile(file.path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      const base64 = `data:${file.mimetype};base64,${data.toString('base64')}`;
      
      // Clean up temp file
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error cleaning up temp file:', unlinkErr);
      });
      
      resolve(base64);
    });
  });
};

// Ensure uploads directories exist for backward compatibility
const oldUploadsDir = path.join(__dirname, 'uploads');
const newUploadsDir = path.join(__dirname, 'public/uploads');

if (!fs.existsSync(oldUploadsDir)) {
  fs.mkdirSync(oldUploadsDir, { recursive: true });
  console.log('📁 Created old uploads directory:', oldUploadsDir);
}

if (!fs.existsSync(newUploadsDir)) {
  fs.mkdirSync(newUploadsDir, { recursive: true });
  console.log('📁 Created new uploads directory:', newUploadsDir);
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
      console.log('⚠️ Service account file not found at config/firebase-service-account.json, please use environment variables or service account file');
      throw new Error('Firebase credentials not found');
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

// Body parser middleware (moved before adminAuth routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use maintenance middleware after static files but before routes
app.use(maintenanceMiddleware);

// Admin authentication routes
app.use('/admin', adminAuthRoutes);

// Admin API routes
app.use('/api/admin', adminRoutes);

// Favicon route
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'public', 'images', 'logo_pt.png');
  res.sendFile(faviconPath, (err) => {
    if (err) res.status(404).send('Favicon not found');
  });
});

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Pelatihan Data Analitik Terbaik Indonesia - Platform Data Analitik Terbaik',
    description: 'Platform Pembelajaran Data Analitik Terbaik Di Indonesia Dengan Instruktur Profesional Dan Sertifikat Bersertifikat.',
    keywords: 'data analitik, platform pembelajaran, kursus data science, bootcamp data analyst',
    author: 'Pelatihan Data Analitik Terbaik Indonesia',
    robots: 'index, follow',
    googlebot: 'index, follow',
    ogTitle: 'Pelatihan Data Analitik Terbaik Indonesia - Platform Data Analitik Terbaik',
    ogDescription: 'Platform Pembelajaran Data Analitik Terbaik Di Indonesia Dengan Instruktur Profesional Dan Sertifikat Bersertifikat.',
    ogImage: 'https://grow-synergy-indonesia.com/images/og-image.jpg',
    ogUrl: 'https://grow-synergy-indonesia.com',
    ogType: 'website',
    ogSiteName: 'Pelatihan Data Analitik Terbaik Indonesia',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Pelatihan Data Analitik Terbaik Indonesia - Platform Data Analitik Terbaik',
    twitterDescription: 'Platform Pembelajaran Data Analitik Terbaik Di Indonesia Dengan Instruktur Profesional Dan Sertifikat Bersertifikat.',
    twitterImage: 'https://grow-synergy-indonesia.com/images/twitter-image.jpg',
    canonical: 'https://grow-synergy-indonesia.com',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
    structuredDataJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Grow Synergy Indonesia",
      "description": "Platform Pembelajaran Data Analitik Terbaik Di Indonesia Dengan Instruktur Profesional Dan Sertifikat Bersertifikat.",
      "url": "https://grow-synergy-indonesia.com",
      "provider": {
        "@type": "Organization",
        "name": "Grow Synergy Indonesia",
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
        "name": "Grow Synergy Indonesia",
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
        "name": "Grow Synergy Indonesia",
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
        "name": "Grow Synergy Indonesia",
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
app.get('/blog/:slug', async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 Looking for blog with slug: ${slug}`);
    
    // Validate slug parameter
    if (!slug || slug.trim() === '') {
      console.log(`❌ Invalid slug parameter: ${slug}`);
      return res.status(404).render('404', {
        title: 'Blog Not Found',
        message: 'Invalid blog URL'
      });
    }
    
    // Fetch blog from Firestore by slug
    const blogsSnapshot = await db.collection('blogs')
      .where('slug', '==', slug.trim())
      .limit(1)
      .get();
    
    if (blogsSnapshot.empty) {
      console.log(`❌ Blog not found with slug: ${slug}`);
      
      // Try to find by ID as fallback (in case slug is actually an ID)
      try {
        const blogByIdSnapshot = await db.collection('blogs').doc(slug).get();
        if (!blogByIdSnapshot.exists) {
          console.log(`❌ Blog not found by ID either: ${slug}`);
          
          // List all available blogs for debugging
          const allBlogsSnapshot = await db.collection('blogs').limit(5).get();
          const availableBlogs = allBlogsSnapshot.docs.map(doc => ({
            id: doc.id,
            slug: doc.data().slug,
            title: doc.data().title
          }));
          
          console.log('📋 Available blogs (first 5):', availableBlogs);
          
          return res.status(404).render('404', {
            title: 'Blog Not Found',
            message: `Blog dengan slug "${slug}" tidak ditemukan. Available blogs: ${availableBlogs.map(b => b.slug).join(', ') || 'None'}`
          });
        }
        var blog = { id: blogByIdSnapshot.id, ...blogByIdSnapshot.data() };
        console.log(`✅ Blog found by ID fallback: ${blog.title}`);
      } catch (idError) {
        console.error(`❌ Error checking blog by ID: ${idError}`);
        return res.status(500).render('500', {
          title: 'Server Error',
          message: 'Terjadi kesalahan saat mencari blog. Silakan coba lagi.'
        });
      }
    } else {
      var blog = { id: blogsSnapshot.docs[0].id, ...blogsSnapshot.docs[0].data() };
      console.log(`✅ Blog found by slug: ${blog.title}`);
    }
    
    // Validate blog data
    if (!blog.title) {
      console.log(`❌ Blog missing title: ${JSON.stringify(blog)}`);
      return res.status(500).render('500', {
        title: 'Server Error',
        message: 'Blog data is incomplete. Please contact administrator.'
      });
    }
    
    // Fetch related blogs (same category, exclude current blog)
    try {
      const relatedBlogsSnapshot = await db.collection('blogs')
        .where('category', '==', blog.category || 'Tutorial')
        .where('slug', '!=', slug)
        .limit(3)
        .get();
      
      const relatedBlogs = relatedBlogsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log(`📊 Found ${relatedBlogs.length} related blogs`);
    } catch (relatedError) {
      console.error('⚠️ Error fetching related blogs:', relatedError);
      var relatedBlogs = [];
    }
    
    // Render blog detail page
    res.render('blog-detail', {
      title: blog.title + ' - GROW SYNERGY INDONESIA',
      description: blog.excerpt || blog.description || blog.title,
      ogTitle: blog.title,
      ogDescription: blog.excerpt || blog.description || blog.title,
      ogImage: blog.image || 'https://picsum.photos/seed/blog-' + blog.id + '/1200/600.jpg',
      ogUrl: `https://growsynergyid.com/blog/${slug}`,
      ogType: 'article',
      ogSiteName: 'GROW SYNERGY INDONESIA',
      twitterCard: 'summary_large_image',
      twitterTitle: blog.title,
      twitterDescription: blog.excerpt || blog.description || blog.title,
      twitterImage: blog.image || 'https://picsum.photos/seed/blog-' + blog.id + '/1200/600.jpg',
      canonical: `https://growsynergyid.com/blog/${slug}`,
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
    
  } catch (error) {
    console.error('❌ Error loading blog detail:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).render('500', {
      title: 'Server Error',
      message: 'Terjadi kesalahan saat memuat blog. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin dashboard route (moved after adminAuth routes)

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
        db.collection('experts').get().catch(() => ({ docs: [] })),
        db.collection('portfolios').get().catch(() => ({ docs: [] })),
        db.collection('academies').get().catch(() => ({ docs: [] })),
        db.collection('blogs').get().catch(() => ({ docs: [] })),
        db.collection('testimonials').get().catch(() => ({ docs: [] })),
        db.collection('heroSection').get().catch(() => ({ docs: [] })),
        db.collection('aboutSection').get().catch(() => ({ docs: [] }))
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
app.post('/admin/experts-form', upload.single('image'), async (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  
  try {
    const expertData = req.body;
    console.log('📝 Creating expert with data:', expertData);
    
    // Convert image to Base64 for persistent storage
    if (req.file) {
      const base64Image = await convertToBase64(req.file);
      expertData.image = base64Image;
      console.log('📝 Image converted to Base64');
    }
    
    const docRef = await db.collection('experts').add(expertData);
    console.log('✅ Expert created with ID:', docRef.id);
    
    res.redirect('/admin/experts');
  } catch (error) {
    console.error('❌ Error creating expert:', error);
    res.status(500).send('Error creating expert');
  }
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

app.get('/api/firebase/data', async (req, res) => {
  console.log('🔥 Firebase data request received');
  try {
    // Fetch real data from Firestore
    const [blogsSnapshot, expertsSnapshot, portfoliosSnapshot, academiesSnapshot, testimonialsSnapshot, heroSectionsSnapshot, aboutSectionsSnapshot] = await Promise.all([
      db.collection('blogs').get(),
      db.collection('experts').get(),
      db.collection('portfolios').get(),
      db.collection('academies').get(),
      db.collection('testimonials').get(),
      db.collection('heroSection').get(),
      db.collection('aboutSection').get()
    ]);

    const blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const experts = expertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const portfolios = portfoliosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const academies = academiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const testimonials = testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const heroSections = heroSectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const aboutSections = aboutSectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('📊 Real data loaded from Firestore:');
    console.log(`  - Blogs: ${blogs.length} documents`);
    console.log(`  - Experts: ${experts.length} documents`);
    console.log(`  - Portfolios: ${portfolios.length} documents`);
    console.log(`  - Academies: ${academies.length} documents`);
    console.log(`  - Testimonials: ${testimonials.length} documents`);
    console.log(`  - Hero Sections: ${heroSections.length} documents`);
    console.log(`  - About Sections: ${aboutSections.length} documents`);

    // Return real data with fallbacks to mock data if collections are empty
    res.json({
      blogs: blogs.length > 0 ? blogs : [
        {
          title: 'Panduan Lengkap Data Analitik untuk Pemula',
          category: 'tutorial',
          author: 'Dr. Ahmad Wijaya',
          date: '2024-01-15',
          readTime: '10',
          description: 'Panduan lengkap untuk memulai karir di bidang data analitik.',
          image: '/images/blogs/data-analitik-pemula.jpg',
          content: 'Data analitik adalah proses menginspeksi, membersihkan, dan memodelkan data...'
        }
      ],
      experts: experts.length > 0 ? experts : [
        {
          id: 'expert-1',
          name: 'Dr. Ahmad Wijaya, M.Sc.',
          title: 'Data Science Expert & Founder',
          organization: 'GROW SYNERGY INDONESIA',
          image: 'https://picsum.photos/seed/ahmad-wijaya/300/300.jpg',
          bio: 'Expert dengan 10+ tahun pengalaman di bidang data science dan machine learning.',
          specialties: ['Data Science', 'Machine Learning', 'Python'],
          experience: '10+ tahun',
          rating: 4.9,
          reviewCount: 156
        }
      ],
      portfolios: portfolios.length > 0 ? portfolios : [],
      academies: academies.length > 0 ? academies : [],
      testimonials: testimonials.length > 0 ? testimonials : [],
      heroSection: heroSections.length > 0 ? heroSections : [
        {
          title: 'Transformasi Karir dengan Data Analitik',
          subtitle: 'GROW SYNERGY INDONESIA',
          description: 'Platform pembelajaran data analitik terbaik di Indonesia.',
          backgroundImage: '/images/hero1.jpg',
          buttonText1: 'Mulai Belajar',
          buttonText2: 'Konsultasi Gratis'
        }
      ],
      aboutSection: aboutSections.length > 0 ? aboutSections : []
    });
  } catch (error) {
    console.error('❌ Error fetching real data from Firestore:', error);
    // Fallback to mock data if Firestore fails
    const mockData = {
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
        }
      ],
      experts: [],
      portfolios: [],
      academies: [],
      testimonials: [],
      heroSection: [],
    };
    
    res.json(mockData);
  }
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

