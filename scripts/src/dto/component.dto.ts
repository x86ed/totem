import { ApiProperty } from '@nestjs/swagger';

export class ComponentDto {
  @ApiProperty({ description: 'Component key (e.g. auth, payment)', example: 'auth' })
  key: string = '';

  @ApiProperty({ description: 'Component description', example: 'Authentication and authorization systems' })
  description: string = '';
}
