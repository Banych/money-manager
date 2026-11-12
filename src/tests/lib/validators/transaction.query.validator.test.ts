import { describe, expect, it } from 'vitest';

import { TransactionType } from '@/generated/prisma';
import { transactionQuerySchema } from '@/lib/validators/transaction.query.validator';

describe('transactionQuerySchema', () => {
  it('accepts an empty query', () => {
    expect(transactionQuerySchema.parse({})).toEqual({
      page: undefined,
      limit: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it('parses page and limit into numbers', () => {
    expect(transactionQuerySchema.parse({ page: '3', limit: '50' })).toEqual(
      expect.objectContaining({ page: 3, limit: 50 })
    );
  });

  it.each(['0', '-1'])('rejects the page %s', (page) => {
    expect(transactionQuerySchema.safeParse({ page }).success).toBe(false);
  });

  it.each(['0', '101'])('rejects the limit %s', (limit) => {
    expect(transactionQuerySchema.safeParse({ limit }).success).toBe(false);
  });

  it.each(['1', '100'])('accepts the limit %s', (limit) => {
    expect(transactionQuerySchema.safeParse({ limit }).success).toBe(true);
  });

  it('accepts a known type and rejects an unknown one', () => {
    expect(
      transactionQuerySchema.parse({ type: TransactionType.INCOME }).type
    ).toBe(TransactionType.INCOME);
    expect(transactionQuerySchema.safeParse({ type: 'TRANSFER' }).success).toBe(
      false
    );
  });

  it('rejects an empty category or search', () => {
    expect(transactionQuerySchema.safeParse({ category: '' }).success).toBe(
      false
    );
    expect(transactionQuerySchema.safeParse({ search: '' }).success).toBe(
      false
    );
  });

  it('turns from and to into dates', () => {
    const parsed = transactionQuerySchema.parse({
      from: '2026-11-01',
      to: '2026-11-30T23:59:59.999Z',
    });
    expect(parsed.from).toEqual(new Date('2026-11-01'));
    expect(parsed.to).toEqual(new Date('2026-11-30T23:59:59.999Z'));
  });

  it.each([{ from: 'last week' }, { to: 'tomorrow' }])(
    'rejects a date that cannot be parsed: %o',
    (query) => {
      expect(transactionQuerySchema.safeParse(query).success).toBe(false);
    }
  );
});
