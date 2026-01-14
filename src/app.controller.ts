import { Controller, Get, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { SeoService } from './seo/seo.service';
import { ContentService } from './common/services/content.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seoService: SeoService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  async getHome(@Res() res: Response) {
    const seoData = this.seoService.getHomeData();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('index', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
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
      heroSections,
    });
  }

  }
