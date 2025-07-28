import { PrefixController } from '../src/controllers/prefix.controller';
import { PrefixDto } from '../src/dto/prefix.dto';
import { readFileSync, writeFileSync } from 'fs';
import mock from 'mock-fs';
import { resolve } from 'path';
import { HttpException } from '@nestjs/common';

describe('PrefixController', () => {
  const idTestMdPath = resolve(__dirname, 'testdata/id.test.md');
  const minimalMd = '# id-conventions.md\n\n## Prefix\nTEST\n\n## Layer\nLayerContent\n\n## Component\nComponentContent';

  beforeEach(() => {
    mock({
      [idTestMdPath]: minimalMd,
      [resolve(__dirname, 'testdata')]: {},
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should get the prefix from id.test.md', () => {
    const controller = new PrefixController();
    // Patch controller to use test file
    (controller as any).ID_MD_PATH = idTestMdPath;
    const result = controller.getPrefix();
    expect(result).toHaveProperty('prefix');
    expect(typeof result.prefix).toBe('string');
    expect(result.prefix.length).toBeLessThanOrEqual(6);
    expect(result.prefix).toMatch(/^[A-Z0-9_-]+$/);
  });

  it('should update the prefix with PUT and only affect the prefix section', () => {
    const controller = new PrefixController();
    (controller as any).ID_MD_PATH = idTestMdPath;
    const newPrefix = 'abc123';
    const result = controller.updatePrefix(new PrefixDto(newPrefix));
    expect(result.prefix).toBe(newPrefix.toUpperCase());
    // Confirm file was updated only in the prefix section
    const fileContent = readFileSync(idTestMdPath, 'utf-8');
    const prefixSection = fileContent.match(/## Prefix\s*\n([\s\S]*?)(?=^## |^#|$)/m);
    expect(prefixSection).toBeTruthy();
    if (prefixSection) {
      const lines = prefixSection[1].split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      expect(lines.length).toBe(1);
      expect(lines[0]).toBe(newPrefix.toUpperCase());
      // Confirm blank lines above and below
      expect(prefixSection[1]).toMatch(/^\n?ABC123\n?$/i);
    }
    // Confirm other sections are untouched
    expect(fileContent).toContain('## Layer');
    expect(fileContent).toContain('## Component');
  });

  it('should update the prefix with POST', () => {
    const controller = new PrefixController();
    (controller as any).ID_MD_PATH = idTestMdPath;
    const newPrefix = 'xyz789';
    const result = controller.setPrefixPost(new PrefixDto(newPrefix));
    expect(result.prefix).toBe(newPrefix.toUpperCase());
    // Confirm file was updated in the Prefix section
    const fileContent = readFileSync(idTestMdPath, 'utf-8');
    const prefixSection = fileContent.match(/## Prefix\s*\n([\s\S]*?)(?=^## |^#|$)/m);
    expect(prefixSection).toBeTruthy();
    if (prefixSection) {
      const lines = prefixSection[1].split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      expect(lines.length).toBe(1);
      expect(lines[0]).toBe(newPrefix.toUpperCase());
    }
  });

  it('should not allow invalid prefix', () => {
    const controller = new PrefixController();
    (controller as any).ID_MD_PATH = idTestMdPath;
    expect(() => controller.updatePrefix(new PrefixDto(''))).toThrow();
    expect(() => controller.setPrefixPost(new PrefixDto('!@#$%^&*()'))).toThrow();
  });

  it('should reject prefix with whitespace and sanitize allowed characters', () => {
    const controller = new PrefixController();
    (controller as any).ID_MD_PATH = idTestMdPath;
    // Should reject any prefix with whitespace or only special chars
    expect(() => controller.updatePrefix(new PrefixDto('  ab c!@# '))).toThrow(HttpException);
    expect(() => controller.updatePrefix(new PrefixDto('abc 123'))).toThrow(HttpException);
    expect(() => controller.updatePrefix(new PrefixDto('   '))).toThrow(HttpException);
    expect(() => controller.updatePrefix(new PrefixDto('!@#$%^&*()'))).toThrow(HttpException);
    // Should throw if sanitized prefix is longer than 6
    expect(() => controller.updatePrefix(new PrefixDto('ABC-123'))).toThrow(HttpException);
  });

  it('should limit prefix to 6 characters and reject longer', () => {
    const controller = new PrefixController();
    (controller as any).ID_MD_PATH = idTestMdPath;
    expect(() => controller.updatePrefix(new PrefixDto('longprefixname'))).toThrow();
    const result = controller.updatePrefix(new PrefixDto('abcdef'));
    expect(result.prefix.length).toBe(6);
  });
});
