# Builder position: is "a week or two" survivable?

## Brief

"A week or two" does not survive contact with the code. My estimate: 6 to 10 weeks of
focused work, not 1 to 2. Strongest evidence: the whole current app, all 315 lines of it,
is smaller than one recovered file. `profile/[id].js` alone is 1,880 lines and multiplexes
eleven operations behind a single path via `req.method` and an `id` sentinel. The 52 figure
also undercounts: 38 are real routes, 14 are shared helpers, and the 38 route files average
289 lines each, roughly ten times denser than anything built so far. Auth, sanitization, and
moderation, the pieces every write path depends on, exist in neither codebase yet.

## The decomposition

Not 52 units of equal weight. Eleven files (`admin/articles`, `admin/members`,
`article/classify-order`, `article/publish`, `article/repolish`, `article/submit`,
`article/upload-image`, `article/[id]`, `contributor`, `profile/[id]`, plus `_ghost-admin`
itself) are built around Ghost as the system of record. Ghost is retired, so these are not
ports, they are rewrites that borrow the recovered file only as a reference for business
logic. `quotes.js` (719 lines) is itself five sub-routes collapsed into one function to
dodge Vercel's old function ceiling; `profile/[id].js` is eleven. Seven files
(`admin/pulse`, `admin/team`, `admin/member-tier`, `admin/feedback`, `admin/feedback/[id]`,
`article/repolish`, `article/admin-resetup-maps`) are admin-only and can wait, or run
through Supabase Studio directly at launch. `webhooks/member-added.js` is dead outright: it
fires on Ghost membership, which will not exist. `robots.js` and `sitemap.js` are the cheap
end: Next.js ships both as file conventions since v13, apps/web has neither file today, and
circulation already confirmed zero new dependency cost. That leaves the load-bearing
middle: `comment.js`, `comments.js`, `comment/[id]`, `comment/[id]/nominate.js`,
`classify.js`, `article/submit.js` and `article/publish.js` minus their Ghost calls, and the
six client islands the mandate already names, none of which have a line of component code
today beyond a README.

## The minimum cut

If a week or two is the real budget, the honest minimum is what exists now, finished: the
read-only front page and article view, sanitized, on design tokens, voice-checked,
accessible. No comments, because comment auth cannot be built without the session and
claim-token work landing first, and that alone is most of a two-week budget. No composer,
no votes, no fingerprint, no opinion maps, no admin. That is not a smaller Dialecta.
`_recovered/CLAUDE.md` calls the classification engine, the fingerprint, and the growth
layer downstream of the platform's founding principle, not optional add-ons. Cut to two
weeks, Dialecta launches as a blog with no discourse layer, a different product than the
one being described as exciting and engaging.

## What the recovered source buys

It shortens the parts that are logic, not trust: the classification prompts, the axis and
fingerprint weighting, the malleability-window rule, the moderation state machine shape.
That work already happened and does not need re-deriving. It does not shorten the parts
that are trust: `comment.js`'s own header explains member identity comes from
`{{@member.uuid}}`, a value Ghost's server injected into the page, so "a caller cannot
spoof identity." Ghost is gone. Ported as is, that code reintroduces the exact spoofing
hole it was written to prevent, on a foundation that no longer holds. It buys nothing for
UI: apps/web has zero component code, the recovered app was Handlebars with injected React
islands, a different rendering model, so the client islands are new builds against the
design spec, not ports.

## Not handler-count work

The claim token is new identity architecture: a table, an issuance flow, gating on
`email_confirmed_at` with a documented Supabase quirk to route around, already scoped in
`phases-and-missions.md` as its own multi-day item citing a USENIX paper. It has no
handler-count analog because it gates every write handler rather than being one.
`getTierCapabilities` has zero callers anywhere, including inside `_recovered` itself;
`_subscription-tier.js`, which wraps it, is dead weight nothing imports. That is a
five-minute delete or a real decision about tier gating, not a port. The axis-mapping
signature change is a contract fix that every one of the four files importing
`_axis-mapping.js` must agree on before any of them ship. None of this shows up if you
count 52 files and divide.
