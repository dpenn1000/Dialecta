# architect seat: access, what works and what is missing

For Dan, written overnight 2026-09-21. Every row was tested tonight, not assumed. Nothing here has
been changed: each fix is a proposal, and the ones outside `team/architect/` go through the
convener and the council.

## What works

| Access | Through | Tested by |
| --- | --- | --- |
| The live database, read | The claude.ai Supabase connector, in a lead session | About twenty catalog queries on `mguulnibvzusfvyuowwh`: grants, enums, constraints, policies, migration history, extensions |
| Database logs, 24 hours | The same connector's `query_logs` | Counted edge, PostgREST and Postgres log rows; found last night's revoke by its text |
| The Supabase advisors | `get_advisors`, security and performance | Full baseline in `team/architect/knowledge/2026-live-schema-hygiene-census.md` |
| GitHub | `gh` as `dpenn1000`, scopes `repo`, `workflow`, `read:org`, `gist` | `gh auth status`; read the repository and its visibility |
| Vercel, read | The claude.ai Vercel connector | Listed the `dialecta` and `dialecta-next` projects |
| Code tools | `npx` from the public npm registry, pinned | Five tools installed into the npm cache and calibrated: `team/architect/tools/README.md` |
| Current practice | WebFetch and WebSearch | Every source in `team/architect/references/README.md` |

## What is missing, in order

### 1. The seat itself cannot reach the database

When `architect` runs as its own agent, its `tools:` line in `.claude/agents/architect.md` lists no
database tool, so it cannot run a single check in `team/architect/checks/`. Tonight's database work
ran from a lead session instead.

The connector that lead session used is also the wrong shape for this seat:

- **It is not read-only.** Its `execute_sql` runs any statement, and `apply_migration` sits beside
  it. The mandate says "The Supabase MCP `execute_sql` is read-only". For this connector that is not
  true; it has been read-only only because every session chose to be.
- **It is not scoped to Dialecta.** `list_projects` from a subagent returned another organisation's
  project on 2026-09-20. Every query since has had to pass the project id by hand and confirm the
  database by its table names.

**The fix, about five minutes of yours.** From `C:\Dialecta`, add a project-scoped, read-only
Supabase server to the project's `.mcp.json`:

```
claude mcp add --scope project --transport http supabase-dialecta-ro "https://mcp.supabase.com/mcp?project_ref=mguulnibvzusfvyuowwh&read_only=true&features=database,debugging,docs"
```

Authorise it once in the browser when it asks. Supabase documents `read_only=true` as "Execute all
queries as a read-only Postgres user", and `project_ref` as scoping to one project, which "disables
account tools". Then add `mcp__supabase-dialecta-ro__*` to the `tools:` line in
`.claude/agents/architect.md`. The database then enforces the read-only rule, where today only habit
does.

### 2. `.env` stays closed, and that is right

Reading `.env`, even variable names only, was refused twice by the permission layer, including after
your go-ahead in chat. I did not route around it. With item 1 in place the seat needs no secret at
all. The one question that seemed to need `.env` is settled without it: the service key has two names
on purpose. `apps/web` reads `SUPABASE_SERVICE_ROLE_KEY` per `apps/web/.env.example`, and the legacy
`api/` and `scripts/` read `SUPABASE_SERVICE_KEY` per the root `.env.example`. The residual is small:
the web template is missing 2 names its code reads (`ANALYTICS_ADMIN_UIDS`,
`NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC`), the root template 13.

### 3. Two database extensions for standing checks

`plpgsql_check` 2.8 and `pgtap` 1.3.3 are available on the project and not installed. The first
checks function bodies against the schema without running them, the class of defect behind
`initialise_contributor_axes`. The second turns `team/architect/checks/` into tests. Installing
either is a `create extension`, a write to live, so it is a `migrator` migration and your call.
Suggested order: `plpgsql_check` first, tried on a Supabase branch before production.

### 4. A read-only credential for scheduled checks

The seven checks run by hand today. Running them on a schedule needs a read-only database role and
its connection string as a GitHub Actions secret, then a workflow `builder` writes. The repository is
public, so the role must be read-only in the database, not only by convention.

### 5. Start the seat's sessions in `C:\Dialecta`

This session started in the Trinity folder, so the project's own MCP server, `dialecta-local-research`,
never loaded and the shared notes index was searched with grep instead. Nothing to fix, only where to
open the next session.

### 6. Ghost

No Ghost Content or Admin key is configured anywhere the seat can see. It matters only for mapping
the three shapes of `profiles.ghost_member_id` to Ghost's own fields, which is part of the identity
decision. Low priority.

## One more thing you asked for tonight

"Code and data expert, both seats." The mandate already covers the data layer in one line of six.
The proposed change, for the convener to carry with the name decision: make the data half explicit
(table organization, identity keys, integrity, migrations, query cost, scale), point the seat at its
instruments (`checks/`, `tools/`, `references/`), and replace the read-only claim with item 1. Held
until the name is settled so the file changes once.
