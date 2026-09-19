---
name: dialecta-exchange
description: Post, answer, or close a record in exchange/ so agents hand off work, flag a blind spot, ask a named agent for advice, or take a vote. Use whenever an agent finishes work another picks up, is about to commit to an approach, hits a fork it cannot resolve alone, or when decider needs the team on record before Dan decides.
---

Usage: `/dialecta-exchange <post|answer|close> [args]`.

Read `exchange/README.md` for when to use which record type and `exchange/SCHEMA.md` for the
format. `exchange/EXAMPLE.md` is a filled handoff. Do not restate those here; read them.

## post

1. Read `exchange/ledger.md` first. An open record on the same question means answering that
   one, not opening a second.
2. Pick the type from the table in `README.md`. When `handoff` and `advice` both fit, the test
   is whether you are finished: a handoff passes work along, an advice record asks a question
   while you hold the work.
3. Take the next free `NNN` for today across all types in `ledger.md`.
4. Write `exchange/open/<date>-<NNN>-<type>-<slug>.md` with every front matter field filled and
   every heading for that type present. A heading with nothing under it stays, with the word
   that is true under it.
5. Append the ledger line.
6. If the type blocks you (`advice`, `vote`), stop and report that you are waiting, naming the
   record id and who owes the answer. If it does not (`handoff`, `blindspot`), carry on.

## answer

1. Confirm the record names you in `to:`, or that `to:` is `[group]`. An `advice` record
   addressed to another agent is not yours to answer.
2. Append a `### <your agent name>` block at the end of the record. Never edit anything above it.
3. Answer the question that was asked. Nothing else, and no agreement for its own sake: an
   agent with nothing to add stays silent, and silence is a valid response to a `blindspot`.
4. For a `vote`, append only your own row to the `## Ballots` table: choice, and one line of
   reasoning. Do not write the tally; that is the chair's.
5. Set `state: answered` when the record is an `advice` or `vote` and you are the last agent
   owed.

## close

Only the agent in `from:`, or `decider`, closes a record.

1. Write `outcome:` in the front matter, one line, what actually happened. "Merged as
   `abc1234`" or "dropped, the spec already decided it in ADR-002".
2. Set `state: closed`, or `abandoned` with the reason in `outcome:`.
3. `git mv` the file from `open/` to `closed/`.
4. Rewrite that record's line in `ledger.md` with the new state and the outcome.
5. Run the learning loop: if you learned something that will change how you work, add or revise
   one row in your own `practices.md` or `positions.md`, citing the record id as evidence. A
   record that closes without teaching anyone anything was overhead; say so plainly rather than
   inventing a lesson.

## Rules

- Records are append-only while open. Correct a wrong statement by appending a correction so
  the reasoning stays legible.
- Never edit another agent's block in a record.
- Write inside `exchange/` and your own folder. The existing folder rules still hold: advisors
  stay out of `docs/`, `apps/` and `packages/`, and specs are Dan's.
- One question per `advice` record. Two questions are two records.
- Voice v1.2 applies to every record; these are read by people as well as agents.
