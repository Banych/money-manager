# Linting and Code Formatting Configuration Guide

This document provides a comprehensive guide to set up linting, code formatting, and pre-commit hooks for a Next.js project using ESLint, Prettier, Husky, and lint-staged.

## Table of Contents

1. [Overview](#overview)
2. [Dependencies](#dependencies)
3. [ESLint Configuration](#eslint-configuration)
4. [Prettier Configuration](#prettier-configuration)
5. [TypeScript Configuration](#typescript-configuration)
6. [Husky and lint-staged Setup](#husky-and-lint-staged-setup)
7. [Package.json Scripts](#packagejson-scripts)
8. [VS Code Integration](#vs-code-integration)
9. [Migration Checklist](#migration-checklist)
10. [Troubleshooting](#troubleshooting)

## Overview

This configuration provides:

- **ESLint**: Code linting for JavaScript/TypeScript with Next.js specific rules
- **Prettier**: Code formatting with consistent style
- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Run linters only on staged files for performance
- **TypeScript**: Type checking integration

## Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    // Core Next.js and React dependencies are assumed to be present
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@types/node": "^20",
    "@types/react": "19.1.2",
    "@types/react-dom": "19.1.2",
    "eslint": "^9.25.1",
    "eslint-config-next": "^15.3.1",
    "eslint-config-prettier": "^10.1.2",
    "eslint-plugin-react": "^7.37.5",
    "husky": "^9.1.7",
    "lint-staged": "^16.1.2",
    "prettier": "^3.5.0",
    "typescript": "^5",
    "typescript-eslint": "^8.24.0"
  }
}
```

### Installation Command

```bash
# Using yarn
yarn add -D @eslint/eslintrc eslint eslint-config-next eslint-config-prettier eslint-plugin-react husky lint-staged prettier typescript typescript-eslint

# Using npm
npm install --save-dev @eslint/eslintrc eslint eslint-config-next eslint-config-prettier eslint-plugin-react husky lint-staged prettier typescript typescript-eslint

# Using pnpm
pnpm add -D @eslint/eslintrc eslint eslint-config-next eslint-config-prettier eslint-plugin-react husky lint-staged prettier typescript typescript-eslint
```

## ESLint Configuration

### File: `eslint.config.mjs`

```javascript
import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Extend recommended configs
  ...compat.extends(
    'next/core-web-vitals', // Next.js rules
    'next/typescript', // Next.js TypeScript rules
    'plugin:react/recommended', // React best practices
    'plugin:react-hooks/recommended', // React hooks rules
    'plugin:@typescript-eslint/recommended' // TypeScript rules
  ),

  // Disable ESLint formatting rules that conflict with Prettier
  eslintConfigPrettier,

  {
    // File patterns and ignores
    ignores: [
      'node_modules/**/*',
      '.next/**/*',
      'out/**/*',
      'generated/**/*', // Prisma generated files
      '*.config.js', // Config files
      '*.config.mjs',
    ],
    files: ['**/*.{js,jsx,ts,tsx}'],

    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
      'react/prop-types': 'off', // Using TypeScript for prop validation

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'error',
      'no-debugger': 'error',

      // Import rules
      'no-duplicate-imports': 'error',

      // Next.js specific
      '@next/next/no-img-element': 'error',
    },
  },
];

export default config;
```

### Key Features of This ESLint Configuration

1. **Modern Flat Config**: Uses ESLint 9+ flat configuration format
2. **Next.js Integration**: Includes Next.js specific rules and TypeScript support
3. **React Best Practices**: Enforces React and React Hooks best practices
4. **TypeScript Support**: Full TypeScript linting with proper type checking
5. **Prettier Integration**: Disables formatting rules that conflict with Prettier
6. **Custom Rules**: Tailored rules for code quality and consistency

## Prettier Configuration

### File: `.prettierrc`

```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true,
  "endOfLine": "lf"
}
```

### File: `.prettierignore`

```ignore
# Dependencies
node_modules/

# Build outputs
.next/
out/
dist/
build/

# Generated files
generated/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Package lock files (keep yarn.lock, ignore others)
package-lock.json

# Environment files
.env*

# IDE files
.vscode/settings.json
.idea/

# OS files
.DS_Store
Thumbs.db
```

### Prettier Configuration Explained

- **trailingComma**: "es5" - Adds trailing commas where valid in ES5
- **tabWidth**: 2 - Uses 2 spaces for indentation
- **semi**: false - No semicolons at the end of statements
- **singleQuote**: true - Uses single quotes instead of double quotes
- **endOfLine**: "lf" - Uses LF line endings for cross-platform compatibility

## TypeScript Configuration

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Husky and lint-staged Setup

### 1. Initialize Husky

```bash
# After installing husky as dev dependency
npx husky init
```

### 2. File: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn lint-staged
```

### 3. lint-staged Configuration in `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,scss,md}": ["prettier --write"]
  }
}
```

### What This Setup Does

1. **Pre-commit Hook**: Runs automatically before each commit
2. **Staged Files Only**: Only processes files that are staged for commit (performance)
3. **Auto-fix**: Automatically fixes ESLint errors where possible
4. **Format**: Formats code with Prettier
5. **Multiple File Types**: Handles JS/TS files with linting and all supported files with formatting

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "validate": "yarn lint && yarn format:check && yarn type-check"
  }
}
```

### Script Explanations

- **lint**: Runs ESLint on the project
- **lint:fix**: Runs ESLint and automatically fixes issues
- **format**: Formats all files with Prettier
- **format:check**: Checks if files are formatted correctly
- **type-check**: Runs TypeScript compiler without emitting files
- **validate**: Runs all quality checks (use in CI/CD)

## VS Code Integration

### File: `.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Required VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### File: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## Migration Checklist

### Step 1: Install Dependencies

```bash
# Choose your package manager
yarn add -D @eslint/eslintrc eslint eslint-config-next eslint-config-prettier eslint-plugin-react husky lint-staged prettier typescript typescript-eslint
```

### Step 2: Copy Configuration Files

- [ ] `eslint.config.mjs`
- [ ] `.prettierrc`
- [ ] `.prettierignore`
- [ ] `tsconfig.json` (modify paths as needed)

### Step 3: Update package.json

- [ ] Add scripts section
- [ ] Add lint-staged configuration
- [ ] Verify dependencies are installed

### Step 4: Initialize Husky

```bash
npx husky init
```

### Step 5: Set up Pre-commit Hook

- [ ] Create `.husky/pre-commit` file
- [ ] Make it executable: `chmod +x .husky/pre-commit`

### Step 6: VS Code Setup (Optional)

- [ ] Create `.vscode/settings.json`
- [ ] Create `.vscode/extensions.json`
- [ ] Install recommended extensions

### Step 7: Test the Setup

```bash
# Test linting
yarn lint

# Test formatting
yarn format:check

# Test type checking
yarn type-check

# Test all together
yarn validate

# Test pre-commit hook
git add .
git commit -m "test commit"
```

## Troubleshooting

### Common Issues

#### 1. ESLint Flat Config Not Working

**Problem**: ESLint not recognizing flat config format
**Solution**: Ensure you're using ESLint 9+ and the config file is named `eslint.config.mjs`

#### 2. Prettier and ESLint Conflicts

**Problem**: Formatting rules conflict between ESLint and Prettier
**Solution**: Ensure `eslint-config-prettier` is included and is the last config in the extends array

#### 3. Husky Hooks Not Running

**Problem**: Pre-commit hooks are not executing
**Solution**:

- Ensure Husky is initialized: `npx husky init`
- Check file permissions: `chmod +x .husky/pre-commit`
- Verify Git hooks are enabled: `git config core.hooksPath .husky`

#### 4. lint-staged Not Finding Files

**Problem**: lint-staged reports no files to process
**Solution**: Ensure files are staged (`git add`) before committing

#### 5. TypeScript Path Mapping Issues

**Problem**: Import paths not resolving correctly
**Solution**: Adjust `paths` in `tsconfig.json` to match your project structure

### Debug Commands

```bash
# Check ESLint configuration
npx eslint --print-config src/index.tsx

# Check Prettier configuration
npx prettier --check --debug-check src/

# Test lint-staged manually
npx lint-staged

# Check TypeScript configuration
npx tsc --showConfig
```

## Advanced Customization

### Adding Custom ESLint Rules

```javascript
// In eslint.config.mjs
rules: {
  // Add custom rules here
  'custom-rule-name': 'error',

  // Project-specific rules
  'no-restricted-imports': [
    'error',
    {
      'patterns': ['../../../*'] // Prevent deep relative imports
    }
  ]
}
```

### Custom Prettier Configuration

```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true,
  "endOfLine": "lf",
  "printWidth": 80,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always"
}
```

### Multiple Git Hooks

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn type-check
yarn lint-staged

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run type check
        run: yarn type-check

      - name: Run linting
        run: yarn lint

      - name: Check formatting
        run: yarn format:check

      - name: Run validation
        run: yarn validate
```

## Conclusion

This configuration provides a robust foundation for code quality in Next.js projects. It ensures:

- **Consistent Code Style**: Through Prettier formatting
- **Code Quality**: Through ESLint rules and TypeScript checking
- **Automated Quality Checks**: Through Husky pre-commit hooks
- **Performance**: Through lint-staged processing only changed files
- **IDE Integration**: Through VS Code settings and extensions

The setup is designed to be developer-friendly while maintaining high code quality standards across the entire project lifecycle.
