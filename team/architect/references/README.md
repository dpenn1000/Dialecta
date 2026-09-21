# architect: references

The outside sources this seat cites, pinned so a citation cannot change underneath it. Nothing here
is copied into the repository. A vendored copy goes stale, and third-party prose would fail this
repository's voice gate on landing. The seat reads each source at its pinned URL with WebFetch.

Pinned 2026-09-21. When a pin moves, the note that relied on the old one says so.

## Vendor rulebooks written for agents

### Supabase Postgres best practices

| | |
| --- | --- |
| Repository | `supabase/agent-skills`, MIT (`LICENSE` at the repository root) |
| Pin | tag `supabase-postgres-best-practices-v1.6.0`, commit `1207767388a0ffb55f21fb4e6988fee96942431d` |
| Not the pin | the `version: "1.1.1"` inside `SKILL.md`, which `.release-please-manifest.json` contradicts |
| Raw file | `https://raw.githubusercontent.com/supabase/agent-skills/1207767388a0ffb55f21fb4e6988fee96942431d/skills/supabase-postgres-best-practices/references/<file>` |
| Evidence | `knowledge/2026-vendor-agent-rulebooks.md` |

31 rules in eight groups, listed at the pin through the GitHub trees API:

| Group | Files |
| --- | --- |
| `schema` | `schema-constraints`, `schema-data-types`, `schema-foreign-key-indexes`, `schema-lowercase-identifiers`, `schema-partitioning`, `schema-primary-keys` |
| `query` | `query-composite-indexes`, `query-covering-indexes`, `query-index-types`, `query-missing-indexes`, `query-partial-indexes` |
| `security` | `security-privileges`, `security-rls-basics`, `security-rls-performance` |
| `conn` | `conn-idle-timeout`, `conn-limits`, `conn-pooling`, `conn-prepared-statements` |
| `data` | `data-batch-inserts`, `data-n-plus-one`, `data-pagination`, `data-upsert` |
| `lock` | `lock-advisory`, `lock-deadlock-prevention`, `lock-short-transactions`, `lock-skip-locked` |
| `monitor` | `monitor-explain-analyze`, `monitor-pg-stat-statements`, `monitor-vacuum-analyze` |
| `advanced` | `advanced-full-text-search`, `advanced-jsonb-indexing` |

Read first for Dialecta: `security-rls-performance`, `security-privileges`, `schema-constraints`,
`schema-foreign-key-indexes`. **Do not cite `security-rls-basics` alone.** Its worked policy is the
unwrapped `auth.uid()` form that `security-rls-performance`, in the same package and version, names
as incorrect.

Installing it as a skill under `.claude/skills/` is outside this seat's fence and is the convener's
call. As a pinned reference it needs nobody's permission.

### Vercel React best practices

| | |
| --- | --- |
| Repository | `vercel-labs/agent-skills`, **no licence file**: view and cite, never copy |
| Pin | commit `063bee94c3f4df8453406c830b0a7df0f2860278`, 2026-08-28 |
| Skill | `react-best-practices`, 70 rules by file count (its own README says "40+") |
| Version trap | two rules assume React 19.2 (`<Activity>`, `useEffectEvent`); `apps/web` pins 19.1.0. Zero rules assume Next.js 16 |

## Standards texts

| Source | What the seat takes from it |
| --- | --- |
| PostgreSQL wiki, "Don't Do This" | Type and query hygiene, the baseline every table is measured against. On 2026-09-21 live had no `timestamp` without time zone, no `varchar(n)` and no `char(n)` column (`knowledge/2026-live-schema-hygiene-census.md`) |
| Markus Winand, "Use The Index, Luke" (use-the-index-luke.com) | Indexing and query cost, free and maintained |
| PostgreSQL 17 manual: `ddl-rowsecurity`, `sql-altertype`, `sql-createpolicy`, `ddl-partitioning`, `indexes-types`, `routine-vacuuming`, `pgstatstatements` | The primary source for every catalog claim. Live runs 17.6 |
| Supabase database linter catalog (`supabase.com/docs/guides/database/database-linter`) | What `get_advisors` checks, and by its function lints' scope, what it does not |
| Supabase MCP (`supabase.com/docs/guides/getting-started/mcp`) | `read_only=true`, `project_ref=`, `features=`: the access shape this seat should run under |
| Ford, Parsons, Kua, Sadalage, "Building Evolutionary Architectures", 2nd ed., O'Reilly, 2022 | The fitness function: a standing, automated check that the system keeps a property it was meant to have. `knowledge/2026-architectural-fitness-functions.md` |
| Hunt and Thomas, "The Pragmatic Programmer", 1999, DRY | "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system": this seat's founding sentence, one level above copy-paste |

## Tool documentation, for the pinned versions in `../tools/`

| Tool | Version | Rules and options reference |
| --- | --- | --- |
| dependency-cruiser | 18.4.0 | `github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md`, `doc/options-reference.md` |
| ast-grep | 0.45.3 | `ast-grep.github.io/guide/rule-config.html`, `reference/rule.html` |
| knip | 6.37.0 | `knip.dev` |
| jscpd | 5.3.0 | `jscpd --help` (v5 is a Rust rewrite; v4 option names do not all carry over) |
| squawk | 2.65.0 | `squawkhq.com/docs/rules` |
