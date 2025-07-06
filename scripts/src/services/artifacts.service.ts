import { Injectable } from '@nestjs/common';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, lstatSync } from 'fs';
import { join, resolve, extname, dirname, sep } from 'path';

const ALLOWED_EXTENSIONS = ['.md', '.markdown', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
const ARTIFACTS_DIR = resolve(__dirname, '../../../artifacts');

function isSafePath(base: string, target: string): boolean {
  const rel = resolve(target).replace(base, '');
  return resolve(target).startsWith(base + sep) || resolve(target) === base;
}

function isAllowedFileType(filename: string): boolean {
  const ext = extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

function isSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

@Injectable()
export class ArtifactsService {
  getDirectoryTree(subPath = ''): any {
    const dirPath = resolve(ARTIFACTS_DIR, subPath);
    if (!isSafePath(ARTIFACTS_DIR, dirPath) || isSymlink(dirPath)) {
      throw new Error('Invalid directory path');
    }
    if (!existsSync(dirPath)) {
      return null;
    }
    const stat = statSync(dirPath);
    if (!stat.isDirectory()) {
      throw new Error('Not a directory');
    }
    const children = readdirSync(dirPath)
      .filter(name => !isSymlink(join(dirPath, name)))
      .map(name => {
        const fullPath = join(dirPath, name);
        const childStat = statSync(fullPath);
        if (childStat.isDirectory()) {
          return {
            name,
            type: 'folder',
            children: this.getDirectoryTree(join(subPath, name)),
          };
        } else if (isAllowedFileType(name)) {
          return {
            name,
            type: 'file',
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);
    return {
      name: subPath || 'artifacts',
      type: 'folder',
      children,
    };
  }

  getFile(filePath: string): { type: string; content: string } {
    const absPath = resolve(ARTIFACTS_DIR, filePath);
    if (!isSafePath(ARTIFACTS_DIR, absPath) || isSymlink(absPath)) {
      throw new Error('Invalid file path');
    }
    if (!existsSync(absPath)) {
      throw new Error('File does not exist');
    }
    if (!isAllowedFileType(absPath)) {
      throw new Error('File type not allowed');
    }
    const ext = extname(absPath).toLowerCase();
    if (['.md', '.markdown'].includes(ext)) {
      return { type: 'markdown', content: readFileSync(absPath, 'utf-8') };
    } else {
      // image: return base64
      const data = readFileSync(absPath);
      return { type: 'image', content: data.toString('base64') };
    }
  }

  saveFile(filePath: string, content: string, encoding: 'utf-8' | 'base64' = 'utf-8'): void {
    const absPath = resolve(ARTIFACTS_DIR, filePath);
    if (!isSafePath(ARTIFACTS_DIR, absPath) || isSymlink(absPath)) {
      throw new Error('Invalid file path');
    }
    if (!isAllowedFileType(absPath)) {
      throw new Error('File type not allowed');
    }
    const parentDir = dirname(absPath);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
    if (encoding === 'base64') {
      writeFileSync(absPath, Buffer.from(content, 'base64'));
    } else {
      writeFileSync(absPath, content, 'utf-8');
    }
  }

  createFolder(folderPath: string): void {
    const absPath = resolve(ARTIFACTS_DIR, folderPath);
    if (!isSafePath(ARTIFACTS_DIR, absPath) || isSymlink(absPath)) {
      throw new Error('Invalid folder path');
    }
    if (!existsSync(absPath)) {
      mkdirSync(absPath, { recursive: true });
    }
  }
}
