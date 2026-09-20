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

## Providers are not equivalent, and now this is measured

Settled 2026-09-20 by reading `supabase/auth` at `2e9ce6c8`, not by reading the docs, which do not
answer it. Full note: `2026-supabase-automatic-identity-linking.md`.

**The gate exists.** `DetermineAccountLinking` in `internal/models/linking.go` builds its match pool
with `if email.Verified || config.Mailer.Autoconfirm`. When that pool is empty the function always
returns `CreateAccount` and never `LinkAccount`. An unverified email cannot silently attach itself
to an existing account. The call site in `internal/api/external.go` adds no check of its own, so the
gate lives in exactly one place.

**The gate is only as honest as the provider adapter feeding it**, and that is where the providers
separate into three groups.

| Group | Providers | What the adapter does |
| --- | --- | --- |
| Reads the real signal | Google, GitHub, GitLab, Discord, Keycloak, Azure, the OIDC paths for Slack and LinkedIn, generic and custom OIDC | Passes the provider's actual verification claim through |
| Hardcodes verified | Facebook on both the Graph API and Limited Login paths, X, legacy Twitter, Apple's native ID token path, the classic REST paths for LinkedIn and Slack, Notion, WorkOS, Snapchat, Twitch, Figma, Fly | Sets `Verified: true` regardless of what the provider reported |
| Hardcodes unverified | Spotify | Sets `Verified: false`, so it can never trigger a link at all |

Dan named three providers. One is in the first group and two are in the second.

Two details worth carrying. Apple's own ID tokens carry a real `email_verified` claim and the native
path never reads it, which makes Apple worse than it needs to be rather than worse by necessity.
Azure assumes verified when its `xms_edov` claim is absent entirely, which is a softer version of
the same thing.

**A caveat I am holding deliberately.** Hardcoding verified is not the same as the email being
unverified. Supabase is assuming those platforms only ever hand out confirmed addresses, and that
assumption may hold. X's adapter carries a comment citing its own `confirmed_email` field as
justification. Facebook's has no comment at all. Whether the assumption is true lives outside
Supabase's source and is not established here. The accurate statement is that **Supabase does not
check, and whether the provider does is unverified**, which is weaker than saying the email is
unverified and is the version I will defend.

That distinction is the difference between a finding and an accusation, and it is also the thing a
second sprint is settling from each provider's own developer documentation.

**What does not depend on any of this:** Google's consent screen is the one surface ADR-002 accepts
not owning, and each further provider is one more. The login UI being ours is a locked consequence
of that ADR, and social buttons are the part of it that is not.

## Can the fourteen be protected whatever Dan picks

Yes, and the reason is a boundary that has not been named yet: **linking is Supabase's decision, but
the claim is ours.**

Supabase decides whether two identities are the same user. P0-6 decides whether a user is one of the
14 Ghost members and hands them an existing profile with existing comments. Those are two different
decisions, made by two different pieces of code, and only the second one is in this repository.
Whatever Supabase does or does not check at the identity layer, the moment a new `auth.users` row is
matched to a member's profile is Dialecta's own code running, and that code can refuse.

Measured 2026-09-20: `auth.identities` carries `provider text not null` and
`identity_data jsonb not null`. The provider that asserted an identity and the claims it made are
both readable at claim time. Which claims land in `identity_data` varies by provider and should be
confirmed against a real sign in rather than assumed, but the column is there and it is not empty.

Three controls, ranked, none of which depends on the provider list.

**1. Stop using an email address as the claim.** Issue each of the 14 a one time claim token out of
band, and require it on first sign in to take over a legacy profile. The token is a secret Dan
issues; an email address is a fact an attacker can assert. This is the strongest of the three
because it does not depend on any provider telling the truth, and it is the only one that is still
correct if a provider's verification is itself compromised. It is also a small build: one table, one
column, one check.

**2. Gate the claim on the provider's own verification, checked here rather than trusted upstream.**
At the moment of claim, read `auth.identities.provider` and `identity_data` for the identity making
it, and refuse the legacy profile link unless the provider asserted a verified email. This works
even if Supabase's automatic linking does not check, because it runs later and separately. Its limit
is that it trusts the provider's assertion, which is exactly the thing that differs between Google
and the weaker providers, so it narrows the hole rather than closing it.

**3. Hold the second provider until the 14 have claimed.** Launch with one provider that verifies
email, let the legacy members claim, then widen. This is a hedge rather than a control. It shrinks
the window and does nothing for a member who never claims, and the ones who never claim are the ones
nobody is watching.

**What I would put in front of the council: 1, with 2 as defence in depth.** Together they make the
provider decision a question about new contributors rather than about the 14, which is the point of
the peer's ask. A control that holds whatever Dan picks is worth more than a finding that narrows
what he can pick.

Neither depends on the `email_verified` research landing. Both can be specified now and neither
changes shape when it does.

## What I argue

**Google is fine and this seat has no objection to it.** It reads the real claim, it needs no
mailbox round trip, and the designer's note already shows it is the path with the fewest ways to
fail for the 14. If the answer is Google plus the claim token, nothing here is contested.

**Facebook and X carry a specific cost, and it is not paid by the people who choose them.** Because
linking is by email, enabling either sets the verification floor for every account on the platform,
including contributors who only ever use Google and including the 14 who have not signed in yet. A
contributor cannot opt out of a provider they never touched. That asymmetry is the argument, rather
than any claim that Facebook or X are careless.

**The claim token is required either way, and more so with Facebook or X in scope.** Controls that
read a verification claim are reading a hardcoded constant for those providers, so the defence in
depth control degrades to nothing exactly where it is most needed. A token does not.

**Three things to settle in the build regardless of the provider list:**

- **Read `Mailer.Autoconfirm` off the live project and write it down.** It sits in the same
  condition as the verification check, so turning it on bypasses the gate for every provider at once,
  Google included. Nobody would enable it for this reason, which is precisely why it should be
  recorded before somebody enables it for another one.
- **Confirm what each provider actually puts in `auth.identities.identity_data`**, by one real sign
  in per provider on a project that is not production. This cannot be read out of documentation and
  should not be assumed. It is the prerequisite for the defence in depth control being buildable
  rather than plausible.
- **Look at `GOTRUE_EXPERIMENTAL_PROVIDER_LINKING_DOMAINS`.** It exists in the source as a way to
  isolate providers from a shared auto linking pool, which would let Facebook sit alongside Google
  without sharing a match domain. Whether it is exposed on hosted Supabase at all is unknown and no
  dashboard reference was found, so ask Supabase rather than planning around it.

**Where I would land if asked today.** Google now, with the claim token. Add a second provider when
somebody can name the contributor it brings who would not otherwise arrive, and prefer one from the
first group when that day comes, since GitHub and Discord read the real signal and suit a discourse
platform's audience at least as well as Facebook does. That is a preference and not a veto; the
reach argument belongs to `designer` and `treasurer` and I have not costed it.

**What would change my position.** If the second sprint establishes that Facebook and X do only ever
release confirmed addresses, the hardcoding stops being a hole and becomes an undocumented
dependency on provider behaviour, which is a weaker objection and a fair one to overrule. I will say
so plainly if that is what it finds.

## What I will need decided

| Question | Why it matters | Who |
| --- | --- | --- |
| Does this proceed as a new ADR superseding 002 | The method is locked and the frame says a method change is an ADR, not a debate | `decider` |
| Which providers, ranked, rather than a set | The floor is set by the weakest one enabled, so the marginal provider is the decision, not the list | Dan, with the council |
| Whether P0-6 keeps the email match | It is the difference between an account merge and an account takeover | `builder`, `migrator` |
| Whether automatic identity linking stays on | Supabase's default, and the single highest leverage switch here | Dan |

*Position opened 2026-09-20. Incomplete by design; the two open sections are marked.*
