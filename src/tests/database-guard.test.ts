import { describe, expect, it } from 'vitest';

import { db } from '@/lib/db';

// If src/tests/setup.ts stops running, these fail instead of letting a test
// reach the production database. Don't import setup.ts here: that would run
// its guard again and hide a missing setupFiles entry.
describe('database guard', () => {
  it('points the connection variables at an unreachable host', () => {
    for (const name of ['DATABASE_URL', 'DIRECT_URL']) {
      const url = new URL(process.env[name] ?? '');
      expect(url.hostname).toBe('tests-must-not-connect.invalid');
    }
  });

  it('replaces the shared Prisma client with one that throws', () => {
    expect(() => db.transaction).toThrow(/must not touch the database/);
    expect(() => db.$queryRaw).toThrow(/must not touch the database/);
  });
});
