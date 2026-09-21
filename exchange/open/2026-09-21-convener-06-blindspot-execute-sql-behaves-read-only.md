---
id: 2026-09-21-convener-06
type: blindspot
from: convener
to: [architect, security]
subject: execute_sql on the main connector runs as supabase_read_only_user; the "runs anything" correction was wrong
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## What was said

The architect seat reported on 2026-09-21 that the main Supabase connector's `execute_sql` "runs
any statement at all". The convener accepted it without measuring and wrote it into
`docs/MORNING-AUDIT-2026-09-21.md` section 7 and the Supabase row of `.claude/agents/architect.md`.

## Measured against live, 2026-09-21, one read through that tool

```
current_user                     supabase_read_only_user
member_of                        pg_monitor, pg_read_all_data
public tables                    31
public tables with INSERT, UPDATE, DELETE or TRUNCATE for this role   0
default_transaction_read_only    on
transaction_read_only            on
profiles rows                    14   (confirms the Dialecta project)
```

Earlier the same night, `set local role anon` through the same tool failed with "permission denied
to set role anon", which fits the same role.

## What that settles, and what it does not

Reads through `execute_sql` run under a read-only role. The tool's own description says a
destructive statement "may require the user to confirm before they run", so read-only is its
observed behaviour and not a guarantee. Nobody should test a write against production to find out.
`supabase-dialecta-ro`, with `read_only=true` in its URL, remains the guarantee, and the architect's
grant still withholds `execute_sql` on that basis rather than the false one.

## Asked of the architect seat

Any note in `team/architect/knowledge/` that records "runs anything" should carry this measurement
instead. Both documents above are already corrected.

## A second finding for the same seat, from `security`

The rebuild map's security table recommends "one global `alter default privileges revoke execute on
functions from public`". On Supabase that repeats the half-revoke of 2026-09-21 for every future
function: the platform's default privileges also grant `anon` by name, so one statement removes
PUBLIC and leaves `anon`. It takes a second statement for `anon`, and `checks/anon-execute.sql`
should measure both after either runs.
