import { describe, expect, it } from 'vitest';

import { FinancialAccountType } from '@/generated/prisma';
import {
  createAccountValidator,
  updateAccountValidator,
} from '@/lib/validators/account.validator';

const validAccount = {
  name: 'Main card',
  balance: 120.5,
  currency: 'EUR',
  type: FinancialAccountType.BANK_ACCOUNT,
};

const accountId = 'clh3am8ar0000qzrmn7q1d2k5';

describe('createAccountValidator', () => {
  it('accepts a valid account', () => {
    expect(createAccountValidator.parse(validAccount)).toEqual(validAccount);
  });

  it('rejects a name shorter than 3 characters', () => {
    const result = createAccountValidator.safeParse({
      ...validAccount,
      name: 'ab',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['name']);
  });

  it('rejects an empty currency', () => {
    const result = createAccountValidator.safeParse({
      ...validAccount,
      currency: '',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['currency']);
  });

  it('rejects an unknown account type', () => {
    expect(
      createAccountValidator.safeParse({ ...validAccount, type: 'PIGGY_BANK' })
        .success
    ).toBe(false);
  });

  it.each([FinancialAccountType.CASH, FinancialAccountType.PREPAID])(
    'rejects a negative balance on a %s account',
    (type) => {
      const result = createAccountValidator.safeParse({
        ...validAccount,
        type,
        balance: -0.01,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        path: ['balance'],
        message: 'Cash and prepaid accounts cannot have negative balances',
      });
    }
  );

  it.each([FinancialAccountType.CASH, FinancialAccountType.PREPAID])(
    'accepts a zero balance on a %s account',
    (type) => {
      expect(
        createAccountValidator.safeParse({ ...validAccount, type, balance: 0 })
          .success
      ).toBe(true);
    }
  );

  it.each([
    FinancialAccountType.CREDIT_CARD,
    FinancialAccountType.BANK_ACCOUNT,
  ])('accepts a negative balance on a %s account', (type) => {
    expect(
      createAccountValidator.safeParse({
        ...validAccount,
        type,
        balance: -250,
      }).success
    ).toBe(true);
  });
});

describe('updateAccountValidator', () => {
  it('accepts an id alone', () => {
    expect(updateAccountValidator.parse({ id: accountId })).toStrictEqual({
      id: accountId,
    });
  });

  it('rejects an id that is not a cuid', () => {
    const result = updateAccountValidator.safeParse({ id: 'account-1' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid account ID format');
  });

  it('rejects a negative balance sent together with a cash type', () => {
    const result = updateAccountValidator.safeParse({
      id: accountId,
      balance: -5,
      type: FinancialAccountType.CASH,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['balance']);
  });

  it('accepts a negative balance sent without a type', () => {
    // The rule only applies when both fields are in the request; the stored
    // type of the account is not checked here.
    expect(
      updateAccountValidator.safeParse({ id: accountId, balance: -5 }).success
    ).toBe(true);
  });
});
