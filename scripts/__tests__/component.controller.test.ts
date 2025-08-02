import { ComponentController } from '../src/controllers/component.controller';
import { ComponentDto } from '../src/dto/component.dto';
import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('ComponentController', () => {
  let controller: ComponentController;
  const testMdPath = path.resolve(__dirname, './testdata/id.test.md');
  const initialMdContent = `# ID Conventions\n\n## Layer\n\n- **UI** - User Interface layer\n- **API** - API layer\n- **DB** - Database layer\n\n## Component\n\n- **Button** - Interactive button element\n- **Input** - Text input field\n- **Card** - Card display component\n\n## Feature\n\n- **Login** - User authentication\n- **Signup** - New user registration\n\n## Priority\n\n- **P0** - Critical\n- **P1** - High\n- **P2** - Medium\n- **P3** - Low\n\n## Prefix\n\n- **UI** - User Interface\n- **API** - API\n- **DB** - Database\n`;

  beforeEach(() => {
    // Reset test markdown file to known good state
    fs.writeFileSync(testMdPath, initialMdContent, 'utf-8');
    controller = new ComponentController(testMdPath);
  });

  it('should get all components', () => {
    const result = controller.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('key');
    expect(result[0]).toHaveProperty('description');
  });

  it('should get a component by key', () => {
    const result = controller.getByKey('Button');
    expect(result.key).toBe('Button');
    expect(result.description).toContain('Interactive button');
  });

  it('should throw if component not found', () => {
    expect(() => controller.getByKey('notfound')).toThrow(HttpException);
  });

  it('should add a new component and not add extra blank lines', () => {
    const dto = new ComponentDto();
    dto.key = 'newcomp';
    dto.description = 'A new component';
    const result = controller.addComponent(dto);
    expect(result.key).toBe('newcomp');
    expect(result.description).toBe('A new component');
    // Should be present in getAll
    const all = controller.getAll();
    expect(all.some(c => c.key.toLowerCase() === 'newcomp')).toBe(true);
    // Check that there is not an extra blank line above the new entry in the file
    const fileContent = fs.readFileSync(testMdPath, 'utf-8');
    const componentSection = fileContent.match(/## Component[\s\S]*?## Feature/);
    expect(componentSection).toBeTruthy();
    // The new entry should not be preceded by more than one blank line
    const lines = componentSection[0].split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('**newcomp**')) {
        // Count blank lines above
        let blankCount = 0;
        for (let j = i - 1; j >= 0 && lines[j].trim() === ''; j--) blankCount++;
        expect(blankCount).toBeLessThanOrEqual(1);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('should not add duplicate component', () => {
    const dto = new ComponentDto();
    dto.key = 'Button';
    dto.description = 'Duplicate';
    expect(() => controller.addComponent(dto)).toThrow(HttpException);
  });

  it('should update a component description only', () => {
    const dto = new ComponentDto();
    dto.key = 'Button';
    dto.description = 'Updated description';
    const result = controller.updateComponent('Button', dto);
    expect(result.key).toBe('Button');
    expect(result.description).toBe('Updated description');
    // Should be updated in getAll
    const updated = controller.getByKey('Button');
    expect(updated.description).toBe('Updated description');
  });

  it('should update a component key and description (newKey)', () => {
    // Add a component to update
    const dto = new ComponentDto();
    dto.key = 'oldkey';
    dto.description = 'Old description';
    controller.addComponent(dto);
    // Update key and description
    const updateDto = new ComponentDto();
    updateDto.key = 'newkey';
    updateDto.description = 'New description';
    const result = controller.updateComponent('oldkey', { ...updateDto, newKey: 'newkey' });
    expect(result.key).toBe('newkey');
    expect(result.description).toBe('New description');
    // Should be present under new key
    const updated = controller.getByKey('newkey');
    expect(updated.description).toBe('New description');
    // Old key should not exist
    expect(() => controller.getByKey('oldkey')).toThrow(HttpException);
  });

  it('should update a component key and description', () => {
    // Add a component to update
    const dto = new ComponentDto();
    dto.key = 'oldkey';
    dto.description = 'Old description';
    controller.addComponent(dto);
    // Update key and description
    const updateDto = new ComponentDto();
    updateDto.key = 'newkey';
    updateDto.description = 'New description';
    const result = controller.updateComponent('oldkey', { ...updateDto, newKey: 'newkey' });
    expect(result.key).toBe('newkey');
    expect(result.description).toBe('New description');
    // Should be present under new key
    const updated = controller.getByKey('newkey');
    expect(updated.description).toBe('New description');
    // Old key should not exist
    expect(() => controller.getByKey('oldkey')).toThrow(HttpException);
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
