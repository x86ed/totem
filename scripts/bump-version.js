#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Package.json file paths
const packagePaths = [
  path.join(__dirname, '..', 'package.json'),
  path.join(__dirname, 'package.json'),
  path.join(__dirname, '..', 'frontend', 'package.json')
];

function bumpPatchVersion(version) {
  const parts = version.split('.');
  const patch = parseInt(parts[2]) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

function bumpMinorVersion(version) {
  const parts = version.split('.');
  const minor = parseInt(parts[1]) + 1;
  return `${parts[0]}.${minor}.0`;
}

function updatePackageJson(filePath, bumpType = 'patch') {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file does not exist`);
    return null;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const oldVersion = packageJson.version;
  const newVersion = bumpType === 'minor' ? bumpMinorVersion(oldVersion) : bumpPatchVersion(oldVersion);
  
  packageJson.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`Updated ${filePath}: ${oldVersion} -> ${newVersion}`);
  return newVersion;
}

try {
  // Get bump type from command line argument
  const bumpType = process.argv[2] || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('Invalid bump type. Use: patch, minor, or major');
    process.exit(1);
  }
  
  console.log(`Bumping ${bumpType} version in package.json files...`);
  
  // Update all package.json files
  let newVersion = null;
  for (const packagePath of packagePaths) {
    const version = updatePackageJson(packagePath, bumpType);
    if (version && !newVersion) {
      newVersion = version;
    }
  }
  
  if (!newVersion) {
    console.error('No package.json files were updated');
    process.exit(1);
  }
  
  // Git operations
  console.log('\nCommitting changes...');
  execSync('git add package.json */package.json', { stdio: 'inherit' });
  execSync(`git commit -m "bump version to ${newVersion}"`, { stdio: 'inherit' });
  
  console.log(`\nTagging version ${newVersion}...`);
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  
  console.log('\nPushing changes and tags...');
  execSync('git push', { stdio: 'inherit' });
  execSync('git push --tags', { stdio: 'inherit' });
  
  console.log(`\n✅ Successfully bumped version to ${newVersion} and pushed to remote`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
