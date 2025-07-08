import { Controller, Get, Param, Post, Body, Put, Delete, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ContributorDto, MarkdownDto } from '../dto/contributor.dto';
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@ApiTags('contributors')
@Controller('api/contributor')
// Remove this file after renaming to contributor.controller.ts
  private contributorsDir = join(process.cwd(), '.totem/contributors');

  @Get()
  @ApiOperation({ summary: 'Get all contributors', description: 'Retrieve all contributors from markdown files' })
  @ApiResponse({ status: 200, description: 'List of contributors', type: ContributorDto, isArray: true })
  public getAllContributors(): ContributorDto[] {
    if (!existsSync(this.contributorsDir)) {
      // Instead of throwing, create the directory and return an empty array
      // This prevents the server from crashing if the directory does not exist
      // and allows the UI to function with zero contributors.
      // You may want to use mkdirSync(this.contributorsDir, { recursive: true }) if you want to auto-create it.
      return [];
    }
    const files = readdirSync(this.contributorsDir).filter(f => f.endsWith('.md'));
    return files
      .map(f => this.parseContributorMarkdown(join(this.contributorsDir, f)))
      .filter((c): c is ContributorDto => !!c);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get contributor by name', description: 'Retrieve a contributor by name (filename without .md)' })
  @ApiParam({ name: 'name', description: 'Contributor name (filename without .md)', example: 'jane-doe' })
  @ApiResponse({ status: 200, description: 'Contributor found', type: MarkdownDto })
  @ApiResponse({ status: 404, description: 'Contributor not found', type: String })
  public getContributorByName(@Param('name') name: string): MarkdownDto {
    const filePath = join(this.contributorsDir, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Contributor not found', 404);
    }
    const contributor = this.wrapContributorJson(filePath);
    if (!contributor) {
      throw new HttpException('Contributor not found', 404);
    }
    return contributor;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contributor', description: 'Create a new contributor markdown file' })
  @ApiBody({ type: ContributorDto, description: 'Contributor data to create' })
  @ApiResponse({ status: 201, description: 'Contributor created successfully', type: ContributorDto })
  @ApiResponse({ status: 400, description: 'Contributor already exists or invalid data', type: String })
  public createContributor(@Body() dto: ContributorDto): ContributorDto {
    const filePath = join(this.contributorsDir, `${dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}.md`);
    if (existsSync(filePath)) {
      throw new HttpException('Contributor already exists', 400);
    }
    const markdown = this.contributorToMarkdown(dto);
    writeFileSync(filePath, markdown, 'utf-8');
    return this.parseContributorMarkdown(filePath)!;
  }

  @Put(':name')
  @ApiOperation({ summary: 'Update a contributor', description: 'Update an existing contributor markdown file' })
  @ApiParam({ name: 'name', description: 'Contributor name (filename without .md)', example: 'jane-doe' })
  @ApiBody({ type: ContributorDto, description: 'Contributor data to update, or { markdown: string } to update raw markdown' })
  @ApiResponse({ status: 200, description: 'Contributor updated successfully', type: ContributorDto })
  @ApiResponse({ status: 404, description: 'Contributor not found', type: String })
  public updateContributor(@Param('name') name: string, @Body() dto: any): ContributorDto {
    const filePath = join(this.contributorsDir, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Contributor not found', 404);
    }
    if (dto.markdown && typeof dto.markdown === 'string') {
      writeFileSync(filePath, dto.markdown, 'utf-8');
      return this.parseContributorMarkdown(filePath)!;
    }
    const markdown = this.contributorToMarkdown(dto);
    writeFileSync(filePath, markdown, 'utf-8');
    return this.parseContributorMarkdown(filePath)!;
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete a contributor', description: 'Delete a contributor markdown file' })
  @ApiParam({ name: 'name', description: 'Contributor name (filename without .md)', example: 'jane-doe' })
  @ApiResponse({ status: 200, description: 'Contributor deleted successfully', type: String })
  @ApiResponse({ status: 404, description: 'Contributor not found', type: String })
  public deleteContributor(@Param('name') name: string): { message: string } {
    const filePath = join(this.contributorsDir, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Contributor not found', 404);
    }
    unlinkSync(filePath);
    return { message: 'Contributor deleted successfully' };
  }

  private contributorToMarkdown(dto: ContributorDto): string {
    let md = `# Contributor Profile: ${dto.name}\n\n`;
    if (dto.gitProfile) {
      md += `## Git Profile\n`;
      if (dto.gitProfile.username) md += `- **Username**: ${dto.gitProfile.username}\n`;
      if (dto.gitProfile.fullName) md += `- **Full Name**: ${dto.gitProfile.fullName}\n`;
      if (dto.gitProfile.email) md += `- **Email**: ${dto.gitProfile.email}\n`;
      if (dto.gitProfile.github) md += `- **GitHub**: ${dto.gitProfile.github}\n`;
      if (dto.gitProfile.location) md += `- **Location**: ${dto.gitProfile.location}\n`;
      if (dto.gitProfile.joined) md += `- **Joined**: ${dto.gitProfile.joined}\n`;
      md += `\n`;
    }
    if (dto.roleAndResponsibilities) {
      md += `## Role & Responsibilities\n`;
      if (dto.roleAndResponsibilities.position) md += `- **Position**: ${dto.roleAndResponsibilities.position}\n`;
      if (dto.roleAndResponsibilities.team) md += `- **Team**: ${dto.roleAndResponsibilities.team}\n`;
      if (dto.roleAndResponsibilities.focusAreas?.length) {
        md += `- **Focus Areas**: \n`;
        dto.roleAndResponsibilities.focusAreas.forEach((fa: string) => {
          md += `  - ${fa}\n`;
        });
      }
      md += `\n`;
    }
    if (dto.availability) {
      md += `## Timezone & Availability\n`;
      if (dto.availability.primaryTimezone) md += `- **Primary Timezone**: ${dto.availability.primaryTimezone}\n`;
      if (dto.availability.workingHours) md += `- **Working Hours**: ${dto.availability.workingHours}\n`;
      if (dto.availability.bestContactTime) md += `- **Best Contact Time**: ${dto.availability.bestContactTime}\n`;
      if (dto.availability.responseTime) md += `- **Response Time**: ${dto.availability.responseTime}\n`;
      md += `\n`;
    }
    if (dto.codingPreferences) {
      md += `## Coding Preferences\n`;
      if (dto.codingPreferences.primary?.length) md += `- **Primary**: ${dto.codingPreferences.primary.join(', ')}\n`;
      if (dto.codingPreferences.frontend) md += `- **Frontend**: ${dto.codingPreferences.frontend}\n`;
      if (dto.codingPreferences.backend) md += `- **Backend**: ${dto.codingPreferences.backend}\n`;
      if (dto.codingPreferences.databases) md += `- **Databases**: ${dto.codingPreferences.databases}\n`;
      if (dto.codingPreferences.tools) md += `- **Tools**: ${dto.codingPreferences.tools}\n`;
      md += `\n`;
    }
    if (dto.codeStyle) {
      md += `## Code Style\n`;
      if (dto.codeStyle.formatting) md += `- **Formatting**: ${dto.codeStyle.formatting}\n`;
      if (dto.codeStyle.linting) md += `- **Linting**: ${dto.codeStyle.linting}\n`;
      if (dto.codeStyle.testing) md += `- **Testing**: ${dto.codeStyle.testing}\n`;
      if (dto.codeStyle.documentation) md += `- **Documentation**: ${dto.codeStyle.documentation}\n`;
      md += `\n`;
    }
    if (dto.workflow) {
      md += `## Development Workflow\n`;
      if (dto.workflow.branching) md += `- **Branching**: ${dto.workflow.branching}\n`;
      if (dto.workflow.commits) md += `- **Commits**: ${dto.workflow.commits}\n`;
      if (dto.workflow.prProcess) md += `- **PR Process**: ${dto.workflow.prProcess}\n`;
      if (dto.workflow.codeReview) md += `- **Code Review**: ${dto.workflow.codeReview}\n`;
      md += `\n`;
    }
    if (dto.communication) {
      md += `## Communication Style\n`;
      if (dto.communication.codeReviews) md += `- **Code Reviews**: ${dto.communication.codeReviews}\n`;
      if (dto.communication.documentation) md += `- **Documentation**: ${dto.communication.documentation}\n`;
      if (dto.communication.meetings) md += `- **Meetings**: ${dto.communication.meetings}\n`;
      if (dto.communication.mentoring) md += `- **Mentoring**: ${dto.communication.mentoring}\n`;
      md += `\n`;
    }
    if (dto.expertise) {
      md += `## Expertise Areas\n`;
      if (dto.expertise.expertiseAreas?.length) {
        dto.expertise.expertiseAreas.forEach((area: string) => {
          md += `- ${area}\n`;
        });
      }
      md += `\n`;
    }
    if (dto.funFacts) {
      md += `## Fun Facts\n`;
      if (dto.funFacts.funFacts?.length) {
        dto.funFacts.funFacts.forEach((fact: string) => {
          md += `- ${fact}\n`;
        });
      }
      md += `\n`;
    }
    if (dto.contactPreferences) {
      md += `## Contact Preferences\n`;
      if (dto.contactPreferences.urgentIssues) md += `- **Urgent Issues**: ${dto.contactPreferences.urgentIssues}\n`;
      if (dto.contactPreferences.codeQuestions) md += `- **Code Questions**: ${dto.contactPreferences.codeQuestions}\n`;
      if (dto.contactPreferences.generalDiscussion) md += `- **General Discussion**: ${dto.contactPreferences.generalDiscussion}\n`;
      if (dto.contactPreferences.afterHours) md += `- **After Hours**: ${dto.contactPreferences.afterHours}\n`;
      md += `\n`;
    }
    if (dto.lastUpdated) {
      md += `---\n*Last Updated: ${dto.lastUpdated}*\n`;
    }
    return md.trim() + '\n';
  }

  private parseContributorMarkdown(filePath: string): ContributorDto | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      let name = '';
      let gitProfile: any = {};
      let roleAndResponsibilities: any = {};
      let availability: any = {};
      let codingPreferences: any = {};
      let codeStyle: any = {};
      let workflow: any = {};
      let communication: any = {};
      let expertise: any = {};
      let funFacts: any = {};
      let contactPreferences: any = {};
      let lastUpdated = '';
      let currentSection = '';

      // (no-op, left for future multi-line buffer support)

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('# Contributor Profile:')) {
          name = line.replace('# Contributor Profile:', '').trim();
        }
        // Section headers
        if (line.match(/^##\s*Git Profile/)) currentSection = 'gitProfile';
        else if (line.match(/^##\s*Role & Responsibilities/)) currentSection = 'roleAndResponsibilities';
        else if (line.match(/^##\s*Timezone & Availability/)) currentSection = 'availability';
        else if (line.match(/^##\s*Coding Preferences/)) currentSection = 'codingPreferences';
        else if (line.match(/^##\s*Code Style/)) currentSection = 'codeStyle';
        else if (line.match(/^##\s*Development Workflow/)) currentSection = 'workflow';
        else if (line.match(/^##\s*Communication Style/)) currentSection = 'communication';
        else if (line.match(/^##\s*Expertise Areas/)) currentSection = 'expertise';
        else if (line.match(/^##\s*Fun Facts/)) currentSection = 'funFacts';
        else if (line.match(/^##\s*Contact Preferences/)) currentSection = 'contactPreferences';
        else if (line.match(/^---/)) currentSection = 'lastUpdated';

        // Parse key-value pairs and lists
        if (currentSection === 'gitProfile' && line.match(/^- \*\*Username\*\*:/)) {
          gitProfile.username = line.replace(/^- \*\*Username\*\*: /, '').trim();
        } else if (currentSection === 'gitProfile' && line.match(/^- \*\*Full Name\*\*:/)) {
          gitProfile.fullName = line.replace(/^- \*\*Full Name\*\*: /, '').trim();
        } else if (currentSection === 'gitProfile' && line.match(/^- \*\*Email\*\*:/)) {
          gitProfile.email = line.replace(/^- \*\*Email\*\*: /, '').trim();
        } else if (currentSection === 'gitProfile' && line.match(/^- \*\*GitHub\*\*:/)) {
          gitProfile.github = line.replace(/^- \*\*GitHub\*\*: /, '').trim();
        } else if (currentSection === 'gitProfile' && line.match(/^- \*\*Location\*\*:/)) {
          gitProfile.location = line.replace(/^- \*\*Location\*\*: /, '').trim();
        } else if (currentSection === 'gitProfile' && line.match(/^- \*\*Joined\*\*:/)) {
          gitProfile.joined = line.replace(/^- \*\*Joined\*\*: /, '').trim();
        }

        if (currentSection === 'roleAndResponsibilities' && line.match(/^- \*\*Position\*\*:/)) {
          roleAndResponsibilities.position = line.replace(/^- \*\*Position\*\*: /, '').trim();
        } else if (currentSection === 'roleAndResponsibilities' && line.match(/^- \*\*Team\*\*:/)) {
          roleAndResponsibilities.team = line.replace(/^- \*\*Team\*\*: /, '').trim();
        } else if (currentSection === 'roleAndResponsibilities' && line.match(/^- \*\*Focus Areas\*\*:/)) {
          roleAndResponsibilities.focusAreas = [];
        } else if (currentSection === 'roleAndResponsibilities' && line.match(/^  - /)) {
          if (!roleAndResponsibilities.focusAreas) roleAndResponsibilities.focusAreas = [];
          roleAndResponsibilities.focusAreas.push(line.replace(/^  - /, '').trim());
        }

        if (currentSection === 'availability' && line.match(/^- \*\*Primary Timezone\*\*:/)) {
          availability.primaryTimezone = line.replace(/^- \*\*Primary Timezone\*\*: /, '').trim();
        } else if (currentSection === 'availability' && line.match(/^- \*\*Working Hours\*\*:/)) {
          availability.workingHours = line.replace(/^- \*\*Working Hours\*\*: /, '').trim();
        } else if (currentSection === 'availability' && line.match(/^- \*\*Best Contact Time\*\*:/)) {
          availability.bestContactTime = line.replace(/^- \*\*Best Contact Time\*\*: /, '').trim();
        } else if (currentSection === 'availability' && line.match(/^- \*\*Response Time\*\*:/)) {
          availability.responseTime = line.replace(/^- \*\*Response Time\*\*: /, '').trim();
        }

        if (currentSection === 'codingPreferences' && line.match(/^- \*\*Primary\*\*:/)) {
          codingPreferences.primary = line.replace(/^- \*\*Primary\*\*: /, '').split(',').map(s => s.trim());
        } else if (currentSection === 'codingPreferences' && line.match(/^- \*\*Frontend\*\*:/)) {
          codingPreferences.frontend = line.replace(/^- \*\*Frontend\*\*: /, '').trim();
        } else if (currentSection === 'codingPreferences' && line.match(/^- \*\*Backend\*\*:/)) {
          codingPreferences.backend = line.replace(/^- \*\*Backend\*\*: /, '').trim();
        } else if (currentSection === 'codingPreferences' && line.match(/^- \*\*Databases\*\*:/)) {
          codingPreferences.databases = line.replace(/^- \*\*Databases\*\*: /, '').trim();
        } else if (currentSection === 'codingPreferences' && line.match(/^- \*\*Tools\*\*:/)) {
          codingPreferences.tools = line.replace(/^- \*\*Tools\*\*: /, '').trim();
        }

        if (currentSection === 'codeStyle' && line.match(/^- \*\*Formatting\*\*:/)) {
          codeStyle.formatting = line.replace(/^- \*\*Formatting\*\*: /, '').trim();
        } else if (currentSection === 'codeStyle' && line.match(/^- \*\*Linting\*\*:/)) {
          codeStyle.linting = line.replace(/^- \*\*Linting\*\*: /, '').trim();
        } else if (currentSection === 'codeStyle' && line.match(/^- \*\*Testing\*\*:/)) {
          codeStyle.testing = line.replace(/^- \*\*Testing\*\*: /, '').trim();
        } else if (currentSection === 'codeStyle' && line.match(/^- \*\*Documentation\*\*:/)) {
          codeStyle.documentation = line.replace(/^- \*\*Documentation\*\*: /, '').trim();
        }

        if (currentSection === 'workflow' && line.match(/^- \*\*Branching\*\*:/)) {
          workflow.branching = line.replace(/^- \*\*Branching\*\*: /, '').trim();
        } else if (currentSection === 'workflow' && line.match(/^- \*\*Commits\*\*:/)) {
          workflow.commits = line.replace(/^- \*\*Commits\*\*: /, '').trim();
        } else if (currentSection === 'workflow' && line.match(/^- \*\*PR Process\*\*:/)) {
          workflow.prProcess = line.replace(/^- \*\*PR Process\*\*: /, '').trim();
        } else if (currentSection === 'workflow' && line.match(/^- \*\*Code Review\*\*:/)) {
          workflow.codeReview = line.replace(/^- \*\*Code Review\*\*: /, '').trim();
        }

        if (currentSection === 'communication' && line.match(/^- \*\*Code Reviews\*\*:/)) {
          communication.codeReviews = line.replace(/^- \*\*Code Reviews\*\*: /, '').trim();
        } else if (currentSection === 'communication' && line.match(/^- \*\*Documentation\*\*:/)) {
          communication.documentation = line.replace(/^- \*\*Documentation\*\*: /, '').trim();
        } else if (currentSection === 'communication' && line.match(/^- \*\*Meetings\*\*:/)) {
          communication.meetings = line.replace(/^- \*\*Meetings\*\*: /, '').trim();
        } else if (currentSection === 'communication' && line.match(/^- \*\*Mentoring\*\*:/)) {
          communication.mentoring = line.replace(/^- \*\*Mentoring\*\*: /, '').trim();
        }

        if (currentSection === 'expertise' && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
          if (!expertise.expertiseAreas) expertise.expertiseAreas = [];
          expertise.expertiseAreas.push(line.replace(/^[-*]\s*/, '').trim());
        }

        if (currentSection === 'funFacts' && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
          if (!funFacts.funFacts) funFacts.funFacts = [];
          funFacts.funFacts.push(line.replace(/^[-*]\s*/, '').trim());
        }

        if (currentSection === 'contactPreferences' && line.match(/^- \*\*Urgent Issues\*\*:/)) {
          contactPreferences.urgentIssues = line.replace(/^- \*\*Urgent Issues\*\*: /, '').trim();
        } else if (currentSection === 'contactPreferences' && line.match(/^- \*\*Code Questions\*\*:/)) {
          contactPreferences.codeQuestions = line.replace(/^- \*\*Code Questions\*\*: /, '').trim();
        } else if (currentSection === 'contactPreferences' && line.match(/^- \*\*General Discussion\*\*:/)) {
          contactPreferences.generalDiscussion = line.replace(/^- \*\*General Discussion\*\*: /, '').trim();
        } else if (currentSection === 'contactPreferences' && line.match(/^- \*\*After Hours\*\*:/)) {
          contactPreferences.afterHours = line.replace(/^- \*\*After Hours\*\*: /, '').trim();
        }

        if (currentSection === 'lastUpdated' && line.match(/\*Last Updated:/)) {
          lastUpdated = line.replace(/\*Last Updated:/, '').replace(/\*/g, '').trim();
        }
      }
      return {
        name,
        gitProfile: Object.keys(gitProfile).length ? gitProfile : undefined,
        roleAndResponsibilities: Object.keys(roleAndResponsibilities).length ? roleAndResponsibilities : undefined,
        availability: Object.keys(availability).length ? availability : undefined,
        codingPreferences: Object.keys(codingPreferences).length ? codingPreferences : undefined,
        codeStyle: Object.keys(codeStyle).length ? codeStyle : undefined,
        workflow: Object.keys(workflow).length ? workflow : undefined,
        communication: Object.keys(communication).length ? communication : undefined,
        expertise: Object.keys(expertise).length ? expertise : undefined,
        funFacts: Object.keys(funFacts).length ? funFacts : undefined,
        contactPreferences: Object.keys(contactPreferences).length ? contactPreferences : undefined,
        lastUpdated: lastUpdated || undefined
      };
    } catch (error) {
      console.error(`Error parsing contributor file ${filePath}:`, error);
      return null;
    }
  }

  private wrapContributorJson(filePath: string): MarkdownDto | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return {
        fileName: filePath,
        content: content
      };
    } catch (error) {
      console.error(`Error parsing contributor file ${filePath}:`, error);
      return null;
    }
  }
}
