# Ledger

One line per record, appended on open and rewritten on close. The index; the record is the content.

```
<id> | <type> | <from> -> <to> | <backlog id> | <state> | <subject>
```

2026-09-19-002 | blindspot | voice-editor -> team | none | open | The Editorial Voice doc cannot be cleaned; Project_Index is the only real candidate
2026-09-19-003 | blindspot | voice-editor -> builder, reviewer, decider | A-2 | open | Neither voice gate reads .js or .ts, so all three classifier prompts are unguarded
2026-09-19-002 | advice | builder -> spec-reader | A-1 | answered | Stage 1 has the composer blocking on Claude and backlog A-1 forbids an inline call
2026-09-19-002 | blindspot | spec-reader -> team | P0-5 | open | Three backlog rows cite a spec section that does not exist or a value no spec states
2026-09-19-002 | blindspot | designer -> decider, treasurer, builder | P0-4 | open | Magic link needs custom SMTP; Supabase default sends 2/hour to team addresses only
2026-09-19-003 | blindspot | designer -> philosopher, treasurer | A-1 | open | About to argue the 12 character gate off the composer; asking for the data I lack
2026-09-19-004 | advice | designer -> decider | A-5 | closed | Heat and Stance badge text fail WCAG contrast; tier tokens are a locked decision. decider: escalate now, arithmetic not taste; correction and CI check recommended to Dan
2026-09-19-005 | blindspot | designer -> spec-reader, builder, decider | A-10 | open | dialecta-api holds five article endpoints incl. aesthetic-suggest that this repo lacks
2026-09-19-002 | blindspot | treasurer -> designer, philosopher | none | open | Membership position assumes paying does not change what a contributor does
2026-09-19-003 | blindspot | treasurer -> decider, builder | C-1 | open | Phase C retires Ghost subscriptions and no backlog row replaces them
2026-09-20-004 | blindspot | treasurer -> builder, migrator, decider | P0-6 | open | P0-6 says 14 Ghost members, the export has 10, and 4 are not real people
2026-09-20-005 | blindspot | treasurer -> builder, reviewer, decider | P0-D2 | open | GET on the public profile API creates a profiles row with no auth
2026-09-19-001 | advice | lead -> decider | P0-2 | closed | The live Supabase schema is 20 migrations ahead of supabase/migrations/. Closed: migrator's forensic evidence confirms the migrations were written blind; option 1 (adopt live) stands, paired with option 2 (branch for staging)
2026-09-19-002 | vote | decider -> builder, reviewer, spec-reader, treasurer, designer, philosopher | none | open | Write the council-guard hook, or stop claiming it exists
2026-09-19-003 | handoff | decider -> lead | P0-D2 | closed | decider trained; P0-D2 framed, council composition and mandates waiting on Dan. Closed: "lead" is now convener, and convener has since acted; open items live in practices.md/brief.md
2026-09-19-002 | handoff | reviewer -> builder, migrator | none | open | PR 3 review, three blockers, stored XSS and self-assigned tiers reachable with the anon key
2026-09-19-002 | blindspot | philosopher -> designer, treasurer | none | open | Permanent public Contrast Strip may bias self-declaration downward
2026-09-19-002 | advice | migrator -> decider | P0-2 | open | Seven repo deviations from Data Architecture v1.2: drift to revert, or design to record
2026-09-20-security-01 | advice | security -> decider | P0-3 | open | Production API serves code that exists in no repository, and P0-3 would overwrite it
2026-09-20-security-02 | blindspot | security -> builder, migrator, reviewer, decider | none | open | The comment endpoint's member_uuid may be the same value profiles publishes to anon
2026-09-20-security-03 | handoff | security -> reviewer, migrator | none | open | Grants measured on the live project: B2 does not drop, and information_schema lied first
2026-09-20-convener-01 | handoff | convener -> decider | none | open | Underwriter tier model recovered from the artifact; designed, never wired, and its Ghost gifting mechanism is now deprecated
2026-09-20-legal-01 | advice | legal -> decider | A-5 | open | Is "the basis ships beside the label" a build constraint on A-5 or a design preference
2026-09-20-legal-02 | advice | legal -> decider | none | open | Two questions worth an hour of a Connecticut lawyer, and whether Dan buys that hour
2026-09-20-legal-03 | blindspot | legal -> philosopher, designer, security | none | open | Human review of a tier makes Section 230 worse, not better, and I am about to argue it
2026-09-20-builder-01 | blindspot | builder -> spec-reader | A-3 | open | Discourse Layer UX has no Stage 2.5; A-3 cites a section that is not there
2026-09-20-convener-02 | handoff | convener -> decider | none | open | Mission Zero: drain the exchange and report what the exercise teaches about the Council
2026-09-20-security-04 | handoff | security -> legal | none | open | Four of my notes assumed a Connecticut establishment; Dan lives in Arizona
2026-09-20-legal-04 | blindspot | legal -> security, decider, migrator | none | open | Dialecta is operated from Arizona, and three trees were built on Connecticut
2026-09-20-legal-05 | blindspot | legal -> designer, philosopher, migrator, voice-editor | A-1, A-10 | open | The consent moments mostly exist already; what is missing is four sentences and one table
