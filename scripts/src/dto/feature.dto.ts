import { ApiProperty } from '@nestjs/swagger';

export class FeatureDto {
  @ApiProperty({ description: 'Feature key (e.g. login, dashboard)', example: 'login' })
  key: string = '';

  @ApiProperty({ description: 'Feature description', example: 'User authentication and session management' })
  description: string = '';
}
