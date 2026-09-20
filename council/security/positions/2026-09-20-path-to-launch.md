# Position: what must be true before the first stranger arrives

**Seat:** security. **Written:** 2026-09-20, for the path-to-launch debate. **Status:** advisory.
Nothing here is decided; Dan decides.

## Brief

The single control that must exist before the first stranger arrives is closing
`profiles.ghost_member_id` as a public credential, because it is the one path reachable today with
no signup, no session, and no phase boundary standing in front of it. `api/comment.js` takes
`member_uuid` from the request body and checks only that it is a non-empty string, line 123, then
matches it against a column `anon` can already read, since `profiles_select` runs `USING (true)`.
The database publishes its own proof of identity. A matched post runs on the service key, so RLS
never sees it, and immediately writes `axis_events` against a named person's fingerprint. That is
live now, not at launch.

## Body

**The comment hole is a today gate, not a launch gate.** Nothing about it depends on which phase is
running. The precondition is a public SELECT and a POST, so it was already reachable on day one,
before any of the 269 visitors, and stays reachable through every phase in `launch.md` unless
something closes it by name. I would place it ahead of phase one, as a condition on leaving the API
reachable at all, not one line item inside stop the bleeding.

**The containment is a column default, not a control, and it has an expiry date.** `status`
defaults to `pending_review` and the read policy filters on `published`, so a forged comment sits in
the corpus without reaching the public page. That holds only because nothing promotes yet. The Wait
Window and Stage 2.5 pipeline ends it by design and has no reason to notice, because from its own
side it is promoting comments exactly as intended. Whichever mission ships that pipeline should
carry the comment hole fix as a named entry condition, not inherit a default that quietly stopped
applying.

**The claim token has to land before P0-6 ever executes, not before launch, and not behind the
provider debate.** `auth.users` is empty today, so the takeover path is prospective and this is the
cheapest it will ever be to close. M1 already frames the ordering correctly: the claim token work
starts first and is owed whatever P0-D2 decides. The plan should state that as a hard constraint on
P0-6, since a mission entry line is easy to satisfy in spirit and miss in sequence.

**Three traps in one day, one cause: a source's account of itself was trusted over what it does.**
Next.js's current docs describe `proxy.ts`, a name that arrived in 16.0.0 and never fires on this
app's 15.5.25. `information_schema.role_table_grants` reported an empty database because it only
shows a role's own grants, which read as closed when every table was open to `anon`.
`identity_data.email_verified` looks like the provider's claim and is a normalized field most
providers never touch, stored false by absence rather than by fact. None of the three raised an
error. The plan should require that any phase exit claim about a security property name how it was
checked, a live query or a test, never a doc or a field name.

**A wasted shot and a dangerous arrival are different failures, and the plan prices them as one.** A
wasted shot is reversible: the product does not land, the visitor leaves, tomorrow looks the same. A
dangerous arrival writes something that outlives the visit, a forged comment under a real name, an
uncapped classification spend, later an account takeover, and none of it requires the visitor to be
impressed, or even to be a person rather than a script. Phase three, make it good, answers the first
kind. It does nothing for the second, because the second was never a polish failure. I would not let
either phase wait on the other.
