# Port carries the person the code assumed, not only the code

*philosopher position, 2026-09-20, port or rewrite. Angle: a port moves working code and also
moves whatever view of a contributor that code was built around. Read in full: both OG image
routes, the nomination panel, the fingerprint engine, the tier badge, the tier capability gate,
all three community surfaces, and the moment surface (`get-moment.js` plus its three files under
`app/contributor/[handle]/moment/[id]/`). Cross-checked against my own P-1 through P-11, the
charter's veto list, `Dialecta_Founding_Philosophy.md`, and today's `legal`/`circulation` exchange
on share cards.*

## Brief

The files I was asked to rule on assume a contributor who is legible to strangers: rankable,
browsable, shareable by tier. The Council spent today narrowing exactly that. Strongest proof:
`get-moment.js` lines 162 to 171 build a `tier_promoted` share card with a tier arrow (`Spark to
Forum`) for X and Facebook, the identical thing `legal` and I ruled out today for the other two OG
routes, just not yet applied to this third file. A port that stops at Ghost imports re-ships a
ruling the Council made hours earlier without noticing it applies here too.

## Position

**On Dan's position directly.** He is right about the cost, and the file-by-file count below
proves it rather than just conceding it: of everything I read, no whole file drops. One event type
drops outright (`follower_milestone`, ten lines inside `get-moment.js`), one relocates rather than
disappears (`tier_promoted`, to a surface `dialecta-community-feed.jsx` already built), and every
file, all 4,842 lines across the nine components plus the moment surface, ports as-is or adapted,
keeping the large majority of its own lines. That is what "port as much as possible" looks like
once the psychological assumptions are named rather than ported by default. The papergrain and the
wood are not what I am objecting to anywhere in this position. A tier word on a stranger's screen
is not papergrain.

### The two OG image routes: adapted

`comment/[id]/opengraph-image.js` and `contributor/[handle]/opengraph-image.js` are good
infrastructure wrapped around a violation. The font-loading harness, the Satori gotchas documented
in their own comments, the neutral `brandCard` fallback, the defensive never-500 pattern: all of
that is real, hard-won cost and it ports as-is. What does not port is the classification.

`comment/[id]/opengraph-image.js` maps `comment.final_tier` to a bare word at lines 40 to 48
(`TIER_LABELS`), folds it into the footer at lines 73 to 79 (`buildFooter`), reads it at line 254,
and renders it at line 335 beside `by ' + memberName`. This is the exact shape `legal` and I
ruled out today in `2026-09-20-circulation-01`: a tier word about a named person, off-platform, no
rubric, no Pact, no way to contest it. I checked whether it is live: no `page.js` exists in
`app/comment/[id]/`, only this file, and its own header says why: "Theme integration is deferred:
comment-sharing UI doesn't exist in the discourse layer yet." Dormant, reachable by no built page
today. Adapt it by deleting `TIER_LABELS`, the `tierLabel` line, and the tier argument to
`buildFooter`. Nothing else needs to change.

`contributor/[handle]/opengraph-image.js` is not dormant. Next.js wires an `opengraph-image.js`
to its sibling route by file convention alone, no import needed, and `app/contributor/[handle]/
page.js` is a live route with its own `generateMetadata`. Any share of a contributor profile
today renders this card. It maps axis scores to an archetype label and top two pillars at lines
60 to 79, reads them at lines 320 to 323, and renders them at lines 420 and 430. Same ruling,
higher stakes: this one is wired. Adapt by deleting the archetype and pillar rendering; keep the
avatar, name, handle, and branding.

### The nomination panel: adapted, and not the reward loop to worry about

`dialecta-nomination-panel.jsx` is `backlog.md`'s A-7, "the community reclassification surface"
by its own line 4, the third leg of the three-input final-tier model its header cites at lines 7
to 9. Read whole, it carries no status game for the nominator: no points, no karma, no visible
nominator identity anywhere in the file. The Breach path (lines 354 to 383) discloses its
consequence before submit rather than hiding behind a bare gate, which passes P-2's legitimacy
test. Credit where it holds: this is the strongest evidence in the whole tree that someone already
built toward the community-correction path I argued for in P-11.

What does not pass is the aggregation the UI exposes. `TriggerRow` shows the raw total to every
viewer before they open the panel, at lines 91 to 100 ("47 nominations"), and the component's own
state is `noms.total` and `noms.tallies`, a plain count. That is P-6 by name: a comment already
showing a rising tally primes the next viewer to pile on, which measures within-group cascade, not
cross-group agreement, at the exact surface, 35 percent of classification weight, where I already
argued a raw count corrupts. Adapt: keep the three-state UI, the reason picker, the Breach
disclosure. Change the total display to something short of a live scoreboard, and do not let A-8's
re-review trigger fire on a raw threshold; whatever computes `resolution` server-side (not in this
file, unread by me, flagged for whoever owns it) needs the bridging aggregator P-6 already named,
before the UI's numbers mean what they'll appear to mean. One unverified dependency: `reason.label`
comes from `RESPONSE_REASONS` in `dialecta-private-draft.jsx`, 1,796 lines I have not read. The
verdict on the reason vocabulary itself is provisional until someone reads that file.

### The fingerprint engine and its shared primitive: adapted, lightly, and the badge ports as-is

`dialecta-fingerprint-engine.jsx` is 910 lines of pure geometry: a function of a `data` prop, one
import (`topics.js`), no Ghost reference anywhere in it. My own fingerprint review stands, now
confirmed against the code directly rather than the render: the dashed guide circle at line 702,
commented "the potential ring" in the source, earns its claim as horizon rather than ceiling, and
the notch on a low axis still needs the repair that position already asked `designer` for. Adapt,
narrowly: this file owes one geometry fix, not a rebuild.

`dialecta-tier-badge.jsx` ports as-is: the shared primitive across the comment card, the
declaration grid, and the nomination panel (its own docstring, lines 4 to 13), and its seven
tiers at lines 38 to 81 match the brightness ladder `Dialecta_Tier_Psychology.md` documents. One
thing for `spec-reader` rather than a blocker: the code comment at line 27 states Stance and
Breach as canonical, while `Dialecta_Tier_Psychology.md` line 322 still marks both provisional as
of v1.1. Confirm which is current before treating the code as the settled name.

### `dialecta-tier-capabilities.js`: as-is, and it is the wall P-9 asked for

62 lines, and I read all of them. The only two consumers its own docstring names are the editor's
polish-run limit and the opinion-map candidate cap, lines 26 to 34 and 40 to 46. Nothing in this
file, and nothing in the nomination panel or the classifier as far as I read them, lets
`subscription_tier` reach classification weight, vote weight, or nomination. That is P-9's fix
already built, not yet broken. Port it as-is. The recommendation is not a code change to this
file: add a standing CI guard, the same pattern `git_guard.py` already uses for tombstones, that
fails if `subscription_tier` or this file is ever imported by the classifier or the vote path.
Write the rule while the wall is still true, not after something quietly imports it.

### The community surfaces: adapted, and yes, there is a follow graph

All three files (`dialecta-community-feed.jsx`, `dialecta-community-contributors.jsx`,
`dialecta-community-author.jsx`) implement a `FollowButton` posting `_action: follow` or
`unfollow`, and a "Following" view. As a private, asymmetric notify-me relationship, unscored and
uncounted anywhere I read, this is closer to a newsletter subscription than a status ladder, and I
am not recommending it come out. What should not come over with it:

- `dialecta-community-contributors.jsx` line 32 lists "Most followed sort, needs follower counts
  on `_list`" as a future item. Strike it, don't defer it. A visible follower count is the most
  recognizable status ladder in engagement media, and the founding philosophy's own line, "They
  reward the performance of conviction over its honest examination... make identity a costume"
  (`Dialecta_Founding_Philosophy.md`, line 55), is a description of exactly what a follower
  leaderboard trains people toward.
- The same file's sort options at line 76, implemented at lines 481 to 487, let a viewer sort the
  entire roster by archetype label, grouping every contributor by psychological type as the
  primary way to browse them. That is a different act than the archetype filter chips at lines 57
  to 66, which I am not objecting to: choosing to find more Skeptics is a reader's filter. Sorting
  everyone into archetype buckets by default puts the classification in front of the name. Drop
  the sort, keep the filter.
- `dialecta-community-feed.jsx` names itself "the dopamine-for-good engine" at line 4 and calls
  Thread Spotlight "the platform's primary viral unit" at line 14. The mechanism underneath, a
  Forum-tier-weighted Hot rank with the file's own stated limits, "no algorithmic amplification
  beyond" it, "identity events surface milestones, never raw activity counts" (lines 44 to 49), is
  sound and should port. The vocabulary describing it is not neutral: a team that writes "viral
  unit" is thinking in the spread mechanics the founding essay was written against, whatever this
  file does today. Strip both phrases from the ported comments and replace them with the
  constraint they were standing in for.

### The moment surface: adapted at the event-type level, and two of eight do not come back

`get-moment.js` (197 lines, `lib/`) plus three files under `app/contributor/[handle]/moment/[id]/`
(`opengraph-image.js` 491, `page.js` 251, `MomentShareButtons.js` 80, 822 lines total, three files
not four; the fourth line in the debate log's count is likely the fetcher, which sits in `lib/`
and is worth counting separately since it is the piece every event type shares). `describeMoment`
switches on eight event types at lines 131 to 197. Four port as-is or close to it: `first_comment`,
`first_article`, `first_quote`, `became_steward`. A fifth, `delta_acknowledged` (lines 155 to 161),
deserves a direct word of credit: a card that celebrates changing someone else's mind is about the
closest a shareable moment gets to rewarding this platform's actual thesis rather than a status
marker.

Two do not come back in this form. `tier_promoted`, lines 162 to 171, interpolates the tier names
directly into the card ("Spark to Forum," confirmed against `dialecta-handoff-2026-05-05-share-
architecture.md` line 110, which describes the same mechanic under the old tier names). This is
not a stranger's characterization of someone; it is self-chosen sharing of an outcome the person
is proud of, which is a real difference from the comment and contributor OG cards, and I am not
dismissing it. But the binding rule `legal` and I set today does not carve out an exception for
self-selection, and it should not: a "Spark to Forum" badge with a share button attached is
Goodhart pressure on the tier system by design, exactly what my charter's veto names, dressed as a
reward the contributor asked for rather than one the platform imposed. `dialecta-community-
feed.jsx` already built the right home for this, its own "Identity Event" type (lines 15 to 19),
on-platform, milestone-only. Move the celebration there; drop the off-platform card.
`follower_milestone`, lines 172 to 181, is simpler: it renders a raw follower count large,
confirmed against the same handoff, line 111 ("render the count number large, no quote glyph"),
which is the follower-leaderboard problem from the community files above, concentrated into one
shareable card. Drop it outright, and do not add its Phase A trigger when that work resumes; it is
currently unwired, so dropping it costs nothing already built elsewhere. The shared machinery,
font loading, the bot-user-agent redirect in `page.js`, the three share actions in
`MomentShareButtons.js`, is generic and ports as-is regardless of which event types survive it.

## The test

A five-month-old surface still belongs if the answer to both of these is no:

1. **Does it make a classification visible to anyone but its subject, without the reasoning that
   makes it earned (P-2) or a way to contest it (P-11)?** Every file I dropped or cut in this
   position fails this one: the two OG cards, `tier_promoted`, the archetype sort.
2. **Does it turn a classification, a relationship, or an act of judgment into a broadcastable
   count, rank, or badge a person or the platform can optimize toward?** This is the quieter
   failure and the one worth watching for, because it survives code review that only checks
   question one: follower counts, "most followed," a live nomination tally, "viral unit" as the
   name of a thing you are building toward.

A yes on either does not disqualify the file. It disqualifies the part, and in every file above
the violation was ten to forty lines inside a file of three hundred to nine hundred, never the
whole thing. One more tell worth using on the next surface: a file that already argues with
itself in its own comments (`dialecta-community-feed.jsx` naming its own constraints, the moment
page distinguishing recognition from surveillance) has an author who was already fighting this
fight, and deserves the benefit of adapt over rewrite. Both OG cards worry at length about Satori
and font tracing and never once about the word they are rendering. Zero such argument deserves
more suspicion from whoever ports the file than the file gave itself.

## Verdicts

| File | Verdict | What changes |
| --- | --- | --- |
| `comment/[id]/opengraph-image.js` | Adapted | Drop `TIER_LABELS`, tier in footer (lines 40-48, 73-79, 254, 335) |
| `contributor/[handle]/opengraph-image.js` | Adapted | Drop archetype and pillar caption (lines 60-79, 320-323, 420, 430) |
| `dialecta-nomination-panel.jsx` | Adapted | Keep UI and Breach disclosure; stop showing a raw public total (lines 91-100); server-side aggregator must bridge, not count |
| `dialecta-fingerprint-engine.jsx` | Adapted | Keep the engine; carry the notch repair from the fingerprint-review position |
| `dialecta-tier-badge.jsx` | As-is | Confirm Stance/Breach canonical status with spec-reader |
| `dialecta-tier-capabilities.js` | As-is | Add a CI guard barring classifier/vote imports of this file |
| `dialecta-community-feed.jsx` | Adapted | Keep Forum-weighted ranking; strip "dopamine"/"viral unit" language |
| `dialecta-community-contributors.jsx` | Adapted | Keep follow and filter chips; drop archetype sort and the follower-count sort item |
| `dialecta-community-author.jsx` | Adapted | Keep as built; no follower count added |
| `get-moment.js` + moment surface | Adapted | Keep 6 of 8 event types; drop `tier_promoted` (move to on-platform Identity Event) and `follower_milestone` |

## Rebuttal

Builder is more right than I was, and the evidence is stronger than builder's own brief. I
read `fingerprint-geometry.ts` and `fingerprint-texture.ts` in full. Builder cited one
deliberate change, the hard clamp's removal. `fingerprint-texture.ts` documents three more,
found the same day: a spiral from a linear ring seed, a seam at theta zero, a turbulence
frequency that stepped instead of blended. My "this file owes one geometry fix" undercounted
by three, and had the direction backward: the fix is not owed, it is already paid, in a
different file, in TypeScript. Porting the 910 lines whole would reintroduce four named, dated
bugs, not carry forward clean math. I concede that plainly.

I hold short of "rewritten" for the file as a whole. Both `packages/core` files describe
themselves as ported and amended, returning the same shape the render code needs, a fraction
of ring radius, a pixel offset, not a new one. The petal paths, the notch handling, color from
purity, the parts I read in full for my own position, are separable from the compute they
consume. Swap the functions, keep the paint. That is adapted, a heavier cut than I credited it
with, deleting this file's own compute rather than patching it, but adapted.

Circulation and I do not conflict. Seven of eight scores clean against the
tier-badge rule alone. My drop of `follower_milestone` rests on a second test, a raw count
that primes comparison, which that rule never asked about. Both rulings hold.

Treasurer's fifty dollars is accepted, and it answers the question asked: a price sitting in a
config file nobody outside engineering reads has not switched any norm yet. That needs the
exposure Phase 4 withholds, which is what my constraint was always about.
