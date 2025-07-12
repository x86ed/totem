import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from './status.controller';
import { StatusDto } from '../dto/status.dto';
import * as fs from 'fs';
import * as path from 'path';

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
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => p === mockPath);
    jest.spyOn(fs, 'readFileSync').mockImplementation((p) => {
      if (p === mockPath) return mockFile;
      throw new Error('File not found');
    });
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
    }).compile();
    controller = module.get<StatusController>(StatusController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    const spy = jest.spyOn(fs, 'writeFileSync');
    const dto = { key: 'blocked', description: 'Cannot proceed due to dependency' };
    controller.addStatus(dto);
    expect(spy).toHaveBeenCalledWith(
      mockPath,
      expect.stringContaining('- **blocked** - Cannot proceed due to dependency'),
      'utf-8'
    );
  });

  it('should not add duplicate status', () => {
    expect(() => controller.addStatus({ key: 'open', description: 'desc' })).toThrow('Status already exists');
  });

  it('should update a status', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');
    controller.updateStatus('open', { key: 'open', description: 'Updated desc' });
    expect(spy).toHaveBeenCalledWith(
      mockPath,
      expect.stringContaining('- **open** - Updated desc'),
      'utf-8'
    );
  });

  it('should not update missing status', () => {
    expect(() => controller.updateStatus('missing', { key: 'missing', description: 'desc' })).toThrow('Status not found');
  });

  it('should delete a status', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');
    controller.deleteStatus('open');
    expect(spy).toHaveBeenCalledWith(
      mockPath,
      expect.not.stringContaining('- **open** - Ready for work, not started'),
      'utf-8'
    );
  });

  it('should not delete missing status', () => {
    expect(() => controller.deleteStatus('missing')).toThrow('Status not found');
  });
});
