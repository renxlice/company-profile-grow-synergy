const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');

async function bootstrap() {
  try {
    const server = express();
    
    // Health check endpoint
    server.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // Basic route for testing
    server.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>GROW SYNERGY INDONESIA</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Server is Running!</h1>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Port: ${process.env.PORT || 3001}</p>
          <p>Time: ${new Date().toISOString()}</p>
          <a href="/health">Health Check</a>
        </body>
        </html>
      `);
    });
    
    console.log('Initializing NestJS...');
    
    // Try to initialize NestJS with minimal setup
    try {
      const AppModule = require('./dist/src/app.module').AppModule;
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
      
      // Enable CORS
      app.enableCors({
        origin: true,
        credentials: true,
      });
      
      // Initialize NestJS
      await app.init();
      console.log('NestJS initialized successfully');
      
    } catch (error) {
      console.error('NestJS initialization failed:', error.message);
      console.log('Continuing with Express only...');
    }
    
    // Start server
    const port = process.env.PORT || 3001;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
