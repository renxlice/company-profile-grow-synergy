import { Controller, Get, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('meta-tags')
  async getMetaTags() {
    const seoData = this.seoService.generateHomeSeo();
    return this.seoService.generateMetaTags(seoData);
  }

  @Get('structured-data')
  getStructuredData() {
    return this.seoService.generateStructuredData();
  }
}
