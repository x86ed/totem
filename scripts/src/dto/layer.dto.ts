import { ApiProperty } from '@nestjs/swagger';

export class LayerDto {
  @ApiProperty({ description: 'Layer key (e.g. Frontend, Backend)', example: 'Frontend' })
  key: string = '';

  @ApiProperty({ description: 'Layer description', example: 'User interface components, web applications, dashboards' })
  description: string = '';
}
