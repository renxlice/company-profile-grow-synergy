import { Controller, Get, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { SeoService } from './seo/seo.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seoService: SeoService,
  ) {}

  @Get()
  async getHome(@Res() res: Response) {
    const seoData = await this.seoService.generateHomeSeo();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('index', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    });
  }

  @Get('synergy-experts')
  async getSynergyExperts(@Res() res: Response) {
    const seoData = await this.seoService.generateSynergyExpertsSeo();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('synergy-experts', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    });
  }

  @Get('synergy-portfolio')
  async getSynergyPortfolio(@Res() res: Response) {
    const seoData = await this.seoService.generateSynergyPortfolioSeo();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('synergy-portfolio', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    });
  }

  @Get('synergy-academy')
  async getSynergyAcademy(@Res() res: Response) {
    const seoData = await this.seoService.generateSynergyAcademySeo();
    const structuredDataJson = JSON.stringify(seoData.structuredData);
    
    return res.render('synergy-academy', {
      ...seoData,
      structuredDataJson,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    });
  }

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response) {
    const sitemap = await this.seoService.generateSitemap();
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  }

  @Get('robots.txt')
  getRobots(@Res() res: Response) {
    res.set('Content-Type', 'text/plain');
    res.send(this.seoService.generateRobotsTxt());
  }
}
