import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**/*',
      '.next/**/*',
      'out/**/*',
      'dist/**/*',
      'build/**/*',
      'src/generated/**/*',
      '**/generated/**/*',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },

  // Base configurations
  ...compat.config({
    extends: [
      'eslint:recommended',
      'plugin:@next/next/recommended',
      'next/core-web-vitals',
      'next/typescript',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
  }),

  // Prettier configuration (must be last to override formatting rules)
  eslintConfigPrettier,

  // Custom rules configuration
  {
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
      'no-console': 'warn', // Changed from error to warn for development
      'no-debugger': 'error',

      // Import rules
      'no-duplicate-imports': 'error',

      // Next.js specific rules
      '@next/next/no-img-element': 'error',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
];
