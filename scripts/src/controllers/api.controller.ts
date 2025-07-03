import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TotemService } from '../services/totem.service';
import { StatusResponseDto, HealthResponseDto } from '../dto/status.dto';

/**
 * API Controller that provides general server information endpoints.
 * Handles status and health check requests for the Totem server.
 */
@ApiTags('API')
@Controller('api')
export class ApiController {
  constructor(private readonly totemService: TotemService) {}

  /**
   * Retrieves the current status of the Totem server.
   * @returns Promise containing server status information including initialization state and version
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get server status',
    description: 'Returns the current status of the Totem server including initialization state and version information',
  })
  @ApiResponse({
    status: 200,
    description: 'Server status retrieved successfully',
    type: StatusResponseDto,
  })
  async getStatus(): Promise<StatusResponseDto> {
    return this.totemService.getStatus();
  }

  /**
   * Retrieves detailed health information about the server.
   * @returns Promise containing health data including uptime, memory usage, and system information
   */
  @Get('health')
  @ApiOperation({
    summary: 'Get server health',
    description: 'Returns detailed health information about the server including uptime, memory usage, and system information',
  })
  @ApiResponse({
    status: 200,
    description: 'Server health information retrieved successfully',
    type: HealthResponseDto,
  })
  async getHealth(): Promise<HealthResponseDto> {
    return this.totemService.getHealth();
  }
}