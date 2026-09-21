# Two vendor rulebooks, and each one's own version number disagrees with itself

**Source:** GitHub REST API, `api.github.com/repos/<owner>/<repo>`, fetched 2026-09-21, for
`supabase/agent-skills` and `vercel-labs/agent-skills`. Individual rule files read through the
GitHub Contents API (`.../contents/<path>`, base64-decoded), same date. Where a claim needed a
second source, `.release-please-manifest.json`, `CHANGELOG.md`, and the repositories' own tags and
releases, also read through the API, same date.

**Note context:** filed during the architect seat's arming sprint, ahead of its first
`/dialecta-research` run. Not tied to a reading-list lead; `reading-list.md` does not carry this
topic yet.

## Both exist, health first

| Repo | Stars | Pushed | Days stale | Archived | Open issues | Licence | Created |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `supabase/agent-skills` | 2,639 | 2026-08-12 | 40 | No | 481 | MIT | 2026-01-16 |
| `vercel-labs/agent-skills` | 31,407 | 2026-08-28 | 24 | No | 172 | **none** | 2025-12-08 |

"Days stale" is fetch date minus `pushed_at`, not `updated_at`: `updated_at` moves on stars and
issue activity alone and reads as today for both, which is why `pushed_at` is the field this seat's
own tool-landscape note already trusted.

Open issues against stars: 18% for Supabase, 0.5% for Vercel. That gap is not neglect on Supabase's
side by itself. Its newest issues get same-day attention (five different `user-feedback:`-tagged
issues, an automated intake pattern, all touched within 26 hours of each other on 2026-09-19 and
09-20), while several from February and March, such as #49 ("CLAUDE.md duplicates SKILL.md, wastes
context tokens") and #50 (a missing rule index in the exact skill this note reads), have zero
comment or update since the day they were filed. Recent and old issues are not treated the same way.

Vercel's licence field reads `null` from the API, and it is not a metadata gap: there is no
`LICENSE` file in the repository root at all, confirmed by listing it directly. Supabase's repo
carries a 1,065-byte `LICENSE` file matching its MIT declaration.

## What each repo ships

`supabase/agent-skills` ships two skills: `supabase` (general, v0.1.2, covers every Supabase
product including `@supabase/ssr` by name in its own trigger list) and
`supabase-postgres-best-practices` (the one this note reads in depth, version claimed as discussed
below). `vercel-labs/agent-skills` ships eight: `react-best-practices`, `vercel-optimize`,
`react-native-skills`, `web-design-guidelines`, `writing-guidelines`, `composition-patterns`,
`deploy-to-vercel`, `vercel-cli-with-tokens`. Only `react-best-practices` was read past its README.

## The Postgres skill's rules, counted and picked

Method: listed `skills/supabase-postgres-best-practices/references/` through the Contents API,
kept files ending `.md` whose name does not start with `_` (three do: `_contributing.md`,
`_sections.md`, `_template.md`, all scaffolding rather than rules), grouped the rest by the prefix
before the first hyphen. 31 rule files across 8 categories, re-derived by a short script rather than
by eye and it landed on the same number: `schema` 6, `query` 5, `conn` 4, `lock` 4, `data` 4,
`security` 3, `monitor` 3, `advanced` 2.

Five bear most on Dialecta, which runs Supabase Postgres with RLS on every table, ten Postgres
enums, CHECK constraints carrying value lists, plpgsql functions, foreign keys, and a Next.js server
reading it through `@supabase/ssr`:

1. `security-rls-performance.md`: wrap every `auth.uid()` call in `(select ...)`, and put a
   SECURITY DEFINER helper behind an explicit `auth.uid()` check inside its own body. This is close
   to word for word what `2026-supabase-rls-performance.md` already found from Supabase's
   troubleshooting docs, so it is a second, independent vendor source landing on the same rule.
2. `security-rls-basics.md`, for the opposite reason. Its own worked policy reads
   `using (user_id = auth.uid())`, no `(select ...)` wrap, which is the exact shape rule 1's
   "Incorrect" example names in the same skill, same version. One file in this package contradicts
   another.
3. `security-privileges.md`: least privilege, and `revoke all on schema public from public`. Matches
   `2026-postgres-alter-default-privileges.md`'s anon EXECUTE finding and recommends the same
   durable fix this seat already filed.
4. `schema-constraints.md`: add a CHECK, foreign key, or unique constraint from a
   `do $$ if not exists (select 1 from pg_constraint ...) then ... end $$` block, never a bare
   `ALTER TABLE ADD CONSTRAINT`. The same read-the-catalog-before-you-assert method the baseline
   migration finding needed and did not get.
5. `schema-foreign-key-indexes.md`: Postgres never indexes a foreign key column on its own, and the
   file ships a ready `pg_constraint`/`pg_index` query that finds every unindexed one. Dialecta has
   foreign keys and no filed note has run this query yet.

## The React and Next.js skill, the same treatment

`react-best-practices`, v1.0.0, MIT. Method as above: 70 rule files (`_sections.md` and
`_template.md` excluded) across 8 categories: `rerender` 15, `js` 14, `rendering` 11, `server` 10,
`async` 6, `bundle` 6, `advanced` 4, `client` 4.

That 70 disagrees with the skill's own package about itself. `metadata.json`'s abstract and the
repository's root `README.md` both say "Contains 40+ rules." Only `SKILL.md`'s body text says 70,
and 70 is what a file count returns. Three files in the same repository state the size of
the same directory three different ways, and the one that is right is the one you can count.

No rule names Next.js 16, `proxy.ts`, `dynamicIO`, `"use cache"`, or Turbopack. Searched the 108KB
compiled `AGENTS.md` and all 70 rule titles for each; none appear. On the specific question asked,
this comes back clean: nothing here would fail the way `proxy.ts` already did on this app.

Something adjacent did turn up. `rendering-activity.md` recommends React's `<Activity>`, imported
directly from `'react'`; `advanced-effect-event-deps.md` recommends `useEffectEvent`, same import.
Both shipped stable in React 19.2, released October 1, 2025. On 19.0 and 19.1, the hook exists only
as `experimental_useEffectEvent`, and `<Activity>` is not exported under either name. Dialecta pins
React 19.1. Either rule's code sample, followed as written, would fail to resolve against this app's
actual dependency, the same failure shape as the Next.js version gap, one layer over into React
itself.

Rules that do land on Dialecta's stack as pinned: `server-cache-react.md` (`React.cache()` for
per-request dedup in `apps/web`'s server components), `server-auth-actions.md` (authenticate a
Server Action like a route handler, not like a page render), and `bundle-barrel-imports.md` (import
directly, avoid barrel files), which is the performance-side version of the caution
`2026-duplicate-logic-tool-landscape.md` already raised about `packages/core/src/index.ts`'s
103-line barrel from the dead-export side.

## Frontmatter, next to dialecta-research's own

`.claude/skills/dialecta-research/SKILL.md` carries two frontmatter fields: `name` and
`description`. Both vendor skills add a `license` field and a `metadata` block. Supabase's block
holds `author`, `version`, `organization`, `date`, `abstract`. Vercel's holds only `author` and
`version` in `SKILL.md` itself, with `organization`, `date`, `abstract`, and `references` split into
a sibling `metadata.json`.

`version` is the field this note already caught lying. Supabase's `SKILL.md` says
`version: "1.1.1"`, dated January 2026. `.release-please-manifest.json`, the file that
drives this repository's release tags, says `1.6.0`, and a real tag exists at
`supabase-postgres-best-practices-v1.6.0` on commit `1207767388a0ffb55f21fb4e6988fee96942431d`. The
2026-07-30 commit that raised the rule count and rewrote the description bumped the changelog and
the manifest and left the embedded `metadata.version` string untouched, so the file has been quietly
wrong about its own version since. An in-file version field is not where a pin belongs.

## Recommendation, with the bus factor

Both repos are corporate-backed, not solo maintainers, so bus factor here means organizational
interest rather than one person vanishing. Supabase's signal is the stronger one: MIT licence, a
LICENSE file on disk, a working release-please pipeline with real per-skill tags, and a caught bug
(issue #58, a broken reference link, fixed 2026-04-05) in the exact skill this note read. 481 open
issues is real surface, but the repository is 845KB and the skill itself is 31 short files, readable
end to end in one sitting, which is what this note just did.

Vercel's is bigger and faster-moving (31k stars, a much lower issue ratio) but carries no licence at
all. GitHub's terms let anyone view and fork a public repository; they grant no licence to copy its
text into another project. Reading it and paraphrasing its rules in Dialecta's own words, as this
note does, raises no such question. Vendoring its files into `.claude/skills/` would.

**Verdict: `supabase-postgres-best-practices` is a reasonable install candidate, pinned to tag
`supabase-postgres-best-practices-v1.6.0`, never to the version the file claims about itself.
`react-best-practices` stays a cited reference until Vercel adds a licence.** For citation, pin it
at release `agent-skills-063bee94c3f4df8453406c830b0a7df0f2860278`: Vercel names its releases after
their own commit SHA, so that tag and the content behind it cannot disagree the way Supabase's
semver string did. Either way, installing under `.claude/skills/` sits outside this seat's fence;
this note is the evidence for that decision, not the decision.

## What I did not do

I did not run `npx skills add`, install either package, or execute any of the 101 combined rule
files' SQL or TypeScript samples. I read five of the Postgres skill's 31 rules closely and the rest
by title; I read nine of the React skill's 70 rules closely (the five picked, plus three checked for
the Next.js 16 and React 19.2 questions) and the rest by title and category. I did not open the
other seven skills in `vercel-labs/agent-skills` past their README description.

## Implies for

Practice: a vendor skill's own embedded count or version is a claim, not a fact; check it against
the file listing or the release manifest before citing it, the discipline
`2026-duplicate-logic-tool-landscape.md` already applied to a remembered README claim, now applied
to a claim the file makes about itself. Related: `2026-supabase-rls-performance.md` and
`2026-postgres-alter-default-privileges.md`, which this note's picks corroborate from a second
vendor; `2026-nextjs-boundary-crossref.md`, whose version-gap caution this note extends from
Next.js to React.

*Filed 2026-09-21*
