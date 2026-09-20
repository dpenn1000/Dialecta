# Position: social login, and what email does when it is the join key

**Seat:** security. **Written:** 2026-09-20, at Dan's request, to be argued when the council takes
the build. **Status:** advisory. Nothing here is decided.

Dan asked for familiar credentials: Google, Facebook, X and similar. This seat does not object to
that goal. Reducing the distance between reading Dialecta and writing on it is a real aim and it
belongs to `designer` and `treasurer` as much as to anyone. What follows is what each version of it
costs, so the council argues with the cost visible rather than discovering it in the build.

## First, a procedural point that is not mine to waive

ADR-002 states its Decision as "Supabase Auth, magic link plus Google". The P0-D2 council frame is
explicit about the standing of that: "The method question is settled unless Dan reopens it, and
reopening it is a new ADR superseding 002, not a council debate."

Dan has reopened it. So this is a new ADR rather than a position inside P0-D2, whose open question
is the sign up gate and not the method. Worth saying plainly, because the alternative is a method
change arriving through a debate about something else, and `decider` should see it as what it is.

## The mechanism, and it is the whole argument

Three things in this system join on an email address, and they were designed independently.

1. **Supabase Auth links identities by email.** Its identity linking page states that "Supabase Auth
   automatically links identities with the same email address to a single user", and that on a
   successful link it "will remove any other unconfirmed identities linked to an existing user".
   This is on by default.
2. **ADR-002 makes email the claim on a pre-existing account.** Consequences, verbatim: "P0-6: the
   14 Ghost members are matched by email on first sign-in and linked to their existing comments and
   profile rows."
3. **Whether Supabase verifies the email before linking is unconfirmed.** Neither the Google
   provider page nor the identity linking page states whether a provider's `email_verified` claim is
   checked. This is in verification now and the answer sets the severity of everything below.

Put together, an email address is not an identifier in this system. It is a bearer credential. It
claims an account, and under P0-6 it claims an account that already has comments and a profile
attached to it.

**The consequence is the sentence worth carrying into the council:** once linking is by email, the
security of every account equals the security of the weakest provider that is enabled, not the
provider that account's owner chose. A contributor who signs in only with Google is still exposed
through any other provider that will assert their address.

That is why "Google, Facebook, X" is not one decision with three instances. It is one decision about
the floor.

## What it does to the fourteen

The 14 Ghost members are the sharpest version, because P0-6 matches them by email at first sign in
and they have not signed in yet.

An attacker does not need a victim to have ever used Dialecta. Being one of the 14 is enough. If a
provider can be made to assert a member's address, the first sign in with that provider is matched
to that member's existing profile and comments, which is the design working exactly as written.

Those 14 include the founder, the arm's length reviewers, and whoever else is in the Ghost export.
Their addresses are not secret in the way a password is. For a publication, a contributor's address
is frequently a published fact.

This is not an argument against social login. It is an argument that P0-6's email match and
multi-provider social login are safe separately and hazardous together, and that the pair has never
been considered as a pair because they were decided six weeks apart.

## The state today, which is the good news

The live project holds zero `auth.users` rows, zero `auth.identities`, and no provider has ever been
used. Measured 2026-09-20. The 14 profiles exist with no auth records behind them.

Nothing has to be migrated, nothing has to be unwound, and no contributor has a session to
invalidate. Every option below is open at equal cost right now, and that stops being true on the
first sign in.

## Providers are not equivalent

*In verification. Two sprints are running: one reading the Supabase auth server source to settle
whether `email_verified` gates automatic linking, and one establishing per provider whether an email
is returned at all, whether it is verified, and what review each provider demands. This section will
carry a comparison table rather than an assertion.*

What is already known and does not depend on that research: Google's consent screen is the one
surface ADR-002 accepts not owning, and each further provider is one more. The login UI being ours
is a locked consequence in ADR-002, and social buttons are the part of it that is not.

## What I expect to argue

*Held until the research lands, because the shape of the recommendation depends on whether the
linking check exists. Two branches, both already visible:*

*If Supabase checks `email_verified` and the weak providers are excluded from automatic linking,
this is mostly a question of operational cost per provider and the position is mild.*

*If it does not, the position is that automatic linking must be turned off or constrained before any
second provider is enabled, and that P0-6 should not use an email match at all. The alternative to
an email match is a one time claim token issued to each of the 14, which makes the claim an artifact
Dan controls rather than an assertion a provider makes. That is a small build and it removes the
compounding entirely.*

## What I will need decided

| Question | Why it matters | Who |
| --- | --- | --- |
| Does this proceed as a new ADR superseding 002 | The method is locked and the frame says a method change is an ADR, not a debate | `decider` |
| Which providers, ranked, rather than a set | The floor is set by the weakest one enabled, so the marginal provider is the decision, not the list | Dan, with the council |
| Whether P0-6 keeps the email match | It is the difference between an account merge and an account takeover | `builder`, `migrator` |
| Whether automatic identity linking stays on | Supabase's default, and the single highest leverage switch here | Dan |

*Position opened 2026-09-20. Incomplete by design; the two open sections are marked.*
