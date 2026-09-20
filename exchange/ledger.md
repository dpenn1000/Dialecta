# Ledger

One line per record, appended on open and rewritten on close. The index; the record is the content.

```
<id> | <type> | <from> -> <to> | <backlog id> | <state> | <subject>
```

2026-09-19-001 | advice | lead -> decider | P0-2 | open | The live Supabase schema is 20 migrations ahead of supabase/migrations/
2026-09-19-002 | blindspot | voice-editor -> team | none | open | The Editorial Voice doc cannot be cleaned; Project_Index is the only real candidate
2026-09-19-003 | blindspot | voice-editor -> builder, reviewer, decider | A-2 | open | Neither voice gate reads .js or .ts, so all three classifier prompts are unguarded
2026-09-19-002 | advice | builder -> spec-reader | A-1 | open | Stage 1 has the composer blocking on Claude and backlog A-1 forbids an inline call
2026-09-19-002 | blindspot | spec-reader -> team | P0-5 | open | Three backlog rows cite a spec section that does not exist or a value no spec states
2026-09-19-002 | blindspot | designer -> decider, treasurer, builder | P0-4 | open | Magic link needs custom SMTP; Supabase default sends 2/hour to team addresses only
2026-09-19-003 | blindspot | designer -> philosopher, treasurer | A-1 | open | About to argue the 12 character gate off the composer; asking for the data I lack
2026-09-19-004 | advice | designer -> decider | A-5 | open | Heat and Stance badge text fail WCAG contrast; tier tokens are a locked decision
2026-09-19-005 | blindspot | designer -> spec-reader, builder, decider | A-10 | open | dialecta-api holds five article endpoints incl. aesthetic-suggest that this repo lacks
2026-09-19-002 | blindspot | treasurer -> designer, philosopher | none | open | Membership position assumes paying does not change what a contributor does
2026-09-19-003 | blindspot | treasurer -> decider, builder | C-1 | open | Phase C retires Ghost subscriptions and no backlog row replaces them
2026-09-20-004 | blindspot | treasurer -> builder, migrator, decider | P0-6 | open | P0-6 says 14 Ghost members, the export has 10, and 4 are not real people
2026-09-20-005 | blindspot | treasurer -> builder, reviewer, decider | P0-D2 | open | GET on the public profile API creates a profiles row with no auth
2026-09-19-001 | advice | lead -> decider | P0-2 | answered | The live Supabase schema is 20 migrations ahead of supabase/migrations/. decider recommends adopting live, paired with branching for staging; waiting on one question to Dan
2026-09-19-002 | vote | decider -> builder, reviewer, spec-reader, treasurer, designer, philosopher | none | open | Write the council-guard hook, or stop claiming it exists
2026-09-19-003 | handoff | decider -> lead | P0-D2 | open | decider trained; P0-D2 framed, council composition and mandates waiting on Dan
2026-09-19-002 | handoff | reviewer -> builder, migrator | none | open | PR 3 review, three blockers, stored XSS and self-assigned tiers reachable with the anon key
