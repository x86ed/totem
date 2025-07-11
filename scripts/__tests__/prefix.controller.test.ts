import { PrefixController } from '../src/controllers/prefix.controller';
import { PrefixDto } from '../src/dto/prefix.dto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

describe('PrefixController', () => {
  const idMdPath = resolve(process.cwd(), '.totem/projects/conventions/id.md');
  let originalContent: string;

  beforeAll(() => {
    if (existsSync(idMdPath)) {
      originalContent = readFileSync(idMdPath, 'utf-8');
    } else {
      // Create a minimal id.md for testing
      originalContent = '# id-conventions.md\n\n## Prefix\nTEST\n\n## Layer\nLayerContent';
      writeFileSync(idMdPath, originalContent, 'utf-8');
    }
  });

  afterAll(() => {
    if (originalContent) {
      writeFileSync(idMdPath, originalContent, 'utf-8');
    }
  });

  it('should get the prefix from id.md', () => {
    const controller = new PrefixController();
    const result = controller.getPrefix();
    expect(result).toHaveProperty('prefix');
    expect(typeof result.prefix).toBe('string');
    expect(result.prefix.length).toBeLessThanOrEqual(6);
    expect(result.prefix).toMatch(/^[A-Z0-9_-]+$/);
  });

  it('should update the prefix with PUT', () => {
    const controller = new PrefixController();
    const newPrefix = 'abc123';
    const result = controller.updatePrefix(new PrefixDto(newPrefix));
    expect(result.prefix).toBe(newPrefix.toUpperCase());
    // Confirm file was updated
    const fileContent = readFileSync(idMdPath, 'utf-8');
    expect(fileContent).toContain(newPrefix.toUpperCase());
  });

  it('should update the prefix with POST', () => {
    const controller = new PrefixController();
    const newPrefix = 'xyz789';
    const result = controller.setPrefixPost(new PrefixDto(newPrefix));
    expect(result.prefix).toBe(newPrefix.toUpperCase());
    // Confirm file was updated
    const fileContent = readFileSync(idMdPath, 'utf-8');
    expect(fileContent).toContain(newPrefix.toUpperCase());
  });

  it('should not allow invalid prefix', () => {
    const controller = new PrefixController();
    expect(() => controller.updatePrefix(new PrefixDto(''))).toThrow();
    expect(() => controller.setPrefixPost(new PrefixDto('!@#$%^&*()'))).toThrow();
  });

  it('should trim and sanitize prefix', () => {
    const controller = new PrefixController();
    const result = controller.updatePrefix(new PrefixDto('  ab c!@# '));
    expect(result.prefix).toBe('ABC');
  });

  it('should limit prefix to 6 characters', () => {
    const controller = new PrefixController();
    const result = controller.updatePrefix(new PrefixDto('longprefixname'));
    expect(result.prefix.length).toBeLessThanOrEqual(6);
  });
});
