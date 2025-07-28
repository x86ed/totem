import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContributorGitProfileDto {
  @ApiProperty({ description: 'Git username', example: 'acidburn' })
  username!: string;

  @ApiProperty({ description: 'Full name', example: 'Kate Libby' })
  fullName!: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'acidburn@hacktheplanet.com' })
  email!: string;

  @ApiPropertyOptional({ description: 'GitHub profile URL', example: 'https://github.com/AcidBurn' })
  github?: string;

  @ApiPropertyOptional({ description: 'Location', example: 'New York City' })
  location!: string;

  @ApiPropertyOptional({ description: 'Year joined', example: '1995' })
  joined!: string;
}

export class ContributorRoleDto {
  @ApiProperty({ description: 'Position or title', example: 'Elite Hacker & Hardware Guru' })
  position!: string;

  @ApiPropertyOptional({ description: 'Team', example: 'Hackers' })
  team?: string;

  @ApiPropertyOptional({ description: 'Focus areas', type: [String], example: [
    'High-performance systems and hardware optimization',
    'Social engineering and infiltration',
    'Cracking encryption and security systems',
    'Winning any and all hacking competitions'
  ] })
  focusAreas?: string[];
}

export class ContributorAvailabilityDto {
  @ApiPropertyOptional({ description: 'Primary timezone', example: 'EST/EDT (UTC-5/UTC-4)' })
  primaryTimezone?: string;

  @ApiPropertyOptional({ description: 'Working hours', example: 'Mostly nocturnal.' })
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Best contact time', example: 'Late night.' })
  bestContactTime?: string;

  @ApiPropertyOptional({ description: 'Response time', example: `Depends if I'm in the middle of a hack.` })
  responseTime?: string;
}

export class ContributorCodingPreferencesDto {
  @ApiPropertyOptional({ description: 'Primary languages', type: [String], example: ['C', 'C++', 'Assembly', 'Perl'] })
  primary?: string[];

  @ApiPropertyOptional({ description: 'Frontend stack', example: 'Who needs a frontend when you have a command line?' })
  frontend?: string;

  @ApiPropertyOptional({ description: 'Backend stack', example: 'High-performance, low-latency systems.' })
  backend?: string;

  @ApiPropertyOptional({ description: 'Databases', example: 'I can read the raw disk if I have to.' })
  databases?: string;

  @ApiPropertyOptional({ description: 'Tools', example: 'My trusty laptop (a P6), a fast modem, and a sharp wit.' })
  tools?: string;
}

export class ContributorCodeStyleDto {
  @ApiPropertyOptional({ description: 'Formatting', example: 'Fast and loose.' })
  formatting?: string;

  @ApiPropertyOptional({ description: 'Linting', example: 'For people who make mistakes.' })
  linting?: string;

  @ApiPropertyOptional({ description: 'Testing', example: "My code works. If it doesn't, I'll fix it." })
  testing?: string;

  @ApiPropertyOptional({ description: 'Documentation', example: "My code is self-documenting. If you can't read it, you're not elite." })
  documentation?: string;
}

export class ContributorWorkflowDto {
  @ApiPropertyOptional({ description: 'Branching', example: 'feature/gibson-hack' })
  branching?: string;

  @ApiPropertyOptional({ description: 'Commits', example: 'feat: own the gibson' })
  commits?: string;

  @ApiPropertyOptional({ description: 'PR Process', example: "I'll push when it's ready." })
  prProcess?: string;

  @ApiPropertyOptional({ description: 'Code Review', example: 'This is a work of art. No changes.' })
  codeReview?: string;
}

export class ContributorCommunicationDto {
  @ApiPropertyOptional({ description: 'Code Reviews', example: 'Sarcastic but brilliant.' })
  codeReviews?: string;

  @ApiPropertyOptional({ description: 'Documentation', example: 'Minimalist. The code speaks for itself.' })
  documentation?: string;

  @ApiPropertyOptional({ description: 'Meetings', example: 'Prefers to meet on a pirate radio station.' })
  meetings?: string;

  @ApiPropertyOptional({ description: 'Mentoring', example: "Will teach you, but you have to prove you're not a lamer first." })
  mentoring?: string;
}

export class ContributorExpertiseDto {
  @ApiPropertyOptional({ description: 'Expertise areas', type: [String], example: [
    'Hardware', 'Security', 'Social Engineering', 'Networking'
  ] })
  expertiseAreas?: string[];
}

export class ContributorFunFactsDto {
  @ApiPropertyOptional({ description: 'Fun facts', type: [String], example: [
    'Her handle comes from the pH of the acid that can burn through security.',
    'Owns a laptop with a P6 processor. It\'s the fastest thing on the planet.',
    'Is never seen without her signature sunglasses.',
    'Is an expert at Wipeout.'
  ] })
  funFacts?: string[];
}

export class ContributorContactPreferencesDto {
  @ApiPropertyOptional({ description: 'Urgent Issues', example: 'Find me on the pirate radio station.' })
  urgentIssues?: string;

  @ApiPropertyOptional({ description: 'Code Questions', example: 'Post it on the BBS.' })
  codeQuestions?: string;

  @ApiPropertyOptional({ description: 'General Discussion', example: "Let's meet at Cyberdelia." })
  generalDiscussion?: string;

  @ApiPropertyOptional({ description: 'After Hours', example: "Never send a boy to do a woman's job." })
  afterHours?: string;
}

export class ContributorDto {
  @ApiProperty({ description: 'Contributor name', example: 'Acid Burn' })
  name!: string;

  @ApiPropertyOptional({ description: 'Git profile', type: ContributorGitProfileDto })
  gitProfile?: ContributorGitProfileDto;

  @ApiPropertyOptional({ description: 'Role & responsibilities', type: ContributorRoleDto })
  roleAndResponsibilities?: ContributorRoleDto;

  @ApiPropertyOptional({ description: 'Timezone & availability', type: ContributorAvailabilityDto })
  availability?: ContributorAvailabilityDto;

  @ApiPropertyOptional({ description: 'Coding preferences', type: ContributorCodingPreferencesDto })
  codingPreferences?: ContributorCodingPreferencesDto;

  @ApiPropertyOptional({ description: 'Code style', type: ContributorCodeStyleDto })
  codeStyle?: ContributorCodeStyleDto;

  @ApiPropertyOptional({ description: 'Development workflow', type: ContributorWorkflowDto })
  workflow?: ContributorWorkflowDto;

  @ApiPropertyOptional({ description: 'Communication style', type: ContributorCommunicationDto })
  communication?: ContributorCommunicationDto;

  @ApiPropertyOptional({ description: 'Expertise areas', type: ContributorExpertiseDto })
  expertise?: ContributorExpertiseDto;

  @ApiPropertyOptional({ description: 'Fun facts', type: ContributorFunFactsDto })
  funFacts?: ContributorFunFactsDto;

  @ApiPropertyOptional({ description: 'Contact preferences', type: ContributorContactPreferencesDto })
  contactPreferences?: ContributorContactPreferencesDto;

  @ApiPropertyOptional({ description: 'Last updated date', example: 'July 2025' })
  lastUpdated?: string;
}

export class ContributorMarkdownDto {
  @ApiProperty({ description: 'Name of the file', example: 'acid-burn.md' })
  fileName!: string;

  @ApiProperty({ description: 'Markdown content of the file', example: '# Contributor Profile: Acid Burn\n...' })
  content!: string;
}
