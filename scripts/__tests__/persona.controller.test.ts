  describe('createPersona', () => {
    it('should create a new persona and return PersonaDto', () => {
      mockfs({ '.totem/personas': {} });
      const controller = new PersonaController();
      const dto: PersonaDto = {
        name: 'Test-Persona',
        primaryFocus: 'Testing',
        decisionFramework: { priorities: ['A'], defaultAssumptions: ['B'] },
        codePatterns: undefined,
        requirementsPatterns: undefined,
        domainContexts: [],
        reviewChecklist: undefined,
      };
      const created = controller.createPersona(dto);
      expect(created.name).toBe('Test-Persona');
      expect(created.primaryFocus).toBe('Testing');
    });

    it('should throw if persona already exists', () => {
      mockfs({ '.totem/personas': { 'test-persona.md': '# Test-Persona' } });
      const controller = new PersonaController();
      const dto: PersonaDto = {
        name: 'Test-Persona',
        primaryFocus: 'Testing',
        decisionFramework: { priorities: ['A'], defaultAssumptions: ['B'] },
        codePatterns: undefined,
        requirementsPatterns: undefined,
        domainContexts: [],
        reviewChecklist: undefined,
      };
      expect(() => controller.createPersona(dto)).toThrow('Persona already exists');
    });
  });

  describe('updatePersona', () => {
    it('should update persona with markdown', () => {
      mockfs({ '.totem/personas': { 'refactor-raleigh.md': '# Refactor-Raleigh\n\n**Primary Focus:** Old' } });
      const controller = new PersonaController();
      const updated = controller.updatePersona('refactor-raleigh', { markdown: '# Refactor-Raleigh\n\n**Primary Focus:** Updated' });
      expect(updated.name).toBe('Refactor-Raleigh');
      expect(updated.primaryFocus).toBe('Updated');
    });

    it('should throw if persona does not exist', () => {
      mockfs({ '.totem/personas': {} });
      const controller = new PersonaController();
      expect(() => controller.updatePersona('notfound', { markdown: '# Notfound' })).toThrow('Persona not found');
    });
  });

  describe('deletePersona', () => {
    it('should delete an existing persona', () => {
      mockfs({ '.totem/personas': { 'delete-me.md': '# Delete-Me\n\n**Primary Focus:** To be deleted' } });
      const controller = new PersonaController();
      const resp = controller.deletePersona('delete-me');
      expect(resp).toHaveProperty('message');
      expect(resp.message).toMatch(/deleted/i);
      expect(() => controller.getPersonaByName('delete-me')).toThrow('Persona not found');
    });

    it('should throw if persona does not exist', () => {
      mockfs({ '.totem/personas': {} });
      const controller = new PersonaController();
      expect(() => controller.deletePersona('notfound')).toThrow('Persona not found');
    });
  });

  describe('personaToMarkdown', () => {
    it('should generate markdown from PersonaDto', () => {
      const controller = new PersonaController();
      const dto: PersonaDto = {
        name: 'Test-Persona',
        primaryFocus: 'Testing',
        decisionFramework: { priorities: ['A'], defaultAssumptions: ['B'] },
        codePatterns: undefined,
        requirementsPatterns: undefined,
        domainContexts: [],
        reviewChecklist: undefined,
      };
      const md = controller['personaToMarkdown'](dto);
      expect(md).toContain('# Test-Persona');
      expect(md).toContain('**Primary Focus:** Testing');
    });
  });

  const personasDir = require('path').join(process.cwd(), '.totem/personas');

describe('wrapPersonaJson', () => {
  it('should return fileName and content', () => {
    mockfs({ '.totem/personas': { 'refactor-raleigh.md': '# Refactor-Raleigh\n\n**Primary Focus:** Test' } });
    const controller = new PersonaController();
    const result = controller['wrapPersonaJson'](require('path').join(process.cwd(), '.totem/personas', 'refactor-raleigh.md'));
    expect(result).toHaveProperty('fileName');
    expect(result).toHaveProperty('content');
    expect(result && result.content).toContain('Refactor-Raleigh');
  });
  it('should return null on error', () => {
    const controller = new PersonaController();
    expect(controller['wrapPersonaJson']('notfound.md')).toBeNull();
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mockfs from 'mock-fs';
import { PersonaController } from '../src/controllers/persona.controller';
import { PersonaDto } from '../src/dto/persona.dto';
import * as path from 'path';

describe('PersonaController', () => {
  let controller: PersonaController;


  beforeEach(() => {
    controller = new PersonaController();
    mockfs.restore(); // Ensure clean fs before each test
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('getAllPersonas', () => {
    it('should return an array of PersonaDto', () => {
      // Arrange
      mockfs({
        '.totem/personas': {
          'refactor-raleigh.md': '# Refactor-Raleigh\n\n**Primary Focus:** Code consistency\n\n**When choosing between options, prioritize:**\n1. Code clarity\n\n**Default assumptions:**\n- Every codebase accumulates technical debt over time\n\n## Domain Context\n### Example Context\n- Example item',
          'security-sasha.md': '# Security-Sasha\n\n**Primary Focus:** Security\n\n**When choosing between options, prioritize:**\n1. Data security\n\n**Default assumptions:**\n- All user input is malicious until validated\n\n## Domain Context\n### Example Context\n- Example item'
        }
      });
      // Act
      const result = controller.getAllPersonas();
      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Refactor-Raleigh');
      expect(result[1].name).toBe('Security-Sasha');
    });

    it('should throw if personas directory cannot be read', () => {
      mockfs({}); // No .totem/personas directory
      expect(() => controller.getAllPersonas()).toThrow('Could not read personas directory');
    });
  });

  describe('getPersonaByName', () => {
    it('should return a MarkdownDto for a valid persona', () => {
      mockfs({
        '.totem/personas': {
          'refactor-raleigh.md': '# Refactor-Raleigh\n\n**Primary Focus:** Code consistency\n\n**When choosing between options, prioritize:**\n1. Code clarity\n\n**Default assumptions:**\n- Every codebase accumulates technical debt over time\n\n## Domain Context\n### Example Context\n- Example item'
        }
      });
      const result = controller.getPersonaByName('refactor-raleigh');
      expect(result).toBeDefined();
      expect(result.fileName).toContain('refactor-raleigh.md');
      expect(result.content).toContain('Refactor-Raleigh');
    });

    it('should throw 404 if persona not found', () => {
      mockfs({
        '.totem/personas': {
          // No file for 'notfound'
        }
      });
      expect(() => controller.getPersonaByName('notfound')).toThrow('Persona not found');
    });
  });
});
