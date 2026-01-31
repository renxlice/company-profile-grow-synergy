import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressHandlebars from 'express-handlebars';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    isLoggedIn?: boolean;
    username?: string;
  }
}

// Global maintenance state
// Start with maintenance mode disabled, but allow control in production
let maintenanceMode = false;

// Toggle maintenance mode
const toggleMaintenance = (enable = true) => {
    // Allow maintenance toggle in both development and production
    // Only show maintenance page in production
    maintenanceMode = enable;
    console.log(`Maintenance mode ${enable ? 'enabled' : 'disabled'} (${process.env.NODE_ENV || 'development'} mode)`);
    return { success: true, maintenanceMode: maintenanceMode };
};

// Check if maintenance mode is active
const isMaintenanceMode = () => {
    return maintenanceMode;
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Make maintenance functions available globally
  (global as any).toggleMaintenance = toggleMaintenance;
  (global as any).isMaintenanceMode = isMaintenanceMode;

  console.log(`\n=== SERVER STARTED ===`);
  console.log(`Server running on port 3001`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Maintenance mode: ${isMaintenanceMode() ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`Development protection: ${process.env.NODE_ENV === 'development' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Current time: ${new Date().toISOString()}`);
  console.log(`=== MAINTENANCE MODE CONTROLS ===`);
  console.log(`- Global functions available: toggleMaintenance(), isMaintenanceMode()`);
  console.log(`=== SERVER STARTED ===\n`);

  // Setup Handlebars view engine
  // Always use src/views for development (npm run start:dev)
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('__dirname:', __dirname);
  
  if (process.env.NODE_ENV !== 'production') {
    // Development mode - use src/views directly
    // __dirname = dist/src, so we need to go up two levels to reach root, then to src/views
    const viewsPath = join(__dirname, '..', '..', 'src', 'views');
    console.log('Using development views path:', viewsPath);
    app.setBaseViewsDir(viewsPath);
  } else {
    // Production mode - use compiled views
    const viewsPath = join(__dirname, 'views');
    console.log('Using production views path:', viewsPath);
    app.setBaseViewsDir(viewsPath);
  }
  
  // Static file serving for uploads only
  app.use('/uploads', (req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    
    let filePath;
    if (process.env.NODE_ENV !== 'production') {
      // Development mode - use public folder directly
      filePath = path.join(__dirname, '..', '..', 'public', req.originalUrl);
    } else {
      // Production mode - use compiled public folder
      filePath = path.join(__dirname, '..', 'public', req.originalUrl);
    }
    
    console.log('Looking for file:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Static file not found:', filePath);
        return res.status(404).json({ message: 'File not found' });
      }
      next();
    });
  });
  
  // Add maintenance middleware before static file serving
  app.use((req, res, next) => {
    // Debug logging
    const nodeEnv = (process.env.NODE_ENV || '').trim();
    console.log(`Maintenance middleware check - NODE_ENV: "${nodeEnv}", Path: ${req.path}`);
    
    // In development mode, allow maintenance toggle but don't show maintenance page
    if (nodeEnv === 'development') {
      console.log(`Development mode: maintenance toggle allowed, but page not shown for ${req.path}`);
      return next();
    }
    
    // Skip maintenance check for ALL admin routes, login page, maintenance page, API routes, and static assets
    // Be more specific to avoid blocking admin dashboard and uploads
    if (req.path.startsWith('/admin') || 
        req.path === '/maintenance' || 
        req.path === '/admin/login' ||
        req.path.startsWith('/api/admin') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/images') ||
        req.path.startsWith('/uploads') || // IMPORTANT: Allow uploads folder for dashboard images
        req.path.startsWith('/_next') || // Next.js static files
        req.path.includes('favicon.ico') ||
        req.path.includes('.well-known') || // Chrome devtools and other well-known paths
        req.path.includes('robots.txt') ||
        req.path.includes('sitemap.xml')) {
      console.log(`Maintenance middleware: skipping ${req.path}`);
      return next();
    }
    
    // Special handling for index.html - check if this is an admin request
    if (req.path === '/' || req.path === '/index.html') {
      // Check if user has admin session cookie
      const sessionCookie = req.headers.cookie?.match(/connect\.sid=([^;]+)/);
      if (sessionCookie) {
        console.log(`Maintenance middleware: potential admin request to ${req.path}, skipping`);
        return next();
      }
    }
    
    // Check if maintenance mode is active (only in production)
    if (isMaintenanceMode()) {
      console.log(`Production maintenance middleware: showing maintenance page for ${req.path}`);
      const fs = require('fs');
      const path = require('path');
      
      try {
        let maintenanceTemplate;
        if (process.env.NODE_ENV !== 'production') {
          // Development mode - use src/views directly
          maintenanceTemplate = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'views', 'maintenance.hbs'), 'utf8');
        } else {
          // Production mode - use compiled views (check both dist/views and src/views as fallback)
          try {
            maintenanceTemplate = fs.readFileSync(path.join(__dirname, '../views/maintenance.hbs'), 'utf8');
          } catch (distError) {
            console.log('Maintenance template not found in dist/views, falling back to src/views');
            maintenanceTemplate = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'views', 'maintenance.hbs'), 'utf8');
          }
        }
        
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
    
    next();
  });
  
  // Static assets serving
  if (process.env.NODE_ENV !== 'production') {
    // Development mode - use public folder directly
    app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  } else {
    // Production mode - use compiled public folder
    app.useStaticAssets(join(__dirname, '..', 'public'));
  }
  
  const handlebars = expressHandlebars.create({
    extname: '.hbs',
    defaultLayout: false,
    helpers: {
      numberFormat: function(value) {
        if (!value) return '0';
        return new Intl.NumberFormat('id-ID').format(value);
      },
      eq: function(a, b) {
        return a === b;
      }
    }
  });
  
  app.engine('hbs', handlebars.engine);
  app.setViewEngine('hbs');

  // Security middleware
  app.use(
    helmet.default({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.quilljs.com"],
          scriptSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "https://www.gstatic.com",
            "https://www.gstatic.com/*",
            "https://www.googletagmanager.com",
            "https://www.googletagmanager.com/*",
            "https://www.google-analytics.com",
            "https://www.google-analytics.com/*",
            "https://www.google.com",
            "https://*.firebaseio.com",
            "https://cdn.tailwindcss.com",
            "https://cdn.quilljs.com"
          ],
          scriptSrcAttr: ["'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "https://picsum.photos"],
          connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com", "https://www.google-analytics.com", "https://www.gstatic.com", "https://www.googletagmanager.com", "https://www.google.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'", "http://localhost:*", "https://localhost:*", "https:"],
        },
      },
    })
  );
  app.use(compression());

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe - temporarily disabled for troubleshooting
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     transform: true,
  //     forbidNonWhitelisted: false,
  //   })
  // );

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('Data Analytics Training API')
    .setDescription('API untuk pelatihan data analitik - Platform pembelajaran terbaik di Indonesia')
    .setVersion('1.0')
    .addTag('data-analytics')
    .addTag('training')
    .addTag('courses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}

bootstrap();
