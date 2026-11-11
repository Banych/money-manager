import { describe, expect, it } from 'vitest';

import { toSafeCallbackPath } from '@/lib/callback-url';

const origin = 'https://money.example.com';

describe('toSafeCallbackPath', () => {
  it.each([
    ['/accounts', '/accounts'],
    ['/transactions?page=2#latest', '/transactions?page=2#latest'],
    ['accounts/new', '/accounts/new'],
    [`${origin}/dashboard?tab=month`, '/dashboard?tab=month'],
    // Encoded slashes stay in the path, so the result stays same-origin.
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com'],
  ])('keeps the same-origin path %s', (input, expected) => {
    expect(toSafeCallbackPath(input, origin)).toBe(expected);
  });

  it.each([
    'https://evil.com/accounts',
    'http://money.example.com/accounts',
    'https://money.example.com:8443/accounts',
    '//evil.com',
    '/\\evil.com',
    '\\\\evil.com',
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    `blob:${origin}/0b1c`,
  ])('falls back for %s', (input) => {
    expect(toSafeCallbackPath(input, origin)).toBe('/');
  });

  it('collapses leading slashes so the path cannot turn protocol-relative', () => {
    expect(toSafeCallbackPath(`${origin}//evil.com/x`, origin)).toBe(
      '/evil.com/x'
    );
  });

  it.each([null, undefined, ''])('falls back for %s', (input) => {
    expect(toSafeCallbackPath(input, origin)).toBe('/');
  });

  it('falls back when the URL cannot be parsed', () => {
    expect(toSafeCallbackPath('http://[::1', origin)).toBe('/');
  });

  it('uses the given fallback', () => {
    expect(toSafeCallbackPath('//evil.com', origin, '/dashboard')).toBe(
      '/dashboard'
    );
  });
});
