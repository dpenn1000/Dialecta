# ADR-002: Supabase Auth is the one identity
*2026-09-19. Status: Decided.*

## Question
Which system owns who a contributor is. Blocked P0-4 and every table keyed on a person.

## Options considered
| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| Ghost members (status quo) | None | No server-side join, no RLS, trust the browser's member id | Votes, aspirations, snapshots done safely |
| Supabase Auth | Login pages, member re-invite, profile trigger | None | Nothing |
| Third-party auth (Clerk, Auth0) in front of Supabase | Vendor and a second user table to sync | Two sources of identity | Owning the login UI fully |

## Decision
Supabase Auth, magic link plus Google, with `profiles.user_id` referencing `auth.users`. `auth.uid()` in RLS is what lets every engine feature ship without a service-role key in the request path.

## Consequences
- Foundation migration already keys on `profiles.user_id uuid`; `ghost_member_id text` stays for the import.
- P0-6: the 14 Ghost members are matched by email on first sign-in and linked to their existing comments and profile rows.
- Login UI is ours: `/login` in `apps/web`, styled from the design spec, no vendor widget.

## Specs touched
- docs/Dialecta_Data_Architecture.md, "Identity Types": Phase 2 (Supabase-native uuid) is now the only phase.
