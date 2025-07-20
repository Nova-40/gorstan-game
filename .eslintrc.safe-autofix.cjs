// .eslintrc.safe-autofix.cjs — Safe ESLint configuration for autofix only
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// ESLint config that only autofixes safe, non-logic-altering rules

const typescriptParser = require('@typescript-eslint/parser');
const typescript = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // ONLY ULTRA-SAFE FORMATTING RULES
      // These rules only fix spacing and layout without changing logic
      
      // Safe import fixes
      'no-duplicate-imports': 'error',
      
      // That's it - everything else is too risky for autofix
      // Let Prettier handle all other formatting
    },
  },
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '*.min.js',
      'public/',
      'docs/',
      // Ignore files with known parsing issues
      'src/components/AppCore_optimized.tsx',
      'src/engine/enhancedWanderingNPCController.ts',
      'src/logic/dominicLogic.ts',
      'src/logic/dreamRoomEvents.ts',
      'src/utils/roomNPCCleaner.ts',
      'src/utils/trapTester.ts',
      'src/scripts/testItemManagement.ts',
    ],
  },
];
