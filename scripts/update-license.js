

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newLicenseHeader = `/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

`;

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip already updated files
    if (content.includes('Copyright © 2025 Geoff Webster. All Rights Reserved.')) {
      console.log(`Skipping ${filePath} - already updated`);
      return;
    }
    
    // Pattern to match various MIT license headers
    const patterns = [
      /\/\/ [^\n]*\n\/\/ [^\n]*\n\/\/ Code Licence MIT[^\n]*\n/,
      /\/\/ Code Licence MIT[^\n]*\n/,
      /\/\*[^*]*\*\/\s*/,  // Remove existing block comments at start
    ];
    
    let updated = false;
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        updated = true;
        break;
      }
    }
    
    // Add new license header at the top
    content = newLicenseHeader + content;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

function findTypescriptFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(itemPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        files.push(itemPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const files = findTypescriptFiles(srcDir);

console.log(`Found ${files.length} TypeScript/JavaScript files to update`);

files.forEach(updateFile);

console.log('License update complete!');
