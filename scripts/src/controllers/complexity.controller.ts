import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { ComplexityDto } from '../dto/complexity.dto';

@ApiTags('complexity')
@Controller('api/complexity')
export class ComplexityController {
  protected COMPLEXITY_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/complexity.md');

  /**
   * GET /api/complexity - Get all complexity entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all complexities', description: 'Returns all complexity entries from complexity.md' })
  @ApiResponse({ status: 200, description: 'Complexities returned.' })
  getAll(): ComplexityDto[] {
    return this.parseComplexities();
  }

  /**
   * GET /api/complexity/:key - Get complexity by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get complexity by key', description: 'Returns a complexity entry by key' })
  @ApiResponse({ status: 200, description: 'Complexity returned.' })
  getByKey(@Param('key') key: string): ComplexityDto {
    const complexities = this.parseComplexities();
    const found = complexities.find(c => c.key.toLowerCase() === key.toLowerCase());
    if (!found) throw new HttpException('Complexity not found', HttpStatus.NOT_FOUND);
    return found;
  }

  /**
   * PUT /api/complexity/:key - Update complexity description by key
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update complexity', description: 'Updates a complexity description by key' })
  @ApiResponse({ status: 200, description: 'Complexity updated.' })
  updateComplexity(@Param('key') key: string, @Body() body: ComplexityDto): ComplexityDto {
    return this.modifyComplexity(key, body.description, 'update');
  }

  /**
   * POST /api/complexity - Add a new complexity entry
   */
  @Post()
  @ApiOperation({ summary: 'Add complexity', description: 'Adds a new complexity entry' })
  @ApiResponse({ status: 200, description: 'Complexity added.' })
  addComplexity(@Body() body: ComplexityDto): ComplexityDto {
    return this.modifyComplexity(body.key, body.description, 'add');
  }

  /**
   * DELETE /api/complexity/:key - Delete complexity by key
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete complexity', description: 'Deletes a complexity entry by key' })
  @ApiResponse({ status: 200, description: 'Complexity deleted.' })
  deleteComplexity(@Param('key') key: string): { key: string } {
    this.modifyComplexity(key, '', 'delete');
    return { key };
  }

  /**
   * Helper to parse complexities from markdown
   */
  private parseComplexities(): ComplexityDto[] {
    if (!existsSync(this.COMPLEXITY_MD_PATH)) {
      throw new HttpException('complexity.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.COMPLEXITY_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    const result: ComplexityDto[] = [];
    for (const line of lines) {
      // Accept: - **key** - description, **key** - description, - **key** description, **key** description
      let match = line.match(/^-?\s*\*\*(.+?)\*\*\s*-\s*(.+)$/);
      if (!match) {
        match = line.match(/^\s*\*\*(.+?)\*\*\s*-\s*(.+)$/);
      }
      if (!match) {
        match = line.match(/^-?\s*\*\*(.+?)\*\*\s+(.+)$/);
      }
      if (!match) {
        match = line.match(/^\s*\*\*(.+?)\*\*\s+(.+)$/);
      }
      if (match) {
        const dto = new ComplexityDto();
        dto.key = match[1].trim();
        dto.description = match[2].trim();
        if (dto.key) result.push(dto);
      }
    }
    return result;
  }

  /**
   * Helper to modify complexities in markdown
   * Overwrites the entire file on save/update
   */
  private modifyComplexity(key: string, description: string, action: 'add' | 'update' | 'delete'): ComplexityDto {
    if (!key) throw new HttpException('Complexity key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.COMPLEXITY_MD_PATH)) {
      throw new HttpException('complexity.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.COMPLEXITY_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    // Only keep lines that match the complexity entry pattern
    let entries = lines.filter(line => /\*\*(.+?)\*\*/.test(line));
    const idx = entries.findIndex(l => l.toLowerCase().includes(`**${key.toLowerCase()}**`));
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Complexity already exists', HttpStatus.CONFLICT);
      entries.push(`- **${key}** - ${description}`);
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Complexity not found', HttpStatus.NOT_FOUND);
      entries[idx] = `- **${key}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Complexity not found', HttpStatus.NOT_FOUND);
      entries.splice(idx, 1);
    }
    // Overwrite the entire file with the new entries
    const header = '# complexity\n\nrepresents the relative size and effort required for a work item\n\n';
    const updated = `${header}${entries.join('\n')}`;
    writeFileSync(this.COMPLEXITY_MD_PATH, updated, 'utf-8');
    const dto = new ComplexityDto();
    dto.key = key;
    dto.description = description;
    return dto;
  }
}
