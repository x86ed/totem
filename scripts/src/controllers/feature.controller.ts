import { Controller, Get, Put, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { FeatureDto } from '../dto/feature.dto';

@ApiTags('feature')
@Controller('api/feature')
export class FeatureController {
  protected ID_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/id.md');

  /**
   * GET /api/feature - Get all feature entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all features', description: 'Returns all feature entries from id.md' })
  @ApiResponse({ status: 200, description: 'Features returned.' })
  getAll(): FeatureDto[] {
    const features = this.parseFeatures();
    return features;
  }

  /**
   * GET /api/feature/:key - Get feature by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get feature by key', description: 'Returns a feature entry by key' })
  @ApiResponse({ status: 200, description: 'Feature returned.' })
  getByKey(@Param('key') key: string): FeatureDto {
    const features = this.parseFeatures();
    const found = features.find(f => f.key.toLowerCase() === key.toLowerCase());
    if (!found) throw new HttpException('Feature not found', HttpStatus.NOT_FOUND);
    return found;
  }

  /**
   * PUT /api/feature/:key - Update feature description by key
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update feature', description: 'Updates a feature description by key' })
  @ApiResponse({ status: 200, description: 'Feature updated.' })
  updateFeature(@Param('key') key: string, @Body() body: FeatureDto): FeatureDto {
    return this.modifyFeature(key, body.description, 'update');
  }

  /**
   * POST /api/feature - Add a new feature entry
   */
  @Post()
  @ApiOperation({ summary: 'Add feature', description: 'Adds a new feature entry' })
  @ApiResponse({ status: 200, description: 'Feature added.' })
  addFeature(@Body() body: FeatureDto): FeatureDto {
    return this.modifyFeature(body.key, body.description, 'add');
  }

  /**
   * DELETE /api/feature/:key - Delete feature by key
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete feature', description: 'Deletes a feature entry by key' })
  @ApiResponse({ status: 200, description: 'Feature deleted.' })
  deleteFeature(@Param('key') key: string): { key: string } {
    this.modifyFeature(key, '', 'delete');
    return { key };
  }

  /**
   * Helper to parse features from markdown
   */
  private parseFeatures(): FeatureDto[] {
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Robustly extract the ## Feature section
    const match = content.match(/(## Feature\s*\r?\n)([\s\S]*?)(\r?\n## |$)/);
    if (!match) return [];
    const section = match[2];
    const lines = section.split(/\r?\n/);
    const result: FeatureDto[] = [];
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
        const dto = new FeatureDto();
        dto.key = matchLine[1].trim();
        dto.description = matchLine[2].trim();
        if (dto.key) result.push(dto);
      }
    }
    return result;
  }

  /**
   * Helper to modify features in markdown
   */
  private modifyFeature(key: string, description: string, action: 'add' | 'update' | 'delete'): FeatureDto {
    if (!key) throw new HttpException('Feature key required', HttpStatus.BAD_REQUEST);
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Match Feature section robustly
    const match = content.match(/(## Feature\s*\r?\n)([\s\S]*?)(\r?\n## |$)/);
    if (!match) throw new HttpException('Feature section not found', HttpStatus.NOT_FOUND);
    const before = content.slice(0, match.index! + match[1].length);
    const after = content.slice(match.index! + match[0].length - match[3].length);
    let featureLines = match[2].split(/\r?\n/).map(l => l.trim());
    const idx = featureLines.findIndex(l => l.toLowerCase().includes(`**${key.toLowerCase()}**`));
    if (action === 'add') {
      if (idx !== -1) throw new HttpException('Feature already exists', HttpStatus.CONFLICT);
      featureLines.push(`- **${key}** - ${description}`);
    } else if (action === 'update') {
      if (idx === -1) throw new HttpException('Feature not found', HttpStatus.NOT_FOUND);
      featureLines[idx] = `- **${key}** - ${description}`;
    } else if (action === 'delete') {
      if (idx === -1) throw new HttpException('Feature not found', HttpStatus.NOT_FOUND);
      featureLines.splice(idx, 1);
    }
    // Only replace the Feature section
    const newFeatureSection = featureLines.filter(l => l).join('\n');
    const updated = `${before}${newFeatureSection}${after}`;
    writeFileSync(this.ID_MD_PATH, updated, 'utf-8');
    const dto = new FeatureDto();
    dto.key = key;
    dto.description = description;
    return dto;
  }
}
