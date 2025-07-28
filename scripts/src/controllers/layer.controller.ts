import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { LayerDto } from '../dto/layer.dto';

@ApiTags('layer')
@Controller('api/layer')
export class LayerController {
  protected ID_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/id.md');

  /**
   * GET /api/layer - Get all layer entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all layers', description: 'Returns all layer entries from id.md' })
  @ApiResponse({ status: 200, description: 'Layers returned.' })
  getAll(): LayerDto[] {
    const layers = this.parseLayers();
    return layers;
  }

  /**
   * GET /api/layer/:key - Get layer by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get layer by key', description: 'Returns a layer entry by key' })
  @ApiResponse({ status: 200, description: 'Layer returned.' })
  getByKey(@Param('key') key: string): LayerDto {
    const layers = this.parseLayers();
    const found = layers.find(l => l.key.toLowerCase() === key.toLowerCase());
    if (!found) throw new HttpException('Layer not found', HttpStatus.NOT_FOUND);
    return found;
  }

  /**
   * PUT /api/layer/:key - Update layer description by key (optionally update key)
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update layer', description: 'Updates a layer description by key. Optionally updates the key if newKey is provided.' })
  @ApiResponse({ status: 200, description: 'Layer updated.' })
  updateLayer(@Param('key') key: string, @Body() body: LayerDto & { newKey?: string }): LayerDto {
    const newKey = body.newKey && body.newKey.trim() ? body.newKey.trim() : key;
    return this.modifyLayer(key, body.description, 'update', newKey);
  }

  /**
   * POST /api/layer - Add a new layer entry
   */
  @Post()
  @ApiOperation({ summary: 'Add layer', description: 'Adds a new layer entry' })
  @ApiResponse({ status: 200, description: 'Layer added.' })
  addLayer(@Body() body: LayerDto): LayerDto {
    return this.modifyLayer(body.key, body.description, 'add');
  }

  /**
   * DELETE /api/layer/:key - Delete layer by key
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete layer', description: 'Deletes a layer entry by key' })
  @ApiResponse({ status: 200, description: 'Layer deleted.' })
  deleteLayer(@Param('key') key: string): { key: string } {
    this.modifyLayer(key, '', 'delete');
    return { key };
  }

  /**
   * Helper to parse layers from markdown
   */
  private parseLayers(): LayerDto[] {
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    const lines = content.split(/\r?\n/);
    let inLayerSection = false;
    const result: LayerDto[] = [];
    for (const line of lines) {
      if (line.trim().startsWith('## Layer')) {
        inLayerSection = true;
        continue;
      }
      if (inLayerSection) {
        if (line.trim().startsWith('## ')) break;
        if (!line.trim()) continue;
        // Accept: - **Key** - Description, **Key** - Description, - **Key** Description, **Key** Description
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
          const dto = new LayerDto();
          dto.key = match[1].trim();
          dto.description = match[2].trim();
          if (dto.key) result.push(dto);
        }
      }
    }
    return result;
  }

  /**
   * Helper to modify layers in markdown
   * Now supports key change for 'update' action.
   */
  private modifyLayer(
    key: string,
    description: string,
    action: 'add' | 'update' | 'delete',
    newKey?: string
  ): LayerDto {
    if (!key) throw new HttpException('Layer key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Match Layer section robustly (handles any whitespace, blank lines, and section at end of file)
    const match = content.match(/(## Layer\s*\r?\n+)([\s\S]*?)(\r?\n+## |\r?\n+##|$)/);
    if (!match) throw new HttpException('Layer section not found', HttpStatus.NOT_FOUND);
    const before = content.slice(0, match.index! + match[1].length);
    const after = content.slice(match.index! + match[0].length - match[3].length);
    let layerLines = match[2].split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
    const idx = layerLines.findIndex(l => l.toLowerCase().includes(`**${key.toLowerCase()}**`));
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Layer already exists', HttpStatus.CONFLICT);
      layerLines.push(`- **${key}** - ${description}`);
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Layer not found', HttpStatus.NOT_FOUND);
      const finalKey = newKey && newKey !== key ? newKey : key;
      layerLines[idx] = `- **${finalKey}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Layer not found', HttpStatus.NOT_FOUND);
      layerLines.splice(idx, 1);
    }
    // Only replace the Layer section
    const newLayerSection = layerLines.filter(l => l).join('\n');
    const updated = `${before}${newLayerSection}${after}`;
    writeFileSync(this.ID_MD_PATH, updated, 'utf-8');
    const dto = new LayerDto();
    dto.key = newKey && newKey !== key ? newKey : key;
    dto.description = description;
    return dto;
  }
}
