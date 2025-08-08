// scripts/smoke/smoke-test.js  
// Gorstan Game Runtime Smoke Test
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Automated smoke testing for core game functionality

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGS_DIR = join(__dirname, 'logs');
const TIMEOUT = 30000; // 30 seconds timeout for operations
const BASE_URL = 'http://localhost:5173';

// Test configuration
const CONFIG = {
  headless: process.env.HEADFUL !== 'true',
  slowMo: process.env.HEADFUL === 'true' ? 100 : 0,
  viewport: { width: 1280, height: 720 },
  timeout: TIMEOUT,
};

/**
 * Logger utility for test output
 */
class TestLogger {
  constructor() {
    this.logs = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Ensure logs directory exists
    try {
      mkdirSync(LOGS_DIR, { recursive: true });
    } catch (error) {
      console.warn('Could not create logs directory:', error.message);
    }
  }

  log(level, message, details = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details: details ? JSON.stringify(details, null, 2) : null,
    };
    
    this.logs.push(entry);
    
    const logLine = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;
    console.log(logLine);
    
    if (details) {
      console.log('  Details:', details);
    }
  }

  info(message, details) { this.log('info', message, details); }
  warn(message, details) { this.log('warn', message, details); }
  error(message, details) { this.log('error', message, details); }
  success(message, details) { this.log('success', message, details); }

  async saveLogs() {
    try {
      const logFile = join(LOGS_DIR, `smoke-test-${this.timestamp}.json`);
      writeFileSync(logFile, JSON.stringify(this.logs, null, 2));
      this.info(`Logs saved to ${logFile}`);
    } catch (error) {
      this.error('Failed to save logs', { error: error.message });
    }
  }
}

/**
 * Main smoke test suite
 */
class GorstnSmokeTest {
  constructor() {
    this.logger = new TestLogger();
    this.browser = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      failures: [],
    };
  }

  async setup() {
    this.logger.info('Setting up smoke test environment');
    
    try {
      this.browser = await chromium.launch(CONFIG);
      this.page = await this.browser.newPage();
      
      // Set up error handling
      this.page.on('console', msg => {
        const level = msg.type();
        if (level === 'error') {
          this.logger.error(`Browser console error: ${msg.text()}`);
        }
      });

      this.page.on('pageerror', error => {
        this.logger.error('Page error occurred', { error: error.message, stack: error.stack });
      });

      this.logger.success('Browser setup complete');
      return true;
    } catch (error) {
      this.logger.error('Setup failed', { error: error.message });
      return false;
    }
  }

  async runTest(testName, testFn) {
    this.testResults.total++;
    this.logger.info(`Running test: ${testName}`);
    
    try {
      await testFn();
      this.testResults.passed++;
      this.logger.success(`✓ ${testName} passed`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.failures.push({ test: testName, error: error.message });
      this.logger.error(`✗ ${testName} failed`, { error: error.message });
    }
  }

  async testInitialRender() {
    await this.page.goto(BASE_URL);
    await this.page.waitForSelector('body', { timeout: TIMEOUT });
    
    // Check if the game loads without fatal errors
    const title = await this.page.title();
    if (!title.includes('Gorstan') && title !== '') {
      this.logger.warn('Page title might be unexpected', { title });
    }
    
    // Check for presence of game elements
    const gameElements = await this.page.$$eval('[class*="game"], [id*="game"], [class*="terminal"], [class*="console"]', 
      elements => elements.length);
    
    if (gameElements === 0) {
      throw new Error('No game elements found on page');
    }
    
    this.logger.info(`Found ${gameElements} game-related elements`);
  }

  async testQuickActionsPanel() {
    // Look for direction buttons in QuickActionsPanel
    const directionButtons = await this.page.$$eval(
      'button[title*="North"], button[title*="East"], button[title*="South"], button[title*="West"]',
      buttons => buttons.map(btn => ({ 
        title: btn.title, 
        disabled: btn.disabled,
        className: btn.className 
      }))
    );

    if (directionButtons.length === 0) {
      this.logger.warn('No direction buttons found - this may be expected in initial state');
      return;
    }

    this.logger.info(`Found ${directionButtons.length} direction buttons`, { directionButtons });

    // Try clicking an enabled direction button
    const enabledButton = directionButtons.find(btn => !btn.disabled);
    if (enabledButton) {
      const buttonSelector = `button[title="${enabledButton.title}"]`;
      await this.page.click(buttonSelector);
      this.logger.info(`Clicked direction button: ${enabledButton.title}`);
      
      // Wait a moment for any navigation to occur
      await this.page.waitForTimeout(1000);
    }
  }

  async testConsoleCommands() {
    // Look for command input field
    const commandInput = await this.page.$('input[type="text"], textarea, [contenteditable="true"]');
    
    if (!commandInput) {
      this.logger.warn('No command input found');
      return;
    }

    // Test basic commands that should be safe
    const testCommands = ['look', 'inventory', 'help'];
    
    for (const command of testCommands) {
      try {
        await commandInput.fill(command);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(500); // Brief wait for command processing
        this.logger.info(`Executed command: ${command}`);
      } catch (error) {
        this.logger.warn(`Command "${command}" failed`, { error: error.message });
      }
    }
  }

  async testNPCModal() {
    // Look for NPC or talk buttons
    const npcButtons = await this.page.$$eval(
      'button[title*="Talk"], button[title*="NPC"], button:has-text("Talk"), button:has-text("?")',
      buttons => buttons.length
    );

    if (npcButtons === 0) {
      this.logger.warn('No NPC interaction buttons found');
      return;
    }

    this.logger.info(`Found ${npcButtons} NPC-related buttons`);

    // Try to open NPC modal
    try {
      await this.page.click('button[title*="Talk"], button[title*="NPC"], button:has-text("Talk"), button:has-text("?")');
      await this.page.waitForTimeout(1000);

      // Check if modal opened
      const modal = await this.page.$('[role="dialog"], .modal, [class*="modal"]');
      if (modal) {
        this.logger.success('NPC modal opened successfully');
        
        // Try to close modal
        const closeButton = await this.page.$('button[aria-label*="close"], button:has-text("Close"), button:has-text("×")');
        if (closeButton) {
          await closeButton.click();
          this.logger.info('Closed NPC modal');
        }
      }
    } catch (error) {
      this.logger.warn('NPC modal test failed', { error: error.message });
    }
  }

  async testInventoryAccess() {
    // Look for inventory button
    const inventoryButton = await this.page.$('button[title*="Inventory"], button:has-text("Inventory"), button[title*="Backpack"]');
    
    if (!inventoryButton) {
      this.logger.warn('No inventory button found');
      return;
    }

    try {
      await inventoryButton.click();
      await this.page.waitForTimeout(500);
      
      // Check if inventory opened (modal or panel)
      const inventoryOpen = await this.page.$('[class*="inventory"], [role="dialog"]:has-text("Inventory")');
      if (inventoryOpen) {
        this.logger.success('Inventory opened successfully');
      } else {
        this.logger.warn('Inventory button clicked but no inventory UI detected');
      }
    } catch (error) {
      this.logger.warn('Inventory test failed', { error: error.message });
    }
  }

  async testGameStateConsistency() {
    // Check for obvious errors or broken states
    const consoleErrors = await this.page.evaluate(() => {
      const errors = [];
      const originalError = console.error;
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };
      return errors;
    });

    if (consoleErrors.length > 0) {
      this.logger.warn('Console errors detected', { errors: consoleErrors });
    }

    // Check if critical game elements are present
    const criticalElements = {
      'Game container': '[class*="game"], [id*="game"]',
      'Terminal/Console': '[class*="terminal"], [class*="console"]',
      'Actions panel': '[class*="action"], [class*="quick"]',
    };

    for (const [name, selector] of Object.entries(criticalElements)) {
      const element = await this.page.$(selector);
      if (!element) {
        this.logger.warn(`Critical element missing: ${name}`);
      } else {
        this.logger.info(`✓ ${name} present`);
      }
    }
  }

  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      this.logger.info('Cleanup completed');
    } catch (error) {
      this.logger.error('Cleanup failed', { error: error.message });
    }
  }

  async run() {
    this.logger.info('Starting Gorstan smoke test suite');
    
    const setupSuccess = await this.setup();
    if (!setupSuccess) {
      this.logger.error('Setup failed, aborting tests');
      return false;
    }

    // Run all tests
    await this.runTest('Initial Render', () => this.testInitialRender());
    await this.runTest('Quick Actions Panel', () => this.testQuickActionsPanel());
    await this.runTest('Console Commands', () => this.testConsoleCommands());
    await this.runTest('NPC Modal', () => this.testNPCModal());
    await this.runTest('Inventory Access', () => this.testInventoryAccess());
    await this.runTest('Game State Consistency', () => this.testGameStateConsistency());

    await this.cleanup();
    await this.logger.saveLogs();

    // Report results
    const { passed, failed, total, failures } = this.testResults;
    this.logger.info('=== SMOKE TEST RESULTS ===');
    this.logger.info(`Total Tests: ${total}`);
    this.logger.info(`Passed: ${passed}`);
    this.logger.info(`Failed: ${failed}`);
    
    if (failures.length > 0) {
      this.logger.error('Failed Tests:', failures);
    }

    const success = failed === 0;
    if (success) {
      this.logger.success('🎉 All smoke tests passed!');
    } else {
      this.logger.error('💥 Some smoke tests failed');
    }

    return success;
  }
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const smokeTest = new GorstnSmokeTest();
  smokeTest.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Smoke test crashed:', error);
    process.exit(1);
  });
}

export default GorstnSmokeTest;
