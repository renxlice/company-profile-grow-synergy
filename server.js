const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const AppModule = require('./dist/src/app.module').AppModule;

async function bootstrap() {
  const server = express();
  
  // Health check endpoint
  server.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  try {
    // Initialize NestJS with Express adapter
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    
    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    // Initialize NestJS
    await app.init();
    
    // Start server
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
