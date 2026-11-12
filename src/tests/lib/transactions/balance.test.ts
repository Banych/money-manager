import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaClient, Transaction, TransactionType } from '@/generated/prisma';
import {
  calculateSimpleMonthlyBudget,
  getAccountNetTransactions,
  lockAccountForBalanceWrite,
  recomputeAccountBalance,
  roundToCents,
  validateTransactionAccess,
} from '@/lib/transactions/balance';

// A stand-in for the Prisma client: only the calls balance.ts makes, each a
// vi.fn() the test sets up. Nothing here can reach a database.
function createFakePrisma() {
  const fake = {
    $queryRaw: vi.fn(),
    transaction: {
      groupBy: vi.fn(),
      findFirst: vi.fn(),
    },
    financialAccount: {
      update: vi.fn(),
    },
  };
  return { fake, prisma: fake as unknown as PrismaClient };
}

const accountId = 'account-1';
const userId = 'user-1';

type Fake = ReturnType<typeof createFakePrisma>['fake'];

function sumsByType(fake: Fake, income: number | null, expense: number | null) {
  fake.transaction.groupBy.mockResolvedValue([
    { type: TransactionType.INCOME, _sum: { amount: income } },
    { type: TransactionType.EXPENSE, _sum: { amount: expense } },
  ]);
}

describe('roundToCents', () => {
  it.each([
    [0.1 + 0.2, 0.3],
    [10.005, 10.01],
    [-3.14159, -3.14],
    [1e-15, 0],
    [100, 100],
  ])('rounds %s to %s', (amount, expected) => {
    expect(roundToCents(amount)).toBe(expected);
  });
});

describe('getAccountNetTransactions', () => {
  let fake: Fake;
  let prisma: PrismaClient;

  beforeEach(() => {
    ({ fake, prisma } = createFakePrisma());
  });

  it('returns income minus expense', async () => {
    sumsByType(fake, 1500, 420.5);
    await expect(
      getAccountNetTransactions(prisma, accountId, userId)
    ).resolves.toBe(1079.5);
  });

  it('sums only the given account of the given user', async () => {
    sumsByType(fake, 0, 0);
    await getAccountNetTransactions(prisma, accountId, userId);
    expect(fake.transaction.groupBy).toHaveBeenCalledWith({
      by: ['type'],
      where: { accountId, userId },
      _sum: { amount: true },
    });
  });

  it('counts a type with no rows as zero', async () => {
    fake.transaction.groupBy.mockResolvedValue([
      { type: TransactionType.EXPENSE, _sum: { amount: 30 } },
    ]);
    await expect(
      getAccountNetTransactions(prisma, accountId, userId)
    ).resolves.toBe(-30);
  });

  it('counts a null sum as zero', async () => {
    sumsByType(fake, null, null);
    await expect(
      getAccountNetTransactions(prisma, accountId, userId)
    ).resolves.toBe(0);
  });

  it('returns zero for an account with no transactions', async () => {
    fake.transaction.groupBy.mockResolvedValue([]);
    await expect(
      getAccountNetTransactions(prisma, accountId, userId)
    ).resolves.toBe(0);
  });
});

describe('lockAccountForBalanceWrite', () => {
  let fake: Fake;
  let prisma: PrismaClient;

  beforeEach(() => {
    ({ fake, prisma } = createFakePrisma());
  });

  it('locks the row with FOR NO KEY UPDATE and passes the ids as parameters', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 50 }]);

    await lockAccountForBalanceWrite(prisma, accountId, userId);

    const [strings, ...values] = fake.$queryRaw.mock.calls[0];
    const sql = (strings as string[]).join('?');
    expect(sql).toContain('FOR NO KEY UPDATE');
    expect(sql).not.toMatch(/FOR UPDATE/);
    expect(sql).toContain('"id" = ?');
    expect(sql).toContain('"userId" = ?');
    expect(values).toEqual([accountId, userId]);
  });

  it('returns the locked account', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 50 }]);
    await expect(
      lockAccountForBalanceWrite(prisma, accountId, userId)
    ).resolves.toEqual({ id: accountId, openingBalance: 50 });
  });

  it('returns null when no row matches', async () => {
    fake.$queryRaw.mockResolvedValue([]);
    await expect(
      lockAccountForBalanceWrite(prisma, accountId, userId)
    ).resolves.toBeNull();
  });
});

describe('recomputeAccountBalance', () => {
  let fake: Fake;
  let prisma: PrismaClient;

  beforeEach(() => {
    ({ fake, prisma } = createFakePrisma());
    fake.financialAccount.update.mockImplementation(async ({ data }) => ({
      id: accountId,
      ...data,
    }));
  });

  it('stores openingBalance plus income minus expense, rounded to cents', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 0.1 }]);
    sumsByType(fake, 0.2, 0);
    const latest = new Date('2026-11-10T08:30:00.000Z');
    fake.transaction.findFirst.mockResolvedValue({ date: latest });

    await recomputeAccountBalance(prisma, accountId, userId);

    expect(fake.financialAccount.update).toHaveBeenCalledWith({
      where: { id: accountId, userId },
      data: { balance: 0.3, lastActivity: latest },
      select: { id: true, balance: true, lastActivity: true },
    });
  });

  it('can produce a negative balance', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 100 }]);
    sumsByType(fake, 0, 250.75);
    fake.transaction.findFirst.mockResolvedValue({ date: new Date() });

    const result = await recomputeAccountBalance(prisma, accountId, userId);

    expect(result.balance).toBe(-150.75);
  });

  it('sets lastActivity to null when the account has no transactions', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 75 }]);
    fake.transaction.groupBy.mockResolvedValue([]);
    fake.transaction.findFirst.mockResolvedValue(null);

    const result = await recomputeAccountBalance(prisma, accountId, userId);

    expect(result).toEqual({ id: accountId, balance: 75, lastActivity: null });
  });

  it('takes lastActivity from the newest transaction of this account and user', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 0 }]);
    fake.transaction.groupBy.mockResolvedValue([]);
    fake.transaction.findFirst.mockResolvedValue(null);

    await recomputeAccountBalance(prisma, accountId, userId);

    expect(fake.transaction.findFirst).toHaveBeenCalledWith({
      where: { accountId, userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
  });

  it('locks the account before reading the sums', async () => {
    fake.$queryRaw.mockResolvedValue([{ id: accountId, openingBalance: 0 }]);
    fake.transaction.groupBy.mockResolvedValue([]);
    fake.transaction.findFirst.mockResolvedValue(null);

    await recomputeAccountBalance(prisma, accountId, userId);

    const lockOrder = fake.$queryRaw.mock.invocationCallOrder[0];
    const sumOrder = fake.transaction.groupBy.mock.invocationCallOrder[0];
    expect(lockOrder).toBeLessThan(sumOrder);
  });

  it('throws and writes nothing when the account is not the user’s', async () => {
    fake.$queryRaw.mockResolvedValue([]);

    await expect(
      recomputeAccountBalance(prisma, accountId, userId)
    ).rejects.toThrow('Account not found or access denied');
    expect(fake.transaction.groupBy).not.toHaveBeenCalled();
    expect(fake.financialAccount.update).not.toHaveBeenCalled();
  });
});

describe('validateTransactionAccess', () => {
  let fake: Fake;
  let prisma: PrismaClient;

  beforeEach(() => {
    ({ fake, prisma } = createFakePrisma());
  });

  it('returns the transaction when it belongs to the user', async () => {
    const transaction = {
      id: 'tx-1',
      accountId,
      amount: 20,
      type: TransactionType.EXPENSE,
    };
    fake.transaction.findFirst.mockResolvedValue(transaction);

    await expect(
      validateTransactionAccess(prisma, 'tx-1', userId)
    ).resolves.toEqual(transaction);
    expect(fake.transaction.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'tx-1', userId } })
    );
  });

  it('throws when the transaction is missing or someone else’s', async () => {
    fake.transaction.findFirst.mockResolvedValue(null);
    await expect(
      validateTransactionAccess(prisma, 'tx-1', userId)
    ).rejects.toThrow('Transaction not found or access denied');
  });
});

describe('calculateSimpleMonthlyBudget', () => {
  function tx(
    type: TransactionType,
    amount: number,
    currency: string
  ): Transaction & { account: { currency: string } } {
    return {
      type,
      amount,
      account: { currency },
    } as Transaction & { account: { currency: string } };
  }

  it('sums income and expenses separately', () => {
    expect(
      calculateSimpleMonthlyBudget([
        tx(TransactionType.INCOME, 2000, 'EUR'),
        tx(TransactionType.EXPENSE, 120.5, 'EUR'),
        tx(TransactionType.EXPENSE, 79.5, 'EUR'),
      ])
    ).toEqual({
      monthlyIncome: 2000,
      monthlyExpenses: 200,
      primaryCurrency: 'EUR',
    });
  });

  it('picks the currency used by the most transactions', () => {
    const budget = calculateSimpleMonthlyBudget([
      tx(TransactionType.EXPENSE, 10, 'EUR'),
      tx(TransactionType.EXPENSE, 10, 'USD'),
      tx(TransactionType.EXPENSE, 10, 'USD'),
    ]);
    expect(budget.primaryCurrency).toBe('USD');
  });

  it('defaults to EUR with no transactions', () => {
    expect(calculateSimpleMonthlyBudget([])).toEqual({
      monthlyIncome: 0,
      monthlyExpenses: 0,
      primaryCurrency: 'EUR',
    });
  });
});
