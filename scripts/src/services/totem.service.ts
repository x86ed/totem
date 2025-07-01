import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class TotemService {
  /**
   * Check if Totem has been initialized in this project
   */
  isTotemInitialized(): boolean {
    return fs.existsSync('.totem') || fs.existsSync('totem.config.json');
  }

  /**
   * Initialize Totem project if not already done
   */
  async initializeTotem(): Promise<void> {
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
  async buildFrontend(): Promise<void> {
    const distPath = path.join(process.cwd(), 'frontend/dist');
    
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

  /**
   * Get server status information
   */
  getStatus() {
    const packageJson = require('../../../package.json');
    return {
      status: 'running',
      initialized: this.isTotemInitialized(),
      timestamp: new Date().toISOString(),
      version: packageJson.version
    };
  }

  /**
   * Get server health information
   */
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };
  }
}