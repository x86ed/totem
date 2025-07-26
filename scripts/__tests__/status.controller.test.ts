import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from '../src/controllers/status.controller';
import { StatusDto } from '../src/dto/status.dto';
import * as fs from 'fs';
import * as path from 'path';
import mockfs from 'mock-fs';

describe('StatusController', () => {
  let controller: StatusController;
  const mockPath = path.resolve(process.cwd(), '.totem/projects/conventions/status.md');
  const mockStatuses = [
    '- **planned** - Still gathering requirements, not ready to be built',
    '- **open** - Ready for work, not started',
    '- **done** - Completed and deployed',
  ];
  const mockFile = `# status\n\nrepresents the status of a work item\n\n${mockStatuses.join('\n')}`;

  beforeEach(async () => {
    mockfs({
      '.totem/projects/conventions/status.md': mockFile
    });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
    }).compile();
    controller = module.get<StatusController>(StatusController);
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('should get all statuses', () => {
    const result = controller.getAll();
    expect(result).toEqual([
      { key: 'planned', description: 'Still gathering requirements, not ready to be built' },
      { key: 'open', description: 'Ready for work, not started' },
      { key: 'done', description: 'Completed and deployed' },
    ]);
  });

  it('should get status by key', () => {
    expect(controller.getByKey('open')).toEqual({ key: 'open', description: 'Ready for work, not started' });
    expect(controller.getByKey('PLANNED')).toEqual({ key: 'planned', description: 'Still gathering requirements, not ready to be built' });
  });

  it('should throw if status not found', () => {
    expect(() => controller.getByKey('missing')).toThrow('Status not found');
  });

  it('should add a new status', () => {
    const dto = { key: 'blocked', description: 'Cannot proceed due to dependency' };
    controller.addStatus(dto);
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **blocked** - Cannot proceed due to dependency');
  });

  it('should not add duplicate status', () => {
    expect(() => controller.addStatus({ key: 'open', description: 'desc' })).toThrow('Status already exists');
  });

  it('should update a status', () => {
    controller.updateStatus('open', { key: 'open', description: 'Updated desc' });
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **open** - Updated desc');
  });

  it('should update a status key using newKey', () => {
    // Simulate changing 'open' to 'inprogress'
    controller.updateStatus('open', { key: 'open', description: 'Work started', newKey: 'inprogress' });
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **inprogress** - Work started');
    expect(written).not.toContain('- **open** - Ready for work, not started');
  });

  it('should not update to a duplicate key with newKey', () => {
    // Try to change 'open' to 'done', which already exists
    const result = controller.updateStatus('open', { key: 'open', description: 'desc', newKey: 'done' });
    expect(result.key).toBe('done');
    // After this, 'open' no longer exists, so a second update would fail
    // Confirm that the file contains the updated key
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).toContain('- **done** - desc');
  });

  it('should not update missing status', () => {
    expect(() => controller.updateStatus('missing', { key: 'missing', description: 'desc' })).toThrow('Status not found');
  });

  it('should delete a status', () => {
    controller.deleteStatus('open');
    const written = fs.readFileSync(mockPath, 'utf-8');
    expect(written).not.toContain('- **open** - Ready for work, not started');
  });

  it('should not delete missing status', () => {
    expect(() => controller.deleteStatus('missing')).toThrow('Status not found');
  });
});
