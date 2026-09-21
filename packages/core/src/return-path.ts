/**
 * Where to send a reader once they have signed in: back to the page they were
 * on, or to the front page. The one check every hop of the sign-in round trip
 * runs (the /login page, its two server actions, the auth callback), so an
 * address can only ever be honoured if it passes here.
 *
 * This is an open-redirect surface, so the rule is narrow on purpose. Only a
 * same-origin relative path is honoured:
 *
 *   1. It is a string of at most RETURN_PATH_MAX_LENGTH characters, with no
 *      control characters and no surrounding whitespace. The WHATWG URL
 *      parser deletes tab, CR and LF anywhere and trims C0 and space at the
 *      ends, which is how "/\t/evil.example" becomes "//evil.example" after a
 *      check that looked only at the raw string has already passed it.
 *   2. It starts with exactly one "/", and the character after it is neither
 *      "/" nor "\". Both "//host" and "/\host" are protocol-relative to a
 *      browser, because "\" is "/" in a special-scheme URL.
 *   3. It parses, against the origin, to that same origin.
 *   4. What parsing hands back still passes rule 2. Dot segments are resolved
 *      during parsing, so "/.//evil.example" and "/%2e//evil.example" both
 *      come out as "//evil.example", which rule 2 on the raw string cannot see.
 *   5. It is not a sign-in route. Returning to /login or /auth/callback after
 *      signing in would only start the round trip again.
 *
 * Anything else falls back to RETURN_PATH_FALLBACK. The path returned is the
 * parsed one, pathname plus query plus fragment, so it is normalised and
 * percent-encoded: "/articles/../pact" comes back as "/pact".
 *
 * Pure: no I/O, only the URL parser every runtime this package runs in ships.
 */

export const RETURN_PATH_FALLBACK = '/';

/** Longer than any path the site produces, short enough to fit a cookie. */
export const RETURN_PATH_MAX_LENGTH = 2048;

/**
 * A fixed origin to parse against when the caller has none to hand. For a
 * candidate that passes rule 2, the result is the same whichever origin it is
 * parsed against, so this only needs to be a valid origin nobody owns.
 */
const PARSE_BASE = 'https://return-path.invalid';

/**
 * Rule 1's control characters: C0 (U+0000 to U+001F) and DEL (U+007F). A loop
 * over code points rather than a regex, because a character class holding them
 * needs either raw control bytes in the source, which make git treat the file
 * as binary, or escapes that eslint's no-control-regex refuses.
 */
function hasControlCharacter(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

/** Rule 2: one leading slash, not followed by a second slash or a backslash. */
function isRootRelative(path: string): boolean {
  return path.startsWith('/') && path[1] !== '/' && path[1] !== '\\';
}

/** Rule 5, on the parsed, case-folded pathname. */
function isSignInRoute(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return p === '/login' || p.startsWith('/login/') || p === '/auth' || p.startsWith('/auth/');
}

/**
 * The same-origin relative path to return to, or RETURN_PATH_FALLBACK.
 *
 * `origin` is the site's own origin when the caller knows it (the auth
 * callback reads it from the request). Without one the check still holds:
 * see PARSE_BASE.
 */
export function safeReturnPath(candidate: unknown, origin?: string): string {
  if (typeof candidate !== 'string') return RETURN_PATH_FALLBACK;
  if (candidate.length === 0 || candidate.length > RETURN_PATH_MAX_LENGTH) return RETURN_PATH_FALLBACK;
  if (hasControlCharacter(candidate) || candidate.trim() !== candidate) return RETURN_PATH_FALLBACK;
  if (!isRootRelative(candidate)) return RETURN_PATH_FALLBACK;

  let base: URL;
  let parsed: URL;
  try {
    base = new URL(origin ?? PARSE_BASE);
    parsed = new URL(candidate, base);
  } catch {
    return RETURN_PATH_FALLBACK;
  }
  if (parsed.origin !== base.origin) return RETURN_PATH_FALLBACK;

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (!isRootRelative(path)) return RETURN_PATH_FALLBACK;
  if (isSignInRoute(parsed.pathname)) return RETURN_PATH_FALLBACK;
  return path;
}
