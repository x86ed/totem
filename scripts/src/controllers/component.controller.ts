import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
// import { resolve } from 'path';

import { ComponentDto } from '../dto/component.dto';

@ApiTags('component')
@Controller('api/component')
export class ComponentController {
  protected ID_MD_PATH: string;
  constructor(
    @Inject('COMPONENT_MARKDOWN_PATH') mdPath: string
  ) {
    this.ID_MD_PATH = mdPath;
  }

  /**
   * Allows tests to override the markdown file path
   */
  setFilePath(path: string) {
    this.ID_MD_PATH = path;
  }

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
   * PUT /api/component/:key - Update component description by key (optionally update key)
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update component', description: 'Updates a component description by key. Optionally updates the key if newKey is provided.' })
  @ApiResponse({ status: 200, description: 'Component updated.' })
  updateComponent(@Param('key') key: string, @Body() body: ComponentDto & { newKey?: string }): ComponentDto {
    const newKey = body.newKey && body.newKey.trim() ? body.newKey.trim() : key;
    return this.modifyComponent(key, body.description, 'update', newKey);
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
    // Use the same regex as modifyComponent
    const match = content.match(/(## Component\s*\r?\n)([\s\S]*?)(\r?\n## |$)/);
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
   * Now supports key change for 'update' action.
   */
  private modifyComponent(
    key: string,
    description: string,
    action: 'add' | 'update' | 'delete',
    newKey?: string
  ): ComponentDto {
    if (!key) throw new HttpException('Component key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Robustly extract the ## Component section
    const match = content.match(/(## Component\s*\r?\n)([\s\S]*?)(\r?\n## |$)/);
    if (!match) throw new HttpException('Component section not found', HttpStatus.NOT_FOUND);
    const before = content.slice(0, match.index! + match[1].length);
    const after = content.slice(match.index! + match[0].length - match[3].length);
    let rawLines = match[2].split(/\r?\n/);
    // Find index by key (case-insensitive)
    const idx = rawLines.findIndex(l => {
      const m = l.match(/\*\*(.+?)\*\*/);
      return m && m[1].trim().toLowerCase() === key.trim().toLowerCase();
    });
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Component already exists', HttpStatus.CONFLICT);
      // Only add a blank line if the section is not empty and last line is not blank
      if (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() !== '') {
        rawLines.push(`- **${key}** - ${description}`);
      } else {
        // If section is empty or last line is blank, just add the entry
        rawLines[rawLines.length - 1] = `- **${key}** - ${description}`;
      }
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Component not found', HttpStatus.NOT_FOUND);
      const finalKey = newKey && newKey !== key ? newKey : key;
      rawLines[idx] = `- **${finalKey}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Component not found', HttpStatus.NOT_FOUND);
      rawLines.splice(idx, 1);
    }
    // Remove leading/trailing blank lines
    let componentLines = rawLines;
    while (componentLines.length && !componentLines[0].trim()) componentLines.shift();
    while (componentLines.length && !componentLines[componentLines.length - 1].trim()) componentLines.pop();
    // Rebuild section with exactly one blank line above and below
    let newSection = '';
    if (componentLines.length > 0) {
      newSection = '\n' + componentLines.join('\n') + '\n';
    } else {
      newSection = '\n';
    }
    // Ensure only one blank line above and below
    let updated = before.replace(/\n*$/, '\n') + newSection + after.replace(/^\n*/, '\n');
    writeFileSync(this.ID_MD_PATH, updated, 'utf-8');
    const dto = new ComponentDto();
    dto.key = newKey && newKey !== key ? newKey : key;
    dto.description = description;
    return dto;
  }
}

