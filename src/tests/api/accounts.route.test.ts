import { beforeEach, describe, expect, it, vi } from 'vitest';

const { create, getAuthSession } = vi.hoisted(() => ({
  create: vi.fn(),
  getAuthSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getAuthSession }));
vi.mock('@/lib/db', () => ({ db: { financialAccount: { create } } }));

import { POST } from '@/app/api/accounts/route';

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );

beforeEach(() => {
  create.mockReset();
  getAuthSession.mockResolvedValue({ user: { id: 'user-1' } });
});

describe('POST /api/accounts', () => {
  it('answers 400 with field errors for invalid data', async () => {
    const response = await post({ name: 'ab', balance: 10 });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid data provided');
    expect(json.details.fieldErrors.name).toEqual([
      'Name must be at least 3 characters long',
    ]);
    expect(create).not.toHaveBeenCalled();
  });

  it('answers 400 for a negative cash balance', async () => {
    const response = await post({ name: 'Wallet', balance: -5 });

    expect(response.status).toBe(400);
    expect((await response.json()).details.fieldErrors.balance).toEqual([
      'Cash and prepaid accounts cannot have negative balances',
    ]);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a valid account for the signed-in user', async () => {
    create.mockResolvedValue({ id: 'account-1' });

    const response = await post({ name: 'Wallet', balance: 10.005 });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Wallet',
        balance: 10.01,
        openingBalance: 10.01,
        currency: 'EUR',
        type: 'CASH',
        userId: 'user-1',
      },
    });
  });

  it('answers 401 when signed out', async () => {
    getAuthSession.mockResolvedValue(null);

    expect((await post({ name: 'Wallet', balance: 10 })).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });
});
