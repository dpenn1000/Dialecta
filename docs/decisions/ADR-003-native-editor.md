# ADR-003: Build the editor and article server in-house
*2026-09-19. Status: Decided.*

## Question
Where articles are written and stored. Blocked P0-5 and the Article Editorial Template flow.

## Options considered
| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| Ghost editor via Content API (Phase A plan) | A mirror table | Two stores; the five declaration questions and the Stage 2.5 window live outside the editor | A native writing flow |
| Sanity or another headless CMS | Schema in a second system, studio hosting | Portable Text is fine, but the editorial stages still bolt on | Full control of the composing surface |
| Own editor on ProseMirror (TipTap) storing document JSON in Supabase, rendered server-side | Editor build (roughly two sessions for a solid first cut) | Maintenance of one more surface we own | Nothing |

## Decision
Own editor. The Article Editorial Template puts editorial mechanics inside the act of writing (the five declaration questions, key claims, suggested axes, the amendment window). A third-party editor can't host that; ours can. Storage is TipTap JSON in `articles.body_json` with a server-rendered HTML cache in `articles.body_html`; JSON is portable if we ever change editors.

## Consequences
- New backlog items A-10 (editor island), A-11 (article server: draft, declare, publish, amend window), A-12 (import the five Ghost posts into `articles`).
- Migration 0002: `articles` gains `body_json jsonb`, `body_html text`, `status`, `declared_claims jsonb`, `suggested_axes jsonb`, `amend_until timestamptz`.
- Phase C shrinks to newsletters and cancelling Ghost.
- Images: Supabase Storage bucket `article-media`, signed uploads from the editor.

## Specs touched
- docs/Dialecta_Article_Editorial_Template.md: no change to the flow; add a note that the composer is the implementation surface.
- docs/Dialecta_Data_Architecture.md, `articles` entity: the new columns above.
