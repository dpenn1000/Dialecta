import { describe, expect, it } from 'vitest';
import { RETURN_PATH_FALLBACK, RETURN_PATH_MAX_LENGTH, safeReturnPath } from '../src/return-path';

const ORIGIN = 'https://dialecta.org';

/**
 * Everything below must come back as the fallback. Grouped by the trick each
 * one plays, so a failure names the class of attack that got through.
 */
const HOSTILE: Record<string, readonly unknown[]> = {
  'not a string': [undefined, null, 42, 0, true, {}, [], ['/articles/x'], () => '/'],
  'empty or oversized': ['', `/${'a'.repeat(RETURN_PATH_MAX_LENGTH)}`],
  'no leading slash': ['articles/x', '.', '..', './x', '?next=/x', '#dialecta-comments', 'evil.example'],
  'protocol-relative': ['//evil.example', '//evil.example/articles/x', '///evil.example', '////evil.example', '//dialecta.org/x'],
  'backslash host': ['/\\evil.example', '\\\\evil.example', '\\/evil.example', '/\\/evil.example', '\\evil.example'],
  'absolute URL, any origin': [
    'https://evil.example',
    'http://evil.example/articles/x',
    'HTTPS://EVIL.EXAMPLE',
    'https://dialecta.org/articles/x',
    'https:evil.example',
    'https:/evil.example',
  ],
  'script and other schemes': [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'mailto:someone@example.com',
    'file:///etc/passwd',
  ],
  'control characters the URL parser strips': [
    '/\t/evil.example',
    '/\n/evil.example',
    '/\r/evil.example',
    '/\r\n/evil.example',
    '\t//evil.example',
    '/\u0000/evil.example',
    '/\u001f/evil.example',
    '/\u007f/evil.example',
    '/articles/x\n',
  ],
  'surrounding whitespace': [' //evil.example', ' /articles/x', '/articles/x ', ' /articles/x'],
  'dot segments that normalise to a second slash': [
    '/.//evil.example',
    '/..//evil.example',
    '/%2e//evil.example',
    '/%2E//evil.example',
    '/%2e%2e//evil.example',
    '/./\\evil.example',
    '/x/..//evil.example',
  ],
  'sign-in routes, which would loop': [
    '/login',
    '/login/',
    '/login?next=/articles/x',
    '/Login',
    '/auth/callback',
    '/auth/callback?code=abc',
    '/auth',
  ],
};

describe('safeReturnPath', () => {
  it('falls back to the front page', () => {
    expect(RETURN_PATH_FALLBACK).toBe('/');
  });

  it.each([
    ['/', '/'],
    ['/articles/why-environments-shape-behavior', '/articles/why-environments-shape-behavior'],
    ['/articles/x#dialecta-comments', '/articles/x#dialecta-comments'],
    ['/articles/x?view=all#dialecta-comments', '/articles/x?view=all#dialecta-comments'],
    ['/write', '/write'],
    ['/write?article=1b1c7c63-4a40-4e8e-9b0e-2f3a4b5c6d7e', '/write?article=1b1c7c63-4a40-4e8e-9b0e-2f3a4b5c6d7e'],
    ['/profile/wen-zhao', '/profile/wen-zhao'],
    ['/loginx', '/loginx'],
    ['/authors', '/authors'],
  ])('keeps the same-origin path %s', (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected);
    expect(safeReturnPath(input, ORIGIN)).toBe(expected);
  });

  it.each([
    ['/articles/../pact', '/pact'],
    ['/articles/café', '/articles/caf%C3%A9'],
    ['/a b', '/a%20b'],
    ['/articles/x\\y', '/articles/x/y'],
  ])('returns %s normalised, as %s', (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected);
  });

  it.each([
    ['/%2F%2Fevil.example', '/%2F%2Fevil.example'],
    ['/%5C%5Cevil.example', '/%5C%5Cevil.example'],
    ['/／evil.example', '/%EF%BC%8Fevil.example'],
    ['/@evil.example', '/@evil.example'],
    ['/ /evil.example', '/%20/evil.example'],
  ])('leaves an encoded look-alike %s as a harmless path', (input, expected) => {
    expect(safeReturnPath(input, ORIGIN)).toBe(expected);
  });

  for (const [trick, inputs] of Object.entries(HOSTILE)) {
    it(`refuses ${trick}`, () => {
      for (const input of inputs) {
        expect(safeReturnPath(input), JSON.stringify(input)).toBe(RETURN_PATH_FALLBACK);
        expect(safeReturnPath(input, ORIGIN), JSON.stringify(input)).toBe(RETURN_PATH_FALLBACK);
      }
    });
  }

  it('never returns anything that leaves the origin, as a relative Location or resolved against it', () => {
    const everything = [...Object.values(HOSTILE).flat(), '/articles/x', '/%2F%2Fevil.example', '/／evil.example'];
    for (const input of everything) {
      const out = safeReturnPath(input, ORIGIN);
      expect(out.startsWith('/'), JSON.stringify(input)).toBe(true);
      expect(out[1] === '/' || out[1] === '\\', JSON.stringify(input)).toBe(false);
      expect(new URL(out, ORIGIN).origin, JSON.stringify(input)).toBe(ORIGIN);
      // A browser resolves a relative Location against the current page, so try a deep one too.
      expect(new URL(out, `${ORIGIN}/articles/some/deep/page`).origin, JSON.stringify(input)).toBe(ORIGIN);
    }
  });

  it('checks against the origin it is given', () => {
    expect(safeReturnPath('/articles/x', 'http://localhost:3050')).toBe('/articles/x');
    expect(safeReturnPath('//localhost:3050/x', 'http://localhost:3050')).toBe(RETURN_PATH_FALLBACK);
  });

  it('falls back when the origin it is given cannot be parsed', () => {
    expect(safeReturnPath('/articles/x', 'not an origin')).toBe(RETURN_PATH_FALLBACK);
  });

  it('accepts a path of exactly the maximum length', () => {
    const path = `/${'a'.repeat(RETURN_PATH_MAX_LENGTH - 1)}`;
    expect(path.length).toBe(RETURN_PATH_MAX_LENGTH);
    expect(safeReturnPath(path)).toBe(path);
  });
});
