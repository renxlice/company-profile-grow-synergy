import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Maintenance middleware: ${req.method} ${req.path}, maintenance mode: ${this.maintenanceService.isMaintenanceMode()}`);
    
    // Skip maintenance check for admin routes, login page, maintenance page, and API routes
    if (req.path.startsWith('/admin') || 
        req.path === '/maintenance' || 
        req.path === '/admin/login' ||
        req.path.startsWith('/api/admin') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/images') ||
        req.path.startsWith('/_next') || // Next.js static files
        req.path.includes('favicon.ico')) {
      console.log(`Maintenance middleware: skipping ${req.path}`);
      return next();
    }
    
    // If maintenance mode is active, show maintenance page
    if (this.maintenanceService.isMaintenanceMode()) {
      console.log(`Maintenance middleware: showing maintenance page for ${req.path}`);
      const fs = require('fs');
      const path = require('path');
      
      try {
        const maintenanceTemplate = fs.readFileSync(path.join(__dirname, '../../../views/maintenance.hbs'), 'utf8');
        
        // Simple template replacement
        let html = maintenanceTemplate
          .replace(/\{\{title\}\}/g, 'Maintenance Mode - GROW SYNERGY INDONESIA')
          .replace(/\{\{description\}\}/g, 'Website sedang dalam maintenance. Kami akan segera kembali.');
        
        return res.status(503).send(html);
      } catch (error) {
        console.error('Error rendering maintenance page:', error);
        return res.status(503).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Maintenance</title></head>
          <body>
              <h1>Website Under Maintenance</h1>
              <p>Kami akan segera kembali.</p>
          </body>
          </html>
        `);
      }
    }
    
    console.log(`Maintenance middleware: allowing ${req.path}`);
    next();
  }
}
