import { Injectable } from '@nestjs/common';

export interface AnalyticsData {
  totalVisitors: number;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    visitors: number;
    percentage: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  private events: any[] = [];

  async getAnalytics(): Promise<AnalyticsData> {
    return {
      totalVisitors: 15420,
      pageViews: 45680,
      uniqueVisitors: 12350,
      bounceRate: 32.5,
      avgSessionDuration: 245, // seconds
      topPages: [
        { path: '/', views: 12500, percentage: 27.4 },
        { path: '/courses', views: 8900, percentage: 19.5 },
        { path: '/training/data-analitik-pemula', views: 6700, percentage: 14.7 },
        { path: '/training/python-data-analitik', views: 5400, percentage: 11.8 },
        { path: '/about', views: 3200, percentage: 7.0 },
      ],
      trafficSources: [
        { source: 'Organic Search', visitors: 6800, percentage: 44.1 },
        { source: 'Direct', visitors: 4200, percentage: 27.2 },
        { source: 'Social Media', visitors: 2100, percentage: 13.6 },
        { source: 'Referral', visitors: 1500, percentage: 9.7 },
        { source: 'Email', visitors: 820, percentage: 5.3 },
      ],
      deviceBreakdown: [
        { device: 'Desktop', visitors: 8900, percentage: 57.7 },
        { device: 'Mobile', visitors: 5200, percentage: 33.7 },
        { device: 'Tablet', visitors: 1320, percentage: 8.6 },
      ],
    };
  }

  async trackEvent(eventData: any) {
    const event = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    this.events.push(event);
    
    return {
      success: true,
      eventId: event.id,
      message: 'Event tracked successfully',
    };
  }

  async getDashboardData() {
    const analytics = await this.getAnalytics();
    const recentEvents = this.events.slice(-10).reverse();

    return {
      analytics,
      recentEvents,
      summary: {
        totalEvents: this.events.length,
        todayEvents: this.events.filter(e => {
          const eventDate = new Date(e.timestamp);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        }).length,
        conversionRate: 12.5,
        avgTimeOnPage: 245,
      },
    };
  }

  async getEventsByType(eventType: string) {
    return this.events.filter(event => event.type === eventType);
  }

  async getEventsByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= start && eventDate <= end;
    });
  }
}
