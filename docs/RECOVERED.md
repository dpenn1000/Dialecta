# The recovered trees, and the rule for using them

*Written 2026-09-20. Three directories in this repository are recovered evidence rather than this
repository's code. They were gitignored quarantine until Dan said, correctly, that a thing which
exists only on one laptop is not recovered. They are committed now. The quarantine is a rule, not
a gitignore entry.*

## The rule

**Read them. Cite them. Promote nothing blind.**

Every file in these three trees is either production code this repository never had, or an older
generation of code this repository has replaced. None of it has been reviewed. All of it carries
assumptions that are dying, Ghost's session injection most of all.

A file moves out of a recovered tree and into `apps/`, `packages/` or `supabase/` only by being
read, adapted, and reviewed. The failure this rule exists to prevent already happened once in the
other direction: the September migrations were written without knowledge of the live database, and
merging 44 recovered migrations wholesale would be the same mistake pointed the other way.

## What each one is

| Directory | What | Size | Source |
| --- | --- | --- | --- |
| `_recovered/` | **The production API.** 163 files, 52 under `api/` of which 38 are real routes, plus 46 migrations, 50+ scripts and the `opinion-mapper` skill | 1.6 MB | Vercel `dialecta`, deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7` |
| `_recovered-next/` | **The front-end source.** 113 files, 76,674 lines, 51 components under `lib/theme/`, plus a started Next.js App Router tree under `app/` | 6.1 MB | Vercel `dialecta-next`, deployment `dpl_3ZRBaGX4rKEUnuc87zAm7YHHB7VQ`, 2026-05-06 |
| `_theme/` | **The Ghost theme.** `dialecta-theme v1.0.0`, 42 files: 15 Handlebars templates, 9 minified React bundles, a 3,286-line stylesheet | 6.5 MB | Ghost admin export, `www.dialecta.org` |

Full analysis of all three: `docs/SITE-INVENTORY.md`.

## Why they are committed rather than ignored

Each was recovered because something that existed could not be found. The Underwriter tier model,
the canonical axis mapping, a UNIQUE constraint added in April, the Pact, the theme, and then
76,674 lines of front-end source in a fourth Vercel project nobody had mentioned. Six in one day.

Two of the three are retrievable again only while a Vercel deployment stays up and a token stays
valid. The third needed Ghost admin access. **Leaving them gitignored meant one laptop failure
away from repeating every one of those searches**, and the searches were expensive: the front-end
source alone cost an afternoon of the wrong estimate, because `builder` rebuilt `sitemap.ts`,
`robots.ts` and an OG image route that already existed in `_recovered-next/app/`.

Checked before committing: no credentials in any of the three. The only secret-scan hits are the
Postgres role name `service_role` inside grant statements.

## What they are not

They are not a backup of the live site, and they are not current.

`_recovered-next/` is from 2026-05-06 and is five months old. `_theme/` is live today but
Ghost is being retired. `_recovered/` records a deployment whose commit, `53364fa`, GitHub answers
422 for, so it corresponds to no commit in any repository.

`components/` in the repository root is **older still** and is not the source of anything.
Measured: `dialecta-fingerprint-engine.jsx` is 780 lines there against 910 recovered, and
`dialecta-discourse-layer.jsx` is 692 against 1,251. Treat it as a dated snapshot.

## If you need to recover something else

`scripts/recover-deployment.mjs` takes `--deployment` and `--out`, and needs `VERCEL_TOKEN` in
`.env`. `--dry-run` lists without writing. The team has four Vercel projects and only two have
been recovered: `subscription-command-center` and `committee-api` have not been looked at.
