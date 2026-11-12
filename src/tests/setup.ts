import { vi } from 'vitest';

/**
 * Tests never reach a database: the only one is production (see CLAUDE.md).
 *
 * 1. The connection variables point at a host that cannot resolve. Prisma's
 *    generated client loads `.env` on import (even a test that only imports
 *    an enum) and again when constructed, but never overrides a variable that
 *    is already set, so even a stray `new PrismaClient()` cannot reach the
 *    real database. If `prisma/schema.prisma` ever reads other variable
 *    names, block those here too.
 * 2. The app's shared client (`@/lib/db`) is replaced by one that throws on
 *    any use. A test that needs database calls passes its own fake client
 *    built from `vi.fn()`.
 */
const BLOCKED_DATABASE_URL =
  'postgresql://tests-must-not-connect.invalid:5432/blocked';

process.env.DATABASE_URL = BLOCKED_DATABASE_URL;
process.env.DIRECT_URL = BLOCKED_DATABASE_URL;

vi.mock('@/lib/db', () => ({
  db: new Proxy(
    {},
    {
      get(_target, property) {
        // Let promise checks and inspection through, so a failure message
        // can still print the object.
        if (typeof property === 'symbol' || property === 'then') {
          return undefined;
        }
        throw new Error(
          `Tests must not touch the database (db.${property}). ` +
            'Pass a fake Prisma client built from vi.fn() instead.'
        );
      },
    }
  ),
}));
