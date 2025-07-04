#!/usr/bin/env node

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, Application } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import ticketRoutes from './routes/ticket';

const execAsync = promisify(exec);
const app: Application = express();

// Environment configuration
const PORT: number = parseInt(process.env.PORT || '7073', 10);
const HOST: string = process.env.HOST || 'localhost';
const NODE_ENV: string = process.env.NODE_ENV || 'development';
const API_PREFIX: string = process.env.API_PREFIX || 'api';
const CORS_ORIGIN: string = process.env.CORS_ORIGIN || '*';
const TICKETS_DIR: string = process.env.TICKETS_DIR || '.totem/tickets';
const ENABLE_SWAGGER: boolean = process.env.ENABLE_SWAGGER === 'true';

// Enable CORS with configuration from environment
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

/**
 * Check if Totem has been initialized in this project
 */
function isTotemInitialized(): boolean {
  // Check for .totem directory or configuration file
  return fs.existsSync('.totem') || fs.existsSync('totem.config.json');
}

/**
 * Initialize Totem project if not already done
 */
async function initializeTotem(): Promise<void> {
  console.log('🎯 Initializing Totem project...');
  try {
    const { stdout, stderr } = await execAsync('node dist/init.js');
    console.log('✅ Totem project initialized successfully');
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
  } catch (error) {
    console.error('❌ Failed to initialize Totem:', error);
    throw error;
  }
}

/**
 * Build frontend if not already built
 */
async function buildFrontend(): Promise<void> {
  const distPath = path.join(__dirname, '../frontend/dist');
  
  // Check if build exists
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend build found');
    return;
  }

  console.log('🏗️ Building frontend...');
  try {
    const { stdout, stderr } = await execAsync('cd frontend && npm install && npm run build');
    console.log('✅ Frontend built successfully');
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
  } catch (error) {
    console.error('❌ Failed to build frontend:', error);
    throw error;
  }
}

// API Routes
app.get(`/${API_PREFIX}/status`, (req: Request, res: Response) => {
  res.json({
    status: 'running',
    initialized: isTotemInitialized(),
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    environment: NODE_ENV,
    config: {
      port: PORT,
      host: HOST,
      ticketsDir: TICKETS_DIR,
      swaggerEnabled: ENABLE_SWAGGER
    }
  });
});

app.get(`/${API_PREFIX}/health`, (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

// Use ticket routes
app.use(`/${API_PREFIX}/ticket`, ticketRoutes);

// Serve static files from frontend/dist
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle client-side routing (SPA)
app.get('*', (req: Request, res: Response): void => {
  // Don't serve index.html for API routes
  if (req.path.startsWith(`/${API_PREFIX}/`)) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send(`
      <html>
        <head><title>Totem - Building...</title></head>
        <body style="font-family: system-ui; text-align: center; margin-top: 100px;">
          <h1>🎯 Totem</h1>
          <p>Frontend is building... Please wait a moment and refresh.</p>
          <p><a href="/">Refresh</a></p>
        </body>
      </html>
    `);
  }
});

/**
 * Start the Totem server
 */
async function startServer() {
  try {
    console.log('🎯 Starting Totem AI-Native Project Management Platform...');
    
    // Check if Totem is initialized, if not, initialize it
    if (!isTotemInitialized()) {
      await initializeTotem();
    } else {
      console.log('✅ Totem project already initialized');
    }

    // Ensure frontend is built
    await buildFrontend();

    // Start the server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Totem Server Started Successfully!');
      console.log('');
      console.log(`📋 Web Interface: http://localhost:${PORT}`);
      console.log('');
      console.log('🔧 API Endpoints:');
      console.log(`   GET    http://localhost:${PORT}/api/status       - Server status`);
      console.log(`   GET    http://localhost:${PORT}/api/health       - Health check`);
      console.log(`   GET    http://localhost:${PORT}/api/ticket       - List all tickets`);
      console.log(`   GET    http://localhost:${PORT}/api/ticket/:id   - Get ticket by ID`);
      console.log(`   POST   http://localhost:${PORT}/api/ticket       - Create new ticket`);
      console.log(`   PUT    http://localhost:${PORT}/api/ticket/:id   - Update ticket`);
      console.log(`   DELETE http://localhost:${PORT}/api/ticket/:id   - Delete ticket`);
      console.log('');
      console.log('🎯 AI-Native | 📡 Git-Native | 🌐 Distributed | 🔓 Open Source | 🏠 Self-Hosted');
      console.log('');
      console.log('Press Ctrl+C to stop the server');
    });

  } catch (error) {
    console.error('❌ Failed to start Totem server:', error);
    process.exit(1);
  }
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

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

export { app, startServer };
