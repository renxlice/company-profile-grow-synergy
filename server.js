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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});

