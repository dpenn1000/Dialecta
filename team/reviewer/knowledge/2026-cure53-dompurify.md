# DOMPurify, and where sanitizing belongs

**Source:** Cure53, DOMPurify, project README, read 2026-09-19. https://github.com/cure53/DOMPurify

## Summary

DOMPurify strips inline event handlers and script URLs by default, which is the whole of what
blocker B1 needs. The README's own examples: `'<img src=x onerror=alert(1)//>'` becomes
`<img src="x">`, and `'<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>'` becomes
`<p>abc</p>`. No configuration is required for either.

It runs in Node against a DOM shim:

```js
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const clean = DOMPurify.sanitize('<b>hello there</b>');
```

with one warning attached to that setup: "older versions of jsdom are known to be buggy in ways
that result in XSS even if DOMPurify does everything 100% correctly". The jsdom version is part
of the security boundary, not an implementation detail.

On timing, the README is clear about the direction of the hazard rather than about a single
correct moment: "if you first sanitize HTML and then modify it afterwards, you might easily
void the effects of sanitization", and sanitize "before connecting them to the live document,
not after".

On environments: "it remains your job not to mix contexts on the output side". Sanitizing in
one parser and rendering in another is the mutation XSS shape, and the library does not promise
to cover it.

## Implies for Dialecta

- The answer to "write time, read time, or both" is both, and for different reasons. Write time
  keeps the stored `articles.body_html` clean so the row is not a loaded gun for any other
  consumer, an RSS feed or an email digest or the Ghost export. Read time is what actually
  closes B1, because the write path is not the only way a row gets there: blocker B2 shows a
  contributor writing `body_html` directly through PostgREST with the anon key, never touching
  the editor. A sanitizer that lives only in the editor protects nothing.
- Read time means the server component at `apps/web/src/app/articles/[slug]/page.tsx:43`, which
  already runs in Node, so the jsdom setup above applies and the pinned jsdom version becomes
  something check 2 should look at when the dependency lands.
- The mixed-context warning bites here in a specific way worth writing down. Sanitizing with
  jsdom on the server and then handing the result to `dangerouslySetInnerHTML`, which the
  browser reparses, is two parsers on one string. That is the documented gap. It is the ordinary
  arrangement and the ordinary risk, and the mitigation is to sanitize immediately before the
  render with no transformation in between, per "you might easily void the effects".
- This does not make the column grant unnecessary. Sanitizing stops the script; it does not stop
  a contributor publishing an article that was never reviewed. B1 and B2 share a cause and need
  two different fixes: the sanitizer here, and the grant in
  [2026-postgresql-column-privileges](2026-postgresql-column-privileges.md).
- Remaining gap: TipTap's own guarantees about its output were not read, so "the editor produces
  safe HTML" is still an unverified claim and is carried as a lead. It does not change the
  recommendation, because read-time sanitizing is required either way.

*Filed 2026-09-19*
