# Tiptap HTML utility: JSON to HTML on the server

**Source:** Tiptap Docs, "HTML Utility", https://tiptap.dev/docs/editor/api/utilities/html (read 2026-09-19). Package versions checked against the npm registry the same day.

## Summary

Tiptap ships `generateHTML` for turning a ProseMirror JSON document into an HTML string and `generateJSON` for the reverse. Each exists in two packages. The copies exported from `@tiptap/core` run in the browser only. The copies exported from `@tiptap/html` run on either the server or the browser, and the docs say a virtual DOM is used to generate the HTML on the server, so no real browser and no headless runtime is needed. Both functions take two arguments, the content and a list of extensions, and the extension list is required rather than optional. That requirement is the whole story for a stored-JSON model: the HTML is not a property of the document, it is a product of the document and the exact extension set passed in, so an editor configured with one set and a server renderer configured with another will produce different HTML from identical JSON. Correction to the lead: the source exists and says what the line claims, but it adds a dependency the repo does not have. `apps/web/package.json` lists `@tiptap/react` and `@tiptap/starter-kit` at `^3.31.3` and does not list `@tiptap/html`, whose latest published version is also 3.31.3.

## Implies for Dialecta

- A-11 renders `body_html` on the server, which means `@tiptap/html` has to be added to `apps/web` first. Reaching for `generateHTML` from `@tiptap/core` compiles and then fails at runtime on the server.
- The extension list is the schema decision the reading list asked for, and it belongs in one shared module imported by both the A-10 editor island and the A-11 server renderer. Two lists is a silent corruption path, not a build error.
- Images in A-10 are part of that extension list, so the image extension has to be settled at the same time as the Supabase Storage upload path rather than after it.
- Storing `body_json` and deriving `body_html` on publish keeps the JSON canonical. Any later change to the extension list re-derives old articles differently, so the extension set is worth versioning alongside `prompt_version` in the classification tables.

*Filed 2026-09-19*
