import { describe, expect, it } from 'vitest';

import { csvCell, csvDownload, toCsv } from '@/lib/csv';

describe('csvCell', () => {
  it('writes empty values as empty cells', () => {
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
    expect(csvCell('')).toBe('');
  });

  it('writes numbers as they are, negative ones included', () => {
    expect(csvCell(12.5)).toBe('12.5');
    expect(csvCell(-3)).toBe('-3');
    expect(csvCell(0)).toBe('0');
  });

  it('writes dates as ISO 8601 in UTC', () => {
    expect(csvCell(new Date('2026-11-15T10:20:30.000Z'))).toBe(
      '2026-11-15T10:20:30.000Z'
    );
  });

  it('quotes cells holding commas, quotes or line breaks', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(csvCell('cr\rlf')).toBe('"cr\rlf"');
  });

  it('keeps non-ASCII text unchanged', () => {
    expect(csvCell('Продукты')).toBe('Продукты');
  });

  it.each(['=1+1', '+1', '-1', '@SUM(A1)', '\tcmd', '\rcmd'])(
    'prefixes text starting a formula (%j) with an apostrophe',
    (value) => {
      expect(csvCell(value).replace(/^"/, '')).toMatch(/^'/);
    }
  );

  it('quotes a guarded cell that also needs quotes', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
  });

  it('leaves text that only contains formula characters later on', () => {
    expect(csvCell('a=b')).toBe('a=b');
    expect(csvCell('e-mail')).toBe('e-mail');
  });
});

describe('toCsv', () => {
  it('starts with a BOM and ends every line with CRLF', () => {
    expect(
      toCsv(
        ['name', 'amount'],
        [
          ['Wallet', 10],
          ['Bank, main', null],
        ]
      )
    ).toBe('\uFEFFname,amount\r\nWallet,10\r\n"Bank, main",\r\n');
  });

  it('writes only the header line when there are no rows', () => {
    expect(toCsv(['id'], [])).toBe('\uFEFFid\r\n');
  });
});

describe('csvDownload', () => {
  it('answers with a dated, uncached CSV attachment', async () => {
    const response = csvDownload(
      'accounts',
      'id\r\n',
      new Date('2026-11-15T23:59:00.000Z')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'text/csv; charset=utf-8'
    );
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="money-manager-accounts-2026-11-15.csv"'
    );
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toBe('id\r\n');
  });
});
