// .eslintrc.safe-autofix.js — Safe ESLint configuration for autofix only
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// ESLint config that only autofixes safe, non-logic-altering rules

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  rules: {
    // SAFE AUTOFIX RULES - Layout and formatting only
    'indent': 'off', // Let Prettier handle this
    'quotes': 'off', // Let Prettier handle this
    'semi': 'off', // Let Prettier handle this
    'comma-dangle': 'off', // Let Prettier handle this
    
    // Safe unused variable removal (args preserved to maintain interfaces)
    'no-unused-vars': 'off', // Use TypeScript version
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none', // Don't remove unused args (might be interface requirements)
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }
    ],
    
    // Safe import/export fixes
    'no-duplicate-imports': 'error',
    'sort-imports': 'off', // Can be risky with side effects
    
    // Safe spacing and layout fixes
    'object-curly-spacing': 'off', // Let Prettier handle
    'array-bracket-spacing': 'off', // Let Prettier handle
    'computed-property-spacing': 'off', // Let Prettier handle
    'space-before-function-paren': 'off', // Let Prettier handle
    
    // DISABLED RULES - Too risky for autofix
    'no-undef': 'off', // Don't auto-remove "undefined" variables
    'no-shadow': 'off', // Don't auto-rename shadowed variables
    'prefer-const': 'off', // Don't auto-change let to const
    'no-var': 'off', // Don't auto-change var to let
    'prefer-arrow-callback': 'off', // Don't auto-convert functions
    'object-shorthand': 'off', // Don't auto-convert object methods
    'prefer-destructuring': 'off', // Don't auto-destructure
    'prefer-template': 'off', // Don't auto-convert string concatenation
    
    // TypeScript-specific safe rules
    '@typescript-eslint/no-explicit-any': 'off', // Don't auto-remove any types
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off', // Don't auto-remove ! assertions
    
    // React-specific safe rules
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn', // Warn only, don't autofix
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    '*.min.js',
    'public/',
    'docs/',
  ],
  // Only allow safe fix types
  fixTypes: ['problem', 'layout'],
};
