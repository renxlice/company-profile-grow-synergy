import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Session,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';

@Controller('api/admin')
export class AdminApiController {
  // Maintenance Mode Management
  @Get('maintenance/status')
  async getMaintenanceStatus(@Res() res: Response) {
    try {
      console.log('API Maintenance status route hit');
      
      // TEMPORARILY SKIP SESSION CHECK FOR TESTING
      // Use global maintenance functions
      const status = (global as any).isMaintenanceMode();
      console.log('Maintenance status:', status);
      
      return res.json({
        maintenanceMode: status,
        message: status ? 'Maintenance mode is active' : 'Maintenance mode is inactive'
      });
    } catch (error) {
      console.error('Get maintenance status error:', error);
      return res.status(500).json({ error: 'Failed to get maintenance status' });
    }
  }

  @Post('maintenance/toggle')
  async toggleMaintenanceMode(@Body() body: { enable?: boolean }, @Req() req: Request, @Res() res: Response) {
    try {
      console.log('=== SIMPLE MAINTENANCE TOGGLE ===');
      console.log('Request body:', body);
      console.log('Request origin:', req.headers.origin);
      console.log('Request referer:', req.headers.referer);
      
      const { enable } = body;
      console.log('Toggle request - enable:', enable);
      
      // TEMPORARILY SKIP SESSION CHECK FOR TESTING
      // Only basic validation
      if (enable === undefined || enable === null) {
        return res.status(400).json({ error: 'Invalid request. enable parameter is required.' });
      }
      
      // Use global maintenance functions
      const result = (global as any).toggleMaintenance(enable);
      console.log('Toggle result:', result);
      console.log('=== END SIMPLE TOGGLE ===');
      
      return res.json({
        success: result.success,
        maintenanceMode: result.maintenanceMode,
        message: enable ? 'Maintenance mode enabled' : 'Maintenance mode disabled'
      });
    } catch (error) {
      console.error('Toggle maintenance mode error:', error);
      return res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
  }
}
