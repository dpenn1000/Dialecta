# Forming

*philosopher position, 2026-09-21, on question 2 of
`council/log/2026-09-21-identity-forming-and-the-runner.md`.*

## Brief

"Forming" is the absence of a pattern. Five spec lines name it: four describe a state reached
through low confidence or too little history, and one table cell stores it as a ninth archetype
value (`docs/Dialecta_Data_Architecture.md:157`). I recommend the confidence reading with one
correction: below the threshold no archetype exists, where live's NOT NULL column requires one of
the eight beneath a "forming" rung, in a table anon can read. Strongest evidence: Contributor
Identity retired the Oracle for being defined partly by speaking rarely, "an absence rather than a
move" (`docs/Dialecta_Contributor_Identity.md:130`). Forming is defined wholly by one, and fails
principle 4's test (`:135`): no comment text is forming.

## What an archetype is for

An archetype gives a person "a recognizable pattern they can see in themselves and aspire to
refine" (`Contributor_Identity.md:19`), worth something only because it shows "what is actually
there" (`:21`). Character "is not declared; it is accumulated through repeated action over time"
(`docs/Dialecta_Founding_Philosophy.md:107`), and the Pact's "I welcome the mirror" is "a
commitment to being described" (`docs/decisions/ADR-004-breach-residuals-on-the-fingerprint.md:174`,
`:176`). Before the repetition there is nothing to describe. A newcomer still has a mirror: each
comment gets its card, and the fingerprint grows from its first graduation
(`Contributor_Identity.md:74`).

## Principle 4 and the Oracle

| Test | Forming against it | Source |
| --- | --- | --- |
| An archetype is "not how often they post" | Defined by how often a person has posted | `Contributor_Identity.md:126-128` |
| The Oracle | Retired for being defined partly by an absence; forming is defined wholly by one | `:130` |
| "Can the classification engine detect this from comment text alone, without knowing who wrote it?" | No. Forming is computed by counting a known author's comments | `:135` |
| "No archetype is ranked above another" | Every archetype is further along than forming | `:121` |
| The Archetype Monitor checks "all eight archetype signatures" | Forming has no signature | `Data_Architecture.md:312` |
| The locked list | Eight archetypes by name | root `CLAUDE.md:67` |

| Where | What it holds | Source |
| --- | --- | --- |
| Entity 6's prose | Forming covers contributors without "enough history to assign an archetype" | `Data_Architecture.md:163` |
| The spec's open question, which the frame does not cite | When to assign an archetype "rather than showing 'pattern still forming'" | `Data_Architecture.md:379` |
| `packages/core` | `FORMING` sits outside `ARCHETYPE_IDS`, and its name is "Pattern still forming" | `packages/core/src/archetypes.ts:6-22`, `:49` |
| April's audit | Forming "appears to be a state, not an archetype" | `docs/handoffs/dialecta-coherence-audit.md:2051` |
| The shipped profile | "Pattern Still Forming" when no row exists | `_recovered/api/contributor.js:117` |
| Live, 2026-09-20 | All three real contributors with an axis record have no archetype row | `team/builder/2026-09-20-analytics-spec.md:163` |
| Live's three rows | They match April's seeds, written at `established`. Tonight's values are (unmeasured): `select member_id, archetype_id, confidence from archetypes` | `_recovered/supabase/migrations/002_seed_dev_users.sql` |

The spec wins over code, but this drift is inside the spec: one enum cell against its own prose,
pipeline and principle, and the cell should change, through Dan. April's open doc-patch item is the
vehicle (`dialecta-coherence-audit.md:2065`), and I concede its larger point: live's split of
archetype from confidence is the right shape. Whether `Data_Architecture.md:159` and `:163` are one
state or two is `spec-reader`'s; for the person, both mean no archetype the platform stands behind.

## The confidence ladder

Live's `forming, emerging, established` measures how much the platform has read and names it as how
far the person has grown. Whether a rung is shown belongs to `designer` and the fingerprint debate;
this is what one does to a person who sees it.

| What the ladder does | Evidence |
| --- | --- |
| Turns the reading's limit into the person's rank | The Growth Layer makes "the limits of what the data can actually see" visible as a count, "across your last forty comments", never as a verdict (`docs/Dialecta_Growth_Layer_Principles.md:77`). A profile carries no "ranking against other people" (`docs/Dialecta_Editorial_Voice.md:54`) |
| Sets a gradient climbed by volume | Visible thresholds bring a rush before the line, baseline after, and effort pulled off other work (Anderson et al. 2013, `2013-anderson-steering-badges`). The Growth Layer may not "reward speed" (`:41`) and draws no progress toward an archetype: "No progress bar" (`:164`) |
| Adds a second demotion | The Monitor updates the record when confidence moves (`Data_Architecture.md:313`), and Contributor Identity already asks how an archetype change can avoid "feeling like a demotion" (`:168`) |
| Puts an ordinal beside the vote | Visible standing raised the odds of a recommendation to accept 1.63 times for famous authors (Tomkins et al. 2017, `2017-tomkins-single-double-blind`); P-14 |
| Names a person who cannot answer | An Order may be proposed on one article (`_recovered/api/_stewards-skill.js:146`), where "The author has the final say" (`:33`). An archetype is "never user-declared" (`Contributor_Identity.md:85`), so its threshold is its only protection |

Live's `archetype_id` is NOT NULL, so a forming contributor must carry one of the eight, in a table
anon reads in full (`team/migrator/knowledge/2026-live-rls-surface.md:19`). Miller, Brickman and
Bolen (1975) found that telling fifth graders they were tidy did more to stop littering than
telling them they should be, and suggest attribution works because it "disguises persuasive
intent." An archetype stored before a pattern exists is that disguise, the reverse of "descriptive,
not declarative" (`Contributor_Identity.md:21`), and the later record would partly measure the
label. Limit: children, 1975.

## ADR-004's first render

ADR-004 takes a new contributor to have "no Archetype" (`ADR-004-breach-residuals-on-the-fingerprint.md:125`)
and asks for a confirmation "when an Archetype or residual first exists", showing "the actual
artifact" (`:135`). That needs one dated event with a reading in it.

| Model | An Archetype first exists | The confirmation shows |
| --- | --- | --- |
| Ninth value | At onboarding, as the only writer on disk does (`team/architect/knowledge/2026-live-baseline-unverified-markers.md:83-84`, `:94`), which makes ADR-004's `:125` false | "Pattern Still Forming". The real reading arrives later as an `archetype_shift` (`Data_Architecture.md:314`), in a feed anon reads in full (`2026-live-rls-surface.md:20`), with no confirmation |
| An archetype under a rung | At the first row, readable by anon | A reading the platform itself calls forming |
| Absence | Once, at the threshold | The first reading the platform stands behind |

The first assignment is therefore not a shift, and nothing about it is published before the person
confirms it. That binds B-2 and the runner in question 3.

## Recommendation

1. "Forming" is the state of having no archetype: no row, or a row with none, as `migrator`
   chooses. The architect already wrote this as live's model winning: "an archetype that may be
   absent plus a confidence level" (`team/architect/knowledge/2026-live-forming-three-against-one.md:104-105`).
2. Confidence is the Archetype Monitor's instrument (`Data_Architecture.md:313`), deciding when an
   archetype first exists and when one changes, and never a stage of the person.
3. Entity 6 is amended through Dan to match `Data_Architecture.md:163` and `:379`.

**Veto.** Adding `forming` to `archetype_id`: the add is permanent
(`team/migrator/knowledge/2026-postgresql-enum-evolution.md`), and it turns an absence into a kind,
the Oracle returned. Second: any model that keeps one of the eight beneath "forming" where anon can
read it.

**What would change my mind.** Two results together: a reading test in which "no archetype yet"
reads worse to a newcomer than a hedged archetype, and a measurement that contributors shown an
early archetype drift toward its signature no faster than those shown none. Then I'd accept a
hedged candidate shown to its holder alone, still out of the public table. On confidence: shown as
a count of what was read, never a countdown to a name, I'd support it as P-2's legitimacy
mechanism. Van der Bles et al. (2020), the nearest test I found, saw stated uncertainty cost little
trust across 5,780 people, and mostly when verbal. A rung is verbal.

## Sources

| Source | Read at |
| --- | --- |
| Miller, R. L., Brickman, P., and Bolen, D. (1975). Attribution versus persuasion as a means for modifying behavior. *Journal of Personality and Social Psychology* 31, 430-441. DOI 10.1037/h0076539 | Abstract: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:1151610%20AND%20SRC:MED&resultType=core&format=json |
| van der Bles, A. M., van der Linden, S., Freeman, A. L. J., and Spiegelhalter, D. J. (2020). The effects of communicating uncertainty on public trust in facts and numbers. *PNAS* 117(14), 7672-7683. DOI 10.1073/pnas.1913678117 | Abstract: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:32205438%20AND%20SRC:MED&resultType=core&format=json |
| Filed: `2013-anderson-steering-badges`, `2017-tomkins-single-double-blind` | `council/philosopher/research/` |

## Rebuttal

**Conceded.** No spec names live's three levels, and the split I credited to live is already Entity
6's (`Data_Architecture.md:157`, `:159`). "The confidence reading" in my brief was the wrong label: I
recommend absence below a threshold set by the spec's own 0 to 1 decimal. Live's named rungs are an
addition, and with `archetypes` open to anon (`2026-live-rls-surface.md:19`) they are published
whatever a page renders. I'd retire them for the decimal, which names no stage. No convener
correction names this position; the seed identification (`docs/handoffs/dialecta-handoff-2026-04-27.md:45-47`)
confirms its last table row.

**`spec-reader`.** It reads the text right: Entity 6 stores one state as a value
(`team/spec-reader/positions-2026-09-21-identity-forming-and-the-runner.md:48-49`). The dispute is
whether that value is an archetype, and the strongest point against me is its open question, that
principle 4's rejected candidates "are candidates for the eight, not the sentinel" (`:71-73`). Both
horns lead out of the enum. As a candidate, forming fails, as spec-reader finds (`:57`). As a
sentinel it is not an archetype, and a sentinel stored in `archetype_id` reaches every reader of
that type as one: the Monitor's "all eight archetype signatures" (`Data_Architecture.md:312`),
`archetype_shift` (`:314`), the card's tag (P-14). `packages/core` already draws this line:
`ArchetypeAssignment` has nine members, `ARCHETYPE_IDS` and `ARCHETYPES` eight (`archetypes.ts:6-15`,
`:22`, `:29-38`). "Needs no spec edit" (`:65`) holds only while Entity 6 contradicts principle 4,
which the house rule says to surface.

**`designer`.** Conceded in full: one `ArchetypeAssignment`, resolved once in `lib/data` through
`archetypeName()`. That reconciles the three readings: forming is the ninth member of the
assignment, never of the archetype enum. I'd hold one line, on B-5. A facet that makes
still-forming contributors "a browsable peer, not an absence"
(`council/designer/positions/2026-09-21-identity-forming-and-the-runner.md:49`) is the one member
all eight outrank, the ranking principle 2 forbids (`Contributor_Identity.md:121`).
