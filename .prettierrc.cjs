// .prettierrc.js — Prettier configuration for Gorstan game
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Prettier config for consistent code formatting

module.exports = {
  // Line formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  
  // Semicolons and quotes
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // Trailing commas
  trailingComma: 'es5',
  
  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // TypeScript/JavaScript specific
  parser: 'typescript',
  
  // File-specific overrides
  overrides: [
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
  
  // Ignore patterns
  ignorePath: '.prettierignore',
};
