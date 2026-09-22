---
id: 2026-09-21-security-02
type: handoff
from: security
to: [convener]
subject: Trigger EXECUTE revoked, the anon default gap closed, articles gets updated_at
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Three items from the "still open, deliberately" section of `docs/MORNING-AUDIT-2026-09-21.md`,
each designed, none applied. Full method, SQL, verification, and rollback in
`council/security/2026-09-21-trigger-and-default-hardening/` (`README.md` plus three draft
migration files). Read only throughout; no `apply_migration` call was made, and nothing was
written to `mguulnibvzusfvyuowwh`.

1. **The three trigger functions.** `set_updated_at()`, `quotes_set_updated_at()`,
   `profiles_subscription_tier_touch()` still hold EXECUTE for public, anon, and authenticated.
   Confirmed against `pg_proc`/`pg_trigger` that all three fire only as BEFORE UPDATE triggers
   (`profiles`, `quotes`, `aspirations`), none is SECURITY DEFINER, and none is called directly
   anywhere in this repository (grepped for each name and for `.rpc('<name>'` across `apps/web`,
   `api/`, `components/`, `packages/`, `_recovered/`, `_recovered-next/`, `_theme/`; every hit is
   the function's own definition or a document already describing this gap). Drafted revoke closes
   all three roles on all three functions, matching this schema's own precedent for the same
   shape, `check_handle_not_reserved`, rather than the narrower two-role reading the audit's own
   shorthand suggests.

2. **The default privilege gap.** `team/architect/architecture/2026-09-21-rebuild-map.md`'s
   "Functions" row proposes one global revoke of PUBLIC's default EXECUTE on new functions. Read
   `pg_default_acl`: the only entry for functions in `public` is a per-schema grant that also
   names anon (and authenticated, and service_role) by name, set up by Supabase's own project
   bootstrap, not by anything in this repository. Fetched PostgreSQL's own documentation
   verbatim and confirmed the two halves need opposite statement forms: PUBLIC's default can only
   be revoked globally (no `IN SCHEMA`), and anon's can only be revoked per schema (`IN SCHEMA
   public`), because the two grants were made through two different mechanisms. A global-form
   revoke of anon, the natural-looking pairing with the PUBLIC statement, would be accepted,
   would succeed, and would do nothing. Drafted both statements, in their correct, differing
   forms, as one migration. Confirmed not retroactive for the seven functions named in the brief;
   each already carries its own explicit ACL untouched by a default-privilege change.

3. **`articles.updated_at`.** Confirmed zero triggers exist on `articles` today and nothing has
   ever advanced `updated_at` past a row's insert time. Drafted a trigger reusing the existing
   `public.set_updated_at()` (already running on `profiles` and `aspirations`) rather than a new,
   fourth trigger function, which would have been born with the same open default-EXECUTE shape
   items 1 and 2 close. SECURITY DEFINER is not used: the function touches only the row already
   in flight, so there is no privilege gap for it to bridge.

## Not done

Nothing applied; the brief asked for designs, not for landing them.

Whether `authenticated`'s own default EXECUTE on functions should also be revoked. It carries the
same by-name shape as anon's in `pg_default_acl` and would need the identical per-schema form. Not
drafted: out of the brief's stated scope, and every SECURITY DEFINER function shipped tonight that
needs a client role at all ends up granting authenticated anyway, so closing it is a real but
separate decision, not a mechanical extension of item 2. Flagged in that migration's own file and
in the README.

None of the functional checks in the README's Verification section were run. Each is a write
against production (an UPDATE to prove a trigger still fires, or a create-inside-a-transaction
probe to prove a default privilege changed), and this session was reads only. The reasoning behind
each draft is stated as PostgreSQL's documented behavior, not as something measured live, and the
README says so plainly rather than borrowing the weight of a live result it does not have.

## Governing spec

`docs/MORNING-AUDIT-2026-09-21.md`, section 4, "Security, measured rather than assumed", the
"Still open, deliberately" list: the three bullets on the trigger functions, the default
privilege statement, and `articles.updated_at`. Corroborated by `docs/OPEN-ITEMS.md` row 2.3 (the
same trigger-function finding, independently phrased) and
`team/architect/knowledge/2026-postgres-alter-default-privileges.md` (the PUBLIC half of item 2,
extended here to anon).

## Acceptance

Full queries and expected results in the README's Verification section. Summary: after item 1,
`has_function_privilege` reads false for public/anon/authenticated and true for service_role on
all three functions, matching `check_handle_not_reserved`'s current ACL exactly. After item 2, a
function created inside a transaction and rolled back shows EXECUTE true only for authenticated
and service_role. After item 3, `pg_trigger` shows one new row, `articles_updated_at`, BEFORE
UPDATE, enabled.

## Traps

- Item 2's two statements are not interchangeable in form, despite reading almost the same. Swap
  them and both become no-ops.
- Item 2 does not touch `authenticated` by design; see "Not done" above.
- Item 1 deliberately leaves `opinion_map_positions_resolve_identity` alone, as the precedent the
  other two files follow.
- All three items are independent. No ordering requirement between any of them, or against
  anything else applied tonight.

## Do not touch

- `council/security/2026-09-21-breach-body-migrations/`: a separate, still-open item from
  `exchange/open/2026-09-21-security-01`, unrelated to this handoff beyond sharing an author.
- The seven functions named in item 2 (`comment_bodies`, `comment_tiers`, `own_comment_readings`,
  `current_profile_id`, `place_opinion_map_position`, `claim_profile`,
  `get_own_profile_for_comment`): confirmed unaffected, nothing to do to them here.
- `opinion_map_positions_resolve_identity`: confirmed out of scope for item 1, see above.
