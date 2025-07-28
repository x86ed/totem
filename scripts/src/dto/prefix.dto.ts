import { ApiProperty } from '@nestjs/swagger';

export class PrefixDto {
  @ApiProperty({ description: 'Prefix value', example: 'DEMO' })
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }
}
