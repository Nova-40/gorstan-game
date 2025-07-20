#!/usr/bin/env node
// process-modules.js — Modularized workflow for Gorstan game code processing
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Three-stage process: headers → lint → format (preserves logic at each step)

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

/**
 * Execute a command and handle errors gracefully
 */
function executeCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  console.log(`Command: ${command}`);
  
  try {
    const output = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    if (output.trim()) {
      console.log(output);
    }
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.stdout || error.message);
    return false;
  }
}

/**
 * Check if required dependencies are installed
 */
function checkDependencies() {
  const requiredDeps = ['eslint', 'prettier'];
  const missing = [];
  
  for (const dep of requiredDeps) {
    try {
      execSync(`npx ${dep} --version`, { stdio: 'pipe' });
    } catch {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    console.error(`❌ Missing dependencies: ${missing.join(', ')}`);
    console.log('Install with: npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin');
    return false;
  }
  
  return true;
}

/**
 * Create backup of src directory
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(PROJECT_ROOT, `src-backup-${timestamp}`);
  
  try {
    console.log(`\n💾 Creating backup at: ${path.relative(PROJECT_ROOT, backupDir)}`);
    
    // Use system copy command for better performance
    if (process.platform === 'win32') {
      execSync(`xcopy "${SRC_DIR}" "${backupDir}" /E /I /H /Y`, { stdio: 'pipe' });
    } else {
      execSync(`cp -r "${SRC_DIR}" "${backupDir}"`, { stdio: 'pipe' });
    }
    
    console.log(`✅ Backup created successfully`);
    return backupDir;
  } catch (error) {
    console.error(`❌ Failed to create backup:`, error.message);
    return null;
  }
}

/**
 * Stage 1: Insert headers
 */
function stage1_InsertHeaders() {
  console.log('\n📋 STAGE 1: HEADER INSERTION');
  console.log('=' .repeat(50));
  
  const headerScript = path.join(__dirname, 'add-headers.cjs');
  
  if (!fs.existsSync(headerScript)) {
    console.error(`❌ Header script not found: ${headerScript}`);
    return false;
  }
  
  return executeCommand(`node "${headerScript}"`, 'Header insertion');
}

/**
 * Stage 2: ESLint autofix (safe rules only)
 */
function stage2_LintAndFix() {
  console.log('\n🔍 STAGE 2: SAFE ESLINT AUTOFIX');
  console.log('=' .repeat(50));
  
  const eslintConfig = path.join(PROJECT_ROOT, '.eslintrc.safe-autofix.cjs');
  
  if (!fs.existsSync(eslintConfig)) {
    console.error(`❌ Safe ESLint config not found: ${eslintConfig}`);
    return false;
  }
  
  const command = `npx eslint "src/**/*.{ts,tsx,js,jsx}" --config "${eslintConfig}" --fix --fix-type problem --fix-type layout`;
  return executeCommand(command, 'Safe ESLint autofix');
}

/**
 * Stage 3: Prettier formatting
 */
function stage3_Format() {
  console.log('\n🎨 STAGE 3: PRETTIER FORMATTING');
  console.log('=' .repeat(50));
  
  const command = 'npx prettier "src/**/*.{ts,tsx,js,jsx}" --write';
  return executeCommand(command, 'Prettier formatting');
}

/**
 * Verify TypeScript compilation after processing
 */
function verifyCompilation() {
  console.log('\n🔬 VERIFICATION: TYPESCRIPT COMPILATION');
  console.log('=' .repeat(50));
  
  return executeCommand('npx tsc --noEmit', 'TypeScript compilation check');
}

/**
 * Main workflow execution
 */
function main() {
  console.log('🚀 GORSTAN GAME MODULE PROCESSING WORKFLOW');
  console.log('=' .repeat(60));
  console.log('Three-stage process: Headers → Lint → Format');
  console.log('Each stage preserves previous state and logic');
  console.log('=' .repeat(60));
  
  // Pre-flight checks
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }
  
  // Create backup
  const backupDir = createBackup();
  if (!backupDir) {
    console.log('⚠️  Proceeding without backup (risky!)');
  }
  
  let success = true;
  
  // Stage 1: Headers
  if (success) {
    success = stage1_InsertHeaders();
  }
  
  // Stage 2: Lint
  if (success) {
    success = stage2_LintAndFix();
  } else {
    console.log('⚠️  Skipping linting due to header insertion failure');
  }
  
  // Stage 3: Format
  if (success) {
    success = stage3_Format();
  } else {
    console.log('⚠️  Skipping formatting due to previous failures');
  }
  
  // Verification
  if (success) {
    const compilationOk = verifyCompilation();
    if (!compilationOk) {
      console.log('⚠️  TypeScript compilation issues detected after processing');
      success = false;
    }
  }
  
  // Final report
  console.log('\n' + '=' .repeat(60));
  if (success) {
    console.log('🎉 ALL STAGES COMPLETED SUCCESSFULLY!');
    console.log('✓ Headers inserted');
    console.log('✓ Safe ESLint fixes applied');
    console.log('✓ Prettier formatting applied');
    console.log('✓ TypeScript compilation verified');
    
    if (backupDir) {
      console.log(`\n💾 Backup available at: ${path.relative(PROJECT_ROOT, backupDir)}`);
      console.log('You can safely delete the backup if everything looks good.');
    }
  } else {
    console.log('❌ WORKFLOW COMPLETED WITH ERRORS');
    
    if (backupDir) {
      console.log(`\n🔄 To restore from backup:`);
      if (process.platform === 'win32') {
        console.log(`   rmdir /s /q "${SRC_DIR}"`);
        console.log(`   xcopy "${backupDir}" "${SRC_DIR}" /E /I /H /Y`);
      } else {
        console.log(`   rm -rf "${SRC_DIR}"`);
        console.log(`   cp -r "${backupDir}" "${SRC_DIR}"`);
      }
    }
  }
  console.log('=' .repeat(60));
  
  process.exit(success ? 0 : 1);
}

// Individual stage exports for testing
module.exports = {
  stage1_InsertHeaders,
  stage2_LintAndFix,
  stage3_Format,
  verifyCompilation,
  checkDependencies,
  createBackup,
};

// Run if called directly
if (require.main === module) {
  main();
}
