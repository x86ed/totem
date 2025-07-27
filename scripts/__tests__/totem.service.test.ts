import { TotemService } from '../src/services/totem.service';
import fs from 'fs';
import mock from 'mock-fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('fs');
vi.mock('child_process');

// Patch util.promisify to return a function compatible with exec's callback signature
vi.mock('util', () => ({
  promisify: (fn: any) => (...args: any[]) => {
    // If last arg is a callback, call it with (null, 'mocked output')
    if (typeof args[args.length - 1] === 'function') {
      args[args.length - 1](null, 'mocked output');
    }
    return Promise.resolve('mocked output');
  },
}));

// Patch exec to be compatible with util.promisify
const execMock = vi.fn((cmd, cb) => cb(null, 'mocked output'));
vi.mocked(exec).mockImplementation(execMock);

describe('TotemService', () => {
  let service: TotemService;
  
  beforeEach(() => {
    mock({
      '.totem': {},
      'totem.config.json': '{"version":"1.0.0"}',
      'package.json': '{"name":"totem","version":"1.0.0"}',
    });
    service = new TotemService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    mock.restore();
  });

  describe('isTotemInitialized', () => {
    it('should return true when .totem directory exists', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path === '.totem';
      });

      const result = service.isTotemInitialized();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('.totem');
    });

    it('should return true when totem.config.json exists', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path === 'totem.config.json';
      });

      const result = service.isTotemInitialized();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('totem.config.json');
    });

    it('should return false when neither exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = service.isTotemInitialized();

      expect(result).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return status information', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const result = service.getStatus();

      expect(result).toEqual({
        status: 'running',
        initialized: true,
        timestamp: expect.any(String),
        version: expect.any(String),
      });
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('getHealth', () => {
    it('should return health information', () => {
      const originalUptime = process.uptime;
      const originalMemoryUsage = process.memoryUsage;
      const originalPlatform = process.platform;
      const originalVersion = process.version;

      // Mock process methods
      (process.uptime as any) = vi.fn().mockReturnValue(3600);
      (process.memoryUsage as any) = vi.fn().mockReturnValue({
        rss: 50331648,
        heapTotal: 16777216,
        heapUsed: 10485760,
        external: 1048576,
        arrayBuffers: 0,
      });

      const result = service.getHealth();

      expect(result).toEqual({
        status: 'healthy',
        uptime: 3600,
        memory: {
          rss: 50331648,
          heapTotal: 16777216,
          heapUsed: 10485760,
          external: 1048576,
          arrayBuffers: 0,
        },
        platform: originalPlatform,
        nodeVersion: originalVersion,
      });

      // Restore original methods
      process.uptime = originalUptime;
      process.memoryUsage = originalMemoryUsage;
    });
  });
});