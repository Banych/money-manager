import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TransactionType } from '@/generated/prisma';
import {
  createTransactionValidator,
  editTransactionValidator,
} from '@/lib/validators/transaction.validator';

const now = new Date('2026-11-11T12:00:00.000Z');

const validTransaction = {
  amount: 12.5,
  description: 'Groceries',
  type: TransactionType.EXPENSE,
  category: 'Food',
  date: '2026-11-11T11:59:00.000Z',
  accountId: 'account-1',
};

const transactionId = 'clh3am8ar0000qzrmn7q1d2k5';

beforeEach(() => {
  vi.useFakeTimers({ now });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createTransactionValidator', () => {
  it('accepts a valid transaction', () => {
    expect(createTransactionValidator.parse(validTransaction)).toEqual(
      validTransaction
    );
  });

  it.each([
    [0, 'Amount must be greater than zero'],
    [-1, 'Amount must be greater than zero'],
    [1_000_000.01, 'Amount cannot exceed 1,000,000'],
  ])('rejects the amount %s', (amount, message) => {
    const result = createTransactionValidator.safeParse({
      ...validTransaction,
      amount,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(message);
  });

  it('accepts the maximum amount', () => {
    expect(
      createTransactionValidator.safeParse({
        ...validTransaction,
        amount: 1_000_000,
      }).success
    ).toBe(true);
  });

  it('rejects an amount sent as a string', () => {
    const result = createTransactionValidator.safeParse({
      ...validTransaction,
      amount: '12.50',
    });
    expect(result.error?.issues[0].message).toBe('Amount must be a number');
  });

  it('rejects a missing amount', () => {
    const { amount: _amount, ...withoutAmount } = validTransaction;
    const result = createTransactionValidator.safeParse(withoutAmount);
    expect(result.error?.issues[0].message).toBe('Amount is required');
  });

  it('turns an empty description and category into undefined', () => {
    const parsed = createTransactionValidator.parse({
      ...validTransaction,
      description: '',
      category: '',
    });
    expect(parsed.description).toBeUndefined();
    expect(parsed.category).toBeUndefined();
  });

  it('rejects a date that cannot be parsed', () => {
    const result = createTransactionValidator.safeParse({
      ...validTransaction,
      date: 'yesterday',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Date must be a valid date string'
    );
  });

  it('rejects a date after the current server time', () => {
    const result = createTransactionValidator.safeParse({
      ...validTransaction,
      date: '2026-11-11T12:00:01.000Z',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Date cannot be in the future'
    );
  });

  it('rejects an unknown transaction type', () => {
    expect(
      createTransactionValidator.safeParse({
        ...validTransaction,
        type: 'TRANSFER',
      }).success
    ).toBe(false);
  });

  it('rejects an empty account id', () => {
    const result = createTransactionValidator.safeParse({
      ...validTransaction,
      accountId: '',
    });
    expect(result.error?.issues[0].message).toBe('Account ID is required');
  });
});

describe('editTransactionValidator', () => {
  it('accepts an id alone', () => {
    expect(editTransactionValidator.parse({ id: transactionId })).toStrictEqual(
      {
        id: transactionId,
      }
    );
  });

  it('rejects an id that is not a cuid', () => {
    const result = editTransactionValidator.safeParse({ id: 'tx-1' });
    expect(result.error?.issues[0].message).toBe(
      'Invalid transaction ID format'
    );
  });

  it.each([0, 1_000_000.01])('rejects the amount %s', (amount) => {
    expect(
      editTransactionValidator.safeParse({ id: transactionId, amount }).success
    ).toBe(false);
  });

  it('turns an empty description and category into undefined', () => {
    const parsed = editTransactionValidator.parse({
      id: transactionId,
      description: '',
      category: '',
    });
    expect(parsed.description).toBeUndefined();
    expect(parsed.category).toBeUndefined();
  });

  it('rejects a date that cannot be parsed', () => {
    expect(
      editTransactionValidator.safeParse({ id: transactionId, date: 'soon' })
        .success
    ).toBe(false);
  });
});
