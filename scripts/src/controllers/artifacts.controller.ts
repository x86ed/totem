import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync, lstatSync } from 'fs';
import { join, resolve, extname, basename } from 'path';

@ApiTags('artifacts')
@Controller('api/artifacts')
export class ArtifactsController {
  private readonly ARTIFACTS_DIR = resolve(process.cwd(), '.totem/artifacts');
  private readonly ALLOWED_EXTENSIONS = ['.md', '.markdown', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

  /**
   * Recursively builds a directory tree for the artifacts directory.
   */
  private buildTree(dir: string): any {
    const result: any = { name: basename(dir), path: dir.replace(this.ARTIFACTS_DIR, ''), type: 'directory', children: [] };
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (lstatSync(fullPath).isSymbolicLink()) continue; // skip symlinks
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        result.children.push(this.buildTree(fullPath));
      } else if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        if (this.ALLOWED_EXTENSIONS.includes(ext)) {
          result.children.push({ name: entry, path: fullPath.replace(this.ARTIFACTS_DIR, ''), type: 'file' });
        }
      }
    }
    return result;
  }

  /**
   * GET /api/artifacts/tree - Returns the directory tree of the artifacts folder.
   */
  @Get('tree')
  @ApiOperation({ summary: 'Get artifacts directory tree', description: 'Returns a recursive directory tree of the artifacts folder.' })
  @ApiResponse({ status: 200, description: 'Directory tree returned.' })
  getArtifactsTree() {
    if (!existsSync(this.ARTIFACTS_DIR)) {
      throw new HttpException('Artifacts directory not found', HttpStatus.NOT_FOUND);
    }
    return this.buildTree(this.ARTIFACTS_DIR);
  }

  /**
   * GET /api/artifacts/file?path=... - Returns the contents of a markdown or image file in artifacts.
   */
  @Get('file')
  @ApiOperation({ summary: 'Get artifact file', description: 'Returns the contents of a markdown or image file from the artifacts directory.' })
  @ApiQuery({ name: 'path', required: true, description: 'Relative path to the file within artifacts.' })
  @ApiResponse({ status: 200, description: 'File content returned.' })
  getArtifactFile(@Query('path') relPath: string) {
    if (!relPath) throw new HttpException('Path is required', HttpStatus.BAD_REQUEST);
    const safePath = resolve(this.ARTIFACTS_DIR, relPath);
    if (!safePath.startsWith(this.ARTIFACTS_DIR)) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    if (!existsSync(safePath) || lstatSync(safePath).isSymbolicLink()) {
      throw new HttpException('File not found or is a symlink', HttpStatus.NOT_FOUND);
    }
    const ext = extname(safePath).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new HttpException('File type not allowed', HttpStatus.FORBIDDEN);
    }
    const stat = statSync(safePath);
    if (stat.isFile()) {
      if (ext === '.md' || ext === '.markdown') {
        return { content: readFileSync(safePath, 'utf-8') };
      } else {
        // For images, return base64
        const data = readFileSync(safePath);
        return { content: data.toString('base64'), encoding: 'base64', mime: this.getMimeType(ext) };
      }
    }
    throw new HttpException('Not a file', HttpStatus.BAD_REQUEST);
  }

  /**
   * POST /api/artifacts/file - Create or update a markdown or image file in artifacts.
   * Body: { path: string, content: string, encoding?: 'utf-8' | 'base64' }
   */
  @Post('file')
  @ApiOperation({ summary: 'Save artifact file', description: 'Create or update a markdown or image file in the artifacts directory.' })
  @ApiBody({ schema: { properties: { path: { type: 'string' }, content: { type: 'string' }, encoding: { type: 'string', enum: ['utf-8', 'base64'] } }, required: ['path', 'content'] } })
  @ApiResponse({ status: 200, description: 'File saved.' })
  saveArtifactFile(@Body() body: { path: string, content: string, encoding?: 'utf-8' | 'base64' }) {
    const { path: relPath, content, encoding = 'utf-8' } = body;
    if (!relPath || !content) throw new HttpException('Path and content are required', HttpStatus.BAD_REQUEST);
    const safePath = resolve(this.ARTIFACTS_DIR, relPath);
    if (!safePath.startsWith(this.ARTIFACTS_DIR)) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    const ext = extname(safePath).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new HttpException('File type not allowed', HttpStatus.FORBIDDEN);
    }
    if (lstatSync(safePath).isSymbolicLink()) {
      throw new HttpException('Cannot write to symlink', HttpStatus.FORBIDDEN);
    }
    // Ensure parent directory exists
    const parentDir = join(safePath, '..');
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
    if (encoding === 'base64' && ext !== '.md' && ext !== '.markdown') {
      writeFileSync(safePath, Buffer.from(content, 'base64'));
    } else {
      writeFileSync(safePath, content, 'utf-8');
    }
    return { message: 'File saved', path: relPath };
  }

  /**
   * POST /api/artifacts/folder - Create a new folder in artifacts.
   * Body: { path: string }
   */
  @Post('folder')
  @ApiOperation({ summary: 'Create artifact folder', description: 'Create a new folder in the artifacts directory.' })
  @ApiBody({ schema: { properties: { path: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Folder created.' })
  createArtifactFolder(@Body() body: { path: string }) {
    const { path: relPath } = body;
    if (!relPath) throw new HttpException('Path is required', HttpStatus.BAD_REQUEST);
    const safePath = resolve(this.ARTIFACTS_DIR, relPath);
    if (!safePath.startsWith(this.ARTIFACTS_DIR)) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    if (existsSync(safePath)) {
      throw new HttpException('Folder already exists', HttpStatus.CONFLICT);
    }
    mkdirSync(safePath, { recursive: true });
    return { message: 'Folder created', path: relPath };
  }

  private getMimeType(ext: string): string {
    switch (ext) {
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.gif': return 'image/gif';
      case '.svg': return 'image/svg+xml';
      default: return 'application/octet-stream';
    }
  }
}
