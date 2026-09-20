# Position: does a familiar login increase arrival, or is that assumed

**Seat:** circulation. **Written:** 2026-09-20, against the convener's reframe of P0-D2.
**Status:** advisory. Nothing here is decided.

## Brief

No independent evidence shows social login increases signup completion. The figure in circulation
traces to a 2011 vendor survey of stated preference; the one peer-reviewed study measures attitude,
not behavior; real company results are thin and cut both ways, including one where social login
raised signups but lowered paid conversion. Dialecta has zero signups ever: there is no funnel to
improve, only one to build and then measure honestly. Facebook is 100 percent of non-direct
arrival, which argues for testing Facebook login, not assuming it works: arrival and authentication
are separate decisions, and pairing both to one platform concentrates risk. Reddit fails a lower
bar: zero arrivals. Every added provider is a consent screen; choice there is not free.

## What the evidence actually is

Janrain, which sold social login, commissioned a 2010-2011 survey finding roughly three in four
consumers preferred it to a password: stated preference, fifteen years old, from a company selling
the alternative, still the root of today's recycled lift figures. The one peer-reviewed study,
Gafni and Nissim, surveyed 101 users on attitude: convenience encourages, privacy and security
inhibit. Intention, not a signup count. Real company results cut both ways: MailChimp
measured a 3.4 percent lift, then pulled the feature over branding; Magnetiq got more raw signups
through social login and fewer paid conversions than through its own form, the result closest to
Dialecta's business. Corbado, which sells the competing technology, concluded in 2026
that published figures mostly trace to interested parties. Sourcing:
`research/2026-social-login-conversion-evidence-review.md`.

Dialecta has nothing to correct that against: 269 visitors, 6 real people, 0 rows in `auth.users`,
ever. There has never been a signup flow, so there is no rate to improve, only one to produce once
P0-4 ships and someone real tries it. "Social login increases our signups" is a hypothesis to test,
not a benefit already banked.

## Facebook, argued both ways

Facebook is 100 percent of Dialecta's non-direct, non-personal traffic, this seat's own measured
finding. Read one way, that argues for Facebook login: a reader already inside a Facebook session,
often its in-app browser, clicking a friend's share, has the shortest path from click to comment if
the credential is already open. Read the other way, it is a category error: arrival answers how a
stranger found the article, authentication answers how they prove who they are once they act, and
clicking a shared link is not evidence about which login button that person trusts. I land on the
second reading, with one addition that is mine: Facebook is already this seat's largest
concentration risk on arrival (`research/2014-metafilter-acquisition-concentration.md`). Making it
the login too does not diversify that risk, it doubles one platform's leverage over Dialecta instead
of spreading it.

## Reddit fails a lower bar

Reddit fails on this seat's own terms first. Zero measured arrivals against
Facebook's 54: no "the audience is already there" case exists. It is not a native Supabase provider
either; it needs a hand-built OAuth integration for a channel that has sent this site nobody
(`research/2026-supabase-native-oauth-providers.md`). Reddit's OAuth is built for apps acting on a
Reddit account, not marketed as a consumer identity button, and its culture runs pseudonymous by
default, the opposite of the accountable presence a comment section wants. Confusing an untried
channel with a credential system is the same error the industry makes with Facebook, aimed at a
provider with none of Facebook's evidence to even misread.

## The cost this seat owns

Every added provider is one more consent screen between a stranger and their first comment, one
more brand to trust, one more redirect that can fail silently. Choice is marketed as a benefit; at
the exact moment someone was about to type a comment, it is a decision to make before the one they
came to make, and each option is a chance to leave instead of writing it.
