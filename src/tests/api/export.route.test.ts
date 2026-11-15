import { beforeEach, describe, expect, it, vi } from 'vitest';

const { accountFindMany, transactionFindMany, getAuthSession } = vi.hoisted(
  () => ({
    accountFindMany: vi.fn(),
    transactionFindMany: vi.fn(),
    getAuthSession: vi.fn(),
  })
);

vi.mock('@/lib/auth', () => ({ getAuthSession }));
vi.mock('@/lib/db', () => ({
  db: {
    financialAccount: { findMany: accountFindMany },
    transaction: { findMany: transactionFindMany },
  },
}));

import { GET as exportAccounts } from '@/app/api/export/accounts/route';
import { GET as exportTransactions } from '@/app/api/export/transactions/route';

const lines = async (response: Response) =>
  (await response.text()).replace(/^\uFEFF/, '').split('\r\n');

beforeEach(() => {
  accountFindMany.mockReset();
  transactionFindMany.mockReset();
  getAuthSession.mockResolvedValue({ user: { id: 'user-1' } });
});

describe('GET /api/export/accounts', () => {
  it('answers 401 when signed out', async () => {
    getAuthSession.mockResolvedValue(null);

    expect((await exportAccounts()).status).toBe(401);
    expect(accountFindMany).not.toHaveBeenCalled();
  });

  it("exports only the signed-in user's accounts", async () => {
    accountFindMany.mockResolvedValue([
      {
        id: 'acc-1',
        name: 'Main, shared',
        type: 'BANK_ACCOUNT',
        currency: 'EUR',
        openingBalance: 100,
        balance: 87.5,
        createdAt: new Date('2026-11-10T09:00:00.000Z'),
      },
    ]);

    const response = await exportAccounts();

    expect(accountFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="money-manager-accounts-\d{4}-\d{2}-\d{2}\.csv"$/
    );
    expect(await lines(response)).toEqual([
      'id,name,type,currency,openingBalance,balance,createdAt',
      'acc-1,"Main, shared",BANK_ACCOUNT,EUR,100,87.5,2026-11-10T09:00:00.000Z',
      '',
    ]);
  });

  it('answers 500 when the query fails', async () => {
    accountFindMany.mockRejectedValue(new Error('down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect((await exportAccounts()).status).toBe(500);
  });
});

describe('GET /api/export/transactions', () => {
  it('answers 401 when signed out', async () => {
    getAuthSession.mockResolvedValue(null);

    expect((await exportTransactions()).status).toBe(401);
    expect(transactionFindMany).not.toHaveBeenCalled();
  });

  it("exports only the signed-in user's transactions with their account", async () => {
    transactionFindMany.mockResolvedValue([
      {
        id: 'tx-1',
        date: new Date('2026-11-12T00:00:00.000Z'),
        type: 'EXPENSE',
        amount: 12.5,
        accountId: 'acc-1',
        account: { name: 'Wallet', currency: 'EUR' },
        category: 'Groceries',
        description: '=cmd|"/c calc"!A1',
        receiptUrl: null,
        createdAt: new Date('2026-11-12T08:30:00.000Z'),
      },
    ]);

    const response = await exportTransactions();

    expect(transactionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="money-manager-transactions-\d{4}-\d{2}-\d{2}\.csv"$/
    );
    expect(await lines(response)).toEqual([
      'id,date,type,amount,currency,accountId,accountName,category,description,receiptUrl,createdAt',
      'tx-1,2026-11-12T00:00:00.000Z,EXPENSE,12.5,EUR,acc-1,Wallet,Groceries,"\'=cmd|""/c calc""!A1",,2026-11-12T08:30:00.000Z',
      '',
    ]);
  });

  it('answers 500 when the query fails', async () => {
    transactionFindMany.mockRejectedValue(new Error('down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect((await exportTransactions()).status).toBe(500);
  });
});
