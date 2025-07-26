import { Test, TestingModule } from '@nestjs/testing';
import { ComplexityController } from '../src/controllers/complexity.controller';
import { ComplexityDto } from '../src/dto/complexity.dto';
import * as fs from 'fs';
import * as path from 'path';
import mockfs from 'mock-fs';

describe('ComplexityController', () => {
  let controller: ComplexityController;
  const mockPath = path.resolve(process.cwd(), '.totem/projects/conventions/complexity.md');
  const mockComplexities = [
    '- **low** - Minimal effort required',
    '- **medium** - Moderate effort required',
    '- **high** - Significant effort required',
  ];
  const mockFile = `# complexity\n\nrepresents the relative size and effort required for a work item\n\n${mockComplexities.join('\n')}`;

  beforeEach(async () => {
    mockfs({
      '.totem/projects/conventions/complexity.md': mockFile
    });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplexityController],
    }).compile();
    controller = module.get<ComplexityController>(ComplexityController);
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('should get all complexities', () => {
    const result = controller.getAll();
    expect(result).toEqual([
      { key: 'low', description: 'Minimal effort required' },
      { key: 'medium', description: 'Moderate effort required' },
      { key: 'high', description: 'Significant effort required' },
    ]);
  });

  it('should get complexity by key', () => {
    expect(controller.getByKey('medium')).toEqual({ key: 'medium', description: 'Moderate effort required' });
    expect(controller.getByKey('HIGH')).toEqual({ key: 'high', description: 'Significant effort required' });
  });

  it('should throw if complexity not found', () => {
    expect(() => controller.getByKey('missing')).toThrow('Complexity not found');
  });

  it('should add a new complexity', () => {
    const dto = { key: 'extreme', description: 'Extraordinary effort required' };
    controller.addComplexity(dto);
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **extreme** - Extraordinary effort required');
  });

  it('should not add duplicate complexity', () => {
    expect(() => controller.addComplexity({ key: 'low', description: 'desc' })).toThrow('Complexity already exists');
  });

  it('should update a complexity', () => {
    controller.updateComplexity('medium', { key: 'medium', description: 'Updated desc' });
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **medium** - Updated desc');
  });

  it('should update a complexity key using newKey', () => {
    controller.updateComplexity('medium', { key: 'advanced', description: 'Work started', newKey: 'advanced' });
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **advanced** - Work started');
    expect(written).not.toContain('- **medium** - Moderate effort required');
  });

  it('should not update to a duplicate key with newKey', () => {
    const result = controller.updateComplexity('medium', { key: 'high', description: 'desc', newKey: 'high' });
    expect(result.key).toBe('high');
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **high** - desc');
  });

  it('should not update missing complexity', () => {
    expect(() => controller.updateComplexity('missing', { key: 'missing', description: 'desc' })).toThrow('Complexity not found');
  });

  it('should delete a complexity', () => {
    controller.deleteComplexity('medium');
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).not.toContain('- **medium** - Moderate effort required');
  });

  it('should not delete missing complexity', () => {
    expect(() => controller.deleteComplexity('missing')).toThrow('Complexity not found');
  });
});
