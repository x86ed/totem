import { ApiProperty } from '@nestjs/swagger';

export class AcceptanceCriteriaDto {
  @ApiProperty({ description: 'The criteria description', example: 'User can login with email' })
  criteria: string;

  @ApiProperty({ description: 'Whether the criteria is complete', example: false })
  complete: boolean;
}

export class TicketDto {
  @ApiProperty({ description: 'Unique ticket identifier', example: 'healthcare.frontend.patient-dashboard-003' })
  id: string;

  @ApiProperty({ description: 'The title of the ticket', example: 'Patient Dashboard Redesign' })
  title: string;

  @ApiProperty({ description: 'Description of the ticket', example: 'Modern React-based dashboard with real-time data visualization' })
  description: string;

  @ApiProperty({ description: 'Current status', example: 'in-progress', enum: ['open', 'in-progress', 'planning', 'completed'] })
  status: string;

  @ApiProperty({ description: 'Priority level', example: 'medium', enum: ['low', 'medium', 'high'] })
  priority: string;

  @ApiProperty({ description: 'Complexity assessment', example: 'high', enum: ['low', 'medium', 'high'] })
  complexity: string;

  @ApiProperty({ description: 'Assigned persona', example: 'product-proteus', nullable: true })
  persona: string | null;

  @ApiProperty({ description: 'Collaborator', nullable: true })
  collabotator: string | null;

  @ApiProperty({ description: 'AI model used', nullable: true })
  model: string | null;

  @ApiProperty({ description: 'Estimated effort in days', nullable: true })
  effort_days: number | null;

  @ApiProperty({ description: 'Tickets blocked by this one', type: [String] })
  blocks: string[];

  @ApiProperty({ description: 'Tickets that block this one', type: [String] })
  blocked_by: string[];

  @ApiProperty({ description: 'Acceptance criteria', type: [AcceptanceCriteriaDto] })
  acceptance_criteria: AcceptanceCriteriaDto[];

  @ApiProperty({ description: 'Associated tags', type: [String] })
  tags: string[];

  @ApiProperty({ description: 'Additional notes' })
  notes: string;

  @ApiProperty({ description: 'Risk factors', type: [String] })
  risks: string[];

  @ApiProperty({ description: 'Available resources', type: [String] })
  resources: string[];
}

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
  @ApiProperty({ description: 'Response message', example: 'Get ticket with ID: 123' })
  message: string;

  @ApiProperty({ description: 'The ticket data', type: TicketDto, nullable: true })
  ticket: TicketDto | null;
}

export class TicketsListResponseDto {
  @ApiProperty({ description: 'Response message', example: 'Get all tickets' })
  message: string;

  @ApiProperty({ description: 'Array of tickets', type: [TicketDto] })
  tickets: TicketDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Error message', example: 'Tickets directory not found' })
  message: string;

  @ApiProperty({ description: 'Detailed error description', example: 'No tickets directory exists' })
  error: string;

  @ApiProperty({ description: 'Empty tickets array', type: [TicketDto] })
  tickets: TicketDto[];
}
