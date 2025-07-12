import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { StatusDto } from '../dto/status.dto';

@ApiTags('status')
@Controller('api/status')
export class StatusController {
  protected STATUS_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/status.md');

  /**
   * GET /api/status - Get all status entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all statuses', description: 'Returns all status entries from status.md' })
  @ApiResponse({ status: 200, description: 'Statuses returned.' })
  getAll(): StatusDto[] {
    return this.parseStatuses();
  }

  /**
   * GET /api/status/:key - Get status by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get status by key', description: 'Returns a status entry by key' })
  @ApiResponse({ status: 200, description: 'Status returned.' })
  getByKey(@Param('key') key: string): StatusDto {
    const statuses = this.parseStatuses();
    const found = statuses.find(s => s.key.toLowerCase() === key.toLowerCase());
    if (!found) throw new HttpException('Status not found', HttpStatus.NOT_FOUND);
    return found;
  }

  /**
   * PUT /api/status/:key - Update status description by key
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update status', description: 'Updates a status description by key' })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  updateStatus(@Param('key') key: string, @Body() body: StatusDto): StatusDto {
    return this.modifyStatus(key, body.description, 'update');
  }

  /**
   * POST /api/status - Add a new status entry
   */
  @Post()
  @ApiOperation({ summary: 'Add status', description: 'Adds a new status entry' })
  @ApiResponse({ status: 200, description: 'Status added.' })
  addStatus(@Body() body: StatusDto): StatusDto {
    return this.modifyStatus(body.key, body.description, 'add');
  }

  /**
   * DELETE /api/status/:key - Delete status by key
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete status', description: 'Deletes a status entry by key' })
  @ApiResponse({ status: 200, description: 'Status deleted.' })
  deleteStatus(@Param('key') key: string): { key: string } {
    this.modifyStatus(key, '', 'delete');
    return { key };
  }

  /**
   * Helper to parse statuses from markdown
   */
  private parseStatuses(): StatusDto[] {
    if (!existsSync(this.STATUS_MD_PATH)) {
      throw new HttpException('status.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.STATUS_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    const result: StatusDto[] = [];
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
        const dto = new StatusDto();
        dto.key = match[1].trim();
        dto.description = match[2].trim();
        if (dto.key) result.push(dto);
      }
    }
    return result;
  }

  /**
   * Helper to modify statuses in markdown
   * Overwrites the entire file on save/update
   */
  private modifyStatus(key: string, description: string, action: 'add' | 'update' | 'delete'): StatusDto {
    if (!key) throw new HttpException('Status key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.STATUS_MD_PATH)) {
      throw new HttpException('status.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.STATUS_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    // Only keep lines that match the status entry pattern
    let entries = lines.filter(line => /\*\*(.+?)\*\*/.test(line));
    const idx = entries.findIndex(l => l.toLowerCase().includes(`**${key.toLowerCase()}**`));
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Status already exists', HttpStatus.CONFLICT);
      entries.push(`- **${key}** - ${description}`);
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Status not found', HttpStatus.NOT_FOUND);
      entries[idx] = `- **${key}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Status not found', HttpStatus.NOT_FOUND);
      entries.splice(idx, 1);
    }
    // Overwrite the entire file with the new entries
    const header = '# status\n\nrepresents the status of a work item\n\n';
    const updated = `${header}${entries.join('\n')}`;
    writeFileSync(this.STATUS_MD_PATH, updated, 'utf-8');
    const dto = new StatusDto();
    dto.key = key;
    dto.description = description;
    return dto;
  }
}
