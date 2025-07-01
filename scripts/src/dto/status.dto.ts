import { ApiProperty } from '@nestjs/swagger';

export class StatusResponseDto {
  @ApiProperty({
    description: 'Current status of the Totem server',
    example: 'running',
  })
  status: string;

  @ApiProperty({
    description: 'Whether Totem has been initialized in this project',
    example: true,
  })
  initialized: boolean;

  @ApiProperty({
    description: 'Current timestamp in ISO format',
    example: '2025-06-30T12:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Current version of Totem',
    example: '0.6.1',
  })
  version: string;
}

export class HealthResponseDto {
  @ApiProperty({
    description: 'Health status of the server',
    example: 'healthy',
  })
  status: string;

  @ApiProperty({
    description: 'Server uptime in seconds',
    example: 3600,
  })
  uptime: number;

  @ApiProperty({
    description: 'Memory usage information',
    example: {
      rss: 50331648,
      heapTotal: 16777216,
      heapUsed: 10485760,
      external: 1048576,
    },
  })
  memory: NodeJS.MemoryUsage;

  @ApiProperty({
    description: 'Operating system platform',
    example: 'linux',
  })
  platform: string;

  @ApiProperty({
    description: 'Node.js version',
    example: 'v18.17.0',
  })
  nodeVersion: string;
}
