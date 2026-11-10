/**
 * Turns an untrusted `callbackUrl` (e.g. from the query string) into a path
 * on `origin` that is safe to hand to `router.push` or `signIn`.
 *
 * Anything that resolves to another origin or scheme falls back: absolute
 * URLs (`https://evil.com`), protocol-relative ones (`//evil.com`,
 * `/\evil.com`), and `javascript:`/`data:` URLs, which Next's router would
 * otherwise pass to `location.assign`.
 */
export function toSafeCallbackPath(
  callbackUrl: string | null | undefined,
  origin: string,
  fallback = '/'
): string {
  if (!callbackUrl) return fallback;

  let url: URL;
  try {
    url = new URL(callbackUrl, origin);
  } catch {
    return fallback;
  }

  // Check the protocol as well: a `blob:` URL reports its inner origin.
  const base = new URL(origin);
  if (url.protocol !== base.protocol || url.origin !== base.origin) {
    return fallback;
  }

  // A same-origin URL can still carry a path like `//evil.com`, which turns
  // protocol-relative again once it is used without the origin.
  const pathname = url.pathname.replace(/^\/+/, '/');
  return `${pathname}${url.search}${url.hash}`;
}
