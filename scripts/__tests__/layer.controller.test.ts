import { describe, it, expect, beforeEach } from 'vitest';
import { LayerController } from '../src/controllers/layer.controller';
import { LayerDto } from '../src/dto/layer.dto';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const TEST_MD_PATH = resolve(process.cwd(), '.totem/projects/conventions/id.test.md');
const LAYER_SECTION = `## Layer\n- **Frontend** - User interface components, web applications, dashboards\n- **Backend** - Server-side logic, APIs, databases, microservices\n- **GraphQL** - GraphQL schema, resolvers, API gateway\n- **Mobile** - iOS/Android applications, React Native components\n- **Tests** - Unit tests, integration tests, end-to-end testing\n- **Docs** - Documentation, specifications, user guides\n## Component`;

function setupTestMd() {
  // Write a minimal markdown file with Prefix and Layer sections
  const PREFIX_SECTION = '## Prefix\nDEMO\n';
  // Add a blank line before ## Component for parser tolerance
  const tolerantLayerSection = LAYER_SECTION.replace('## Component', '\n## Component');
  writeFileSync(
    TEST_MD_PATH,
    `# id-conventions.md\n\n${PREFIX_SECTION}\n${tolerantLayerSection}\n`,
    'utf-8'
  );
}

class TestLayerController extends LayerController {
  ID_MD_PATH = TEST_MD_PATH;
}

describe('LayerController', () => {
  let controller: TestLayerController;

  beforeEach(() => {
    setupTestMd();
    controller = new TestLayerController();
  });

  it('should get all layers', () => {
    const layers = controller.getAll();
    expect(layers.length).toBe(6);
    expect(layers[0].key).toBe('Frontend');
    expect(layers[0].description).toContain('User interface');
  });

  it('should get layer by key', () => {
    const layer = controller.getByKey('Backend');
    expect(layer.key).toBe('Backend');
    expect(layer.description).toContain('Server-side logic');
  });

  it('should add a new layer', () => {
    const newLayer = new LayerDto();
    newLayer.key = 'Infra';
    newLayer.description = 'Infrastructure and DevOps';
    controller.addLayer(newLayer);
    const layers = controller.getAll();
    expect(layers.some((l: LayerDto) => l.key === 'Infra')).toBe(true);
  });

  it('should update a layer description', () => {
    controller.updateLayer('Frontend', { key: 'Frontend', description: 'Updated UI description' });
    const layer = controller.getByKey('Frontend');
    expect(layer.description).toBe('Updated UI description');
  });

  it('should delete a layer', () => {
    controller.deleteLayer('Docs');
    const layers = controller.getAll();
    expect(layers.some((l: LayerDto) => l.key === 'Docs')).toBe(false);
  });

  it('should throw on duplicate add', () => {
    const dupLayer = new LayerDto();
    dupLayer.key = 'Frontend';
    dupLayer.description = 'Duplicate';
    expect(() => controller.addLayer(dupLayer)).toThrow();
  });

  it('should throw on update non-existent', () => {
    expect(() => controller.updateLayer('NotExist', { key: 'NotExist', description: 'none' })).toThrow();
  });

  it('should throw on delete non-existent', () => {
    expect(() => controller.deleteLayer('NotExist')).toThrow();
  });
});
