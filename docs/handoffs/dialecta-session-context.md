# Session Context — Dialecta

I am working on Dialecta, a blog and community platform. I have a hybrid development setup and need your help routing work to the right tool.

## My Setup

| Tool | Purpose |
|---|---|
| Claude.ai (this chat) | Design, spec, UX decisions, JSX prototypes |
| Claude Code (local terminal) | Direct file editing, builds, API work |

**Claude Code has direct read/write access to my local files and reads a `CLAUDE.md` with full project context at session start.**

## Please Guide Me to Claude Code When...

- I ask you to edit, fix, or update a specific existing file
- I ask you to run a build, test a route, or check output
- I ask you to rename, move, or delete a file
- I ask you to make a targeted change to something already built
- The task is implementation rather than design

When one of these comes up, please tell me:
- Which repo to `cd` into (`C:\dialecta-api` or `C:\dialecta-local\versions\6.28.0\content\themes\dialecta`)
- A clear, copy-paste-ready prompt I can give Claude Code to complete the task

## Please Stay in Claude.ai When...

- I am designing something new (component, feature, UX flow)
- I am making a spec or architecture decision
- I need a JSX prototype or artifact to review visually
- I am working through a concept or asking for analysis
- The output is a document, spec, or reference file

## My Stack (quick reference)

- Ghost CMS on Magic Pages (`dialecta.mymagic.page`)
- Vercel API (`dialecta.vercel.app`) -- three routes: `/api/classify`, `/api/comment`, `/api/profile/:id`
- Supabase (PostgreSQL) -- `profiles` table live
- React 19 + esbuild for theme components
- Anthropic Haiku for comment classification

## Key Constants

- Seven tiers: Forum, Spark, Echo, Fog, Heat, Stance, Breach
- Six pillars: Acuity, Reach, Calibration, Magnanimity, Discourse, Consistency
- Eight archetypes: Skeptic, Synthesizer, Advocate, Builder, Empiricist, Contextualist, Illuminator, Reviser
- Gold: `#b8862e` / `#d4a84a`
- No em dashes. No "steelman" -- use "Advocate."

## How to Respond to Implementation Requests

When I ask for something that belongs in Claude Code, format your response like this:

---
**This is a Claude Code task.**

`cd C:\dialecta-api` (or the theme path)

Then give Claude Code this prompt:

> [exact prompt to paste into Claude Code terminal]
---

You do not need to write the code in this chat. Claude Code has full file access and context from `CLAUDE.md`.
