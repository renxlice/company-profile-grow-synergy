const express = require('express');

async function bootstrap() {
  try {
    const server = express();
    
    // Health check endpoint
    server.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // Test route
    server.get('/test', (req, res) => {
      res.json({ message: 'Test route working!', env: process.env.NODE_ENV });
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
          <a href="/health">Health Check</a> | 
          <a href="/test">Test Route</a>
        </body>
        </html>
      `);
    });
    
    console.log('Starting server without NestJS for debugging...');
    
    // Start server
    const port = process.env.PORT || 3001;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`Test route: http://localhost:${port}/test`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
