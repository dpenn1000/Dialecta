# ADR-001: Leave Ghost entirely; Next.js and Supabase own every layer
*2026-09-19. Status: Decided.*

## Question
Whether the rebuild keeps Ghost for any layer (auth, articles, theme, newsletters) or replaces all of it. Blocked P0-4, P0-5, and the shape of Phase A.

## Options considered
| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| Stay on Ghost, keep adding islands (the May 2026 position) | Nothing | Every engine feature fights a member id the database can't join; theme zip uploads; no RLS path; sidecars for anything server-rendered | Native rendering, real auth, share cards without a sidecar |
| Ghost headless for Phase A (articles via Content API), retire in Phase C | An `articles` mirror and a Content API client | Two content stores for two months; the editor still comes later | Nothing permanent |
| Leave Ghost now: Supabase Auth, native articles, own editor | Import five posts and 14 members once; build the editor earlier | None structural | Ghost's editor and newsletter tooling (replaced by TipTap and Resend) |

## Decision
Leave Ghost now. Dan wants no layer he can't reach into: not the login, not the UI, not the upload cycle. The May recommendation to stay was about momentum on a solo evening cadence; with an agent team the rebuild is weeks, and the cost of carrying Ghost through Phase A no longer buys anything.

## Consequences
- Identity is Supabase Auth from P0-4. `profiles.ghost_member_id` stays as a legacy mapping column used once by the member import.
- `articles` is owned by Supabase from day one. P0-5 becomes "native articles + one-time Ghost import"; `apps/web/src/lib/ghost.ts` is reduced to an import script under `scripts/` and deleted after import.
- The editor (ADR-003) moves from Phase C into Phase A.
- Ghost keeps serving dialecta.org untouched until cutover, then is cancelled. Newsletters via Resend from Phase C.
- `docs/plans/build-plan.md` "Three decisions" table: Articles row replaced.

## Specs touched
- docs/Dialecta_Data_Architecture.md, "Ghost CMS integration notes": mark historical; identity section already says Ghost ids are legacy text.
- docs/Dialecta_Project_Brief.md, "Tech Stack Options": Tier 1 (Ghost) is closed; Tier 2 is the build.
- docs/dialecta-profile-ghost-integration.md: historical, move to `docs/handoffs/` at cutover.
