import { PriorityController } from '../src/controllers/priority.controller';
import { PriorityDto } from '../src/dto/priority.dto';
import { existsSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import { resolve } from 'path';

describe('PriorityController', () => {
  const TEST_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/priority.test.md');
  let controller: PriorityController;

  // Sample markdown content
  const initialContent = `# priority\n\nrepresents the urgency and importance of a work item\n\n- **critical** - Drop everything, immediate action required\n- **high** - Important and urgent, schedule next\n- **medium** - Normal priority, fits in regular workflow\n- **low** - Nice to have, work on when capacity allows\n- **backlog** - Future consideration, not actively planned\n`;

  beforeEach(() => {
    writeFileSync(TEST_MD_PATH, initialContent, 'utf-8');
    controller = new PriorityController();
    // Override path for testing
    (controller as any).PRIORITY_MD_PATH = TEST_MD_PATH;
  });

  afterEach(() => {
    if (existsSync(TEST_MD_PATH)) unlinkSync(TEST_MD_PATH);
  });

  it('should parse all priorities', () => {
    const priorities = controller.getAll();
    expect(priorities.length).toBe(5);
    expect(priorities[0].key).toBe('critical');
    expect(priorities[0].description).toContain('immediate action');
  });

  it('should get priority by key', () => {
    const priority = controller.getByKey('high');
    expect(priority.key).toBe('high');
    expect(priority.description).toContain('Important and urgent');
  });

  it('should add a new priority', () => {
    const dto = new PriorityDto();
    dto.key = 'test';
    dto.description = 'Test priority';
    controller.addPriority(dto);
    const priorities = controller.getAll();
    expect(priorities.some(p => p.key === 'test')).toBe(true);
  });

  it('should update a priority', () => {
    const dto = new PriorityDto();
    dto.key = 'low';
    dto.description = 'Updated description';
    controller.updatePriority('low', dto);
    const priority = controller.getByKey('low');
    expect(priority.description).toBe('Updated description');
  });

  it('should delete a priority', () => {
    controller.deletePriority('backlog');
    const priorities = controller.getAll();
    expect(priorities.some(p => p.key === 'backlog')).toBe(false);
  });

  it('should throw on duplicate add', () => {
    const dto = new PriorityDto();
    dto.key = 'critical';
    dto.description = 'Duplicate';
    expect(() => controller.addPriority(dto)).toThrow();
  });

  it('should throw on update of non-existent key', () => {
    const dto = new PriorityDto();
    dto.key = 'notfound';
    dto.description = 'Nope';
    expect(() => controller.updatePriority('notfound', dto)).toThrow();
  });

  it('should throw on delete of non-existent key', () => {
    expect(() => controller.deletePriority('notfound')).toThrow();
  });
});
