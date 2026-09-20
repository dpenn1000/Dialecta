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
