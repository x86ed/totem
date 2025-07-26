import { FeatureController } from '../src/controllers/feature.controller';
import { FeatureDto } from '../src/dto/feature.dto';
import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('FeatureController', () => {
  it('should update a feature key and description', () => {
    // Add a feature to update
    const dto = new FeatureDto();
    dto.key = 'oldkey';
    dto.description = 'Old description';
    controller.addFeature(dto);
    // Update key and description
    const updateDto = new FeatureDto();
    updateDto.key = 'newkey';
    updateDto.description = 'New description';
    controller.updateFeature('oldkey', { ...updateDto, newKey: 'newkey' });
    // Should be present under new key
    const updated = controller.getByKey('newkey');
    expect(updated.key).toBe('newkey');
    expect(updated.description).toBe('New description');
    // Old key should not exist
    expect(() => controller.getByKey('oldkey')).toThrow(HttpException);
  });
  const TEST_MD_PATH = path.resolve(__dirname, '../../.totem/projects/conventions/id.test.md');
  let controller: FeatureController;

  // Helper to reset test markdown file
  const resetTestMd = (content: string) => {
    fs.writeFileSync(TEST_MD_PATH, content, 'utf-8');
  };

  // Minimal markdown for testing
  const baseMd = `# id-conventions.md\n\n## Feature\n- **login** - User authentication and session management\n- **signup** - User registration and account creation\n`;

  beforeEach(() => {
    resetTestMd(baseMd);
    controller = new FeatureController();
    // Override path for test
    (controller as any).ID_MD_PATH = TEST_MD_PATH;
  });

  afterAll(() => {
    if (fs.existsSync(TEST_MD_PATH)) fs.unlinkSync(TEST_MD_PATH);
  });

  it('should parse all features', () => {
    const features = controller.getAll();
    expect(features.length).toBe(2);
    expect(features[0].key).toBe('login');
    expect(features[1].key).toBe('signup');
  });

  it('should get feature by key', () => {
    const feature = controller.getByKey('login');
    expect(feature.key).toBe('login');
    expect(feature.description).toContain('authentication');
  });

  it('should add a new feature', () => {
    const dto = new FeatureDto();
    dto.key = 'dashboard';
    dto.description = 'Main overview and summary interfaces';
    controller.addFeature(dto);
    const features = controller.getAll();
    expect(features.length).toBe(3);
    expect(features.some(f => f.key === 'dashboard')).toBe(true);
  });

  it('should update a feature', () => {
    const dto = new FeatureDto();
    dto.key = 'login';
    dto.description = 'Updated description';
    controller.updateFeature('login', dto);
    const feature = controller.getByKey('login');
    expect(feature.description).toBe('Updated description');
  });

  it('should delete a feature', () => {
    controller.deleteFeature('signup');
    const features = controller.getAll();
    expect(features.length).toBe(1);
    expect(features[0].key).toBe('login');
  });

  it('should throw if feature not found', () => {
    expect(() => controller.getByKey('notfound')).toThrow(HttpException);
    expect(() => controller.updateFeature('notfound', { key: 'notfound', description: 'desc' })).toThrow(HttpException);
    expect(() => controller.deleteFeature('notfound')).toThrow(HttpException);
  });

  it('should throw if adding duplicate feature', () => {
    expect(() => controller.addFeature({ key: 'login', description: 'desc' })).toThrow(HttpException);
  });

  it('should throw if key is missing', () => {
    expect(() => controller.addFeature({ key: '', description: 'desc' })).toThrow(HttpException);
  });
});
