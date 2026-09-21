# Fitness functions, and what kind this seat's next three findings would be

**Source:** Thoughtworks' own book page for *Building Evolutionary Architectures*, three
Thoughtworks Technology Radar blip pages, Wikipedia's "Don't repeat yourself" article, a
chapter-indexed public summary of *The Pragmatic Programmer*, and Will Larson's reading notes on
the book at lethain.com. All fetched 2026-09-21. The O'Reilly book page itself returned HTTP 403 on
two attempts (direct and through `learning.oreilly.com`); Thoughtworks writing is the alternative
source this note's brief names as acceptable, and is what the definition below rests on.

**Note context:** filed during the architect seat's arming sprint, ahead of its first
`/dialecta-research` run. Not tied to a reading-list lead.

## The book and the term

*Building Evolutionary Architectures*, second edition, O'Reilly, published November 22, 2022,
subtitled "Automated Software Governance" (the first edition's subtitle was "Support Constant
Change"). Four names on this edition: Neal Ford, Rebecca Parsons, Patrick Kua, and Pramod Sadalage,
the fourth added for the second edition, per Thoughtworks' own book page. One search result also
attached Mark Richards, Brendan Burns, and Zhamak Dehghani to the byline; none of the three appear
on Thoughtworks' page or on the retail listings checked alongside it, so they are dropped as a
search artifact rather than repeated here.

The book's own definition, as Thoughtworks' Radar paraphrases it rather than as this note invents
it: a fitness function "provides an objective integrity assessment of some architectural
characteristics." The wider description on the same page places it in its original field: a
technique "borrowed from evolutionary computing," used to summarize how close a design sits to its
intended aims.

## Every fitness function blip on the Radar

| Blip | First appeared | Ring history | Current status |
| --- | --- | --- | --- |
| [Architectural fitness function](https://www.thoughtworks.com/en-us/radar/techniques/architectural-fitness-function) | Nov 2017 | Trial (Nov 2017), Trial (May 2018) | not on the current Radar |
| [Dependency drift fitness function](https://www.thoughtworks.com/radar/techniques/dependency-drift-fitness-function) | Nov 2019 | Trial (Nov 2019), Adopt (Oct 2020) | not on the current Radar |
| [Run cost as architecture fitness function](https://www.thoughtworks.com/radar/techniques/run-cost-as-architecture-fitness-function) | Nov 2018 | Trial (Nov 2018), Adopt (Nov 2019, Oct 2020, Apr 2023) | not on the current Radar |

Method: a named-entity web search for "fitness function" against `thoughtworks.com/radar`, then
each hit fetched directly for its own ring history. This finds every blip with the phrase in its
title; it would miss one that used the idea without the words, so read the count of three as a
floor, not a ceiling.

All three left the current Radar after reaching Trial or Adopt, two of the three by way of Adopt.
Thoughtworks retires blips once they stop needing a fresh opinion, which is the Radar's normal
churn, not a rejection signal; nothing in what was fetched reads as a reversal.

## DRY, exactly as worded

"Every piece of knowledge must have a single, unambiguous, authoritative representation within a
system." Hunt and Thomas, *The Pragmatic Programmer*, Tip 11, "The Evils of Duplication," 1999 first
edition. Verified against Wikipedia's DRY article and a chapter-indexed public summary of the book;
both give this exact sentence, and neither carries a page number, so pagination is not cited here.

The sentence is about knowledge, not code. This seat's founding sentence, a definition exists in one
place and the code does something else, is DRY applied at that same level: the thing that must keep
a single representation is a fact (a schema, a rate, a value list), and the violation is a second
representation of that fact drifting from the first, not a second copy of a function body. The
popular shorthand for DRY, do not copy-paste code, is narrower than what Hunt and Thomas
wrote.

## The book's own dimensions, verified before use

Three axes, each checked against a source quoting the book directly (Larson's notes) rather than
assumed from this note's own brief:

- **Scope: atomic versus holistic.** Atomic exercises one architectural aspect in isolation.
  Holistic runs against a shared context and exercises a combination of aspects; the book's own
  example is checking that no personally identifying information reaches the logging system.
- **Cadence: triggered versus continual**, not "continuous" as this note was asked to check.
  Triggered runs on an event, such as a developer running a test. The book's own word for the other
  half is continual: constant verification with no schedule, the example being a live latency or
  cost alert.
- **Result: static versus dynamic.** Static is a fixed pass or fail, like a unit test. Dynamic is a
  threshold that shifts with context, like a freshness tradeoff that loosens under heavier load.

A fourth axis, automated versus manual, is named in the same source but not defined there in enough
detail to quote with confidence, so it is left out of the mapping below rather than guessed at.

## What kind each of the next three findings would be

| Finding | Scope | Cadence | Result | Reasoning |
| --- | --- | --- | --- | --- |
| anon holding EXECUTE on functions | atomic | triggered | static | one architectural concern, privilege scope; belongs in the same CI harness as the RLS tests; a fixed zero-tolerance pass or fail |
| baseline migration vs `pg_catalog` | holistic | triggered | static | combines type, default, and constraint correctness across many tables into one assessment of whether the file matches live, not one narrow aspect; fires when a migration is authored or applied, not on a clock |
| TypeScript unions vs Postgres enums | atomic | triggered | static | one concern, do two representations of the same domain agree; fires in CI whenever schema or code changes; binary agree or not |

None of the three want continual treatment. Nothing about them is a live-traffic or cost signal
needing constant polling; they are correctness checks that belong at the moment code or schema
changes, which is already what triggered means. The migration finding is the least clean call: it
could be read as nine atomic checks, one per marker, reported together rather than one holistic
check. Holistic is used here because the thing being assessed, does this migration accurately
represent live schema, is itself the combination, not any single marker.

## Implies for

Practice: before turning a by-hand finding into a standing check, name which kind of fitness
function it is, atomic or holistic, triggered or continual, static or dynamic, because that
classification decides where the check lives (a CI assertion versus a production monitor) and what
passing means for it. Related: reading list leads 12 and 13, and `brief.md`'s "next three" item 2,
which this note arms directly.

*Filed 2026-09-21*
