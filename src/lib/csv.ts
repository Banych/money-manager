// CSV for the data export (issue 1 of docs/family-plan.md): RFC 4180 quoting,
// CRLF line ends, and a UTF-8 byte order mark so Excel reads non-ASCII text.

export type CsvCell = string | number | Date | null | undefined;

// A spreadsheet runs a cell starting with one of these as a formula. Text the
// user typed (names, descriptions) gets a leading apostrophe so it stays text.
// Numbers are written by us and never pass through this check.
const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

export function csvCell(value: CsvCell): string {
  if (value === null || value === undefined) {
    return '';
  }

  let text: string;
  if (value instanceof Date) {
    text = value.toISOString();
  } else if (typeof value === 'number') {
    text = String(value);
  } else {
    text = FORMULA_START.test(value) ? `'${value}` : value;
  }

  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (readonly CsvCell[])[]
): string {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(','));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

/** A download response named `money-manager-<name>-<yyyy-mm-dd>.csv`. */
export function csvDownload(name: string, csv: string, now = new Date()) {
  const filename = `money-manager-${name}-${now.toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
