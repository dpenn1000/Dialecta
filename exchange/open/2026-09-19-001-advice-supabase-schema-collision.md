---
id: 2026-09-19-001
type: advice
from: lead
to: [decider]
subject: The live Supabase schema is 20 migrations ahead of supabase/migrations/
backlog: P0-2
state: open
opened: 2026-09-19
closed:
outcome:
---

## Question

Were the two migration files in `supabase/migrations/`, both dated 2026-09-19, written knowing
that the live Dialecta Supabase project already existed with 32 tables and 20 applied migrations?

That single fact decides the path. If they were written knowing, this is a deliberate rebuild and
the job is to write the diff against live. If they were not, the repo should adopt the live schema
and P0-2 through P0-7 need rewriting around what already exists.

## What I already checked

- Supabase project `mguulnibvzusfvyuowwh`, Pennington Media Group org. 32 tables. 20 applied
  migrations dated 2026-04-29 to 2026-05-07, last named `035_growth_engine_schema`.
- The repo's two migrations create 13 tables. Ten exist live with rows in them, including
  `profiles` at 14, `axis_scores` at 36, `axis_events` at 27 and `articles` at 5. Two exist under
  different names. One, `recommitments`, has no live counterpart.
- The 14 live profiles match the 14 Ghost members that backlog P0-6 plans to map, so this is the
  live database and not an abandoned experiment.
- Live table comments cite `Dialecta_Axis_Mapping_v1.md` by name and describe `tier_nominations`
  as the third leg of the three-input final tier model. Whoever built it worked from these specs.
- Full detail: `docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`.

## Why I am stuck

Both readings are consistent with what is on disk, and they lead to opposite work.

Adopting live means deleting the two September files and rewriting six backlog rows, which throws
away design work if that design was deliberate. Treating them as a target schema means writing a
reconciliation migration against a production database with real rows, which is the expensive path
and is wasted if the files were simply written without looking.

Nothing in the repo records which it was. `docs/handoffs/current.md` says the scaffold landed on
2026-09-19 and does not mention the live project. The backlog reads as greenfield throughout.

Only Dan knows. This record exists so the question reaches him in one piece rather than being
rediscovered by the next agent that opens `supabase/`.

---

## Correction appended 2026-09-19 by migrator

**"Only Dan knows" is no longer true.** Dan was asked and does not remember. He
pointed out that the work was done on studio-pc, so there should be a record. There
is. The question this record asks is now answered from evidence on this machine, and
the answer is that **the two September migrations were written without knowledge of
the live database**.

This is evidence, not the decision. The record stays open and addressed to
`decider`.

### How the migrations got here

`docs/handoffs/dialecta-handoff-2026-09-19-studio-pc.md` opens with the install
instruction: "Download `dialecta-scaffold.zip` from the Cowork chat to
`C:\Users\dan\Downloads`." The scaffold, including
`supabase/migrations/20260919000000_foundation.sql`, was authored in a Cowork
session and delivered to studio-pc as a zip. It was not written by a Claude Code
session on this machine.

### Five findings, each checkable

1. **The author told Dan to `db push` into a new project.** The same studio-pc
   handoff says, under what Dan does by hand: "create the `dialecta-staging`
   Supabase project and run `npx supabase link` and `db push`". Nobody aware of 32
   live tables and 20 applied migrations writes that instruction. This is the
   single strongest piece of evidence and it sits in the repo, not in a transcript.

2. **The author had a stale one-line summary and did not check it.** Root
   `CLAUDE.md` at commit `96b26b8`, the commit that added the migrations, read:
   `| Supabase | profiles, comments, classifications, votes | Live |`. Four tables,
   marked Live. The foundation migration issues `create table` for all four. So the
   author knew something was live, had a four-table summary of it, and wrote
   greenfield DDL against it anyway. The failure was not checking, rather than not
   being told.

3. **No session on studio-pc wrote the SQL.** Claude Code keeps per-session file
   history under `~/.claude/file-history/`. Thirteen session histories exist and
   none contains the migration's contents. The file was already on disk when the
   studio-pc session opened.

4. **The timeline puts the discovery 35 minutes after the commit.** Session
   `995db9f2` ran from `C:\Users\dan\OneDrive - Trinity Solar\Apps` between
   18:31:18Z and 19:12:06Z on 2026-09-19 and made every commit in that window.
   Within it: the scaffold was committed at 18:34:58Z as `96b26b8`. The string
   `mguulnibvzusfvyuowwh` appears for the first time at 19:07:49Z. The first
   `list_tables` call against the live project is at 19:07:54Z. The commit recording
   the collision, `188eb8e`, lands at 19:10:16Z.

5. **The discovery was accidental and needed a browser.** It happened because Dan
   asked "Help me with the Supabase npx" at 19:05:28Z, which is P0-2. The session
   called `list_organizations`, then drove Chrome to
   `supabase.com/dashboard/projects` and on to the Pennington Media Group org page
   to find the project. The Supabase MCP connection lists only Trinity Solar, as
   this record already notes, so the live project was not reachable through tooling.
   A Cowork session had no path to it at all.

### What this implies

Both readings in this record are no longer equally consistent with what is on disk.
The reading that the September files were a deliberate rebuild requires an author
who planned a `db push` into a fresh project while knowing production held 32 tables,
and who left a four-table Live line in `CLAUDE.md` unamended. Nothing supports that.

On the record's own logic, "If they were not, the repo should adopt the live schema
and P0-2 through P0-7 need rewriting around what already exists."

Branch A of `team/migrator/p0-2-runbook.md` is that path. Part 1 of that runbook is
read-only and can be run before this record closes.

### One thing this does not settle

Whether the seven repo deviations from the spec in `2026-09-19-002` are drift or
design is a separate question, and this evidence bears on it without deciding it. A
scaffold written in one pass from the spec is less likely to contain seven
considered improvements, but two of the seven are defensible on their merits and one
has already propagated into backlog D-3. That record stays open on its own terms.
