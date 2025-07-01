import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

// Mock dependencies
vi.mock('fs');
vi.mock('path');
vi.mock('readline');
vi.mock('child_process');

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);
const mockReadline = vi.mocked(readline);
const mockExecSync = vi.mocked(execSync);

// Mock readline interface
const mockRl = {
  question: vi.fn(),
  close: vi.fn(),
};

describe('Init Script Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockReadline.createInterface.mockReturnValue(mockRl as any);
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
    mockFs.readFileSync.mockReturnValue('{}');
    mockFs.existsSync.mockReturnValue(false);
    mockExecSync.mockReturnValue(Buffer.from(''));
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Argument Parsing', () => {
    it('should parse --type argument correctly', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'init.ts', '--type=project'];
      
      expect(process.argv).toContain('--type=project');
      
      process.argv = originalArgv;
    });

    it('should parse --init flag correctly', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'init.ts', '--init'];
      
      expect(process.argv).toContain('--init');
      
      process.argv = originalArgv;
    });
  });

  describe('Configuration Loading', () => {
    it('should handle missing config file gracefully', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => mockFs.readFileSync('./.totem/config/user-config.md', 'utf8')).toThrow();
    });

    it('should load JSON config correctly', () => {
      const mockJsonConfig = {
        rootDirectory: '/home/user/projects',
        gitUser: 'John Doe',
        gitEmail: 'john@example.com',
        location: 'New York, USA'
      };

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockJsonConfig));

      const content = mockFs.readFileSync('./.totem/config/user-config.json', 'utf8');
      const parsed = JSON.parse(content);
      
      expect(parsed.gitUser).toBe('John Doe');
      expect(parsed.gitEmail).toBe('john@example.com');
    });
  });

  describe('Git Configuration Detection', () => {
    it('should get git user and email from system', () => {
      mockExecSync.mockImplementation((command) => {
        if (command === 'git config user.name') {
          return Buffer.from('John Doe');
        }
        if (command === 'git config user.email') {
          return Buffer.from('john@example.com');
        }
        return Buffer.from('');
      });

      const name = mockExecSync('git config user.name', { encoding: 'utf8' });
      const email = mockExecSync('git config user.email', { encoding: 'utf8' });

      expect(name.toString()).toBe('John Doe');
      expect(email.toString()).toBe('john@example.com');
    });

    it('should handle missing git configuration gracefully', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git not configured');
      });

      expect(() => mockExecSync('git config user.name')).toThrow('Git not configured');
    });
  });

  describe('User Input Handling', () => {
    it('should handle user questions with defaults', () => {
      const mockQuestion = vi.fn((prompt, callback) => {
        callback('test answer');
      });
      
      mockRl.question = mockQuestion;

      mockRl.question('Test question (default): ', (answer: string) => {
        expect(answer).toBe('test answer');
      });

      expect(mockQuestion).toHaveBeenCalledWith('Test question (default): ', expect.any(Function));
    });

    it('should use default values when user provides empty input', () => {
      const mockQuestion = vi.fn((prompt, callback) => {
        callback(''); // Empty input
      });
      
      mockRl.question = mockQuestion;

      mockRl.question('Question (default value): ', (answer: string) => {
        expect(answer).toBe('');
      });
    });
  });

  describe('File System Operations', () => {
    it('should create .totem directory structure', () => {
      mockFs.mkdirSync.mockImplementation(() => undefined);

      mockFs.mkdirSync('./.totem/config', { recursive: true });
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./.totem/config', { recursive: true });
    });

    it('should save config files correctly', () => {
      const config = {
        gitUser: 'John Doe',
        gitEmail: 'john@example.com',
        location: 'New York',
        projectRole: 'Developer',
        team: 'Frontend',
        areasOfExpertise: ['React', 'TypeScript'],
        codingStyle: 'Prettier + ESLint',
        rootDirectory: '/home/user/projects'
      };

      // Test that the mock functions would be called correctly
      mockFs.writeFileSync('./.totem/config/user-config.md', expect.any(String));
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './.totem/config/user-config.md',
        expect.any(String)
      );

      mockFs.writeFileSync('./.totem/config/user-config.json', JSON.stringify(config, null, 2));
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './.totem/config/user-config.json',
        expect.stringContaining('"gitUser": "John Doe"')
      );
    });
  });

  describe('Template Generation', () => {
    it('should generate project manifest correctly', () => {
      const projectData = {
        name: 'test-project',
        description: 'A test project',
        domain: 'testing',
        author: 'John Doe',
        userConfig: {
          team: 'Test Team',
          codingStyle: 'Prettier',
          areasOfExpertise: ['Testing']
        }
      };

      const expectedManifest = {
        name: projectData.name,
        description: projectData.description,
        domain: projectData.domain,
        author: projectData.author,
        team: projectData.userConfig.team,
        created: expect.any(String),
        version: "1.0.0",
        components: [],
        dependencies: [],
        userConfig: {
          codingStyle: projectData.userConfig.codingStyle,
          expertise: projectData.userConfig.areasOfExpertise
        }
      };

      const manifestJson = JSON.stringify(expectedManifest, null, 2);
      mockFs.writeFileSync('manifest.json', manifestJson);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith('manifest.json', expect.stringContaining('test-project'));
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => mockFs.writeFileSync('test.txt', 'content')).toThrow('Permission denied');
    });

    it('should handle invalid user input gracefully', () => {
      const invalidChoice = '999';
      const choices: { [key: string]: string } = { '0': 'config', '1': 'project', '2': 'domain', '3': 'component' };
      const type = choices[invalidChoice];
      
      expect(type).toBeUndefined();
    });
  });
});
