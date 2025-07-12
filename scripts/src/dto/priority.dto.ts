import { ApiProperty } from '@nestjs/swagger';

export class PriorityDto {
  @ApiProperty({ description: 'Priority key (e.g. critical, high)', example: 'critical' })
  key: string = '';

  @ApiProperty({ description: 'Priority description', example: 'Drop everything, immediate action required' })
  description: string = '';
}
