import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeoService {
  constructor(private configService: ConfigService) {}

  getHomeData() {
    return {
      title: 'Pelatihan Data Analitik Terbaik di Indonesia | Kursus Online Bersertifikat',
      description: 'Pelatihan data analitik profesional dengan instruktur berpengalaman. Dapatkan sertifikat dan karir impian Anda. Daftar sekarang!',
      keywords: 'pelatihan data analitik, kursus data analytics, training data science, belajar data analitik indonesia, data analyst course indonesia',
      author: 'GROW SYNERGY INDONESIA',
      canonical: 'https://localhost:3001',
      ogTitle: 'Pelatihan Data Analitik Terbaik di Indonesia',
      ogDescription: 'Platform pembelajaran data analitik dengan instruktur profesional dan sertifikat bersertifikat',
      ogImage: 'https://localhost:3001/images/og-image.jpg',
      ogUrl: 'https://localhost:3001',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Pelatihan Data Analitik Terbaik di Indonesia',
      twitterDescription: 'Platform pembelajaran data analitik dengan instruktur profesional',
      twitterImage: 'https://localhost:3001/images/twitter-image.jpg',
      structuredData: this.generateStructuredData(),
    };
  }

  getAboutData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      title: 'Tentang Kami - Platform Pelatihan Data Analitik Terbaik | GROW SYNERGY INDONESIA',
      description: 'Tentang GROW SYNERGY INDONESIA - Platform pembelajaran data analitik dengan instruktur profesional dan kurikulum yang relevan untuk kebutuhan industri.',
      keywords: 'tentang kami, grow synergy indonesia, platform data analitik, training center indonesia, kursus profesional',
      author: siteName,
      canonical: `${siteUrl}/about`,
      ogTitle: 'Tentang Kami - GROW SYNERGY INDONESIA',
      ogDescription: 'Platform pembelajaran data analitik dengan komitmen untuk mengembangkan talenta digital Indonesia',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: `${siteUrl}/about`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Tentang Kami - GROW SYNERGY INDONESIA',
      twitterDescription: 'Platform pembelajaran data analitik dengan instruktur profesional',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateAboutStructuredData(),
    };
  }

  getSynergyAcademyData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      title: 'Synergy Academy - Program Pelatihan Data Analitik | GROW SYNERGY INDONESIA',
      description: 'Synergy Academy menawarkan program pelatihan data analitik, data science, dan web development dengan instruktur profesional dan sertifikat bersertifikat.',
      keywords: 'synergy academy, pelatihan data analitik, kursus data science, web development course, bootcamp indonesia',
      author: siteName,
      canonical: `${siteUrl}/synergy-academy`,
      ogTitle: 'Synergy Academy - Program Pelatihan Profesional',
      ogDescription: 'Program pelatihan komprehensif dengan kurikulum yang relevan dan instruktur berpengalaman',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: `${siteUrl}/synergy-academy`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Academy - Program Pelatihan',
      twitterDescription: 'Pelatihan profesional dengan sertifikat bersertifikat',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateSynergyAcademyStructuredData(),
    };
  }

  getSynergyExpertsData() {
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

  getSynergyPortfolioData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      title: 'Synergy Portfolio - Koleksi Project Terbaik | GROW SYNERGY INDONESIA',
      description: 'Portfolio proyek dan keberhasilan klien kami dalam berbagai bidang teknologi. Lihat hasil kerja tim ahli kami.',
      keywords: 'synergy portfolio, project showcase, web development portfolio, data science projects, client success stories',
      author: siteName,
      canonical: `${siteUrl}/synergy-portfolio`,
      ogTitle: 'Synergy Portfolio - Project Showcase',
      ogDescription: 'Koleksi proyek terbaik dari tim ahli kami dalam data science, web development, dan mobile development',
      ogImage: `${siteUrl}/images/og-image.jpg`,
      ogUrl: `${siteUrl}/synergy-portfolio`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Synergy Portfolio - Project Showcase',
      twitterDescription: 'Project terbaik dari tim ahli kami',
      twitterImage: `${siteUrl}/images/twitter-image.jpg`,
      structuredData: this.generateSynergyPortfolioStructuredData(),
    };
  }

  generateStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": siteName,
      "url": siteUrl,
      "logo": `${siteUrl}/images/logo.png`,
      "description": "Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan kurikulum yang komprehensif",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ID"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+62-xxx-xxxx",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://facebook.com/growsynergyindonesia",
        "https://instagram.com/growsynergyindonesia",
        "https://linkedin.com/company/grow-synergy-indonesia"
      ]
    };
  }

  generateAboutStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    const siteName = this.configService.get<string>('SITE_NAME') || 'GROW SYNERGY INDONESIA';
    
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
      "logo": `${siteUrl}/images/logo.png`,
      "description": "Platform pembelajaran data analitik dengan instruktur profesional dan kurikulum yang relevan untuk kebutuhan industri",
      "foundingDate": "2023",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ID"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+62-xxx-xxxx",
        "contactType": "customer service"
      }
    };
  }

  generateSynergyAcademyStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Data Analytics Training",
      "description": "Program pelatihan data analitik komprehensif dengan instruktur profesional",
      "provider": {
        "@type": "Organization",
        "name": "GROW SYNERGY INDONESIA",
        "url": siteUrl
      },
      "educationalLevel": "Beginner to Advanced",
      "inLanguage": "id",
      "offers": {
        "@type": "Offer",
        "price": "IDR 5000000",
        "priceCurrency": "IDR"
      }
    };
  }

  generateSynergyExpertsStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Synergy Experts - GROW SYNERGY INDONESIA",
      "description": "Tim instruktur profesional dengan pengalaman lebih dari 10 tahun di berbagai bidang industri",
      "url": `${siteUrl}/synergy-experts`,
      "logo": `${siteUrl}/images/logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+62-xxx-xxxx",
        "contactType": "customer service"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ID"
      }
    };
  }

  generateSynergyPortfolioStructuredData() {
    const siteUrl = this.configService.get<string>('SITE_URL') || 'https://localhost:3001';
    
    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": "Synergy Portfolio",
      "description": "Koleksi proyek terbaik dari tim ahli kami",
      "url": `${siteUrl}/synergy-portfolio`,
      "creator": {
        "@type": "Organization",
        "name": "GROW SYNERGY INDONESIA"
      }
    };
  }
}
