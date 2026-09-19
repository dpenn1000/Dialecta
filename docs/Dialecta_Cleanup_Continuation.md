# Dialecta — Cleanup Continuation Instructions
*Paste this at the start of a new chat to resume the project cleanup work.*

---

## Context

I'm building **Dialecta**, a constructive dialogue platform. This chat is a **continuation of a project cleanup pass** that was previously in progress in another conversation. That conversation got pulled into a long design iteration on the Design Spec's nav gradient and I want to keep this new chat focused on the cleanup work — *not* on visual design iteration.

**Important behavior request:** Please default to my "concise, non-descriptive output" preference (tables over prose for status, surgical edits for files, no overlong explanations). Do not start re-iterating on visual design choices unless I explicitly ask. If the gradient or any visual element comes up, the answer is "the Design Spec is canonical, follow it exactly."

## Project state (as of handoff)

The project is in a clean state. The cleanup pass already completed:

- ✅ **Project Index** (`Dialecta_Project_Index.md` v0.4) — sole navigational document. Lists all files, layers, gaps, tensions, and cleanup items. Read this first; it's the map.
- ✅ **Article Editorial Template** (`Dialecta_Article_Editorial_Template.md`) — extracted from a stranded chat and uploaded
- ✅ **Growth Layer Principles** (`Dialecta_Growth_Layer_Principles.md`) — uploaded
- ✅ **Project Brief** tier table updated to use canonical names: **The Stance** (was Static), **The Breach** (was Off the Air)
- ✅ **Classification Engine Spec** updated to use Stance/Breach
- ✅ **Pact page** renamed to `dialecta-pact.html` with full content audit (no more OpenGround references, all tier names updated)
- ✅ **Design Spec** (`dialecta-design-spec.html`) updated to include the canonical gradient nav header and Section 08b "Page Background" — the spec doc itself now uses the canonical gradient + grain overlay so it demonstrates the platform's visual language
- ✅ **Opinion maps prototype** renamed and gradient values brought into sync with Design Spec canonical
- ✅ Memory updated with canonical visual values

## Canonical visual values (do not iterate on these)

These are now locked. If asked to build any new component, copy these values exactly from the Design Spec (Sections 08 and 08b):

- **Nav gradient:** `linear-gradient(135deg, #f7f2e8 0%, #1c1814 65%, #1c1814 100%)`
- **Page background:** `linear-gradient(135deg, #1c1814 0px, #28231a 175px, #f7f2e8 775px, #f7f2e8 100%)`
- **Paper grain:** fixed SVG fractalNoise overlay at opacity 0.035 (full definition in Design Spec)
- **Logo asset:** `Dialecta__Hero__White.png` at 32px height with `mix-blend-mode: multiply` on the cream side of the nav
- **Tier names:** Forum, Spark, Echo, Fog, Heat, **Stance**, **Breach** (final canonical names)

## What's still on the cleanup to-do list

In priority order. Focus on these. Do not invent new work.

| # | Item | Notes |
|---|---|---|
| 1 | Decide what to do with the **mobile profile** (`dialecta-profile-mobile.jsx`) built in chat `c037b78b` | Options: promote, fold into main `dialecta-profile.jsx` as responsive, or discard |
| 2 | Decide what to do with the **pitch page** built in chat `c6b32a1e` | Pre-rename, pre-canonical-tier-names. Promote+update or discard |
| 3 | Cosmetic file renames in `/mnt/project/`: `Social_Media__Human_Behavior__and_the_Rewiring_of_Society` → add `.md` extension; `Dialecta__Hero_Logo__PNG.png` → `dialecta-hero-logo.png` | Both files are actually JPEGs despite the `.png` extension — flag this if it matters; otherwise just rename for consistency |
| 4 | Delete obsolete chats from project sidebar (your action — no tool): `Untitled` (757b4359), `Opus project Profile page fingerprint` (6c10add6), `Private draft mode setup` (5c1c95b9), `Logo design` (871c4b5d), `OpenGround project handoff brief` (325ae3b7) | I can't do this for you |
| 5 | Apply chat naming convention going forward: `[Layer] — [Topic]` where Layer is one of: Foundation, Discourse, Identity, Article, Visual, Growth, Build, Idea, Reference | Manual rename in sidebar |

## What's *not* on the to-do list

**Three substantive harmonization tensions remain in the index but should NOT be addressed during cleanup.** They require real design work in dedicated sessions, not file edits:

1. Archetype assignment vs. the Self-Snapshot's three-voice principle (Contributor Identity vs. Growth Layer)
2. Per-comment tier vs. contributor-level axes mapping
3. The Reviser archetype depending on the Delta mechanic, which doesn't exist yet

If any of these come up, defer them to a future dedicated session.

## How to start

Read `Dialecta_Project_Index.md` first. It will tell you everything that exists in the project, what layer each file belongs to, and what the open items are. Then ask me which cleanup item I want to tackle first.

**Do not** start by reading every spec doc end-to-end. **Do not** start by re-deriving the canonical visual values — they're locked. **Do not** start by suggesting design iteration on the nav gradient or any visual element — that's complete.

Use tables, not prose, when reporting status. Be surgical, not comprehensive.
