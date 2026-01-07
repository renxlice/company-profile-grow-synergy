import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeoService {
  constructor(private configService: ConfigService) {}

  generateHomeSeo() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'Pelatihan Data Analitik Indonesia';
    
    return {
      title: 'Pelatihan Data Analitik Terbaik di Indonesia | Kursus Online Bersertifikat',
      description: 'Pelatihan data analitik profesional dengan instruktur berpengalaman. Dapatkan sertifikat dan karir impian Anda. Daftar sekarang!',
      keywords: 'pelatihan data analitik, kursus data analytics, training data science, belajar data analitik indonesia, data analyst course indonesia',
      author: siteName,
      canonical: siteUrl,
      ogTitle: 'Pelatihan Data Analitik Terbaik di Indonesia',
      ogDescription: 'Platform pembelajaran data analitik dengan instruktur profesional dan sertifikat bersertifikat',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: siteUrl,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Pelatihan Data Analitik Terbaik di Indonesia',
      twitterDescription: 'Platform pembelajaran data analitik dengan instruktur profesional',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateStructuredData(),
    };
  }

  generateSynergyExpertsSeo() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      title: 'Synergy Experts - Tim Instruktur Profesional | GROW SYNERGY INDONESIA',
      description: 'Temui tim instruktur profesional kami dengan pengalaman lebih dari 10 tahun di berbagai bidang industri. Expert dalam data science, web development, UI/UX design, dan mobile development.',
      keywords: 'synergy experts, instruktur profesional, data science expert, web development expert, UI/UX designer, mobile developer, trainer indonesia',
      author: siteName,
      canonical: `${siteUrl}/synergy-experts`,
      ogTitle: 'Synergy Experts - Tim Instruktur Profesional',
      ogDescription: 'Tim instruktur berpengalaman dengan dedikasi tinggi untuk mengembangkan talenta digital Indonesia',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: `${siteUrl}/synergy-experts`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Experts - Tim Instruktur Profesional',
      twitterDescription: 'Expert instruktur dengan pengalaman industri terkemuka',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateSynergyExpertsStructuredData(),
    };
  }

  generateSynergyPortfolioSeo() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      title: 'Synergy Portofolio - Project Terbaik | GROW SYNERGY INDONESIA',
      description: 'Lihat koleksi project terbaik dari alumni dan tim kami dalam berbagai bidang teknologi. Web development, mobile apps, UI/UX design, dan data science projects.',
      keywords: 'synergy portfolio, project showcase, web development portfolio, mobile app portfolio, UI/UX design portfolio, data science projects',
      author: siteName,
      canonical: `${siteUrl}/synergy-portfolio`,
      ogTitle: 'Synergy Portofolio - Project Terbaik',
      ogDescription: 'Koleksi project terbaik dari alumni dan tim kami dalam berbagai bidang teknologi',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: `${siteUrl}/synergy-portfolio`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Portofolio - Project Terbaik',
      twitterDescription: 'Project-project terbaik dari alumni dan tim kami',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateSynergyPortfolioStructuredData(),
    };
  }

  generateSynergyAcademySeo() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      title: 'Synergy Academy - Program Pelatihan Terbaik | GROW SYNERGY INDONESIA',
      description: 'Platform pembelajaran terbaik dengan program pelatihan berkualitas. Data science, web development, mobile development, UI/UX design dengan sertifikat.',
      keywords: 'synergy academy, program pelatihan, kursus online, data science course, web development training, mobile development bootcamp, UI/UX design course',
      author: siteName,
      canonical: `${siteUrl}/synergy-academy`,
      ogTitle: 'Synergy Academy - Program Pelatihan Terbaik',
      ogDescription: 'Platform pembelajaran dengan kurikulum relevan dan instruktur profesional',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: `${siteUrl}/synergy-academy`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Academy - Program Pelatihan Terbaik',
      twitterDescription: 'Program pelatihan berkualitas dengan sertifikat yang diakui',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateSynergyAcademyStructuredData(),
    };
  }

  generateStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Pelatihan Data Analitik Indonesia',
      description: 'Platform pelatihan data analitik terbaik di Indonesia dengan instruktur profesional',
      url: siteUrl,
      logo: `${siteUrl}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-812-3456-7890',
        contactType: 'customer service',
        availableLanguage: ['Indonesian', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ID',
        addressLocality: 'Jakarta',
        addressRegion: 'DKI Jakarta',
      },
      sameAs: [
        'https://facebook.com/your-page',
        'https://twitter.com/your-handle',
        'https://linkedin.com/company/your-company',
      ],
      offers: {
        '@type': 'Offer',
        category: 'Educational Services',
        name: 'Pelatihan Data Analitik',
        description: 'Kursus komprehensif data analitik untuk pemula hingga mahir',
        priceCurrency: 'IDR',
        price: '2999000',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  generateSynergyExpertsStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Synergy Experts - GROW SYNERGY INDONESIA',
      description: 'Tim instruktur profesional dengan pengalaman lebih dari 10 tahun di berbagai bidang industri',
      url: `${siteUrl}/synergy-experts`,
      logo: `${siteUrl}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-812-3456-7890',
        contactType: 'customer service',
        availableLanguage: ['Indonesian', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ID',
        addressLocality: 'Jakarta',
        addressRegion: 'DKI Jakarta',
      },
      sameAs: [
        'https://facebook.com/your-page',
        'https://twitter.com/your-handle',
        'https://linkedin.com/company/your-company',
      ],
      offers: {
        '@type': 'Offer',
        category: 'Educational Services',
        name: 'Pelatihan dengan Expert Instruktur',
        description: 'Belajar dari instruktur berpengalaman dengan background industri terkemuka',
        priceCurrency: 'IDR',
        price: '2999000',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  generateSynergyPortfolioStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Synergy Portofolio - GROW SYNERGY INDONESIA',
      description: 'Koleksi project terbaik dari alumni dan tim kami dalam berbagai bidang teknologi',
      url: `${siteUrl}/synergy-portfolio`,
      logo: `${siteUrl}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-812-3456-7890',
        contactType: 'customer service',
        availableLanguage: ['Indonesian', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ID',
        addressLocality: 'Jakarta',
        addressRegion: 'DKI Jakarta',
      },
      sameAs: [
        'https://facebook.com/your-page',
        'https://twitter.com/your-handle',
        'https://linkedin.com/company/your-company',
      ],
      offers: {
        '@type': 'Offer',
        category: 'Educational Services',
        name: 'Project Showcase',
        description: 'Lihat project-project terbaik dari alumni dan tim kami',
        priceCurrency: 'IDR',
        price: '0',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  generateSynergyAcademyStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Synergy Academy - GROW SYNERGY INDONESIA',
      description: 'Platform pembelajaran terbaik dengan program pelatihan berkualitas dan instruktur profesional',
      url: `${siteUrl}/synergy-academy`,
      logo: `${siteUrl}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-812-3456-7890',
        contactType: 'customer service',
        availableLanguage: ['Indonesian', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ID',
        addressLocality: 'Jakarta',
        addressRegion: 'DKI Jakarta',
      },
      sameAs: [
        'https://facebook.com/your-page',
        'https://twitter.com/your-handle',
        'https://linkedin.com/company/your-company',
      ],
      offers: {
        '@type': 'Offer',
        category: 'Educational Services',
        name: 'Program Pelatihan',
        description: 'Program pelatihan berkualitas dengan sertifikat yang diakui secara nasional',
        priceCurrency: 'IDR',
        price: '2999000',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  async generateSitemap() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const currentDate = new Date().toISOString().split('T')[0];

    const urls = [
      {
        loc: siteUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0',
      },
      {
        loc: `${siteUrl}/courses`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '0.8',
      },
      {
        loc: `${siteUrl}/about`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.6',
      },
      {
        loc: `${siteUrl}/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.5',
      },
    ];

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach((url) => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${url.loc}</loc>\n`;
      sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${url.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
  }

  generateRobotsTxt() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow specific paths if needed
# Disallow: /admin/
# Disallow: /private/`;
  }

  generateMetaTags(seoData: any) {
    return {
      title: seoData.title,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: seoData.description },
        { name: 'keywords', content: seoData.keywords },
        { name: 'author', content: seoData.author },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { property: 'og:title', content: seoData.ogTitle },
        { property: 'og:description', content: seoData.ogDescription },
        { property: 'og:image', content: seoData.ogImage },
        { property: 'og:url', content: seoData.ogUrl },
        { property: 'og:type', content: seoData.ogType },
        { property: 'og:site_name', content: seoData.siteName },
        { name: 'twitter:card', content: seoData.twitterCard },
        { name: 'twitter:title', content: seoData.twitterTitle },
        { name: 'twitter:description', content: seoData.twitterDescription },
        { name: 'twitter:image', content: seoData.twitterImage },
      ],
      link: [
        { rel: 'canonical', href: seoData.canonical },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    };
  }
}
