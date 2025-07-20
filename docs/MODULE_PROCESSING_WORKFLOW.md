# Gorstan Game Module Processing Workflow

## Overview

This modularized workflow safely processes TypeScript/JavaScript code in three distinct stages:

1. **Header Insertion** - Adds standardized file headers
2. **Safe Linting** - Applies only non-destructive ESLint fixes  
3. **Prettier Formatting** - Standardizes code style

Each stage preserves the previous state, ensuring no logic is lost.

## Quick Usage

### Full Workflow
```bash
npm run process-modules
```

### Individual Stages
```bash
# Stage 1: Add headers only
npm run add-headers

# Stage 2: Safe linting only (currently disabled due to parsing issues)
npm run lint-safe

# Stage 3: Prettier formatting only
npm run format

# Verification: Check TypeScript compilation
npm run verify
```

## What Each Stage Does

### Stage 1: Header Insertion
- Adds standardized file headers to TypeScript/JavaScript files
- Skips files that already have Gorstan headers
- Extracts descriptions from existing JSDoc comments
- Safe: Only prepends content, never modifies existing code

**Example Header:**
```typescript
// App.tsx — src/App.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Main application component
```

### Stage 2: Safe Linting (Disabled)
- **Status**: Currently disabled due to TypeScript parsing issues
- **Intent**: Apply only ultra-safe ESLint fixes (duplicate imports only)
- **Safety**: Configured to avoid any logic-altering changes

### Stage 3: Prettier Formatting
- Standardizes code formatting (indentation, spacing, etc.)
- Only changes whitespace and formatting
- Preserves all logic and structure

## Files Created

### Scripts
- `scripts/add-headers.cjs` - Header insertion script
- `scripts/process-modules.cjs` - Main workflow orchestrator

### Configuration
- `.eslintrc.safe-autofix.cjs` - Ultra-safe ESLint rules
- `.prettierrc.cjs` - Prettier formatting configuration
- `.prettierignore` - Files to exclude from formatting

### Package.json Scripts
```json
{
  "scripts": {
    "process-modules": "node scripts/process-modules.cjs",
    "add-headers": "node scripts/add-headers.cjs",
    "lint-safe": "npx eslint \"src/**/*.{ts,tsx,js,jsx}\" --config .eslintrc.safe-autofix.cjs --fix --fix-type problem --fix-type layout",
    "format": "npx prettier \"src/**/*.{ts,tsx,js,jsx}\" --write",
    "verify": "npx tsc --noEmit"
  }
}
```

## Current Status

✅ **Header Insertion**: Working perfectly
- Successfully added headers to 100+ files
- Skips files that already have headers
- Preserves existing code structure

⚠️ **Safe Linting**: Disabled
- TypeScript parsing configuration needs adjustment
- Currently configured for ultra-safe rules only
- Will be enabled once parsing issues are resolved

⚠️ **Prettier Formatting**: Partially working
- Some files have syntax errors that prevent formatting
- Files without syntax errors are formatted successfully
- Syntax errors need manual fixing first

## Safety Features

1. **Automatic Backups**: Creates timestamped backup before processing
2. **Incremental Processing**: Each stage can be run independently
3. **Error Recovery**: Provides rollback instructions if issues occur
4. **Conservative Rules**: Only applies changes that cannot break logic

## Syntax Issues Found

The workflow identified several files with syntax errors that need manual fixing:

- `src/components/CreditsScreen.tsx` - Missing comma
- `src/components/HelpModal.tsx` - Unexpected closing brace
- `src/components/moralFramework.ts` - Declaration issues
- `src/engine/blueButtonLogic.ts` - Unterminated string literal
- Several other files with parsing errors

## Recommendations

1. **Start with Headers**: Run `npm run add-headers` to standardize file headers
2. **Fix Syntax Issues**: Manually resolve the syntax errors found by Prettier
3. **Format Gradually**: Run formatting on individual files after fixing syntax
4. **Build Verification**: Use `npm run verify` to ensure TypeScript compilation

## Dependencies

The workflow requires these dev dependencies:
```json
{
  "devDependencies": {
    "eslint": "^9.31.0",
    "prettier": "^3.x.x",
    "@typescript-eslint/parser": "^8.x.x",
    "@typescript-eslint/eslint-plugin": "^8.x.x",
    "eslint-plugin-react": "^7.x.x",
    "eslint-plugin-react-hooks": "^5.x.x"
  }
}
```

## Summary

The modularized workflow successfully demonstrates the three-stage approach:
- ✅ Headers can be safely added to all files
- ⚠️ Linting needs TypeScript parser configuration
- ⚠️ Formatting requires fixing existing syntax errors first

This provides a solid foundation for incremental code quality improvements while preserving all existing functionality.
