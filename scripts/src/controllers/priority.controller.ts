import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { PriorityDto } from '../dto/priority.dto';

@ApiTags('priority')
@Controller('api/priority')
export class PriorityController {
  protected PRIORITY_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/priority.md');

  /**
   * GET /api/priority - Get all priority entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all priorities', description: 'Returns all priority entries from priority.md' })
  @ApiResponse({ status: 200, description: 'Priorities returned.' })
  getAll(): PriorityDto[] {
    return this.parsePriorities();
  }

  /**
   * GET /api/priority/:key - Get priority by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get priority by key', description: 'Returns a priority entry by key' })
  @ApiResponse({ status: 200, description: 'Priority returned.' })
  getByKey(@Param('key') key: string): PriorityDto {
    const priorities = this.parsePriorities();
    const found = priorities.find(p => p.key.toLowerCase() === key.toLowerCase());
    if (!found) throw new HttpException('Priority not found', HttpStatus.NOT_FOUND);
    return found;
  }

  /**
   * PUT /api/priority/:key - Update priority description by key
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update priority', description: 'Updates a priority description by key' })
  @ApiResponse({ status: 200, description: 'Priority updated.' })
  updatePriority(@Param('key') key: string, @Body() body: PriorityDto): PriorityDto {
    return this.modifyPriority(key, body.description, 'update');
  }

  /**
   * POST /api/priority - Add a new priority entry
   */
  @Post()
  @ApiOperation({ summary: 'Add priority', description: 'Adds a new priority entry' })
  @ApiResponse({ status: 200, description: 'Priority added.' })
  addPriority(@Body() body: PriorityDto): PriorityDto {
    return this.modifyPriority(body.key, body.description, 'add');
  }

  /**
   * DELETE /api/priority/:key - Delete priority by key
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete priority', description: 'Deletes a priority entry by key' })
  @ApiResponse({ status: 200, description: 'Priority deleted.' })
  deletePriority(@Param('key') key: string): { key: string } {
    this.modifyPriority(key, '', 'delete');
    return { key };
  }

  /**
   * Helper to parse priorities from markdown
   */
  private parsePriorities(): PriorityDto[] {
    if (!existsSync(this.PRIORITY_MD_PATH)) {
      throw new HttpException('priority.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.PRIORITY_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    const result: PriorityDto[] = [];
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
        const dto = new PriorityDto();
        dto.key = match[1].trim();
        dto.description = match[2].trim();
        if (dto.key) result.push(dto);
      }
    }
    return result;
  }

  /**
   * Helper to modify priorities in markdown
   * Overwrites the entire file on save/update
   */
  private modifyPriority(key: string, description: string, action: 'add' | 'update' | 'delete'): PriorityDto {
    if (!key) throw new HttpException('Priority key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.PRIORITY_MD_PATH)) {
      throw new HttpException('priority.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.PRIORITY_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    // Only keep lines that match the priority entry pattern
    let entries = lines.filter(line => /\*\*(.+?)\*\*/.test(line));
    const idx = entries.findIndex(l => l.toLowerCase().includes(`**${key.toLowerCase()}**`));
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Priority already exists', HttpStatus.CONFLICT);
      entries.push(`- **${key}** - ${description}`);
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Priority not found', HttpStatus.NOT_FOUND);
      entries[idx] = `- **${key}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Priority not found', HttpStatus.NOT_FOUND);
      entries.splice(idx, 1);
    }
    // Overwrite the entire file with the new entries
    const header = '# priority\n\nrepresents the urgency and importance of a work item\n\n';
    const updated = `${header}${entries.join('\n')}`;
    writeFileSync(this.PRIORITY_MD_PATH, updated, 'utf-8');
    const dto = new PriorityDto();
    dto.key = key;
    dto.description = description;
    return dto;
  }
}
