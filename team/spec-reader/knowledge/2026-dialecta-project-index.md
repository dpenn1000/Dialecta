# Project Index v0.16: the map, and where the map is wrong

**Source:** `docs/Dialecta_Project_Index.md`, version 0.16, May 2026, revised 6 May 2026. Read at
commit `9a355c0` on 2026-09-19.

## Summary

The index is the document the mandate starts from. It is a navigational document by its own
statement, section "Purpose": "This is a navigational document, not a specification." It answers
which design layer a document belongs to, what status it has, and what tensions are open.

**What it owns, and owns well.** The six design layers and their unit of analysis, section "The Six
Design Layers". The layer by layer inventory with a status column, section "Document & Artifact
Inventory". The four harmonization tensions. A long Cleanup Items section that the document defends
on purpose, section "Purpose": "Production is messy." The Resolved subsection is the closest thing
the project has to a changelog, and it is where most of the useful reconciliation lives.

**Which spec owns which topic**, as the index has it:

| Layer | Spec | Owns |
|---|---|---|
| Foundation | `Dialecta_Project_Brief.md` | Vision, rules, tier summary, tech stack, roadmap. The entry point |
| Foundation | `Dialecta_Data_Architecture.md` | All data storage, computation, flow. Entities and pipelines |
| Foundation | `Dialecta_Editorial_Voice.md` | Tone, language, the quote principle, commenter message design |
| Discourse | `Dialecta_Classification_Engine_Specification.md` | Claim threshold, the 0 to 3 specificity spectrum, prompt architecture, tier boundary logic |
| Discourse | `Dialecta_Tier_Psychology.md` | Why each of the seven tier names, and the effect each is designed to produce |
| Contributor Identity | `Dialecta_Contributor_Identity.md` | The six pillars, the Fingerprint, the eight archetypes |
| Article | `Dialecta_Article_Editorial_Template.md` | Author submission flow, five declaration questions, Stage 2.5 |
| Growth | `Dialecta_Growth_Layer_Principles.md` | The six principles, trustee framing, consent renewal, three voice composition |
| Growth | `Dialecta_Social_UX_Architecture.md` | Feed design, identity primitives, balance engineering |
| Visual | `design/dialecta-design-spec.html` v1.3 | Tokens, typography, color, component patterns |

**Where the map is wrong.** Six defects, all detailed in [drift-map.md](drift-map.md) section D.
Short form:

1. Ten specs in `docs/` are named nowhere in the index, including
   `Dialecta_Axis_Mapping_v1.md` and `Dialecta_Self_Snapshot_Engine.md`.
2. Line 297 states the Next.js migration "is closed". ADR-001 reverses that.
3. Line 203 states the tier to pillar mapping is "implied but not specified anywhere".
   `Dialecta_Axis_Mapping_v1.md` specifies it in full.
4. Line 75 attributes two steelman references to the Article Editorial Template. It has zero.
5. Lines 188 to 190 contradict line 261 on whether the steelman scrub is done.
6. Line 148, Known Gaps, reads "None currently" while three tensions sit open at lines 202 to 205.

The index also predates `docs/decisions/` entirely. It has no ADR section, no ADR reference, and no
mechanism for recording that a decision record has overridden a spec it lists as Canonical. Its own
instructions, section "How to Use This Index", cover adding a spec, promoting a prototype, resolving
a tension and closing a cleanup item. They do not cover an ADR landing.

## Implies for Dialecta

- The mandate's method, start from the index then read the owning section, is sound for the ten specs
  the index maps and silently incomplete for the ten it does not. Check the file tree before
  concluding no spec owns a topic. This is now practice 6 in `practices.md`.
- Any citation of the index for current build state needs an ADR check first. Treat v0.16 as accurate
  to 6 May 2026 and superseded on stack questions from 2026-09-19.
- Line numbers taken from the index are unreliable across the 2026-09-08 doc import. It cites
  Editorial Voice line 264 for text now at line 203. Re-grep rather than trusting an index line
  reference.
- The index's Resolved section is the best available reconciliation record and is worth reading
  before asserting that any cleanup item is open. Three of the four statements this note corrects
  were already corrected inside the index's own Resolved entries; the stale claims upstream were
  never deleted.
- Someone should decide whether the index gains an ADR column or whether `docs/decisions/README.md`
  gains a "specs overridden" table. Not this agent's call, and not a spec edit this agent can make.

*Filed 2026-09-19*
