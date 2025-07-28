import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonaContextSectionDto {
  @ApiProperty({
    description: 'Name of the context section (e.g., Healthcare Context, Risk Assessment Context)',
    example: 'Healthcare Context'
  })
  name: string;

  @ApiProperty({
    description: 'List of bullet points under this context section',
    type: [String],
    example: [
      'Refactoring for regulatory compliance and auditability',
      'Ensuring tests cover critical clinical workflows'
    ]
  })
  items: string[];
}

export class PersonaDecisionFrameworkDto {
  @ApiProperty({
    description: 'List of priorities for decision making',
    type: [String],
    example: [
      'Code clarity and maintainability over cleverness',
      'Comprehensive tests over untested optimizations'
    ]
  })
  priorities: string[];

  @ApiProperty({
    description: 'Default assumptions for this persona',
    type: [String],
    example: [
      'Every codebase accumulates technical debt over time',
      'Tests are essential for safe refactoring'
    ]
  })
  defaultAssumptions: string[];
}

export class PersonaCodePatternsDto {
  @ApiPropertyOptional({
    description: 'List of best practices or patterns to always implement',
    type: [String],
    example: [
      'Refactor to eliminate duplication',
      'Add or update tests to cover refactored code'
    ]
  })
  alwaysImplement?: string[];

  @ApiPropertyOptional({
    description: 'List of anti-patterns or practices to avoid',
    type: [String],
    example: [
      'Leaving commented-out or unused code in the repository',
      'Making changes without updating or adding tests'
    ]
  })
  avoid?: string[];

  @ApiPropertyOptional({
    description: 'Code examples or snippets',
    type: [String],
    example: [
      'function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }'
    ]
  })
  codeExamples?: string[];
}

export class PersonaRequirementsPatternsDto {
  @ApiPropertyOptional({
    description: 'List of requirements to always include',
    type: [String],
    example: [
      'Clear user stories with acceptance criteria',
      'Defined success metrics and KPIs'
    ]
  })
  alwaysInclude?: string[];

  @ApiPropertyOptional({
    description: 'List of requirements to avoid',
    type: [String],
    example: [
      'Vague or ambiguous requirements',
      'Gold-plating or unnecessary features'
    ]
  })
  avoid?: string[];
}

export class PersonaReviewChecklistDto {
  @ApiProperty({
    description: 'Red flags to look for in review',
    type: [String],
    example: [
      'Unused or dead code left in the codebase',
      'Refactored code with no corresponding tests'
    ]
  })
  redFlags: string[];

  @ApiProperty({
    description: 'Green flags to look for in review',
    type: [String],
    example: [
      'Clean, consistent, and well-tested code',
      'Automated tests passing after changes'
    ]
  })
  greenFlags: string[];
}

export class PersonaMarkdownDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'refactor-raleigh.md'
  })
  fileName: string;

  @ApiProperty({
    description: 'Markdown content of the file',
    example: '# Refactor Raleigh\n\n## Context\n\n- Item 1\n- Item 2\n'
  })
  content: string;
}

export class PersonaDto {
  @ApiProperty({
    description: 'Persona name',
    example: 'Refactor-Raleigh'
  })
  name: string;

  @ApiProperty({
    description: 'Primary focus of the persona',
    example: 'Code consistency, removing technical debt, eliminating unused code, and ensuring robust testing'
  })
  primaryFocus: string;

  @ApiProperty({
    description: 'Decision framework for the persona',
    type: PersonaDecisionFrameworkDto
  })
  decisionFramework: PersonaDecisionFrameworkDto;

  @ApiPropertyOptional({
    description: 'Code patterns for the persona',
    type: PersonaCodePatternsDto
  })
  codePatterns?: PersonaCodePatternsDto;

  @ApiPropertyOptional({
    description: 'Requirements patterns for the persona',
    type: PersonaRequirementsPatternsDto
  })
  requirementsPatterns?: PersonaRequirementsPatternsDto;

  @ApiProperty({
    description: 'List of domain context sections (arbitrary contexts)',
    type: [PersonaContextSectionDto]
  })
  domainContexts: PersonaContextSectionDto[];

  @ApiPropertyOptional({
    description: 'Review checklist for the persona',
    type: PersonaReviewChecklistDto
  })
  reviewChecklist?: PersonaReviewChecklistDto;
}
