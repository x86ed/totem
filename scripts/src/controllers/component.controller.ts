import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { ComponentDto } from '../dto/component.dto';

@ApiTags('component')
@Controller('api/component')
export class ComponentController {
  protected ID_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/id.md');

  /**
   * GET /api/component - Get all component entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all components', description: 'Returns all component entries from id.md' })
  @ApiResponse({ status: 200, description: 'Components returned.' })
  getAll(): ComponentDto[] {
    const components = this.parseComponents();
    return components;
  }

  /**
   * GET /api/component/:key - Get component by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get component by key', description: 'Returns a component entry by key' })
  @ApiResponse({ status: 200, description: 'Component returned.' })
  getByKey(@Param('key') key: string): ComponentDto {
    const components = this.parseComponents();
    const found = components.find(c => c.key.toLowerCase() === key.toLowerCase());
    if (!found) throw new HttpException('Component not found', HttpStatus.NOT_FOUND);
    return found;
  }

  /**
   * PUT /api/component/:key - Update component description by key
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update component', description: 'Updates a component description by key' })
  @ApiResponse({ status: 200, description: 'Component updated.' })
  updateComponent(@Param('key') key: string, @Body() body: ComponentDto): ComponentDto {
    return this.modifyComponent(key, body.description, 'update');
  }

  /**
   * POST /api/component - Add a new component entry
   */
  @Post()
  @ApiOperation({ summary: 'Add component', description: 'Adds a new component entry' })
  @ApiResponse({ status: 200, description: 'Component added.' })
  addComponent(@Body() body: ComponentDto): ComponentDto {
    return this.modifyComponent(body.key, body.description, 'add');
  }

  /**
   * DELETE /api/component/:key - Delete component by key
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete component', description: 'Deletes a component entry by key' })
  @ApiResponse({ status: 200, description: 'Component deleted.' })
  deleteComponent(@Param('key') key: string): { key: string } {
    this.modifyComponent(key, '', 'delete');
    return { key };
  }

  /**
   * Helper to parse components from markdown
   */
  private parseComponents(): ComponentDto[] {
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Robustly extract the ## Component section, even if there are blank lines or extra whitespace
    const match = content.match(/(## Component\s*\r?\n)([\s\S]*?)(\r?\n## [^\r\n]+|$)/);
    if (!match) return [];
    const section = match[2];
    const lines = section.split(/\r?\n/);
    const result: ComponentDto[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      let matchLine = line.match(/^-?\s*\*\*(.+?)\*\*\s*-\s*(.+)$/);
      if (!matchLine) {
        matchLine = line.match(/^\s*\*\*(.+?)\*\*\s*-\s*(.+)$/);
      }
      if (!matchLine) {
        matchLine = line.match(/^-?\s*\*\*(.+?)\*\*\s+(.+)$/);
      }
      if (!matchLine) {
        matchLine = line.match(/^\s*\*\*(.+?)\*\*\s+(.+)$/);
      }
      if (matchLine) {
        const dto = new ComponentDto();
        dto.key = matchLine[1].trim();
        dto.description = matchLine[2].trim();
        if (dto.key) result.push(dto);
      }
    }
    return result;
  }

  /**
   * Helper to modify components in markdown
   */
  private modifyComponent(key: string, description: string, action: 'add' | 'update' | 'delete'): ComponentDto {
    if (!key) throw new HttpException('Component key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Match Component section robustly (handles \n, \r\n, extra whitespace, and section at end of file)
    const match = content.match(/(## Component\s*\r?\n)([\s\S]*?)(\r?\n## [^\r\n]+|$)/);
    if (!match) throw new HttpException('Component section not found', HttpStatus.NOT_FOUND);
    const before = content.slice(0, match.index! + match[1].length);
    const after = content.slice(match.index! + match[0].length - match[3].length);
    let componentLines = match[2].split(/\r?\n/).map(l => l.trim());
    const idx = componentLines.findIndex(l => l.toLowerCase().includes(`**${key.toLowerCase()}**`));
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Component already exists', HttpStatus.CONFLICT);
      componentLines.push(`- **${key}** - ${description}`);
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Component not found', HttpStatus.NOT_FOUND);
      componentLines[idx] = `- **${key}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Component not found', HttpStatus.NOT_FOUND);
      componentLines.splice(idx, 1);
    }
    // Only replace the Component section
    const newComponentSection = componentLines.filter(l => l).join('\n');
    const updated = `${before}${newComponentSection}${after}`;
    writeFileSync(this.ID_MD_PATH, updated, 'utf-8');
    const dto = new ComponentDto();
    dto.key = key;
    dto.description = description;
    return dto;
  }
}

