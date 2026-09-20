# Standing positions

Sprints 1 and 2, 2026-09-19. Sixteen sources filed in `research/`. Nothing here has been argued in
council yet.

Two halves, and they carry different kinds of evidence. D-1 through D-10 are about behaviour, and
none of it is measured here: Dialecta has no first-comment completion metric, so those confidences
are confidences about evidence from other platforms. D-11 through D-18 are about craft, and most of
them are measured directly off this repo's own tokens, so the numbers are about Dialecta and
reproducible from `research/tier-palette-audit.py`.

| # | Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- | --- |
| D-1 | Nothing should gate the act of writing a first comment. Friction belongs on reach and on authority over other people's comments | High | `2018-atwood-discourse-trust-levels`, `2026-stackoverflow-privileges`, `2026-x-community-notes-writing-ability`, `2014-pileggi-metafilter-barriers` | 2026-09-19 |
| D-2 | The 12 character gate in A-1 is too small to filter anything and large enough to produce a dead control. Keep a floor if it stops empty submits, move it off the disabled button, and answer in a sentence | High | `2024-roselli-disabled-form-controls`, `2009-fogg-behavior-model`, Discourse Layer UX, Stage 1 | 2026-09-19 |
| D-3 | The reflection card is the real friction in Stage 1, and it is already in the right place, after the person has written. A second gate in front of it buys nothing the card does not already buy | Medium | Social UX Architecture, "The Foundational Choice"; `2026-x-community-notes-writing-ability` | 2026-09-19 |
| D-4 | The nudge bar is the highest-value element in the composer and should be treated as load bearing copy under Editorial Voice v1.2, not as decoration | Medium | `2009-fogg-behavior-model`; Discourse Layer UX, Stage 1 | 2026-09-19 |
| D-5 | Spam defence in A-1 belongs in a per-account rate limit keyed to classification history, not in a character minimum | High | `2018-atwood-discourse-trust-levels` (TL0 caps), `2026-x-community-notes-writing-ability` (dynamic write limit) | 2026-09-19 |
| D-6 | Nine readers in ten will never comment. The topology bar, the Quality sort and a one-tap position carry more of the platform's value to more people than the composer does | Medium | `2006-nielsen-participation-inequality` | 2026-09-19 |
| D-7 | No position on the composer can be settled until first-comment completion is instrumented. Every row above is a prior | High | charter, "What I measure"; `2025-fido-passkey-index` is built on exactly the metric Dialecta lacks | 2026-09-19 |
| D-8 | P0-D2: Google OAuth primary at cutover, email one-time password second, magic link only once custom SMTP exists, passkeys later | Medium to high | `2026-supabase-auth-email-limits`, `2025-fido-passkey-index` | 2026-09-19 |
| D-9 | P0-4 is blocked on a custom SMTP decision that is not in the backlog and not in ADR-002 | High | `2026-supabase-auth-email-limits` | 2026-09-19 |
| D-10 | If sign-up needs a filter at cutover, a read-first waiting period is a better one than invite-only | Low | `2014-pileggi-metafilter-barriers`, abstract only | 2026-09-19 |
| D-11 | The tier palette asks one channel to carry both an ordinal quality ladder and a seven way categorical identity. Every measured failure below traces back to that | High | `2026-dialecta-tier-palette-audit`, `1996-healey-effective-colours` | 2026-09-19 |
| D-12 | Heat badge text at 1.96:1 against its own chip is a measured defect in the locked palette, not a matter of taste. Raised for Dan; I do not propose the fix | High | `2026-dialecta-tier-palette-audit`, `2023-w3c-wcag22-colour-criteria` (SC 1.4.3) | 2026-09-19 |
| D-13 | The topology bar needs a second, non-colour channel. Stance and Breach are one colour under normal vision and under all three CVD types. The tier icons already exist | High | `2026-dialecta-tier-palette-audit`, `2023-w3c-wcag22-colour-criteria` (SC 1.4.1) | 2026-09-19 |
| D-14 | The Forum border at 1.50:1 on the card surface is the least visible of the seven, which undercuts the locked decision in A-9 to surface Forum counts | Medium to high | `2026-dialecta-tier-palette-audit`, `2023-w3c-wcag22-colour-criteria` (SC 1.4.11) | 2026-09-19 |
| D-15 | The token set needs a spacing scale and a type scale. Space is the channel that carries grouping and it is the only channel with no tokens at all | High | `2026-dialecta-space-and-scale-audit`, `2012-wagemans-gestalt-grouping` | 2026-09-19 |
| D-16 | Article prose in `apps/web` renders in the sans at roughly 85 characters per line. P0-5 is where both get fixed | Medium to high | `2001-dyson-haselgrove-line-length`, `2026-dialecta-space-and-scale-audit` | 2026-09-19 |
| D-17 | The brightness ladder is right and I am not asking to re-pick the gold, the grain or the nav gradient. Every craft position above is additive or a measured defect | High | charter, "Constraints I argue inside"; `.claude/agents/designer.md` | 2026-09-19 |
| D-18 | A contrast check belongs in CI beside `npm run tokens -- --check`, which guards colour drift and cannot see contrast | Medium | `2026-dialecta-tier-palette-audit`, `2021-somers-apca-contrast-whitepaper` | 2026-09-19 |
| D-19 | Each tier needs four tokens with named roles and a contract between them, not four values that happen to sit together. Ink clears 4.5:1 against the lightest point of its own fill; border clears 3:1 against the card | High | `2026-radix-colors-scale-roles`, `2026-trinity-apex-design-system`, `2026-dialecta-tier-palette-audit` | 2026-09-19 |
| D-20 | Dialecta's spacing scale should take the shape Trinity already uses: four numbers, snap everything to them, and one direction rule so gaps never double. Dan picks the numbers | High | `2026-trinity-apex-design-system`, `2026-dialecta-space-and-scale-audit` | 2026-09-19 |
| D-21 | The article editor should carry an aesthetic pass, and it already exists at `dialecta-api/api/article/aesthetic-suggest.js`. A-10 is written as though it does not | Medium to high | exchange 2026-09-19-005 | 2026-09-19 |
| D-22 | The Contrast Strip is the most distinctive element on a comment card and is given the least visual weight. It is the reclassification story made visible, styled as a footnote | Medium | Discourse Layer UX, "Contrast Strip"; Social UX Architecture, "Viral Mechanics"; `2026-trinity-apex-design-system` | 2026-09-19 |
| D-23 | This advisor's charter is written entirely in defensive terms and should carry a generative clause. Raised for Dan; `guard-docs.mjs` correctly blocks me from editing it | Medium | charter.md; `.claude/agents/designer.md` | 2026-09-19 |

---

## Position: the first comment

**What gets a person from reading to posting once.** Almost nothing does. Nine readers in ten never
contribute anywhere, and in the Usenet corpus Nielsen cites, 27% of all postings came from people who
posted exactly once. The modal contributor writes one comment in their life on a given site. Design
for that person or the comment section stays empty.

Fogg's model names the lever. Dialecta cannot raise a first-time commenter's motivation much, so it
has to raise ability, and it has to keep the prompt present at the moment motivation peaks. The
composer already holds the right instrument: the nudge bar says what Forum looks like at the moment it
is relevant, in plain language, which is an ability move. The classification card is the second prompt
and Stage 2.5 is the third. Ability, not motivation, is where the budget goes.

**What the 12 character gate does to that.** Two separate problems, and the second is the bad one.

The threshold is too low to be a quality filter. Twelve characters stops "ok" and "+1" and little
else. A comment of thirteen characters passes. Whatever the gate was meant to catch, it does not
catch it, and the reflection card behind it catches all of it anyway.

The mechanism is worse than the threshold. A-1 disables "Analyze my comment" until the text reaches
12 characters, and the spec says nothing about the button explaining itself. A disabled control is
removed from the tab order, is exempt from the WCAG contrast requirements so it renders low contrast,
and by default tells the person nothing about what is missing. Both the NHS digital service manual
and the GOV.UK Design System say to use one only where user research shows it helps. Dialecta has no
user research. On a phone, where the Responsive Foundations debt already sits, a person hits the
threshold mid-thumb-typing and gets a grey rectangle and silence.

That silence is the part that breaks the voice. Every message below Breach ends with the door open.
A dead button is the platform declining to speak at the one moment it has something useful to say.

**What I would build instead.** Keep a floor if it prevents an empty submit, and make it the smallest
number that does that. Keep the button live and answer a very short comment with one sentence in the
platform's voice, or keep `aria-disabled` with a visible count so the state is announced rather than
guessed. Put the real friction where every precedent puts it. Discourse caps a new account at three
topics and ten replies and gates reach, never speech. Stack Overflow awards the right to post and to
comment at one reputation and spends its whole friction budget on moderation authority. Community
Notes gates publication behind a Rating Impact of five and never gates length. MetaFilter charges
five dollars and makes a new member wait a week, then lets them write at whatever length they like.
None of the four gates on characters.

**Where I could be wrong.** All four precedents are large communities defending against volume.
Dialecta has fourteen members and the opposite problem. A gate that costs a large forum real
contributors might cost Dialecta nobody, because there is nobody yet. That is an argument for
deciding this once the metric exists, not for keeping the gate because it is already written down.

---

## Position: P0-D2, from the return-rate side

The question in P0-D2 is which login method a person completes. Two things decide it here, and only
one of them is a preference.

**The one that is not a preference.** Supabase's own documentation says the built-in email provider
sends two emails per hour, that the bundled SMTP server is not meant for production use, and that
without custom SMTP, Auth "will refuse to deliver messages to addresses that are not part of the
project's team". Magic link sign-up therefore cannot work at cutover on defaults. It will deliver to
Dan and to nobody else. This is a blocker on P0-4, it is recorded nowhere in the backlog, and it
carries a vendor choice, a sending domain and a monthly cost that belong in front of the treasurer
before P0-D2 is decided. Posted to the exchange as a blindspot.

**The one that is a preference.** Google OAuth completes inside the browser with no inbox round trip,
no deliverability surface, and no dead session when the email opens on a different device. For the
fourteen legacy Ghost members being mapped in P0-6, it is the path with the fewest ways to fail.
Email one-time password is the cheap hedge for anyone without a Google account: Supabase says it
shares an implementation with the magic link and differs only in the template, and six digits survive
the move from a phone to a laptop, which a one-time link does not.

Passkeys should wait, and ADR-002 already has them waiting. The FIDO Passkey Index reports that after
one to three years at Amazon, Google, Microsoft, PayPal and TikTok scale, passkeys sit on 36% of
accounts and carry 26% of sign-ins. A platform with fourteen members should not lead with a method
that the best resourced deployments on earth have not made the majority path. The report's headline,
93% success against 63%, should not be quoted in the debate: its own footnote bundles social login in
with the 63%, so it does not compare passkeys to Sign in with Google at all.

**What I want instrumented with `/login` rather than after it.** Sign-in completion split by method,
and seven day return split by method. The passkey report is built entirely on the first of those.
Dialecta has neither, and without them D-8 stays a borrowed prior.

---

## Position: the visual system

**Where I stand and where I stop.** The visual language is locked and it should be. I am not asking
to re-pick the gold, the page background, the grain or the nav gradient, and nothing below requires
it. What follows is either additive, or a number that is wrong against a normative standard. Both
are inside the mandate; iterating on the gradient is not.

**The palette is doing two jobs with one channel.** The seven tiers run as a brightness ladder from
cream to near black, and the design spec is right that this "communicates quality intuitively before
any text is read". That is an ordinal encoding and it works. The same seven values are then asked to
carry a categorical identity: which tier is this, told apart from six others at a glance, on a
topology segment with no text on it. One channel cannot do both well, and the measurements say it
does not.

Six results, all reproducible from `research/tier-palette-audit.py`. Heat badge text measures
**1.96:1** against the top of its own gradient, where body text needs 4.5:1, and the icon inherits it
through `currentColor`. Stance measures 4.26:1. Stance and Breach borders sit **9.22 CIEDE2000**
apart against a median of 38.91, and close to 6.25 under protanopia, so the two most serious tiers
are one colour. Forum's border measures **1.50:1** against the card surface, against a 3:1 floor,
which makes the tier the Quality sort exists to surface the least visible of the seven. Spark is
2.52:1. And the one contrast fix already in the spec, rendering the Forum icon in `--text-primary`,
was applied to a tier measuring 6.39:1 while Heat at 1.96:1 was left alone.

**Most of it is fixable without touching a locked value.** The tier icons already exist in the spec.
Carrying one into each topology segment satisfies SC 1.4.1 and separates Stance from Breach using a
channel colour blindness does not touch. A visible divider between segments handles Forum and Spark.
Only the Heat and Stance text colours need a token change, and that is Dan's, which is why it is an
advice record rather than a proposal.

**Space is the channel with no tokens at all.** The set locks nine surfaces, nine text colours,
twenty-eight tier values, four borders, three shadows, four families and three radii, and defines no
spacing value, no type size, no line height and no measure. In their place the spec uses 29 font
sizes, 14 of them inside the band from 0.52rem to 0.95rem, six of those inside two pixels of each
other. Seventeen padding values, six of which are off any grid. Fourteen line heights. Nothing
distinguishes a deliberate number from an accident, because there is no scale to be off.

That matters more than it sounds. Proximity is the grouping cue that fires first and usually wins,
so spacing is what tells a reader whether the Contrast Strip belongs to the comment above it. In
`apps/web` the whole layout system is `main { max-width: 44rem; padding: 3rem 1rem; }`, which renders
article prose in DM Sans at roughly 85 characters per line when the token set defines a reading face
and the spec elsewhere uses `ch`. Adding the two scales takes nothing away and gives every island
built from A-1 onward something to be checked against.

---

## Proposal: give the tier tokens roles and a contract

Two systems reached the same conclusion independently, and one of them is Dan's.

Radix Colors defines a scale as twelve named roles rather than twelve values, and binds the text
steps to the background steps of their own scale: steps 11 and 12 are "guaranteed to Lc 60 and Lc 90
APCA contrast ratio on top of a step 2 background from the same scale". Accessibility is a property
of how the scale is built. The APEX Design Intent puts the same idea in Dan's words: fills ride
their own grades, "decoupled from the AA text hues, so the light theme's bubbles and bars stay vivid
while its text stays compliant", because "a text hue doing a fill's job is how a slider's center
turns to mud".

Dialecta's Heat badge is that mud case exactly. `--tier-heat-text` is the badge ink and, through
`currentColor`, the icon fill, and nothing binds it to `--tier-heat-top`. No rule was broken. No rule
existed.

So write the rule, and change no value that satisfies it:

| Role | Job | Contract |
| --- | --- | --- |
| `top` and `bot` | The fill. Carries the brightness ladder | None. Stays expressive |
| `border` | Tier identity, and the topology segment | 3:1 against `--bg-white` |
| `ink` | Badge text and icon | 4.5:1 against the lightest point of its own fill |

Five of the seven tiers already pass both. The gold, the grain, the nav gradient and the ladder are
untouched. D-18 then has something to check, because a contract is testable and "pick nice colours"
is not.

The same move fixes space. Trinity snaps every margin, gap and padding to four numbers and adds the
rule this advisor did not have: blocks space downward, section heads own the space above, so gaps
never double. "If a layout only works off-scale, the layout is wrong, not the scale." Dialecta should
take the shape and let Dan pick its own four numbers, because 48px before a section is a cockpit
rhythm and a reading page may want more.

## Proposal: the Contrast Strip is buried

This one is not a defect, it is an argument, and I would rather be argued out of it than leave it
unsaid.

When a commenter's declared tier and the engine's read differ, a strip appears under the comment
footer: "Commenter declared X. Engine read Y. Community voting will settle it." It is permanent and
public. The Social UX Architecture separately calls the reclassification moment the story "Nobody
can tell about any other platform", and names the debate clip the platform's primary viral unit.

That story has a home on the card already, and the card renders it as a system footnote in the same
visual family as the AI card, beneath the vote controls and the specificity dots. The most
distinctive object Dialecta makes is the least weighted thing in its own component.

Trinity's law says colour is spent on data, never on chrome. Here the contrast *is* the data: two
readings of the same sentence, disagreeing in public. I would give it the weight that implies, above
the footer rather than below it, and let the tier badges it names carry their own colour rather than
restating them in the amber system voice.

What I am not doing is designing it in this file. My own charter vetoes anything that ships without
a real contributor having tried it, and there are fourteen members and no instrumentation. This is a
position to argue in council, and the first thing it needs is somebody to look at a card and say
whether the strip reads as the point or as the small print.

## What I would veto, and why it binds both ways

Nothing filed this sprint argues for removing friction. It argues for moving it. The reflection card,
the self-declaration grid and the Stage 2.5 amendment are the friction that makes this platform what
it is, and they sit after the person has written, which is where the Social UX Architecture already
puts them. I would veto replacing any of that with a counter, a streak or a volume reward.

I would equally veto a gate nobody gets through. A disabled button with no message, in front of the
one action the whole platform exists to produce, is the second kind of veto and it is live in A-1
today.
