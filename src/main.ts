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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

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
