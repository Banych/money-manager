import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// No `dotenv/config` here: the local .env holds the production database URL.
// `src/tests/setup.ts` replaces it before any test file loads.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
  },
});
