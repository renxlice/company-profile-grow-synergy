const express = require('express');
const path = require('path');
const fs = require('fs');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  
  res.render('admin/dashboard', {
    title: 'Admin Dashboard - GROW SYNERGY INDONESIA',
    user: req.session.user
  });
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
  res.render('admin/hero-section', {
    title: 'Hero Section Management - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/about-section', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/about-section', {
    title: 'About Section Management - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/experts', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/experts', {
    title: 'Experts Management - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/portfolios', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/portfolios', {
    title: 'Portfolio Management - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/academies', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/academies', {
    title: 'Academy Management - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/testimonials', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/testimonials', {
    title: 'Testimonials Management - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/blogs', (req, res) => {
  // Check if authenticated
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/blogs', {
    title: 'Blog Management - Admin Dashboard',
    user: req.session.user
  });
});

// Admin Form Routes
app.get('/admin/hero-section-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/hero-section-form', {
    title: 'Add Hero Section - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/about-section-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/about-section-form', {
    title: 'Add About Section - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/about-section-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/about-section-edit', {
    title: 'Edit About Section - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/experts-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/experts-form', {
    title: 'Add Expert - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/experts-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/experts-edit', {
    title: 'Edit Expert - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/portfolios-form', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/portfolios-form', {
    title: 'Add Portfolio - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/portfolios-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/portfolios-edit', {
    title: 'Edit Portfolio - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/academies-form-fixed', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/academies-form-fixed', {
    title: 'Add Academy - Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/academies-edit', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/academies-edit', {
    title: 'Edit Academy - Admin Dashboard',
    user: req.session.user
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
      username: req.session.user
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

app.get('/admin/testimonials/create', (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/admin/login');
  }
  res.redirect('/admin/testimonials-form');
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

