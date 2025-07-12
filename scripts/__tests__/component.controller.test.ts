import { Test, TestingModule } from '@nestjs/testing';
import { ComponentController } from '../src/controllers/component.controller';
import { ComponentDto } from '../src/dto/component.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('ComponentController', () => {
  let controller: ComponentController;
  const testMdPath = path.resolve(__dirname, './testdata/id.test.md');
  const initialMdContent = `# ID Conventions\n\n## Layer\n\n- **UI** - User Interface layer\n- **API** - API layer\n- **DB** - Database layer\n\n## Component\n\n- **Button** - Interactive button element\n- **Input** - Text input field\n- **Card** - Card display component\n\n## Feature\n\n- **Login** - User authentication\n- **Signup** - New user registration\n\n## Priority\n\n- **P0** - Critical\n- **P1** - High\n- **P2** - Medium\n- **P3** - Low\n\n## Prefix\n\n- **UI** - User Interface\n- **API** - API\n- **DB** - Database\n`;

  beforeEach(() => {
    // Reset test markdown file to known good state
    fs.writeFileSync(testMdPath, initialMdContent, 'utf-8');
    controller = new ComponentController();
    controller.setFilePath(testMdPath);
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
    expect(all.some(c => c.key.toLowerCase() === 'newcomp')).toBe(true);
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
