#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import os from 'os';

// TypeScript interfaces
interface TotemConfig {
  rootDirectory?: string;
  gitUser?: string;
  gitEmail?: string;
  location?: string;
  projectRole?: string;
  team?: string;
  areasOfExpertise?: string[];
  codingStyle?: string;
  [key: string]: any;
}

interface QuestionAnswer {
  question: string;
  defaultValue?: string;
}

interface ProjectData {
  name: string;
  description: string;
  domain: string;
  author: string;
  userConfig: TotemConfig;
}

interface DomainData {
  name: string;
  description: string;
  industry: string;
  technologies: string;
  userConfig: TotemConfig;
}

interface ComponentData {
  name: string;
  layer: string;
  feature: string;
  description: string;
  assignee: string;
  userConfig: TotemConfig;
}

interface TemplateType<T> {
  prompt(): Promise<T>;
  generate(data: T): void;
}

interface Templates {
  config: TemplateType<TotemConfig>;
  project: TemplateType<ProjectData>;
  domain: TemplateType<DomainData>;
  component: TemplateType<ComponentData>;
}

// Parse command line arguments
const args: string[] = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const configArg = args.find(arg => arg.startsWith('--config='));
const initFlag = args.includes('--init');
const initType: string | null = typeArg ? typeArg.split('=')[1] : (initFlag ? 'config' : null);
const configFile: string | null = configArg ? configArg.split('=')[1] : null;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to ask questions
function ask(question: string, defaultValue: string = ''): Promise<string> {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Parse command line arguments into config
function parseArguments(): TotemConfig {
  const config: TotemConfig = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--root-dir=')) config.rootDirectory = arg.split('=')[1];
    if (arg.startsWith('--git-user=')) config.gitUser = arg.split('=')[1];
    if (arg.startsWith('--git-email=')) config.gitEmail = arg.split('=')[1];
    if (arg.startsWith('--location=')) config.location = arg.split('=')[1];
    if (arg.startsWith('--role=')) config.projectRole = arg.split('=')[1];
    if (arg.startsWith('--team=')) config.team = arg.split('=')[1];
    if (arg.startsWith('--expertise=')) config.areasOfExpertise = arg.split('=')[1].split(',');
    if (arg.startsWith('--coding-style=')) config.codingStyle = arg.split('=')[1];
  });
  
  return config;
}

// Load config from markdown file
function loadConfigFile(filePath: string): TotemConfig {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config: TotemConfig = {};
    
    // Parse markdown-style config
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- **Root Directory**:')) {
        config.rootDirectory = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('- **Git User**:')) {
        config.gitUser = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('- **Git Email**:')) {
        config.gitEmail = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('- **Location**:')) {
        config.location = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('- **Project Role**:')) {
        config.projectRole = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('- **Team**:')) {
        config.team = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('- **Areas of Expertise**:')) {
        config.areasOfExpertise = trimmed.split(':')[1].trim().split(',').map(s => s.trim());
      } else if (trimmed.startsWith('- **Coding Style**:')) {
        config.codingStyle = trimmed.split(':')[1].trim();
      }
    });
    
    return config;
  } catch (error: any) {
    console.log(`Warning: Could not load config file ${filePath}: ${error.message}`);
    return {};
  }
}

// User configuration wizard
async function runConfigWizard(existingConfig: TotemConfig = {}): Promise<TotemConfig> {
  console.log('🧙‍♀️ Totem Contributor Configuration Wizard\n');
  console.log('Please provide the following information (press Enter for defaults):\n');
  
  const config: TotemConfig = {};
  
  // Get current git config as defaults
  let defaultGitUser = '';
  let defaultGitEmail = '';
  try {
    const { execSync } = require('child_process');
    defaultGitUser = execSync('git config user.name', { encoding: 'utf8' }).trim();
    defaultGitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
  } catch (e) {
    // Git not configured or not available
  }
  
  config.rootDirectory = existingConfig.rootDirectory || 
    await ask('Root directory for projects', process.cwd());
  
  config.gitUser = existingConfig.gitUser || 
    await ask('Git username', defaultGitUser);
  
  config.gitEmail = existingConfig.gitEmail || 
    await ask('Git email', defaultGitEmail);
  
  config.location = existingConfig.location || 
    await ask('Location (city, country)', '');
  
  config.projectRole = existingConfig.projectRole || 
    await ask('Project role', 'Developer');
  
  config.team = existingConfig.team || 
    await ask('Team name', '');
  
  const expertiseInput = existingConfig.areasOfExpertise ? 
    existingConfig.areasOfExpertise.join(', ') : 
    await ask('Areas of expertise (comma-separated)', 'Frontend, Backend');
  config.areasOfExpertise = expertiseInput.split(',').map(s => s.trim());
  
  config.codingStyle = existingConfig.codingStyle || 
    await ask('Preferred coding style', 'Prettier + ESLint');
  
  return config;
}

// Save config to file
function saveConfig(config: TotemConfig): TotemConfig {
  const configDir = './.totem/config';
  fs.mkdirSync(configDir, { recursive: true });
  
  const configContent = `# Totem Contributor Configuration

## Personal Information
- **Git User**: ${config.gitUser}
- **Git Email**: ${config.gitEmail}
- **Location**: ${config.location}

## Project Information
- **Root Directory**: ${config.rootDirectory}
- **Project Role**: ${config.projectRole}
- **Team**: ${config.team}

## Technical Preferences
- **Areas of Expertise**: ${config.areasOfExpertise ? config.areasOfExpertise.join(', ') : ''}
- **Coding Style**: ${config.codingStyle}

---
*Generated: ${new Date().toLocaleDateString()}*
*Last Updated: ${new Date().toISOString()}*
`;
  
  fs.writeFileSync(`${configDir}/user-config.md`, configContent);
  
  // Also save as JSON for programmatic access
  fs.writeFileSync(`${configDir}/user-config.json`, JSON.stringify(config, null, 2));
  
  console.log(`\n✅ Configuration saved to ./.totem/config/user-config.md`);
  return config;
}

// Template generators
const templates: Templates = {
  config: {
    async prompt() {
      // Load existing config if available
      let existingConfig = {};
      
      if (configFile) {
        existingConfig = loadConfigFile(configFile);
      } else {
        // Try to load from default location
        try {
          existingConfig = loadConfigFile('./.totem/config/user-config.md');
        } catch (e) {
          // No existing config
        }
      }
      
      // Merge with command line arguments
      const argConfig = parseArguments();
      existingConfig = { ...existingConfig, ...argConfig };
      
      return await runConfigWizard(existingConfig);
    },
    
    generate(config: TotemConfig): void {
      saveConfig(config);
      
      console.log('\n🎯 Configuration Summary:');
      console.log(`👤 User: ${config.gitUser} (${config.gitEmail})`);
      console.log(`📍 Location: ${config.location}`);
      console.log(`💼 Role: ${config.projectRole} on ${config.team} team`);
      console.log(`🚀 Expertise: ${config.areasOfExpertise ? config.areasOfExpertise.join(', ') : 'Not specified'}`);
      console.log(`🎨 Style: ${config.codingStyle}`);
      console.log(`📁 Root: ${config.rootDirectory}`);
    }
  },
  
  project: {
    async prompt(): Promise<ProjectData> {
      // Load user config for defaults
      let userConfig: TotemConfig = {};
      try {
        userConfig = JSON.parse(fs.readFileSync('./.totem/config/user-config.json', 'utf8'));
      } catch (e) {
        console.log('💡 Tip: Run `totem --init` first to set up your preferences');
      }
      
      const name = await ask('Project name');
      const description = await ask('Description');
      const domain = await ask('Domain (healthcare, fintech, etc.)');
      const author = await ask('Author', userConfig.gitUser || '');
      
      return { name, description, domain, author, userConfig };
    },
    
    generate(data: ProjectData): void {
      const projectDir = `${data.userConfig.rootDirectory || '.'}/.totem/projects/${data.name}`;
      
      // Create project directory structure
      fs.mkdirSync(projectDir, { recursive: true });
      fs.mkdirSync(`${projectDir}/components`, { recursive: true });
      fs.mkdirSync(`${projectDir}/docs`, { recursive: true });
      
      // Generate project manifest with user info
      const manifest = {
        name: data.name,
        description: data.description,
        domain: data.domain,
        author: data.author,
        team: data.userConfig.team || '',
        created: new Date().toISOString(),
        version: "1.0.0",
        components: [],
        dependencies: [],
        userConfig: {
          codingStyle: data.userConfig.codingStyle,
          expertise: data.userConfig.areasOfExpertise
        }
      };
      
      fs.writeFileSync(
        `${projectDir}/manifest.json`,
        JSON.stringify(manifest, null, 2)
      );
      
      // Generate enhanced README with user preferences
      const readme = `# ${data.name}

${data.description}

## Project Information
- **Domain**: ${data.domain}
- **Author**: ${data.author}
- **Team**: ${data.userConfig.team || 'Not specified'}
- **Created**: ${new Date().toLocaleDateString()}

## Development Standards
- **Coding Style**: ${data.userConfig.codingStyle || 'Not specified'}
- **Expertise Areas**: ${data.userConfig.areasOfExpertise ? data.userConfig.areasOfExpertise.join(', ') : 'Not specified'}

## Getting Started

This project was created using the Totem project management system.

### Structure
- \`components/\` - Project components and features
- \`docs/\` - Documentation and specifications
- \`manifest.json\` - Project configuration and metadata

### Usage

\`\`\`bash
# Add a new component
totem --type=component

# View project structure
tree ${projectDir}
\`\`\`

## Team
Created by ${data.author} for the ${data.userConfig.team || 'development'} team.
`;
      
      fs.writeFileSync(`${projectDir}/README.md`, readme);
      
      console.log(`\n✅ Project "${data.name}" created successfully!`);
      console.log(`📁 Location: ${projectDir}`);
      console.log(`📋 Manifest: ${projectDir}/manifest.json`);
    }
  },
  
  domain: {
    async prompt(): Promise<DomainData> {
      // Load user config for author info
      let userConfig: TotemConfig = {};
      try {
        userConfig = JSON.parse(fs.readFileSync('./.totem/config/user-config.json', 'utf8'));
      } catch (e) {
        // No user config available
      }
      
      const name = await ask('Domain name');
      const description = await ask('Description');
      const industry = await ask('Industry/Sector');
      const technologies = await ask('Primary technologies (comma-separated)');
      
      return { name, description, industry, technologies, userConfig };
    },
    
    generate(data: DomainData): void {
      const domainDir = `${data.userConfig.rootDirectory || '.'}/.totem/domains`;
      const domainFile = `${domainDir}/${data.name}.md`;
      
      fs.mkdirSync(domainDir, { recursive: true });
      
      const content = `# ${data.name.charAt(0).toUpperCase() + data.name.slice(1)} Domain

${data.description}

## Industry
${data.industry}

## Technologies
${data.technologies.split(',').map(tech => `- ${tech.trim()}`).join('\n')}

## Architecture

### Overview
[Describe the high-level architecture]

### Components
[List main components and their responsibilities]

### Data Flow
[Describe how data flows through the system]

## Key Features

### Core Functionality
- [Feature 1]
- [Feature 2]
- [Feature 3]

### Technical Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

## Development Standards
- **Coding Style**: ${data.userConfig.codingStyle || 'To be defined'}
- **Team Expertise**: ${data.userConfig.areasOfExpertise ? data.userConfig.areasOfExpertise.join(', ') : 'Various'}

---
*Created by: ${data.userConfig.gitUser || 'Unknown'} (${data.userConfig.gitEmail || ''})*
*Generated: ${new Date().toLocaleDateString()}*
`;
      
      fs.writeFileSync(domainFile, content);
      
      console.log(`\n✅ Domain "${data.name}" created!`);
      console.log(`📁 Location: ${domainFile}`);
    }
  },
  
  component: {
    async prompt(): Promise<ComponentData> {
      // Load user config for defaults
      let userConfig: TotemConfig = {};
      try {
        userConfig = JSON.parse(fs.readFileSync('./.totem/config/user-config.json', 'utf8'));
      } catch (e) {
        // No user config available
      }
      
      const name = await ask('Component name');
      const layer = await ask('Layer (frontend, backend, mobile, etc.)');
      const feature = await ask('Feature');
      const description = await ask('Description');
      const assignee = await ask('Assignee', userConfig.gitUser || '');
      
      return { name, layer, feature, description, assignee, userConfig };
    },
    
    generate(data: ComponentData): void {
      const componentDir = `${data.userConfig.rootDirectory || '.'}/.totem/components`;
      const componentFile = `${componentDir}/${data.layer}-${data.name}-${data.feature}.md`;
      
      fs.mkdirSync(componentDir, { recursive: true });
      
      const timestamp = Date.now().toString().slice(-3);
      const componentId = `${data.layer}.${data.name}-${data.feature}-${timestamp}`;
      
      const content = `# ${data.name} - ${data.feature}

**ID**: \`${componentId}\`
**Layer**: ${data.layer}
**Status**: planned
**Priority**: medium
**Complexity**: m
**Assignee**: ${data.assignee}

## Description
${data.description}

## Requirements

### Functional
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Technical
- [ ] [Technical requirement 1]
- [ ] [Technical requirement 2]

### Acceptance Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]

## Implementation

### Architecture
[Describe component architecture following ${data.userConfig.codingStyle || 'team standards'}]

### Dependencies
- [Dependency 1]
- [Dependency 2]

### API/Interface
[Describe interfaces if applicable]

## Testing

### Unit Tests
- [ ] [Test case 1]
- [ ] [Test case 2]

### Integration Tests
- [ ] [Integration test 1]

## Documentation
- [ ] Technical documentation
- [ ] User documentation
- [ ] API documentation

---
*Created by: ${data.userConfig.gitUser || 'Unknown'} (${data.userConfig.team || 'Development'} team)*
*Created: ${new Date().toLocaleDateString()}*
*ID: ${componentId}*
`;
      
      fs.writeFileSync(componentFile, content);
      
      console.log(`\n✅ Component "${data.name}-${data.feature}" created!`);
      console.log(`🆔 ID: ${componentId}`);
      console.log(`👤 Assigned to: ${data.assignee}`);
      console.log(`📁 Location: ${componentFile}`);
    }
  }
};

// Main execution
async function main() {
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🗿 Totem - Structured Project Management Environment\n');
    console.log('USAGE:');
    console.log('  totem [OPTIONS]\n');
    console.log('OPTIONS:');
    console.log('  --init                     Set up contributor configuration');
    console.log('  --type=<type>             Create specific item type');
    console.log('  --config=<file>           Load configuration from markdown file');
    console.log('  --git-user=<name>         Set git username');
    console.log('  --git-email=<email>       Set git email');
    console.log('  --location=<location>     Set location');
    console.log('  --role=<role>             Set project role');
    console.log('  --team=<team>             Set team name');
    console.log('  --expertise=<skills>      Set areas of expertise (comma-separated)');
    console.log('  --coding-style=<style>    Set coding style preference');
    console.log('  --help, -h                Show this help message\n');
    console.log('TYPES:');
    console.log('  config                    Contributor configuration setup');
    console.log('  project                   Create a new project');
    console.log('  domain                    Create a domain specification');
    console.log('  component                 Create a component\n');
    console.log('EXAMPLES:');
    console.log('  totem --init              # Interactive contributor setup');
    console.log('  totem --type=project      # Create a new project');
    console.log('  totem --type=component    # Create a component');
    console.log('  totem --git-user="John" --git-email="john@example.com" --init');
    console.log('  totem --config=./my-config.md --type=project\n');
    console.log('NPM SCRIPTS:');
    console.log('  npm test                  # Run tests');
    console.log('  npm run init:contributor  # Alternative contributor setup');
    rl.close();
    return;
  }
  
  console.log('🗿 Totem Project Initializer\n');
  
  let type = initType;
  
  // If --init flag is used, go directly to config
  if (initFlag && !type) {
    type = 'config';
  }
  
  if (!type) {
    console.log('What would you like to create?');
    console.log('0. Contributor Configuration (recommended first)');
    console.log('1. Project');
    console.log('2. Domain'); 
    console.log('3. Component');
    
    const choice = await ask('\nSelect (0-3)');
    const choices: { [key: string]: string } = { '0': 'config', '1': 'project', '2': 'domain', '3': 'component' };
    type = choices[choice];
  }
  
  if (!type || !templates[type as keyof typeof templates]) {
    console.log('❌ Invalid selection');
    console.log('\nAvailable options:');
    console.log('- config: Set up contributor configuration');
    console.log('- project: Create a new project');
    console.log('- domain: Create a domain specification');
    console.log('- component: Create a component');
    console.log('\nUsage examples:');
    console.log('totem --init                    # Set up contributor config');
    console.log('totem --type=project           # Create a project');
    console.log('totem --config=./my-config.md --type=project');
    console.log('totem --git-user="John Doe" --git-email="john@example.com" --init');
    rl.close();
    return;
  }
  
  try {
    const templateKey = type as keyof typeof templates;
    const data = await templates[templateKey].prompt();
    (templates[templateKey] as any).generate(data);
    console.log('\n🎉 Initialization complete!');
    
    if (type === 'config') {
      console.log('\n💡 Next steps:');
      console.log('- Run `totem --type=project` to create your first project');
      console.log('- Your preferences will be used as defaults');
      console.log('- Edit ./.totem/config/user-config.md to update preferences');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}
