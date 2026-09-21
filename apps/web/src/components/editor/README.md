# Article editor island

The writer at `/write` (backlog A-10), ported from `_recovered-next/lib/theme/dialecta-editor.jsx`.
`writer.tsx` is the island; `prose-editor.tsx` is the TipTap core (ADR-003), which writes
`body_json` and `body_html` from the same transaction. `reflection-bar.tsx` is the recovered brass
reflection bar. The publish seam is `src/app/api/article/route.ts`, and its header lists what the
database still needs before a publish can succeed. Nothing else in the app renders TipTap JSON.
