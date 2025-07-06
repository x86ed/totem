
import { Controller, Get, Param, Post, Body, Put, Delete, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PersonaDto, PersonaContextSectionDto } from '../dto/persona.dto';
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@ApiTags('personas')
@Controller('api/persona')
export class PersonaController {
  private personasDir = join(process.cwd(), '.totem/personas');

  @Get()
  @ApiOperation({ summary: 'Get all personas', description: 'Retrieve all personas from markdown files' })
  @ApiResponse({ status: 200, description: 'List of personas', type: PersonaDto, isArray: true })
  public getAllPersonas(): PersonaDto[] {
    if (!existsSync(this.personasDir)) return [];
    const files = readdirSync(this.personasDir).filter(f => f.endsWith('.md'));
    return files
      .map(f => this.parsePersonaMarkdown(join(this.personasDir, f)))
      .filter((p): p is PersonaDto => !!p);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get persona by name', description: 'Retrieve a persona by name (filename without .md)' })
  @ApiParam({ name: 'name', description: 'Persona name (filename without .md)', example: 'refactor-raleigh' })
  @ApiResponse({ status: 200, description: 'Persona found', type: PersonaDto })
  @ApiResponse({ status: 404, description: 'Persona not found', type: String })
  public getPersonaByName(@Param('name') name: string): PersonaDto {
    const filePath = join(this.personasDir, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Persona not found', 404);
    }
    const persona = this.parsePersonaMarkdown(filePath);
    if (!persona) {
      throw new HttpException('Persona not found', 404);
    }
    return persona;
  }


  @Post()
  @ApiOperation({ summary: 'Create a new persona', description: 'Create a new persona markdown file' })
  @ApiBody({ type: PersonaDto, description: 'Persona data to create' })
  @ApiResponse({ status: 201, description: 'Persona created successfully', type: PersonaDto })
  @ApiResponse({ status: 400, description: 'Persona already exists or invalid data', type: String })
  public createPersona(@Body() dto: PersonaDto): PersonaDto {
    const filePath = join(this.personasDir, `${dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}.md`);
    if (existsSync(filePath)) {
      throw new HttpException('Persona already exists', 400);
    }
    const markdown = this.personaToMarkdown(dto);
    writeFileSync(filePath, markdown, 'utf-8');
    return this.parsePersonaMarkdown(filePath)!;
  }

  @Put(':name')
  @ApiOperation({ summary: 'Update a persona', description: 'Update an existing persona markdown file' })
  @ApiParam({ name: 'name', description: 'Persona name (filename without .md)', example: 'refactor-raleigh' })
  @ApiBody({ type: PersonaDto, description: 'Persona data to update' })
  @ApiResponse({ status: 200, description: 'Persona updated successfully', type: PersonaDto })
  @ApiResponse({ status: 404, description: 'Persona not found', type: String })
  public updatePersona(@Param('name') name: string, @Body() dto: PersonaDto): PersonaDto {
    const filePath = join(this.personasDir, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Persona not found', 404);
    }
    const markdown = this.personaToMarkdown(dto);
    writeFileSync(filePath, markdown, 'utf-8');
    return this.parsePersonaMarkdown(filePath)!;
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete a persona', description: 'Delete a persona markdown file' })
  @ApiParam({ name: 'name', description: 'Persona name (filename without .md)', example: 'refactor-raleigh' })
  @ApiResponse({ status: 200, description: 'Persona deleted successfully', type: String })
  @ApiResponse({ status: 404, description: 'Persona not found', type: String })
  public deletePersona(@Param('name') name: string): { message: string } {
    const filePath = join(this.personasDir, `${name}.md`);
    if (!existsSync(filePath)) {
      throw new HttpException('Persona not found', 404);
    }
    unlinkSync(filePath);
    return { message: 'Persona deleted successfully' };
  }

  private personaToMarkdown(dto: PersonaDto): string {
    let md = `# ${dto.name}\n\n`;
    md += `**Primary Focus:** ${dto.primaryFocus}\n\n`;
    md += `## Decision Framework\n\n`;
    if (dto.decisionFramework?.priorities?.length) {
      md += `**When choosing between options, prioritize:**\n`;
      dto.decisionFramework.priorities.forEach((p, i) => {
        md += `${i + 1}. ${p}\n`;
      });
      md += `\n`;
    }
    if (dto.decisionFramework?.defaultAssumptions?.length) {
      md += `**Default assumptions:**\n`;
      dto.decisionFramework.defaultAssumptions.forEach(a => {
        md += `- ${a}\n`;
      });
      md += `\n`;
    }
    if (dto.codePatterns) {
      md += `## Code Patterns\n\n`;
      if (dto.codePatterns.alwaysImplement?.length) {
        md += `**Always implement:**\n`;
        dto.codePatterns.alwaysImplement.forEach(a => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
      if (dto.codePatterns.avoid?.length) {
        md += `**Avoid:**\n`;
        dto.codePatterns.avoid.forEach(a => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
    }
    if (dto.requirementsPatterns) {
      md += `## Requirements Patterns\n\n`;
      if (dto.requirementsPatterns.alwaysInclude?.length) {
        md += `**Always include:**\n`;
        dto.requirementsPatterns.alwaysInclude.forEach(a => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
      if (dto.requirementsPatterns.avoid?.length) {
        md += `**Avoid:**\n`;
        dto.requirementsPatterns.avoid.forEach(a => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
    }
    md += `## Domain Context\n\n`;
    if (dto.domainContexts?.length) {
      dto.domainContexts.forEach(ctx => {
        md += `### ${ctx.name}\n\n`;
        ctx.items.forEach(item => {
          md += `- ${item}\n`;
        });
        md += `\n`;
      });
    }
    if (dto.reviewChecklist) {
      md += `## Code Review\n\n`;
      if (dto.reviewChecklist.redFlags?.length) {
        md += `**Red flags:**\n\n`;
        dto.reviewChecklist.redFlags.forEach(r => {
          md += `- ${r}\n`;
        });
        md += `\n`;
      }
      if (dto.reviewChecklist.greenFlags?.length) {
        md += `**Green flags:**\n\n`;
        dto.reviewChecklist.greenFlags.forEach(g => {
          md += `- ${g}\n`;
        });
        md += `\n`;
      }
    }
    return md.trim() + '\n';
  }


  private parsePersonaMarkdown(filePath: string): PersonaDto | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      let name = '';
      let primaryFocus = '';
      let priorities: string[] = [];
      let defaultAssumptions: string[] = [];
      let alwaysImplement: string[] = [];
      let avoid: string[] = [];
      let codeExamples: string[] = [];
      let requirementsAlwaysInclude: string[] = [];
      let requirementsAvoid: string[] = [];
      let domainContexts: PersonaContextSectionDto[] = [];
      let reviewRedFlags: string[] = [];
      let reviewGreenFlags: string[] = [];
      let currentSection = '';
      let currentContext: PersonaContextSectionDto | null = null;
      let buffer: string[] = [];

      const flushBufferTo = (target: string[]) => {
        if (buffer.length > 0) {
          target.push(...buffer.map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean));
          buffer = [];
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('# ')) {
          name = line.replace('# ', '').trim();
        } else if (line.startsWith('**Primary Focus:**')) {
          primaryFocus = line.replace('**Primary Focus:**', '').trim();
        } else if (line.match(/^##?\s*Decision Framework/)) {
          currentSection = 'decisionFramework';
        } else if (line.match(/^##?\s*Code Patterns/)) {
          currentSection = 'codePatterns';
        } else if (line.match(/^##?\s*Requirements Patterns/)) {
          currentSection = 'requirementsPatterns';
        } else if (line.match(/^##?\s*Domain Context/)) {
          currentSection = 'domainContext';
        } else if (line.match(/^##?\s*Review/)) {
          currentSection = 'review';
        } else if (line.match(/^###\s*(.+)$/)) {
          // Arbitrary context section
          flushBufferTo(currentContext?.items || []);
          if (currentContext) {
            domainContexts.push({ ...currentContext });
          }
          currentContext = { name: line.replace(/^###\s*/, '').trim(), items: [] };
          currentSection = 'contextSection';
        } else if (line.match(/^\*\*When choosing between options, prioritize:\*\*/)) {
          currentSection = 'priorities';
        } else if (line.match(/^\*\*Default assumptions:\*\*/)) {
          currentSection = 'defaultAssumptions';
        } else if (line.match(/^\*\*Always implement:\*\*/)) {
          currentSection = 'alwaysImplement';
        } else if (line.match(/^\*\*Avoid:\*\*/)) {
          currentSection = 'avoid';
        } else if (line.match(/^\*\*Always include:\*\*/)) {
          currentSection = 'requirementsAlwaysInclude';
        } else if (line.match(/^\*\*Red flags:\*\*/)) {
          currentSection = 'reviewRedFlags';
        } else if (line.match(/^\*\*Green flags:\*\*/)) {
          currentSection = 'reviewGreenFlags';
        } else if (line.match(/^```/)) {
          // Skip code fences for now
          continue;
        } else if (currentSection === 'priorities' && line.match(/^\d+\.\s/)) {
          priorities.push(line.replace(/^\d+\.\s*/, '').trim());
        } else if (currentSection === 'defaultAssumptions' && line.trim().startsWith('-')) {
          defaultAssumptions.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'alwaysImplement' && line.trim().startsWith('-')) {
          alwaysImplement.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'avoid' && line.trim().startsWith('-')) {
          avoid.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'requirementsAlwaysInclude' && line.trim().startsWith('-')) {
          requirementsAlwaysInclude.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'requirementsAvoid' && line.trim().startsWith('-')) {
          requirementsAvoid.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'reviewRedFlags' && line.trim().startsWith('-')) {
          reviewRedFlags.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'reviewGreenFlags' && line.trim().startsWith('-')) {
          reviewGreenFlags.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (currentSection === 'contextSection' && line.trim().startsWith('-')) {
          if (currentContext) currentContext.items.push(line.replace(/^[-*]\s*/, '').trim());
        }
      }
      // Flush last context section
      if (currentContext) {
        domainContexts.push({ ...currentContext });
      }
      // Compose DTO
      return {
        name,
        primaryFocus,
        decisionFramework: {
          priorities,
          defaultAssumptions
        },
        codePatterns: alwaysImplement.length || avoid.length ? {
          alwaysImplement: alwaysImplement.length ? alwaysImplement : undefined,
          avoid: avoid.length ? avoid : undefined
        } : undefined,
        requirementsPatterns: requirementsAlwaysInclude.length || requirementsAvoid.length ? {
          alwaysInclude: requirementsAlwaysInclude.length ? requirementsAlwaysInclude : undefined,
          avoid: requirementsAvoid.length ? requirementsAvoid : undefined
        } : undefined,
        domainContexts,
        reviewChecklist: reviewRedFlags.length || reviewGreenFlags.length ? {
          redFlags: reviewRedFlags,
          greenFlags: reviewGreenFlags
        } : undefined
      };
    } catch (error) {
      console.error(`Error parsing persona file ${filePath}:`, error);
      return null;
    }
  }

}
