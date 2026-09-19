# Handoff: repo setup and site review
*2026-09-08, Cowork session. First Dialecta session since May.*

## What changed

| Item | Detail |
|---|---|
| New home | `C:\Dialecta` is a clone of `dpenn1000/Dialecta` (main, 17 commits) plus untracked additions: `docs/`, `design/`, `components/`, `scripts/`, `CLAUDE.md`, `.env.example`, `.gitignore`. Nothing committed or pushed. `core.filemode=false`, `core.autocrlf=true` set locally. |
| Docs mirror | `docs/` mirrors `OneDrive\Websites\Dialecta\Fundamentals\` plus the root specs, Delta Mechanic spec, drafts, handoffs, and article sources. Nineteen cloud-only OneDrive files did not copy; list in `CLAUDE.md`. |
| Editorial Voice v1.2 | Merged the Trinity Platform voice guide (`OneDrive - Trinity Solar\Apps\_meta\voice\Voice-Guide.md`, Sept 4) into the Dialecta voice. Written to `docs/`, to `OneDrive\Websites\Dialecta\Fundamentals\` (replacing v1.1), and to the claude.ai project. |
| Site review | `docs/reviews/2026-09-08-site-review.md` with text snapshots. |
| Voice checker | `scripts/voice_check.py`, the regex subset of v1.2. |
| OneDrive CLAUDE.md | Cross-references updated: `C:\dialecta-api` etc. are gone from studio-pc; voice import path updated to the repo copy. |

## Found, not fixed

- `C:\dialecta-api`, `C:\dialecta-local` (theme), `C:\dialecta-next` are not on studio-pc. The theme source and `api/_axis-mapping.js` are unaccounted for. Check the Vercel project source and any other machine before rebuilding.
- The GitHub repo's last commit predates the axis-mapping work described in the 2026-04-29 handoffs. Local work was ahead of GitHub and may only exist in the deployment.
- `_to_delete/` in `C:\Dialecta` holds the transfer zip, a stale git lock, and the superseded `dialecta-s02-ux-opinion-maps.jsx`. Delete the folder.

## Next

1. Commit and push the new files from Claude Code.
2. Open the cloud-only OneDrive files once so they download, re-copy them into `docs/` and `components/`.
3. Work the site review in its suggested order.
