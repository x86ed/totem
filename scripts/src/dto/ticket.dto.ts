import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptanceCriterionDto {
  @ApiProperty({
    description: 'The acceptance criteria text',
    example: 'User can login with email and password'
  })
  criteria: string;

  @ApiProperty({
    description: 'Whether this criteria is completed',
    example: false
  })
  complete: boolean;
}

export class TicketDto {
  @ApiProperty({
    description: 'Unique identifier for the ticket',
    example: 'user-authentication-001'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the ticket',
    example: 'User Authentication System'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the ticket',
    example: 'Implement user authentication with email/password login'
  })
  description: string;

  @ApiProperty({
    description: 'Current status of the ticket',
    enum: ['open', 'in_progress', 'closed', 'blocked'],
    example: 'open'
  })
  status: string;

  @ApiProperty({
    description: 'Priority level of the ticket',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'high'
  })
  priority: string;

  @ApiProperty({
    description: 'Complexity level of the ticket',
    enum: ['low', 'medium', 'high'],
    example: 'medium'
  })
  complexity: string;

  @ApiPropertyOptional({
    description: 'Target persona for this ticket',
    example: 'developer'
  })
  persona: string | null;

  @ApiPropertyOptional({
    description: 'Collaborator assigned to this ticket',
    example: 'john.doe'
  })
  collabotator: string | null;

  @ApiPropertyOptional({
    description: 'AI model associated with this ticket',
    example: 'gpt-4'
  })
  model: string | null;

  @ApiPropertyOptional({
    description: 'Estimated effort in days',
    example: 3
  })
  effort_days: number | null;

  @ApiProperty({
    description: 'List of ticket IDs that this ticket blocks',
    type: [String],
    example: ['feature-xyz-002']
  })
  blocks: string[];

  @ApiProperty({
    description: 'List of ticket IDs that block this ticket',
    type: [String],
    example: ['infrastructure-001']
  })
  blocked_by: string[];

  @ApiProperty({
    description: 'List of acceptance criteria for the ticket',
    type: [AcceptanceCriterionDto]
  })
  acceptance_criteria: AcceptanceCriterionDto[];

  @ApiProperty({
    description: 'Tags associated with the ticket',
    type: [String],
    example: ['authentication', 'security', 'backend']
  })
  tags: string[];

  @ApiProperty({
    description: 'Additional notes for the ticket',
    example: 'Remember to implement rate limiting'
  })
  notes: string;

  @ApiProperty({
    description: 'Identified risks for this ticket',
    type: [String],
    example: ['Security vulnerability', 'Performance impact']
  })
  risks: string[];

  @ApiProperty({
    description: 'Resources and links related to the ticket',
    type: [String],
    example: ['https://docs.auth0.com/', 'Internal security guidelines']
  })
  resources: string[];
}

export class CreateTicketDto {
  @ApiPropertyOptional({
    description: 'Custom ID for the ticket (auto-generated if not provided)',
    example: 'user-auth-system-001'
  })
  id?: string;

  @ApiProperty({
    description: 'Title of the ticket',
    example: 'User Authentication System'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the ticket',
    example: 'Implement user authentication with email/password login'
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Initial status of the ticket',
    enum: ['open', 'in_progress', 'closed', 'blocked'],
    default: 'open'
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the ticket',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  })
  priority?: string;

  @ApiPropertyOptional({
    description: 'Complexity level of the ticket',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  complexity?: string;

  @ApiPropertyOptional({
    description: 'Target persona for this ticket',
    example: 'developer'
  })
  persona?: string;

  @ApiPropertyOptional({
    description: 'Collaborator assigned to this ticket',
    example: 'john.doe'
  })
  collabotator?: string;

  @ApiPropertyOptional({
    description: 'AI model associated with this ticket',
    example: 'gpt-4'
  })
  model?: string;

  @ApiPropertyOptional({
    description: 'Estimated effort in days',
    example: 3
  })
  effort_days?: number;

  @ApiPropertyOptional({
    description: 'List of ticket IDs that this ticket blocks',
    type: [String],
    example: ['feature-xyz-002']
  })
  blocks?: string[];

  @ApiPropertyOptional({
    description: 'List of ticket IDs that block this ticket',
    type: [String],
    example: ['infrastructure-001']
  })
  blocked_by?: string[];

  @ApiPropertyOptional({
    description: 'List of acceptance criteria for the ticket',
    type: [AcceptanceCriterionDto]
  })
  acceptance_criteria?: AcceptanceCriterionDto[];

  @ApiPropertyOptional({
    description: 'Tags associated with the ticket',
    type: [String],
    example: ['authentication', 'security', 'backend']
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes for the ticket',
    example: 'Remember to implement rate limiting'
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Identified risks for this ticket',
    type: [String],
    example: ['Security vulnerability', 'Performance impact']
  })
  risks?: string[];

  @ApiPropertyOptional({
    description: 'Resources and links related to the ticket',
    type: [String],
    example: ['https://docs.auth0.com/', 'Internal security guidelines']
  })
  resources?: string[];
}

export class UpdateTicketDto extends CreateTicketDto {}

export class TicketResponseDto {
  @ApiProperty({ description: 'Response message', example: 'Ticket created successfully' })
  message: string;

  @ApiProperty({ description: 'The ticket data', type: () => TicketDto, nullable: true })
  ticket: TicketDto | null;

  @ApiPropertyOptional({ description: 'Filename of the ticket file', example: 'user-auth-001.md' })
  filename?: string;
}

export class TicketsListResponseDto {
  @ApiProperty({ description: 'Response message', example: 'Tickets retrieved successfully' })
  message: string;

  @ApiProperty({ description: 'Array of tickets', type: [TicketDto] })
  tickets: TicketDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Error message', example: 'Ticket not found' })
  message: string;

  @ApiPropertyOptional({ description: 'Detailed error information' })
  error?: string;

  @ApiPropertyOptional({ description: 'Array of tickets', type: [TicketDto], nullable: true })
  tickets?: TicketDto[] | null;
}
