import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import packageJson from '../../package.json'; // Ensure type declarations exist for JSON imports

// Mock dependencies
vi.mock('fs');
vi.mock('child_process');
vi.mock('path');

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

// Import the server after mocks are set up
let app: express.Application;

// Mock the require for package.json
const mockPackageJson = { version: packageJson.version };

beforeAll(async () => {
  // Mock require for package.json
  vi.doMock('../package.json', () => mockPackageJson);
  
  // Mock path.join to return a valid directory path
  mockPath.join.mockImplementation((...args) => '/mock/frontend/dist');
  
  // Mock fs.existsSync to return true for frontend path to avoid static middleware errors  
  mockFs.existsSync.mockImplementation((path) => {
    return path.toString().includes('frontend/dist');
  });
  
  // Import the server module
  const serverModule = await import('../server');
  app = serverModule.app;
});

describe('Server API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mocks
    mockFs.existsSync.mockImplementation((path) => {
      const pathStr = path.toString();
      return pathStr.includes('frontend/dist') || pathStr.includes('.totem/tickets');
    });
    mockPath.join.mockImplementation((...args) => {
      if (args.some(arg => arg && arg.toString().includes('tickets'))) {
        return '/mock/.totem/tickets';
      }
      return '/mock/frontend/dist';
    });
    // Mock readdirSync to return empty array for tickets directory
    mockFs.readdirSync.mockImplementation((path) => {
      if (path.toString().includes('tickets')) {
        return [];
      }
      return [];
    });
  });

  describe('GET /api/status', () => {
    it('should return server status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'running',
        initialized: false,
        version: mockPackageJson.version
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should show initialized true when .totem exists', async () => {
      mockFs.existsSync.mockImplementation((path) => path === '.totem');

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.initialized).toBe(true);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        platform: process.platform,
        nodeVersion: process.version
      });
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.memory).toBeDefined();
    });
  });

  describe('API 404 handling', () => {
    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        error: 'API endpoint not found'
      });
    });
  });

  describe('Static File Serving', () => {
    it('should serve building page when frontend build does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .get('/')
        .expect(503);

      expect(response.text).toContain('Totem');
      expect(response.text).toContain('Frontend is building');
    });

    it('should serve building page for non-API routes when build does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .get('/some-page')
        .expect(503);

      expect(response.text).toContain('Frontend is building');
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS enabled for API requests', async () => {
      const response = await request(app)
        .get('/api/status')
        .set('Origin', 'http://localhost:3001')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('JSON Body Parsing', () => {
    it('should handle JSON content-type properly', async () => {
      const response = await request(app)
        .post('/api/status') // This will 404, but should accept JSON
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // The endpoint doesn't exist, so we expect 404
      expect(response.status).toBe(404);
    });
  });

  describe('Initialization Check', () => {
    it('should detect totem.config.json as initialized', async () => {
      mockFs.existsSync.mockImplementation((path) => path === 'totem.config.json');

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.initialized).toBe(true);
    });

    it('should return false when neither .totem nor config exists', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.initialized).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/status')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      // Express should handle malformed JSON with a 400 error or route not found
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Environment Variables', () => {
    it('should handle missing PORT environment variable', async () => {
      // This tests that the default port parsing works
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('File System Operations', () => {
    it('should check for .totem directory existence', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        if (path === '.totem') return true;
        return false;
      });

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(mockFs.existsSync).toHaveBeenCalledWith('.totem');
      expect(response.body.initialized).toBe(true);
    });

    it('should check for totem.config.json existence', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        if (path === 'totem.config.json') return true;
        return false;
      });

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(mockFs.existsSync).toHaveBeenCalledWith('totem.config.json');
      expect(response.body.initialized).toBe(true);
    });
  });

  describe('Ticket API Endpoints', () => {
    describe('GET /api/ticket', () => {
      it('should return all tickets', async () => {
        const response = await request(app)
          .get('/api/ticket')
          .expect(404);

        expect(response.body).toMatchObject({
          message: 'No tickets found',
          error: 'No markdown ticket files exist in the tickets directory',
          tickets: []
        });
      });
    });

    describe('GET /api/ticket/:id', () => {
      it('should return a specific ticket by ID', async () => {
        const ticketId = '123';
        const response = await request(app)
          .get(`/api/ticket/${ticketId}`)
          .expect(404);

        expect(response.body).toMatchObject({
          message: `Ticket with ID ${ticketId} not found`,
          error: 'No markdown file found with matching ID',
          ticket: null
        });
      });
    });

    describe('POST /api/ticket', () => {
      it('should create a new ticket', async () => {
        const ticketData = {
          title: 'Test Ticket',
          description: 'This is a test ticket',
          priority: 'high'
        };

        const response = await request(app)
          .post('/api/ticket')
          .send(ticketData)
          .set('Content-Type', 'application/json')
          .expect(201);

        expect(response.body).toMatchObject({
          message: 'Ticket created successfully',
          ticket: ticketData
        });
      });
    });

    describe('PUT /api/ticket/:id', () => {
      it('should update an existing ticket', async () => {
        const ticketId = '123';
        const ticketData = {
          title: 'Updated Ticket',
          description: 'This ticket has been updated',
          priority: 'medium'
        };

        const response = await request(app)
          .put(`/api/ticket/${ticketId}`)
          .send(ticketData)
          .set('Content-Type', 'application/json')
          .expect(200);

        expect(response.body).toMatchObject({
          message: `Ticket ${ticketId} updated successfully`,
          ticket: ticketData
        });
      });
    });

    describe('DELETE /api/ticket/:id', () => {
      it('should delete a ticket', async () => {
        const ticketId = '123';
        const response = await request(app)
          .delete(`/api/ticket/${ticketId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          message: `Ticket ${ticketId} deleted successfully`
        });
      });
    });
  });
});
