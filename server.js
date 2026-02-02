const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const AppModule = require('./dist/src/app.module').AppModule;

async function bootstrap() {
  const server = express();
  
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
  });
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
