import { Controller, Get, Post, Body, Render, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppService } from './app.service';
import { SeoService } from './seo/seo.service';
import { ContentService } from './common/services/content.service';
import { BlogService } from './blog.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seoService: SeoService,
    private readonly contentService: ContentService,
    private readonly blogService: BlogService,
  ) {}

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    try {
      const faviconPath = join(process.cwd(), 'public', 'images', 'logo_pt.png');
      const favicon = readFileSync(faviconPath);
      res.setHeader('Content-Type', 'image/png');
      res.send(favicon);
    } catch (error) {
      res.status(404).send('Favicon not found');
    }
  }

  @Get()
  async getHome(@Res() res: Response) {
    const seoData = this.seoService.getHomeData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('index', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    });
  }

  @Get('api/hero-section')
  async getHeroSectionApi(@Res() res: Response) {
    try {
      const heroSections = await this.contentService.getHeroSectionsForFrontend();
      res.json(heroSections);
    } catch (error) {
      console.error('Error fetching hero sections:', error);
      res.status(500).json({ error: 'Failed to fetch hero sections' });
    }
  }

  @Get('home')
  async getHomeContent(@Res() res: Response) {
    const seoData = this.seoService.getHomeData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('index', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    });
  }

  @Get('synergy-experts')
  async getSynergyExperts(@Res() res: Response) {
    const seoData = this.seoService.getSynergyExpertsData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    // Get dynamic content from Firestore
    const heroSections = await this.contentService.getHeroSectionsForFrontend();
    const experts = await this.contentService.getExpertsForFrontend();
    
    return res.render('synergy-experts', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      heroSections,
      experts,
    });
  }

  @Get('synergy-portfolio')
  async getSynergyPortfolio(@Res() res: Response) {
    const seoData = this.seoService.getSynergyPortfolioData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    // Get dynamic content from Firestore
    const heroSections = await this.contentService.getHeroSectionsForFrontend();
    const portfolios = await this.contentService.getPortfoliosForFrontend();
    
    return res.render('synergy-portfolio', {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      structuredData: structuredDataJson,
      aboutSections: [],
      experts: [],
      academies: [],
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      heroSections,
      portfolios,
    });
  }

  @Get('synergy-academy')
  async getSynergyAcademy(@Res() res: Response) {
    const seoData = this.seoService.getSynergyAcademyData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    // Get dynamic content from Firestore
    const heroSections = await this.contentService.getHeroSectionsForFrontend();
    const academies = await this.contentService.getAcademiesForFrontend();
    
    return res.render('synergy-academy', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      heroSections,
      academies,
    });
  }

  @Get('about')
  async getAbout(@Res() res: Response) {
    const seoData = this.seoService.getAboutData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    // Get dynamic content from Firestore
    const heroSections = await this.contentService.getHeroSectionsForFrontend();
    
    return res.render('about', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      heroSections,
    });
  }

  @Get('blog')
  async getBlog(@Res() res: Response) {
    const seoData = {
      title: 'Blog Data Analitik | Tips, Tutorial & Insights Indonesia',
      description: 'Blog data analitik terbaik di Indonesia. Dapatkan tips, tutorial, dan insights tentang data science, machine learning, dan karir data analyst.',
      keywords: 'blog data analitik, tutorial data science, tips data analyst, machine learning indonesia, big data tutorial, karir data analyst',
      author: 'GROW SYNERGY INDONESIA',
      canonical: 'https://localhost:3001/blog',
      ogTitle: 'Blog Data Analitik | Tips, Tutorial & Insights Indonesia',
      ogDescription: 'Blog data analitik terbaik di Indonesia dengan tips, tutorial, dan insights tentang data science',
      ogImage: 'https://localhost:3001/images/blog-og-image.jpg',
      ogUrl: 'https://localhost:3001/blog',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Blog Data Analitik | Tips & Tutorial Indonesia',
      twitterDescription: 'Blog data analitik dengan tips, tutorial, dan insights untuk karir data analyst',
      twitterImage: 'https://localhost:3001/images/blog-twitter-image.jpg',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog Data Analitik GROW SYNERGY INDONESIA",
        "description": "Blog data analitik terbaik di Indonesia dengan tips, tutorial, dan insights tentang data science",
        "url": "https://localhost:3001/blog",
        "publisher": {
          "@type": "Organization",
          "name": "GROW SYNERGY INDONESIA",
          "logo": {
            "@type": "ImageObject",
            "url": "https://localhost:3001/images/logo_pt.png"
          }
        },
        "inLanguage": "id",
        "about": "Data Analytics, Data Science, Machine Learning, Big Data"
      }
    };
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    // Get dynamic content from Firestore
    const heroSections = await this.contentService.getHeroSectionsForFrontend();
    
    // Get blog data from service
    const blogs = await this.blogService.getAllBlogs();
    
    return res.render('blog', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      heroSections,
      blogs: blogs
    });
  }

  @Get('blog/:slug')
  async getBlogDetail(@Res() res: Response, @Param('slug') slug: string) {
    try {
      // Get blog data from service
      const blog = await this.blogService.getBlogBySlug(slug);
      
      if (!blog) {
        return res.status(404).render('404', {
          title: 'Article Not Found',
          message: 'The requested article could not be found.'
        });
      }

      // Generate SEO data for blog detail
      const seoData = {
        title: `${blog.metaTitle || blog.title} | Blog Data Analitik | GROW SYNERGY INDONESIA`,
        description: blog.metaDescription || blog.description,
        keywords: `${blog.tags.join(', ')}, data analitik, data science, machine learning, tutorial data, GROW SYNERGY INDONESIA`,
        author: blog.author,
        canonical: `https://localhost:3001/blog/${blog.slug}`,
        ogTitle: blog.metaTitle || blog.title,
        ogDescription: blog.metaDescription || blog.description,
        ogImage: blog.image,
        ogUrl: `https://localhost:3001/blog/${blog.slug}`,
        ogType: 'article',
        twitterCard: 'summary_large_image',
        twitterTitle: blog.metaTitle || blog.title,
        twitterDescription: blog.metaDescription || blog.description,
        twitterImage: blog.image,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "description": blog.metaDescription || blog.description,
          "url": `https://localhost:3001/blog/${blog.slug}`,
          "author": {
            "@type": "Person",
            "name": blog.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "GROW SYNERGY INDONESIA",
            "logo": {
              "@type": "ImageObject",
              "url": "https://localhost:3001/images/logo_pt.png"
            }
          },
          "datePublished": blog.createdAt instanceof Date ? blog.createdAt.toISOString() : blog.createdAt,
          "dateModified": blog.updatedAt instanceof Date ? blog.updatedAt.toISOString() : blog.updatedAt,
          "image": blog.image,
          "inLanguage": "id"
        }
      };
      
      const structuredDataJson = JSON.stringify(seoData.structuredData);
      
      // Get dynamic content from Firestore
      const heroSections = await this.contentService.getHeroSectionsForFrontend();
      
      // Get related blogs (excluding current blog)
      const allBlogs = await this.blogService.getAllBlogs();
      const relatedBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 3);
      
      return res.render('blog-detail', {
        ...seoData,
        structuredDataJson,
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
        // Firebase config from environment variables
        firebaseApiKey: process.env.FIREBASE_API_KEY || '',
        firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
        firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        firebaseAppId: process.env.FIREBASE_APP_ID || '',
        firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
        heroSections,
        slug: blog.slug,
        blog: blog,
        relatedBlogs: relatedBlogs
      });
    } catch (error) {
      console.error('Error fetching blog detail:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  @Get('partners')
  async getPartners(@Res() res: Response) {
    const seoData = {
      title: 'Partnership & Collaboration | GROW SYNERGY INDONESIA',
      description: 'Partnership opportunities dengan GROW SYNERGY INDONESIA. Kolaborasi dalam pelatihan data analitik, corporate training, dan educational partnerships.',
      keywords: 'partnership data analitik, collaboration training, corporate training indonesia, educational partnership, data analytics collaboration',
      author: 'GROW SYNERGY INDONESIA',
      canonical: 'https://localhost:3001/partners',
      ogTitle: 'Partnership & Collaboration | GROW SYNERGY INDONESIA',
      ogDescription: 'Partnership opportunities dalam pelatihan data analitik dan corporate training',
      ogImage: 'https://localhost:3001/images/partnership-og-image.jpg',
      ogUrl: 'https://localhost:3001/partners',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Partnership & Collaboration | GROW SYNERGY INDONESIA',
      twitterDescription: 'Partnership opportunities dalam pelatihan data analitik',
      twitterImage: 'https://localhost:3001/images/partnership-twitter-image.jpg',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "GROW SYNERGY INDONESIA",
        "url": "https://localhost:3001",
        "logo": "https://localhost:3001/images/logo_pt.png",
        "description": "Platform pelatihan data analitik dengan partnership opportunities untuk corporate training dan educational collaboration",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+62-812-3456-7890",
          "contactType": "business development",
          "availableLanguage": "Indonesian"
        },
        "sameAs": [
          "https://www.linkedin.com/company/grow-synergy-indonesia",
          "https://www.facebook.com/grow-synergy-indonesia"
        ]
      }
    };
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('partners', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      // Firebase config from environment variables
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    });
  }

  @Post('test-academy')
  testAcademy(@Body() body: any, @Res() res: Response) {
    console.log('=== APP CONTROLLER TEST ACADEMY ===');
    console.log('Received body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body));
    
    return res.json({
      message: 'App controller test endpoint working',
      received: body,
      keys: Object.keys(body),
      type: typeof body
    });
  }
}
