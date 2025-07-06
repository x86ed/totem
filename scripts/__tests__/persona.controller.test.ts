import { Test, TestingModule } from '@nestjs/testing';
import { PersonaController } from '../src/controllers/persona.controller';
import { PersonaDto } from '../src/dto/persona.dto';
import * as fs from 'fs';
import * as path from 'path';

describe('PersonaController', () => {
  let controller: PersonaController;
  const personasDir = path.join(process.cwd(), '.totem/personas');

  beforeEach(async () => {
    controller = new PersonaController();
    // Optionally, you can mock fs if you want to avoid real file IO
  });

  describe('getAllPersonas', () => {
    it('should return an array of PersonaDto', () => {
      // Arrange
      const files = ['refactor-raleigh.md', 'security-sasha.md'];
      jest.spyOn(fs, 'readdirSync').mockReturnValue(files as any);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filePath: any) => {
        if (filePath.endsWith('refactor-raleigh.md')) {
          return '# Refactor-Raleigh\n\n**Primary Focus:** Code consistency\n\n**When choosing between options, prioritize:**\n1. Code clarity\n\n**Default assumptions:**\n- Every codebase accumulates technical debt over time\n\n## Domain Context\n### Example Context\n- Example item';
        }
        if (filePath.endsWith('security-sasha.md')) {
          return '# Security-Sasha\n\n**Primary Focus:** Security\n\n**When choosing between options, prioritize:**\n1. Data security\n\n**Default assumptions:**\n- All user input is malicious until validated\n\n## Domain Context\n### Example Context\n- Example item';
        }
        return '';
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
      jest.spyOn(fs, 'readdirSync').mockImplementation(() => { throw new Error('fail'); });
      expect(() => controller.getAllPersonas()).toThrow('Could not read personas directory');
    });
  });

  describe('getPersonaByName', () => {
    it('should return a PersonaDto for a valid persona', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation((filePath: any) => {
        return '# Refactor-Raleigh\n\n**Primary Focus:** Code consistency\n\n**When choosing between options, prioritize:**\n1. Code clarity\n\n**Default assumptions:**\n- Every codebase accumulates technical debt over time\n\n## Domain Context\n### Example Context\n- Example item';
      });
      const result = controller.getPersonaByName('refactor-raleigh');
      expect(result).toBeDefined();
      expect(result.name).toBe('Refactor-Raleigh');
      expect(result.primaryFocus).toContain('Code consistency');
      expect(result.domainContexts[0].name).toBe('Example Context');
      expect(result.domainContexts[0].items[0]).toBe('Example item');
    });

    it('should throw 404 if persona not found', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('fail'); });
      expect(() => controller.getPersonaByName('notfound')).toThrow('Persona not found');
    });
  });
});
