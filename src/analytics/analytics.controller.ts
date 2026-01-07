import { Controller, Get, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics() {
    return this.analyticsService.getAnalytics();
  }

  @Post('track')
  async trackEvent(@Body() eventData: any) {
    return this.analyticsService.trackEvent(eventData);
  }

  @Get('dashboard')
  async getDashboardData() {
    return this.analyticsService.getDashboardData();
  }
}
