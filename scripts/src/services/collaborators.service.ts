import { Injectable, HttpException } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { ContributorDto } from '../dto/contributor.dto';

const CONTRIBUTORS_DIR = resolve(process.cwd(), '.totem/contributors');

@Injectable()
export class ContributorsService {
  getAllContributors(): ContributorDto[] {
    if (!existsSync(CONTRIBUTORS_DIR)) {
      throw new Error('Could not read contributors directory');
    }
    const files = readdirSync(CONTRIBUTORS_DIR).filter(f => f.endsWith('.md'));
    return files
      .map(f => this.parseContributorMarkdown(join(CONTRIBUTORS_DIR, f)))
      .filter((c): c is ContributorDto => !!c);
  }

  getContributorByName(name: string): { fileName: string; content: string } {
    const filePath = join(CONTRIBUTORS_DIR, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Contributor not found', 404);
    }
    const content = readFileSync(filePath, 'utf-8');
    return { fileName: filePath, content };
  }

  createContributor(dto: ContributorDto): ContributorDto {
    const filePath = join(CONTRIBUTORS_DIR, `${dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}.md`);
    if (existsSync(filePath)) {
      throw new HttpException('Contributor already exists', 400);
    }
    const markdown = this.contributorToMarkdown(dto);
    writeFileSync(filePath, markdown, 'utf-8');
    return this.parseContributorMarkdown(filePath)!;
  }

  updateContributor(name: string, dto: any): ContributorDto {
    const filePath = join(CONTRIBUTORS_DIR, `${name}.md`);
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

  deleteContributor(name: string): { message: string } {
    const filePath = join(CONTRIBUTORS_DIR, `${name}.md`);
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
      // You can use the same parsing logic as in the controller, or import it if shared
      // For brevity, just return a minimal object here
      // In production, use the full parser from the controller
      return { name: filePath.split('/').pop()?.replace(/\.md$/, '') || '' } as ContributorDto;
    } catch (error) {
      console.error(`Error parsing contributor file ${filePath}:`, error);
      return null;
    }
  }
}
