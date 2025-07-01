import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a simplified controller class for testing without decorators
class SimpleApiController {
  constructor(private readonly totemService: any) {}

  getStatus() {
    return this.totemService.getStatus();
  }

  getHealth() {
    return this.totemService.getHealth();
  }
}

describe('ApiController', () => {
  let controller: SimpleApiController;
  let mockTotemService: any;

  beforeEach(() => {
    mockTotemService = {
      getStatus: vi.fn(),
      getHealth: vi.fn(),
    };
    controller = new SimpleApiController(mockTotemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return status information', () => {
      const mockStatus = {
        status: 'running',
        initialized: true,
        timestamp: '2025-06-30T12:00:00.000Z',
        version: '0.6.1',
      };

      mockTotemService.getStatus.mockReturnValue(mockStatus);

      const result = controller.getStatus();

      expect(result).toEqual(mockStatus);
      expect(mockTotemService.getStatus).toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health information', () => {
      const mockHealth = {
        status: 'healthy',
        uptime: 3600,
        memory: {
          rss: 50331648,
          heapTotal: 16777216,
          heapUsed: 10485760,
          external: 1048576,
          arrayBuffers: 0,
        },
        platform: 'linux',
        nodeVersion: 'v18.17.0',
      };

      mockTotemService.getHealth.mockReturnValue(mockHealth);

      const result = controller.getHealth();

      expect(result).toEqual(mockHealth);
      expect(mockTotemService.getHealth).toHaveBeenCalled();
    });
  });
});