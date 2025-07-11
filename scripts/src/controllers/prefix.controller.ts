import { Controller, Get, Put, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PrefixDto } from '../dto/prefix.dto';

@ApiTags('prefix')
@Controller('api/prefix')
export class PrefixController {
  /**
   * PUT /api/prefix - Update the project prefix in id.md
   */
  @Put()
  @ApiOperation({ summary: 'Update project prefix', description: 'Updates the project prefix in id.md' })
  @ApiResponse({ status: 200, description: 'Prefix updated.' })
  updatePrefix(@Body() body: PrefixDto): PrefixDto {
    return this.setPrefix(body.prefix);
  }

  /**
   * POST /api/prefix - Update the project prefix in id.md (same as PUT)
   */
  @Post()
  @ApiOperation({ summary: 'Set project prefix', description: 'Sets the project prefix in id.md' })
  @ApiResponse({ status: 200, description: 'Prefix set.' })
  setPrefixPost(@Body() body: PrefixDto): PrefixDto {
    return this.setPrefix(body.prefix);
  }

  /**
   * Helper to update the prefix in the markdown file
   */
  private setPrefix(newPrefix: string): PrefixDto {
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    // Validate newPrefix
    let prefix = (newPrefix || '').replace(/\s+/g, '').replace(/[^A-Za-z0-9_-]/g, '').toUpperCase().slice(0, 6);
    if (!prefix) {
      throw new HttpException('Prefix is empty or invalid', HttpStatus.BAD_REQUEST);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Replace the prefix section
    const updated = content.replace(/(## Prefix[\r\n]+)([\s\S]*?)([\r\n]+## Layer)/, `$1${prefix}$3`);
    if (updated === content) {
      throw new HttpException('Failed to update prefix', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    require('fs').writeFileSync(this.ID_MD_PATH, updated, 'utf-8');
    return { prefix };
  }
  private readonly ID_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/id.md');

  /**
   * GET /api/prefix - Returns the project prefix parsed from id.md
   */
  @Get()
  @ApiOperation({ summary: 'Get project prefix', description: 'Returns the project prefix parsed from id.md' })
  @ApiResponse({ status: 200, description: 'Prefix returned.' })
  getPrefix(): PrefixDto {
    if (!existsSync(this.ID_MD_PATH)) {
      throw new HttpException('id.md file not found', HttpStatus.NOT_FOUND);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Find the section between ## Prefix and ## Layer
    const prefixSection = this.extractPrefix(content);
    if (!prefixSection) {
      throw new HttpException('Prefix section not found', HttpStatus.NOT_FOUND);
    }
    // Clean up: remove whitespace, special chars, limit to 6 chars, uppercase
    let prefix = prefixSection.replace(/\s+/g, '').replace(/[^A-Za-z0-9_-]/g, '').toUpperCase().slice(0, 6);
    if (!prefix) {
      throw new HttpException('Prefix is empty or invalid', HttpStatus.BAD_REQUEST);
    }
    return { prefix };
  }

  private extractPrefix(md: string): string | null {
    const prefixMatch = md.match(/## Prefix([\s\S]*?)## Layer/);
    if (!prefixMatch || !prefixMatch[1]) return null;
    return prefixMatch[1].trim();
  }
}
