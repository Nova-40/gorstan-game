#!/usr/bin/env node

/**
 * Simple script to bump the build version
 * Usage: node scripts/bump-version.js
 */

import fs from 'fs';
import path from 'path';

const versionPath = path.join(process.cwd(), 'src/config/version.ts');

try {
  const content = fs.readFileSync(versionPath, 'utf8');
  
  // Extract current version number
  const versionMatch = content.match(/BUILD_VERSION = "(\d+)"/);
  if (!versionMatch) {
    console.error('Could not find BUILD_VERSION in version.ts');
    process.exit(1);
  }
  
  const currentVersion = parseInt(versionMatch[1]);
  const nextVersion = String(currentVersion + 1).padStart(2, '0');
  
  // Replace the version
  const newContent = content.replace(
    /BUILD_VERSION = "\d+"/,
    `BUILD_VERSION = "${nextVersion}"`
  );
  
  fs.writeFileSync(versionPath, newContent);
  
  console.log(`✅ Version bumped from ${versionMatch[1]} to ${nextVersion}`);
  console.log(`📝 Remember to commit and push the changes!`);
  
} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
}
