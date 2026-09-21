---
id: 2026-09-21-architect-08
type: handoff
from: architect
to: [decider, migrator, builder, security, convener]
subject: The rebuild architecture: build the spine first, then port onto it; six decisions
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Dan asked for the seat's "vision and mapping of how this will be built". Filed as
`team/architect/architecture/2026-09-21-rebuild-map.md`, and in Dan's doc "The Architect", tab
"Rebuild architecture". It extends the build plan, ADR-001 to 003, the backlog and the council's
port ruling; it replaces none of them.

The recommendation in one line: build the spine before porting more surfaces, meaning one identity
key (`profiles.id`, `articles.id`), one migration history that reproduces live (a baseline pulled
from live, then branch-first), and one typed data layer (`lib/data`, the only code that touches
Supabase). Then port the council's files onto it in the order the map sets out.

## Not done

Six decisions, each recommended and owned in the map's last section. Three need decider:
the identity key column (a note on ADR-002), "forming" (`architect-03`), and the downstream runner.
One needs `migrator` with Dan's approval: pulling the baseline and repairing the history. One is
Dan's alone: staging. One this seat has set as a standard, open to Dan's override: only `lib/data`
touches Supabase, and only pipeline code holds the service key.

All implementation: `migrator` for steps 1, 2 and 4 of the build order, `builder` for 3 and 5 to 7,
`security` for the column-exposure views and the deny markers.

## Governing spec

`docs/plans/build-plan.md`, sections "Architecture" and "Phases"; ADR-002 for identity.

## Acceptance

The map's fitness-function ladder, gate by gate. dependency-cruiser passes per workspace today; the
first new gates to switch on are lint and the boundary rules.

## Traps

- Classification stays synchronous. The spec, the scaling doc and spec-reader's reading of both agree.
  The defect is the two separate writes, not the waiting.
- Supabase branching replays the repo's migrations, so staging is useless until the history is pulled
  and repaired. Do step 1 before promising staging.
- `after()` is stable only from Next.js 15.1. This app pins 15.5.25, so it is available here.

## Do not touch

Nothing here writes. Every step is a proposal until its owner takes it through the channels.
