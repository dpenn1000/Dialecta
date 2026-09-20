# The Pact, reviewed

*`legal` position, 2026-09-20, answering the convener's three questions and Dan's mid-session
instruction that the Pact address legal concerns. Not counsel. Nothing here is legal advice.
Every claim names its state or circuit.*

## Brief

A document can hold both registers: the Pact stays a values commitment while a short, conspicuous
sentence incorporates a separate Terms of Use for acceptable use, a content license, liability,
and governing law (Arizona). Today nothing carries those terms; no such document exists anywhere
in this codebase. Incorporation binds only if the link sits inside the signing ceremony, not the
footer, per Nguyen v. Barnes & Noble (9th Cir. 2014) and Berman v. Freedom Financial Network (9th
Cir. 2022). Shortening nets positive for assent if the link gets that weight. One fact outranks
the rest: no code in the live app persists a Pact signing today. The three recorded signatures are
from a retired build.

## 1. One document, two registers

Yes, by incorporation by reference: one sentence in the ceremony, not the footer, pointing to a
separate Terms of Use. § I survives that only if the Pact admits the second document exists, which
it does not today.

**What carries the enforceable terms if the Pact does not: nothing, today.** No Terms of Service,
EULA, or acceptable-use document exists anywhere in this repository; `legal`'s own brief lists them
as owed and unstarted.

Conspicuousness decides whether the link binds. Nguyen v. Barnes & Noble, 763 F.3d 1171 (9th Cir.
2014), binding in Arizona's circuit, killed a footer link as notice; Berman v. Freedom Financial
Network, 30 F.4th 849 (9th Cir. 2022), adds that the term must be visually set off and assent to it
unambiguous. The Pact's read-quiz-sign ceremony supplies that attention. The current footer link
does not.

## 2. Signing: assent to what, and a fact that outranks the wording

`pact_agreed_at`, `pact_version`, and `pact_signed_name`, captured after a taught, quizzed,
hand-typed signature, beat most clickwraps on Nguyen's own logic: an affirmative act, not passive
notice.

**None of it is being produced today.** These fields and `become_author` appear nowhere in the
live `apps/web` or `packages/` trees. The working ceremony shipped 2026-04-29 on a since-retired
stack; today's Next.js page is an 11-line placeholder. The three signed profiles are what the old
stack produced before it stopped, not a live number: a rebuild gap, which answers the council
log's third question.

Migration 010 built `pact_version` to re-prompt on a material revision, but nothing enforces it.
ADR-004's v1.1 would leave the three v1.0 signers and eleven nulls with author status and no
invitation back. An unenforced version column is a label, not a gate.

## 3. Does the Pact reach 583 consent, and the Breach residual

Yes, further than a settings pane: § 583 reads consent by the circumstances of the choice, and a
taught, signed document beats a buried toggle, per today's visibility-control position (Arizona's
own adoption of § 583 unconfirmed). Consent captured nowhere, though, is absent, not weakened,
until the ceremony above runs again.

The Breach residual is a thinner consent, not a cosmetic gap. § VIII asks a signer to welcome being
described, a general disposition; the residual is a permanent, aggregated mark built from text the
signer never sees again, closer to the statement Milkovich worries about. ADR-004's two-moment fix
is sound, but the schema holds one set of pact_* columns, not a log of what the second moment
showed.

## 4. Shortening: which way it nets

Positive, conditionally. A shorter Pact gives the incorporation sentence real weight instead of
losing it in 1,200 words, which is what Berman asks for. Terms moving behind a click is the
browsewrap failure, and it applies to a link nobody was made to encounter; the Pact's read-quiz-sign
structure is the opposite. Shortening the tier teaching does not weaken § 583 either, provided the
summary still names the seven tiers and the Breach-suppression fact. That naming, not the length,
made the consent strong.

## 5. The minimum set

In order of dependency, not a wish list:

1. **Make the commit button write again.** Nothing below has legal effect while `/pact/` is a
   placeholder.
2. **A short Terms of Use.** Acceptable use, a content license, limitation of liability, governing
   law (Arizona). One page, not a EULA in prose.
3. **One incorporation sentence inside the ceremony**, set off near the commit button, not the
   footer.
4. **Name the seven tiers and the Breach-suppression fact** wherever the teaching gets shortened.
5. **A version check** against current, and a record of what a signer saw, not only that they
   signed.

Needs a lawyer: whether Arizona has adopted Restatement § 583, and whether the Pact plus an
incorporated Terms of Use forms a contract when neither uses offer-and-acceptance language. Both
already sit in the standing Arizona opinion-privilege hour.
