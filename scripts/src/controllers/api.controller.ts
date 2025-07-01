import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TotemService } from '../services/totem.service';
import { StatusResponseDto, HealthResponseDto } from '../dto/status.dto';

@ApiTags('API')
@Controller('api')
export class ApiController {
  constructor(private readonly totemService: TotemService) {}

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