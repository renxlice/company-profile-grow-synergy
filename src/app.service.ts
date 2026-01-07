import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Data Analytics Training Platform!';
  }

  async getAnalytics() {
    return {
      message: 'Data Analytics Training API',
      version: '1.0.0',
      status: 'active',
    };
  }
}
