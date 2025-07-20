#!/usr/bin/env node
// add-headers.js — Header insertion script for Gorstan game modules
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Safely prepends headers to TypeScript/JavaScript files without altering logic

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

/**
 * Extract description from JSDoc comment or generate default
 */
function extractDescription(content, filename) {
  // Look for JSDoc comment at the start
  const jsdocMatch = content.match(/^\/\*\*\s*\n([^*]|\*(?!\/))*\*\//m);
  if (jsdocMatch) {
    const lines = jsdocMatch[0].split('\n');
    for (const line of lines) {
      const cleaned = line.trim().replace(/^\*\s*/, '');
      if (cleaned && !cleaned.includes('@') && !cleaned.includes('/**') && !cleaned.includes('*/')) {
        return `Description: ${cleaned}`;
      }
    }
  }
  
  // Look for single-line comment with description
  const commentMatch = content.match(/^\/\/\s*Description:\s*(.+)$/m);
  if (commentMatch) {
    return `Description: ${commentMatch[1].trim()}`;
  }
  
  // Generate default based on filename
  const baseName = path.basename(filename, path.extname(filename));
  return `Module: ${baseName}`;
}

/**
 * Check if file already has Gorstan header
 */
function hasGorstanHeader(content) {
  const firstLines = content.split('\n').slice(0, 10).join('\n');
  return firstLines.includes('Gorstan Game') || 
         firstLines.includes('(c) Geoff Webster 2025') ||
         firstLines.includes('Geoffrey Alan Webster');
}

/**
 * Generate header for a file
 */
function generateHeader(filepath, content) {
  const filename = path.basename(filepath);
  const relativePath = path.relative(SRC_DIR, filepath).replace(/\\/g, '/');
  const description = extractDescription(content, filename);
  
  return [
    `// ${filename} — ${relativePath}`,
    `// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)`,
    `// Code MIT Licence`,
    `// ${description}`,
    '',
    ''
  ].join('\n');
}

/**
 * Process a single file
 */
function processFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Skip if already has header
    if (hasGorstanHeader(content)) {
      console.log(`✓ Skipping ${path.relative(SRC_DIR, filepath)} (already has header)`);
      return;
    }
    
    // Skip empty files
    if (content.trim().length === 0) {
      console.log(`⚠ Skipping ${path.relative(SRC_DIR, filepath)} (empty file)`);
      return;
    }
    
    const header = generateHeader(filepath, content);
    const newContent = header + content;
    
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`✓ Added header to ${path.relative(SRC_DIR, filepath)}`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filepath}:`, error.message);
  }
}

/**
 * Recursively walk directory and process files
 */
function walkDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, dist, build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        walkDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Process TypeScript and JavaScript files
      if (/\.(ts|tsx|js|jsx)$/i.test(entry.name)) {
        processFile(fullPath);
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting header insertion for Gorstan game modules...');
  console.log(`📁 Processing directory: ${SRC_DIR}`);
  console.log('');
  
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }
  
  walkDirectory(SRC_DIR);
  
  console.log('');
  console.log('✅ Header insertion completed!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processFile, walkDirectory, generateHeader };
