import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'The title of the ticket', example: 'Fix login bug' })
  title?: string;

  @ApiProperty({ description: 'Description of the ticket', required: false })
  description?: string;

  @ApiProperty({ description: 'Status of the ticket', required: false })
  status?: string;

  @ApiProperty({ description: 'Priority level', required: false })
  priority?: string;
}

export class UpdateTicketDto extends CreateTicketDto {}

export class TicketResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'The ticket data', nullable: true })
  ticket: any;
}

export class TicketsListResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Array of tickets' })
  tickets: any[];
}
