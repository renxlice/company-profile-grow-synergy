# 🚀 DataAnalitik.id - Platform Pelatihan Data Analitik Terbaik di Indonesia

Platform pembelajaran data analitik yang dioptimasi untuk SEO dengan teknologi Nest.js modern. Website ini dirancang khusus untuk mendapat peringkat teratas di Google untuk kata kunci "pelatihan data analitik".

## 🎯 Fitur Utama

### 📈 SEO Optimization
- **Meta Tags Komprehensif**: Title, description, keywords yang dioptimasi
- **Structured Data (JSON-LD)**: Schema.org untuk EducationalOrganization
- **Open Graph & Twitter Cards**: Social media optimization
- **Sitemap.xml & Robots.txt**: Indexing optimal
- **Server-Side Rendering (SSR)**: Fast loading dan SEO-friendly
- **Clean URLs**: URL structure yang SEO-friendly

### 🎨 Desain Modern
- **Responsive Design**: Optimal di semua perangkat
- **Tailwind CSS**: Styling modern dan konsisten
- **Animasi Interaktif**: User experience yang menarik
- **Dark Mode Support**: Aksesibilitas maksimal

### 📚 Manajemen Kursus
- **Multi-level Courses**: Pemula hingga mahir
- **Instructor Profiles**: Informasi instruktur profesional
- **Student Reviews**: Rating dan testimoni
- **Progress Tracking**: Monitoring pembelajaran

### 📊 Analytics & Monitoring
- **Google Analytics Integration**: Traffic monitoring
- **Custom Analytics**: Event tracking
- **Performance Metrics**: Kecepatan dan optimasi
- **Conversion Tracking**: ROI measurement

## 🛠️ Teknologi Stack

### Backend
- **Nest.js**: Framework Node.js yang scalable
- **TypeScript**: Type safety dan better DX
- **Handlebars**: Template engine untuk SSR
- **Helmet**: Security middleware
- **Compression**: Performance optimization

### Frontend
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icons library
- **Custom JavaScript**: Interaktivitas dan analytics

### SEO Tools
- **Schema.org**: Structured data
- **Meta Tags**: Comprehensive SEO metadata
- **Sitemap Generation**: Auto-generated sitemaps
- **Robots.txt**: Search engine crawling rules

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone https://github.com/your-username/company-profile-grow-synergy.git
cd company-profile-grow-synergy
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. **Build dan run aplikasi**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

5. **Akses aplikasi**
- Website: http://localhost:3001
- API Documentation: http://localhost:3001/api
- Sitemap: http://localhost:3001/sitemap.xml
- Robots.txt: http://localhost:3001/robots.txt

## 📁 Project Structure

```
src/
├── app.module.ts           # Main application module
├── app.controller.ts       # Main controller (home, sitemap, robots)
├── app.service.ts          # Main application service
├── main.ts                 # Application bootstrap
├── seo/                    # SEO optimization
│   ├── seo.module.ts
│   ├── seo.service.ts      # SEO logic & structured data
│   └── seo.controller.ts   # SEO endpoints
├── training/               # Course management
│   ├── training.module.ts
│   ├── training.service.ts  # Course data & logic
│   └── training.controller.ts
├── analytics/              # Analytics & tracking
│   ├── analytics.module.ts
│   ├── analytics.service.ts
│   └── analytics.controller.ts
└── views/                  # Handlebars templates
    ├── layout.hbs          # Base layout with SEO
    └── index.hbs           # Home page

public/
├── css/
│   └── custom.css          # Custom styling
├── js/
│   └── main.js             # Frontend JavaScript
└── images/                 # Static images
```

## 🔧 Configuration

### Environment Variables
```bash
# Application
NODE_ENV=development
PORT=3001

# SEO
SITE_URL=https://your-domain.com
SITE_NAME=Pelatihan Data Analitik Indonesia
SITE_DESCRIPTION=Platform pelatihan data analitik terbaik di Indonesia

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Social Media
FACEBOOK_URL=https://facebook.com/your-page
TWITTER_URL=https://twitter.com/your-handle
LINKEDIN_URL=https://linkedin.com/company/your-company
```

## 🎯 SEO Strategy

### Keyword Targeting
- **Primary**: "pelatihan data analitik"
- **Secondary**: "kursus data analytics", "training data science"
- **Long-tail**: "pelatihan data analitik indonesia", "kursus data analyst online"

### Content Optimization
- **Title Tags**: Optimized untuk CTR
- **Meta Descriptions**: Compelling dan keyword-rich
- **Header Tags**: Proper H1-H6 hierarchy
- **Image Alt Text**: Descriptive dan keyword-optimized

### Technical SEO
- **Page Speed**: Optimized loading times
- **Mobile-First**: Responsive design
- **Schema Markup**: Rich snippets
- **Internal Linking**: Proper site structure

## 📊 Performance Monitoring

### Google Analytics Setup
1. Tambahkan `GOOGLE_ANALYTICS_ID` di environment variables
2. Tracking otomatis untuk:
   - Page views
   - Button clicks
   - Form submissions
   - Course enrollments

### Custom Analytics
- Event tracking via `/api/analytics/track`
- Dashboard analytics di `/api/analytics/dashboard`
- Real-time visitor monitoring

## 🚀 Deployment

### Production Deployment
```bash
# Build aplikasi
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY public/ ./public/
EXPOSE 3001
CMD ["node", "dist/main"]
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Website**: https://dataanalitik.id
- **Email**: info@dataanalitik.id
- **Phone**: +62 812-3456-7890
- **Address**: Jakarta, Indonesia

## 🎯 SEO Results Expected

Dengan implementasi SEO komprehensif ini, website diharapkan dapat:
- **Rank #1** untuk keyword "pelatihan data analitik" dalam 3-6 bulan
- **Increase organic traffic** hingga 300%
- **Improve conversion rate** hingga 15%
- **Reduce bounce rate** di bawah 40%
- **Achieve page speed score** 90+ di Google PageSpeed Insights

---

**Built with ❤️ using Nest.js and optimized for SEO success**