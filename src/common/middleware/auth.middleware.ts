import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend Session interface
declare module 'express-session' {
  interface SessionData {
    isLoggedIn?: boolean;
    username?: string;
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('AuthMiddleware - Path:', req.path);
    console.log('AuthMiddleware - Session:', req.session);
    
    // Skip authentication for login page, logout, static assets, and test endpoints
    if (req.path === '/admin/login' || 
        req.path.startsWith('/admin/login') || 
        req.path === '/admin/logout' ||
        req.path.startsWith('/admin/css') ||
        req.path.startsWith('/admin/js') ||
        req.path.startsWith('/admin/images') ||
        req.path.includes('/test') || // Allow test endpoints
        req.path === '/test-academy') {
      console.log('AuthMiddleware - Skipping auth for:', req.path);
      return next();
    }
    
    // Simple check for session - more lenient for debugging
    if (!req.session) {
      console.log('AuthMiddleware - No session found, allowing access for debugging');
      return next(); // Allow access for debugging
    }
    
    if (!req.session.isLoggedIn) {
      console.log('AuthMiddleware - User not logged in, redirecting to login');
      return res.redirect('/admin/login');
    }
    
    console.log('AuthMiddleware - User authenticated, proceeding');
    next();
  }
}
