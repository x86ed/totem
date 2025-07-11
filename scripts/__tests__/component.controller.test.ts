import { Test, TestingModule } from '@nestjs/testing';
import { ComponentController } from '../src/controllers/component.controller';
import { ComponentDto } from '../src/dto/component.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('ComponentController', () => {
  let controller: ComponentController;
  const testMdPath = path.resolve(__dirname, '../../.totem/projects/conventions/id.test.md');
  const originalMdPath = path.resolve(__dirname, '../../.totem/projects/conventions/id.md');
  const mdBackupPath = path.resolve(__dirname, '../../.totem/projects/conventions/id.md.bak');

  beforeAll(() => {
    // Backup the real id.md and use the test file
    if (fs.existsSync(originalMdPath)) {
      fs.copyFileSync(originalMdPath, mdBackupPath);
      fs.copyFileSync(testMdPath, originalMdPath);
    }
  });

  afterAll(() => {
    // Restore the real id.md
    if (fs.existsSync(mdBackupPath)) {
      fs.copyFileSync(mdBackupPath, originalMdPath);
      fs.unlinkSync(mdBackupPath);
    }
  });

  beforeEach(async () => {
    controller = new ComponentController();
    // Point to test markdown file
    (controller as any).ID_MD_PATH = originalMdPath;
  });

  it('should get all components', () => {
    const result = controller.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('key');
    expect(result[0]).toHaveProperty('description');
  });

  it('should get a component by key', () => {
    const result = controller.getByKey('auth');
    expect(result.key).toBe('auth');
    expect(result.description).toContain('Authentication');
  });

  it('should throw if component not found', () => {
    expect(() => controller.getByKey('notfound')).toThrow(HttpException);
  });

  it('should add a new component', () => {
    const dto = new ComponentDto();
    dto.key = 'newcomp';
    dto.description = 'A new component';
    const result = controller.addComponent(dto);
    expect(result.key).toBe('newcomp');
    expect(result.description).toBe('A new component');
    // Should be present in getAll
    const all = controller.getAll();
    expect(all.some(c => c.key === 'newcomp')).toBe(true);
  });

  it('should not add duplicate component', () => {
    const dto = new ComponentDto();
    dto.key = 'auth';
    dto.description = 'Duplicate';
    expect(() => controller.addComponent(dto)).toThrow(HttpException);
  });

  it('should update a component', () => {
    const dto = new ComponentDto();
    dto.key = 'auth';
    dto.description = 'Updated description';
    const result = controller.updateComponent('auth', dto);
    expect(result.key).toBe('auth');
    expect(result.description).toBe('Updated description');
    // Should be updated in getAll
    const updated = controller.getByKey('auth');
    expect(updated.description).toBe('Updated description');
  });

  it('should throw when updating non-existent component', () => {
    const dto = new ComponentDto();
    dto.key = 'notfound';
    dto.description = 'desc';
    expect(() => controller.updateComponent('notfound', dto)).toThrow(HttpException);
  });

  it('should delete a component', () => {
    // Add first
    const dto = new ComponentDto();
    dto.key = 'todelete';
    dto.description = 'To be deleted';
    controller.addComponent(dto);
    // Delete
    const result = controller.deleteComponent('todelete');
    expect(result).toEqual({ key: 'todelete' });
    // Should not be present
    expect(() => controller.getByKey('todelete')).toThrow(HttpException);
  });

  it('should throw when deleting non-existent component', () => {
    expect(() => controller.deleteComponent('notfound')).toThrow(HttpException);
  });
});
