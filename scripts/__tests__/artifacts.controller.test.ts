import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { ArtifactsController } from '../src/controllers/artifacts.controller';
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync, rmdirSync } from 'fs';
import { join, resolve } from 'path';

describe('ArtifactsController', () => {
  const ARTIFACTS_DIR = resolve(process.cwd(), '.totem/test-artifacts');
  const TEST_FILE = 'test.md';
  const TEST_PATH = join(ARTIFACTS_DIR, TEST_FILE);
  let controller: ArtifactsController;

  beforeAll(() => {
    // Ensure test artifacts dir exists
    if (!existsSync(ARTIFACTS_DIR)) {
      mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test file and dir
    if (existsSync(TEST_PATH)) unlinkSync(TEST_PATH);
    if (existsSync(ARTIFACTS_DIR)) rmdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  beforeEach(async () => {
    controller = new ArtifactsController();
    // Patch ARTIFACTS_DIR for test isolation
    (controller as any).ARTIFACTS_DIR = ARTIFACTS_DIR;
  });

  it('should write a new markdown file', () => {
    const body = { path: TEST_FILE, content: '# Test', encoding: 'utf-8' as const };
    const result = controller.updateArtifactFile(body);
    expect(result).toHaveProperty('message', 'File updated');
    expect(result).toHaveProperty('path', TEST_FILE);
    expect(existsSync(TEST_PATH)).toBe(true);
    expect(readFileSync(TEST_PATH, 'utf-8')).toBe('# Test');
  });

  it('should update an existing markdown file', () => {
    writeFileSync(TEST_PATH, 'Old content', 'utf-8');
    const body = { path: TEST_FILE, content: 'New content', encoding: 'utf-8' as const };
    const result = controller.updateArtifactFile(body);
    expect(result).toHaveProperty('message', 'File updated');
    expect(readFileSync(TEST_PATH, 'utf-8')).toBe('New content');
  });
});
