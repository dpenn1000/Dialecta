# Position: the provider test, not the provider list

**Seat:** security. **Written:** 2026-09-20, for the P0-D2 login methods debate, reframed version.
**Status:** advisory. Nothing here is decided; Dan decides.

## Brief

The adapter split is a test, not a scorecard: whether the adapter passes a provider's real
verification claim into Supabase's shared linking gate, or hardcodes one. Hardcoding alone doesn't
disqualify a provider. A first-time signup with no existing row to match is unaffected by it;
nothing merges. The cost lands on someone else, once a second provider shares the linking pool
with an honest one, and it keeps landing for as long as both stay enabled, not only during the
fourteen's migration window. Reddit has no adapter in `supabase/auth`, confirmed at the source,
and its own API doesn't carry the claim the generic path would need either. `Mailer.Autoconfirm`
and `identity_data` are two more doors to the same mistake.

## The provider test

Read the adapter, or the generic OIDC path if it has none, for how `Verified` gets set: the
provider's own claim, or a literal `true`. A real claim joins the pool at the cost of its own
code. A hardcoded one belongs only inside its own linking domain, isolated from every honest
provider, so it can never attach to an account a truthful one made. Two questions, not a list:
does the adapter tell the truth, and if not, is it caged.

## Whether hardcoding disqualifies a provider

Not by itself. A new contributor's first sign-in through Facebook or X is unaffected: no existing
account exists to attach a false claim to, so `CreateAccount` fires as it would with a real one.
Nobody is harmed by their own click. The harm lands on whoever else holds that address, two ways.
Forward: someone claims an address they don't control before its owner arrives, and banks it
until the owner signs in honestly and merges in. Backward: a contributor with an honestly-made
account is one Facebook or X sign-in from a stranger merging into it, for as long as both stay
enabled. The claim token closes this for the fourteen, not for contributor fifteen, exposed for
the platform's life rather than a migration window.

## Reddit

Not supported. `internal/api/provider/` at `2e9ce6c8` holds thirty-four files and no `reddit.go`;
`external.go`'s provider switch, the one place a name resolves to a constructor, has no
`RedditProvider` case either, read directly, not inferred from a missing page. The generic
OAuth2/OIDC path wouldn't cover it either: Reddit's API has no discovery document or ID token,
and its field is `has_verified_email`, not `email_verified`. Wired through it anyway, Reddit
lands unverified by accident, not design.

## Does adding providers scale

Both, on different parts of the system. Each adapter is one more piece of OAuth mechanics to
trust, contained to itself: flat. The linking gate is one shared pool by default, so a new
dishonest provider doesn't carry only its own risk: it lowers the floor under every account an
honest provider already made, and every one it makes later, for as long as it stays live. Growth
is a product of accounts times dishonest providers enabled, not a sum of providers added, flat
only if each sits in its own linking domain, capping the damage to people who chose it. Whether
hosted Supabase exposes that isolation is unconfirmed.

## What Dan should never do, regardless of the list

Never flip `config.Mailer.Autoconfirm`. It's read by the identical condition that gates linking
and confirmation, for every provider at once, making Google as dishonest as Facebook the moment
it's on. Never read `identity_data` for verification; it's `false` by construction for most
providers, a confident wrong answer rather than a missing one. Never treat `email_confirmed_at`
as permanent once unlinking an identity ships: `UpdateUserEmailFromIdentities` can null it off
that same dishonest field. And never let email stand in as identity's claim anywhere the
fourteen's token doesn't reach, which today is everywhere else.
