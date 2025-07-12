import { ApiProperty } from '@nestjs/swagger';

export class ComplexityDto {
  @ApiProperty({ description: 'Complexity key (e.g. xs, s, m, l, xl, xxl)', example: 'xs' })
  key: string = '';

  @ApiProperty({ description: 'Complexity description', example: 'Trivial change, <1 hour of work' })
  description: string = '';
}
