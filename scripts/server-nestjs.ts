#!/usr/bin/env node

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './src/app.module';
import { TotemService } from './src/services/totem.service';
import * as packageJson from '../package.json';

async function bootstrap() {
  console.log('🎯 Starting Totem AI-Native Project Management Platform...');
  
  // Environment configuration
  const PORT = parseInt(process.env.PORT || '7073', 10);
  const HOST = process.env.HOST || 'localhost';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
  const ENABLE_SWAGGER = process.env.ENABLE_SWAGGER !== 'false';
  
  // Create NestJS application
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with configuration
  app.enableCors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
    credentials: true
  });
  
  // Get Totem service for initialization
  const totemService = app.get(TotemService);
  
  // Check if Totem is initialized, if not, initialize it
  if (!totemService.isTotemInitialized()) {
    await totemService.initializeTotem();
  } else {
    console.log('✅ Totem project already initialized');
  }

  // Ensure frontend is built
  await totemService.buildFrontend();

  // Swagger/OpenAPI configuration (only if enabled)
  if (ENABLE_SWAGGER) {
    const config = new DocumentBuilder()
      .setTitle('Totem API')
      .setDescription('AI-Native, Git-Native, Distributed Project Management Platform API')
      .setVersion(packageJson.version)
      .addTag('API', 'Core API endpoints for Totem project management')
      .setContact(
        'Totem Team',
        'https://github.com/x86ed/totem',
        'contact@totem-platform.dev'
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Totem API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });
  }

  await app.listen(PORT);

  console.log('');
  console.log('🚀 Totem Server Started Successfully!');
  console.log('');
  console.log(`📋 Web Interface:     http://localhost:${PORT}`);
  if (ENABLE_SWAGGER) {
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  }
  console.log(`🔧 API Status:        http://localhost:${PORT}/api/status`);
  console.log(`❤️  Health Check:      http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🎯 AI-Native | 📡 Git-Native | 🌐 Distributed | 🔓 Open Source | 🏠 Self-Hosted');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Totem server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Totem server...');
  process.exit(0);
});

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('❌ Failed to start Totem server:', error);
    process.exit(1);
  });
}