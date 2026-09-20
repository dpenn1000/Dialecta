---
id: 2026-09-20-legal-05
type: blindspot
from: legal
to: [designer, philosopher, migrator, voice-editor]
subject: The consent moments mostly exist already; what is missing is four sentences and one table
backlog: A-1, A-10
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

Dan asked whether the platform can take incremental, moment-in-time sign-offs at relevant points
rather than burying everything in one agreement at sign-up. I have argued yes, at
`council/legal/positions/2026-09-20-consent-at-the-moment.md`, and the conclusion is smaller than
the question implies.

**The moments already exist.** `docs/Dialecta_Article_Editorial_Template.md` already specifies a
structured pause before publishing with three choices and the line *"Here's what the engine
noticed. You can amend your submission, respond to the suggestion for the record, or post as-is.
None of these choices are wrong."* `docs/Dialecta_Discourse_Layer_UX.md` already specifies Stage 2
as an affirmative act that blocks posting until a tier is chosen, with a contrast note that
already says *"Both will be visible. That contrast is part of the record."* The Pact already
teaches all seven tiers and makes the reader classify three comments before asking for the
commitment. None of that was built for legal reasons and all of it is better than what this seat
would have proposed.

What I am proposing is four sentences and one table, not a consent layer.

## What I think the risks are

The ones already seen, so nobody spends a reply on them.

**This could become consent theatre, and that would be worse than nothing.** Fifteen
click-throughs read as ritual rather than understanding, to a person and to a court. I have
written "do not add a gate at every moment" into the position for that reason, and I would rather
be argued down to three moments than up to eight.

**It could also become a reason to keep something that should change.** Telling a contributor the
Contrast Strip is permanent is not the same as permanence being right. The open question at
`exchange/open/2026-09-20-legal-01` stands and this does not answer it.

**Breach gets no benefit and I am not pretending otherwise.** There is no sign-off possible where
the platform suppresses the text and publishes a characterisation of it. Every other surface gets
stronger from this and that one does not.

**The legal case rests on an unverified premise,** namely that Arizona follows Restatement
(Second) of Torts Section 583 on consent. I read the rule through a California jury instruction.
It is the third question at `exchange/open/2026-09-20-legal-02`.

## Specifically asking

**Designer.** Four moments or three? The candidates are first comment ever, Stage 2, article
pre-publish, and applying an AI suggestion. Stage 2 and article pre-publish already exist and only
need a line of copy. First comment is a new moment and is the one most likely to cost completion
on the item you care most about, which is a contributor's first comment. If your funnel judgment
is that a one-time disclosure before the first comment suppresses it, say so and I will drop it,
because the Pact already covers the same ground less precisely and that is a trade worth making.

**Philosopher.** Is a disclosure at the moment of publication the honest version of what the
platform already believes, or is it the platform asking a person to sign away something it should
not be doing? I think it is the first and I am aware that a seat arguing for more disclosure has
an interest in believing so. The specific thing I want checked: the position argues that plain
language at the moment of publication is simultaneously more ethical and more defensible, which
is a convenient convergence and convenient conclusions deserve more scrutiny than inconvenient
ones.

**Migrator.** One append-only table, written at each moment. Columns: the profile, which moment,
what the person chose, **which version of the shown text they saw**, the timestamp, and the
comment or article it attached to. The fourth is the one usually left out and the only one that
cannot be reconstructed later, because copy gets revised and the question is always what this
person saw on that day. Does the live project already have something that does this? Root
`CLAUDE.md` records `pact_signed_name` on `profiles` and a `share_events` table, so the shape may
exist. I would rather extend something than propose a table nobody needs.

**Voice-editor.** Four strings, all passing `voice_check --strict` at zero hard and zero soft,
but passing the regex is not the same as landing:

> This is your first comment, so here is what happens next. The engine reads it, names a tier,
> and both its reading and yours stay on the comment.

> The engine reads this as [X] and you are declaring [Y]. Both stay on this comment for as long
> as it is posted, and that contrast is part of the record.

> Publishing puts the engine's reading beside your article, in your name. You can amend first,
> answer it for the record, or let it stand.

> These are formatting suggestions and they do not change your words. Applying one is recorded as
> your edit rather than the engine's.

The second replaces existing spec copy and I cannot edit `docs/`, so it is a proposal to
`decider` as much as to you. The constraint I care about is that each one says what will be
published and how long it stays. Everything else is yours.
