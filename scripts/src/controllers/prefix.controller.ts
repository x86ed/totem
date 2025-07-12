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
    // Validate newPrefix: must be string
    if (typeof newPrefix !== 'string') {
      throw new HttpException('Prefix must be a string', HttpStatus.BAD_REQUEST);
    }
    // Reject if any whitespace in original input
    if (/\s/.test(newPrefix)) {
      throw new HttpException('Prefix cannot contain whitespace', HttpStatus.BAD_REQUEST);
    }
    // Sanitize: remove disallowed chars, uppercase
    let prefix = newPrefix.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();
    if (!prefix) {
      throw new HttpException('Prefix is empty or contains invalid characters', HttpStatus.BAD_REQUEST);
    }
    if (prefix.length > 6) {
      throw new HttpException('Prefix is too long', HttpStatus.BAD_REQUEST);
    }
    const content = readFileSync(this.ID_MD_PATH, 'utf-8');
    // Find the Prefix section strictly between ## Prefix and next heading
    const prefixSectionRegex = /(## Prefix\s*\n)([\s\S]*?)(?=^## |^#|$)/m;
    const match = content.match(prefixSectionRegex);
    if (!match) {
      throw new HttpException('Prefix section not found', HttpStatus.NOT_FOUND);
    }
    // Split section into lines, preserve blank lines before/after
    let sectionLines = match[2].split(/\r?\n/);
    // Find first non-blank line (prefix value)
    const prefixIdx = sectionLines.findIndex(l => l.trim().length > 0);
    if (prefixIdx === -1) {
      // No prefix value, insert in the middle
      const mid = Math.floor(sectionLines.length / 2);
      sectionLines.splice(mid, 0, prefix);
    } else {
      sectionLines[prefixIdx] = prefix;
    }
    // Remove any other non-blank lines (should only be one prefix value)
    sectionLines = sectionLines.filter((l, i) => i === prefixIdx || l.trim().length === 0);
    // Rejoin, preserving original blank lines
    const newSection = sectionLines.join('\n');
    const before = content.slice(0, match.index! + match[1].length);
    const after = content.slice(match.index! + match[0].length);
    const updated = before + newSection + after;
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
    // Robustly extract the value after ## Prefix, up to next heading or end of file
    const prefixSectionRegex = /## Prefix\s*\n([\s\S]*?)(?=^## |^#|$)/m;
    const match = md.match(prefixSectionRegex);
    if (!match || !match[1]) return null;
    // Get first non-empty line as prefix value
    const lines = match[1].split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines.length ? lines[0] : null;
  }
}
