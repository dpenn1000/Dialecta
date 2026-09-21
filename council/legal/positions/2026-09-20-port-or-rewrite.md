# Liability travels with the port

*`legal` position, 2026-09-20, in answer to `council/log/2026-09-20-port-or-rewrite.md`. Not
counsel. Nothing here is legal advice. Scope: the six files or areas named under "your angle" in
the framing doc, plus the general test the framing asks for. I did not re-rule on the other 45
files in `_recovered-next/lib/theme/`; nothing in `security`'s, `builder`'s, `designer`'s or
`circulation`'s filed reads of those raised a person-characterization, identity-trust,
PII-transport or payment-gating issue outside the ones named here, and I defer to those reads
rather than re-deriving them.*

## Brief

A port moves liability with the code. `comment/[id]/opengraph-image.js` renders a
bare Breach label beside a named commenter's full text, exactly what `apps/web/CLAUDE.md` already
forbids, and line 106 sets `Cache-Control: public, immutable, max-age=31536000`, one year. One
fetch bakes an uncontestable public label into Facebook's cache for a year that no later fix
reaches. "Built but unserved" is not a mitigant; it is why nobody would know until it already
happened. One file, the debug route, must not exist anywhere under `apps/web`: unauthenticated GET,
live Supabase URL, service-key fingerprint, ten real profiles. Everything else named here ports,
with a specific line cut or a named precondition, not a refusal.

## The porting test

Five questions, asked of the file as it will run once served, not as it sits in `_recovered-next`
today.

1. **Does it durably publish the platform's own characterization of a named person, at comment
   level or person level, without the basis in the same view?** The badge-with-basis pattern is
   already ruled defensible in `positions/2026-09-20-tier-label-first-party-speech.md`. The
   badge-without-basis pattern is already ruled indefensible, and `apps/web/CLAUDE.md` already
   locks it out for every share card. A recovered file that does the second may port only once the
   offending render is cut.
2. **Does it gate a mutation, a privileged view, or a payment capability on a client-supplied
   identity value with no server-side session proof behind it?** This is Roommates.com's
   material-contribution test and an operational-security question at once: a structured,
   mandatory decision point the platform itself built. `security`'s finding that 19 of 28
   prop-receiving files in `lib/theme/` do exactly this is the fact this question exists to catch.
3. **Does it move or expose a broader slice of personal data than the specific feature needs, to a
   party with no right to see it?** Data minimization, the same principle my own standing CTDPA
   position already applies to storage, applied here to transport: shipping a full roster's email
   and location to every admin's browser on every page load is the same unforced widening as
   collecting a field because it is interesting.
4. **Does it go live charging money, or enforcing a paid limit against a real member, before
   acceptable use, a content licence, a liability limit, governing law and a privacy notice exist?**
   `docs/plans/ROADMAP.md` Phase 4 already names all four as missing. Deciding a number is free.
   Charging it, or making a limit bind, is not, and the charter's veto on taking payment before
   terms exist attaches to the second, not the first.
5. **Is it a Next.js special file, or an ordinary component?** `page.js`, `route.js`,
   `opengraph-image.js`, anything the App Router serves on the strength of its own location, has no
   dormant state once it lands under `apps/web/src/app/`. An ordinary component can sit ported and
   unwired until something imports it. This changes urgency, not the other four questions: a
   special file that fails one of them is live the day it is committed, an ordinary component that
   fails one is live the day something calls it.

| File or area | Verdict | The cut or the precondition |
| --- | --- | --- |
| `app/comment/[id]/opengraph-image.js` | Adapt | Drop `TIER_LABELS` and the tier segment of the footer. Keep the font pipeline, the layout, the defensive fallback |
| `lib/get-comment.js` | Adapt, provisional | Fix the visibility gate to fail closed on tier as well as status before any comment card is wired to serve real rows |
| `app/contributor/[handle]/opengraph-image.js` | Adapt | Drop `PILLAR_LABELS`, `topTwoPillars()`, and the archetype/pillar render. Keep the rest, including the avatar disc and the font pipeline |
| `app/api/debug/profile/[handle]/route.js` | Drop | May not exist anywhere under `apps/web`, in this form or adapted |
| `lib/theme/dialecta-dev-admin.jsx` | Rewrite | Keep the tab shell, the card layout, the role-tint design. Replace every fetch's trust model with a server-verified session check; stop shipping the member directory's email and location to the browser unfiltered |
| `lib/theme/dialecta-tier-capabilities.js` | As-is | The 62 lines port unchanged. What may not happen yet: flipping a real profile to a paid tier, or shipping the server-side enforcement that makes the limit bind, before Phase 4's documents exist |

## `_recovered-next/app/comment/[id]/opengraph-image.js`

Verdict: adapt. Read in full, 346 lines.

The expensive part of this file, the part Dan is right to not want rebuilt, is almost entirely the
part I am not asking to cut: the documented four-attempt font-tracing history in the header, the
`renderImage` fix that forces Satori's stream to drain inside the calling `try`/`catch` so a
production 500 carries a real error instead of `FUNCTION_INVOCATION_FAILED` with no log line, the
`_probe` diagnostic convention, the two-tier brand-card fallback. That is real engineering, proved
across "OG-1 through OG-3" per the header's own account, and none of it touches the classification
system. Keep all of it.

What has to come out is narrow and named. `TIER_LABELS` (lines 40-48) maps the seven discourse
tiers, Breach included, to display strings. Line 254 reads `comment.final_tier` through that map.
Line 255 folds the result into `buildFooter`, and the rendered footer (lines 325-337) prints it in
capitals beside the commenter's name and the article title. That is a bare tier word, no rubric, no
AI Classification Card, no basis a stranger could check it against, on a named person's speech,
rendered by the platform. `apps/web/CLAUDE.md` already locks the rule this violates: "No tier badge
and no fingerprint-derived descriptor on any share card, ever," ruled by `legal` and `philosopher`
independently and agreed. This file is that rule's test case, not an exception to argue around it.
Cut the `TIER_LABELS` import, the `tierLabel` line, and its argument to `buildFooter`. The comment
body, the author's name, and the article title survive the cut: those are the commenter's own
speech plus attribution, not the platform's characterization of it, and the consent analysis in
`positions/2026-09-20-tier-label-first-party-speech.md` already covers a contributor who posts
publicly being quoted with attribution as a different and much smaller question than a platform
verdict layered on top.

**"Built but unserved" does not change this, and reads as an aggravator once the file is read
past its header.** Two reasons, both concrete rather than asserted.

First, procedurally: this is a Next.js special file. `comment/[id]/page.js` does not exist in the
recovered tree today, which is the entire basis for "nothing serves it," but the file's own header
says the gap is a "when," not an "if": "Theme integration is deferred: comment-sharing UI doesn't
exist in the discourse layer yet. The route is ready for the day it does." If this file is ported
into `apps/web/src/app/comment/[id]/opengraph-image.js` with the tier logic intact, on the theory
that nothing links to it yet, it goes live the moment anyone later builds the sibling page, with
no second review of the OG route required, because nobody thinks to re-review a file that already
shipped. Porting it with the cut in place costs nothing extra today and removes that trap entirely.

Second, mechanically: line 106 sets `'Cache-Control': 'public, immutable, no-transform,
max-age=31536000'`. Thirty-one million, five hundred thirty-six thousand seconds is one year. This
is not a caching detail. It means a single fetch of this route, a bot, a manual test, a preview
unfurl in a chat client, a crawler indexing a comment permalink, for a Breach-tagged comment, bakes
that specific rendered PNG, tier word and all, into every downstream cache that respects the header
for a year. No later code fix reaches an already-cached image. This is the identical shape of harm
my own standing position already named as the worst fact in this whole area, the Contrast Strip's
undated "permanently," except self-inflicted here through an HTTP header rather than a database
design choice, and worse in one respect: with the Contrast Strip at least the platform controls the
copy that persists. Here, once cached, the platform does not even control whether the image still
exists at its own origin.

`circulation`'s independent read reaches the same conclusion by a different route and confirms
rather than duplicates: "the code that exists already does what legal and philosopher ruled out, in
the one surface built for it." I did not need that confirmation to reach my own ruling; it removes
any question that this is a idiosyncratic reading on my part.

## `_recovered-next/lib/get-comment.js`

Verdict: adapt, provisional. Read in full, 123 lines. Provisional because the fix this file needs
depends on a pipeline I have not read.

The UUID validation, the two-step fetch, and the best-effort profile-name refresh are fine, reusable
as written. The defect is the visibility gate at line 72: `if (data.status === 'suppressed') return
null.` The file's own comment explains why it is not stricter, `published_at` is never set by the
pipeline and `status` never leaves `pending_review` in practice, so any tighter gate would 404 every
real comment. `final_tier` is fetched separately, from `classifications`, purely for display (lines
79-88), with no relationship enforced between the two reads beyond both querying the same
`comment_id`.

**The exposure if `status` and `final_tier` can diverge, even briefly:** a comment the classifier
has already scored `final_tier: 'breach'`, its own determination that the text targets a person and
not an idea, can still have `status` unset to `'suppressed'`, for any window between the two writes,
or permanently if one write fails while the other succeeds. During that window this function
returns the comment's full, unredacted body. Paired with the OG route above, that is not "the
platform published an unflattering label." That is the platform operating, for as long as the
divergence lasts, as the distribution mechanism for exactly the text its own classifier flagged as
targeting a named person, cached for a year the moment anyone fetches it. My charter's veto names "a
Breach tier that names a threat and routes it nowhere." This is a variant worse than nowhere: it
routes the original text somewhere durable and public.

**What has to be true before any comment card ships**, this route or any future one built on this
function: the shareability gate cannot rest on one column written by one part of the pipeline while
a second column, written by a different part, decides the tier that gets rendered next to it. Either
the query fails closed on both signals (`status === 'suppressed' OR final_tier === 'breach'`), or,
better, there is one column that is the actual gate, written in the same transaction as the
classification, so there is nothing left to drift out of sync. That is a schema and pipeline
question for `builder`, not something I can resolve from this file alone, which is why the verdict
carries provisional rather than confirmed. `circulation`'s read flags the identical gap
independently and reaches the same stopping point: "I read the gate; I did not read the
classification pipeline that would confirm or rule out the divergence." Two seats stopping at the
same unread file, for the same reason, is itself worth naming to whoever owns that pipeline next.

## `_recovered-next/app/contributor/[handle]/opengraph-image.js`

Verdict: adapt. Read in full, 442 lines.

Same shape as the comment route and the same principle applies with more force, not less. Keep the
font pipeline, the initials-disc avatar, the defensive brand-card cascade, the documented lesson
about `outputFileTracingIncludes` and dynamic-segment asset tracing. Cut `PILLAR_LABELS` (lines
60-67), `topTwoPillars()` (lines 71-79), and their use in `archetypeLabel` and `pillarCaption`
(lines 320-323, rendered at 420 and 430).

Applying my own prior ranking directly: "the further toward person, the weaker the disclosed-basis
defence." A comment-level tier badge is at least about one piece of text. This card characterizes a
person across their whole history on the platform, on every share of their profile, which is closer
to the fingerprint and archetype surfaces I already flagged as the second-worst exposure in the
tier-label analysis, now made durable, cacheable, and off-platform on top of what that analysis
already covered. `apps/web/CLAUDE.md`'s locked rule forbids this outright regardless of ranking.
What raises this file's priority over the comment route is that `circulation` confirms it is
already wired: `page.js`'s `generateMetadata` sets `twitter: { card: 'summary', ... }` explicitly,
so unlike the comment card this route was built to be seen, not deferred. Fix it before the comment
route if the two cannot both land in the same pass.

## `_recovered-next/app/api/debug/profile/[handle]/route.js`

Verdict: drop. Read in full, 74 lines. This is the one ruling in this file with no adapt option.

Two separate disclosures, not one, and I want to name both rather than let the more dramatic one
crowd out the other. First, an infrastructure fingerprint: `env_check` (lines 18-24) returns the
full live `SUPABASE_URL` and, from `SUPABASE_SERVICE_KEY`, its length and first twelve characters
(line 23). That is not the secret itself, but it is a live, repeatable oracle for confirming a
guessed or partially-recovered key against the real one, and it is a disclosure no commit scanner,
no `git log` audit, no gitleaks sweep will ever catch, because the value never touches a commit,
only an HTTP response generated fresh on every request. Second, and separately actionable regardless
of what a court makes of the first: `sample_handles` (lines 45-50) and the two lookup blocks (lines
52-64) hand back `ghost_member_id`, `handle`, and `display_name` for ten real contributors, and any
guessed handle beyond that, to anyone who sends a GET with no authorization header of any kind. That
is personal data of named, real people, not infrastructure metadata, disclosed to the entire
internet.

**Under the statutes I track, with the limits of what I can say plainly stated:** I am not
confident enough in any specific state's breach-notification threshold, including Arizona's A.R.S.
18-552, to say this specific field combination, a UUID plus a handle plus a display name, crosses
that statute's covered-data-elements line, and I am not going to guess at a question that needs a
second, closer read of that statute against this exact disclosure. What I can say without that
gap: this is squarely the shape of unreasonable-security exposure FTC Act Section 5 enforcement has
historically targeted, an operator representing itself as handling member data responsibly while
running a live, unauthenticated endpoint whose entire design is to bypass row-level security with
the service-role key and hand the results to whoever asks. Independent of any statute, this also
sits inside my own charter's language on its own terms: a credible, already-documented risk to a small,
named community whose members know each other, sitting unfixed rather than decided before anything
arrives.

**Whether it may exist in the repository at all: no, not under `apps/web`, in this form or lightly
adapted, ever, in any environment including preview and staging deploys.** Its own docblock states
the intended lifecycle and the platform did not follow it: "Delete this file once Path C is fully
stable." It was not deleted, and `security`'s read confirms it shipped live, in deployment
`dpl_3ZRBaGX4rKEUnuc87zAm7YHHB7VQ`. That history argues against porting this more carefully rather
than for it: "temporary, will delete later" already failed once on this exact file, the strongest
available reason not to create a second occasion for the same drift. A properly access-gated
internal tool, checked at build or run from a terminal against `.env`, serves every legitimate
purpose an adapted version could, without ever being an HTTP route. Designing that replacement is
`security`'s and `builder`'s call, not mine; my ruling is
limited to this file, in this shape, and it does not port.

One recommendation adjacent to my mandate rather than inside it: this file already sits in
`_recovered-next`, which is tracked in this repository today, separate from whether it is ever
copied into `apps/web`. `_recovered-next` is not served, so its presence there is not itself a live
HTTP exposure the way a copy under `apps/web/src/app` would be. But `security`'s findings and this
position now hold the full text and every consequence of it, which is a sufficient record. I would
recommend to the convener that the source copy be removed from the repository, including history,
once whoever owns retention decides the record filed here and in `security`'s read is enough to
build from. That is not a ruling; it is outside what this seat decides alone.

## `_recovered-next/lib/theme/dialecta-dev-admin.jsx`

Verdict: rewrite. The surface is kept, the code that decides who may act on it is not. I read the
file's header, its full `TABS` and mount logic, and did a targeted read of `MembersSection` (lines
971 to roughly 1233 per `security`'s line count, which I independently confirm at the specific
lines cited below); I rely on `security`'s full 2,367-line read for the exact mechanics of
`GrantRoleModal` and the admin mutation call sites I did not personally trace line by line. Marking
that split here rather than presenting a full read I did not do.

Two independent problems, not one, and neither is fixed by an import or a token pass, which is why
this is rewrite rather than adapt.

**The member directory ships full PII to the browser to filter client-side, confirmed independently
in my own read.** Line 981 fetches `/api/admin/members?member_id=` and line 991's `data?.members ||
[]` is the entire array. My own grep confirms the fields: line 1001 filters on `m.email`, line 1002
on `m.location`, line 1033's placeholder reads "Search name, email, location…", line 1144 renders
`{member.email}`, line 1186 renders `{member.location}`. This is the plainest data-minimization
violation of anything named here, and it needs no contested legal theory, only the same principle
my CTDPA position already states for storage, applied to transport: an admin searching for a member
does not need every member's email and location to arrive in their browser process before the
search box has been touched. A server-side search endpoint answers the same feature without putting
a scrapeable, devtools-visible copy of the full roster on every admin's machine on every page load.

**Every authorization decision in the file runs in the browser, off a value the browser was
handed.** `security`'s full read, which I adopt rather than re-derive: `memberUuid` arrives as a DOM
attribute with no session behind it, every tab's visibility and every mutation gates on capabilities
read from one unauthenticated `fetch`, and the `GrantRoleModal` path can be walked from an
unauthenticated `GET /api/profile/_list` (which hands out every contributor's id) to a `POST
/api/admin/team` role grant carrying nothing but that id as proof, the same shape already confirmed
exploitable on the comment-write path. I am not the seat that owns whether that control holds under
load or under a specific attack; `security` owns that. I own whether it is the right control to
owe, and it is not. A role-grant surface the platform built, wired to a mutation the platform built,
structured exactly the way Roommates.com's material-contribution test asks about, a mandatory,
platform-authored decision point rather than freely offered speech, is squarely inside negligent
design exposure whether or not anyone has yet walked the path end to end. An exposure this specific,
already found and filed, is a worse fact in any later dispute than the same gap discovered fresh,
because it goes to notice: the record now shows the platform knew.

**Split the file rather than answering it as one piece.** The presentational shell, the tab
structure, the `ROLE_TINTS` design, the card layout, ports once it is rewired to call
server-verified endpoints instead of trusting a client-held capabilities array. The fetch-and-trust
logic sitting in every handler, the part that currently decides who may see the member directory,
who may grant a role, and whose name a mutation is attributed to, does not survive the cut. That
logic has to be replaced with routes that verify a real session server-side, which is a different
program from what is on disk today even where the JSX around it barely changes.

**This principle is not scoped to one file, and I want to say so rather than let it read that way.**
`security`'s tree-wide count puts 19 of 28 prop-receiving files in `lib/theme/` in the same "trust
decision" bucket dev-admin sits in: `dialecta-editor.jsx`, `dialecta-discourse-layer.jsx`,
`dialecta-profile.jsx`, `dialecta-private-draft.jsx`, the three notifications files,
`dialecta-nomination-panel.jsx`, `dialecta-admin-resetup-maps.jsx`, `dialecta-admin-repolish.jsx`,
`dialecta-profile-settings.jsx`, `dialecta-profile-edit.jsx`, `dialecta-profile-order.jsx`,
`dialecta-opinion-map-placement.jsx`, `dialecta-quotes-app.jsx`, `dialecta-profile-data.js`, and
`dialecta-quotes-data.js`. I have not personally read all eighteen and this extension is inherited
from `security`'s classification, not independent verification of each file, so treat it as
provisional at the individual-file level. But the rule itself is not provisional: any file in that
bucket gets the same verdict dev-admin gets, rewrite the trust logic, keep the surface, for the same
reason, because the underlying legal question, is a mutation attributed to an unverified identity,
does not turn on which component the mutation happens to sit in.

## `_recovered-next/lib/theme/dialecta-tier-capabilities.js`

Verdict: as-is for the file. A separate, named precondition for when it may be wired live. Read in
full, 62 lines.

The brief's question folds two different acts together, and separating them is the entire answer.
Deciding a number and charging it are not the same event, and only one of them needs the missing
documents. `docs/plans/ROADMAP.md` already treats them as different in its own phase plan without
stating the rule: treasurer's Phase 2 recommendation is to decide the Underwriter price early
"because deciding a number is free," while Phase 6, charging, is gated behind Phase 5 and sits after
Phase 4, the Pact, where the missing terms belong. My ruling makes explicit what that sequencing
already assumes.

This file itself does not even carry a price. `getTierCapabilities()` is a lookup table,
`max_candidates` and `polish_runs` keyed on a `subscription_tier` string supplied from elsewhere.
Nothing in these 62 lines moves money, asserts a contract term, or needs a design-token or import
fix. It ports unchanged.

What may not happen before `docs/plans/ROADMAP.md` Phase 4's missing documents exist, acceptable
use, content licence, liability limit, governing law, plus a privacy notice per my own standing
CTDPA recommendation regardless of statutory trigger: `profile.subscription_tier` may not flip to
`'pro'` as the result of an actual charge, and the free tier's limits may not be enforced against a
real member as a monetized restriction. A capability gate with no contract behind it is not itself
a terms problem. A capability gate that is the mechanism by which the platform withholds something
a real person paid for, with nothing written down about what they bought or what happens if it
breaks, is exactly the shape my charter's veto on taking payment before terms exist names.

One more precondition this file's own docblock surfaces and `security` confirms has no answer yet:
lines 7-8 say the server-side mirror "likely" lives in `api/_subscription-tier.js`, and `security`
found no evidence it exists. Until a server twin enforces these limits, the free tier's
cap is exactly as binding as a browser's willingness to obey it, which means there is no real
monetized restriction yet to have a terms problem about. That changes the moment the server
enforcement ships, not before, so the precondition above attaches to that moment, not to committing
this file.

**Answering the roll-call's leftover question directly, since this file is its natural home:** the
Underwriter badge and Charter language treasurer wants priced now does need terms taken by an
affirmative act at signup, not a footer link. Nguyen v. Barnes & Noble is binding rather than
persuasive in Dialecta's home circuit, confirmed in my own corrected tier-label position, and a
footer link does not bind under it. The Pact, ADR-004's § VIII, is already the vehicle this
platform uses for exactly this kind of affirmative-act consent, already carries a signature and a
recorded name, and already absorbed one new question this same day, the visibility choice. Adding
the payment terms to the same ceremony, rather than inventing a second consent flow, is both the
cheaper build and the one that matches the pattern this platform has already chosen for everything
else that needs a real yes.

## Scope of the cuts, against Dan's position

Dan's position is to port as much as possible, because months of work sit in the layouts, the
colors, the papergrain, the wood, and starting over is a real cost, not a hypothetical one. Nothing
in this file argues against that. Read against the six items named here: three port by a named
line-level cut inside files of three hundred to four hundred forty lines each, comment and
contributor OG images and the comment fetcher; one, the tier-capabilities file, ports whole and
untouched; one, dev-admin, keeps its surface and loses its auth layer, a rewrite the brief itself
invited rather than a refusal; one, the debug route, does not port at all, seventy-four lines built
for a diagnostic purpose its own docblock already said to delete. Measured against the 38,300
portable hand-written lines the framing doc counts across the whole recovered tree, the three
line-level cuts remove a tier import and two render sites, a few dozen lines total. That is what
"port as much as possible" looks like once a liability read is applied precisely rather than
categorically: it finds the sentence, not the file, everywhere the sentence is separable from the
file, and names the two places, one file, one layer of another, where it is not.

## Where this needs a lawyer

Two questions from this file specifically, beyond the ones already standing in my prior positions.
Whether the `ghost_member_id` plus `handle` plus `display_name` combination the debug route
disclosed meets any state's statutory definition of personal information for breach-notification
purposes is a reading of specific statutory text against a specific field combination that I have
not done today and should not guess at. And whether a demonstrated, filed, unfixed authorization gap
like `dialecta-dev-admin.jsx`'s role-grant path changes an insurer's view of coverage, or changes
what "known circumstance" disclosure a media liability or tech E&O application would require going
forward, is a policy-wording and disclosure-timing question for the broker, not something reading
the code answers.

One item the roll-call named that this file does not resolve and should not pretend to: whether
media liability insurance has been priced against this specific plan. It has not, so far as any
source in this tree shows, and pricing it stays open, separate from today's port ruling, which is
about what may be committed and served, not about what coverage sits behind the whole platform once
it is.

## Rebuttal

**Philosopher's third file.** Confirmed: `get-moment.js` lines 162-171 build `tier_promoted`. Its OG route carries the same year-long cache header I flagged on the comment card. My first question, does it publish a named person's platform characterization without basis, draws no exception for self-chosen sharing. The test would have caught it. What missed was scope: I ruled only the files my brief named. A rule written "ever" cannot depend on a brief naming every instance. Amend the process: run the five questions against every share card.

**Migrator's read of `comments`.** Confirmed: SELECT is owner-scoped only, no update policy exists, so no non-author can read any comment today. That closes the exposure I named, so the card can't be tested against real rows yet. My precondition belongs on the policy, not `get-comment.js` alone. It must bind whatever public read policy gets written next, failing closed on `status` and `final_tier` together, or a plain `status = 'published'` predicate reopens the same gap for every caller.

**The debug route as evidence.** Reread in full: `env_check` and the profile lookups are queries, not data. Both leaked once, live, in deployment `dpl_3ZRBaGX4rKEUnuc87zAm7YHHB7VQ`. Committing the source doesn't repeat that; the text holds no secret. But it sits at a valid App Router path. Any build that globs that tree with real credentials reactivates it unchanged. Evidence status excuses the commit. It doesn't excuse a live route left in place; strip the handler or rename it out of routing first.

**Treasurer's fifty dollars.** The number doesn't move my ruling; the documents do: acceptable use, a content licence, a liability limit, governing law, and a privacy notice, through the Pact's signature, and only charging waits on them. Treasurer's Vercel point binds earlier, on infrastructure terms, not member terms; neither substitutes for the other.
