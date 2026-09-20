# The nine specs the index omits, one verified line each

**Source:** Direct read of the nine files listed in `drift-map.md` D5 minus
`Dialecta_Axis_Mapping_v1.md` (filed separately). Read 2026-09-20.

## Summary

`drift-map.md` D5 already named these ten files and gave each a short guess at what it owns,
compiled while surveying for the map itself. This note re-reads all nine (Self-Snapshot Engine
gets its own full note, `2026-dialecta-self-snapshot-engine.md`; the line here points to it) and
either confirms or corrects that guess against the actual text, so "no spec owns that" stops
requiring a tree walk for these nine specifically.

| Spec | Verified, one line | Corrects D5's guess? |
|---|---|---|
| `Dialecta_Self_Snapshot_Engine.md` | The three-voice composition implementing Growth Layer Principle 6; archetype is not one of the three voices. Full note: `2026-dialecta-self-snapshot-engine.md` | No, confirmed and expanded |
| `Dialecta_Founding_Philosophy.md` | "The Internal Doctrine": not written for contributors, written for builders, states the source thesis once so every other document can assume it rather than re-argue it | Yes. D5 said "Founding thesis"; the document is explicit that it is internal only, a distinction worth keeping since it means this file is never the citation for anything contributor-facing |
| `Dialecta_Activity_Rhythm_View.md` | The Growth Layer's other "Seeing" feature, paired with the Self-Snapshot: answers when and how a contributor shows up, where the Snapshot answers who they are becoming | No, confirmed and sourced to its own Purpose section |
| `Dialecta_Discourse_Layer_UX.md` | The full comment lifecycle as built in `dialecta-discourse-layer.jsx`: the three-stage submit flow (Write and Analyze, AI Reflection and Self-Declaration, Posted), the comment card, feed sorting, and the reclassification nomination panel | No, confirmed. Worth flagging here since it bears directly on ownership: this document has no Stage 2.5 section (grepped, zero matches), though `docs/plans/backlog.md` A-3, `Dialecta_Delta_Mechanic_Spec.md`, and root `CLAUDE.md`'s locked weighting all assume comments have one. See `2026-dialecta-classification-weighting-provenance.md` |
| `Dialecta_Growth_Scroll.md` | Not a spec but a dated session record, "Session Record and Next Steps," April 16 2026: locks the design of the Growth Scroll visualization itself, a horizontal archival paper-strip journal, its canonical component `dialecta-growth-scroll-v5.jsx`, typography, and paper treatment | Yes. D5 said "Growth scroll surface," accurate but it obscures that no document titled as a spec owns this topic; the closest thing is a build log of one component |
| `Dialecta_Relationship_Types.md` | The dyadic layer above per-contributor identity: four relationship types (Reader, Source, Correspondent, Sparring Partner), their detection rules, and the `follows`/`sparring_partners` schema | No, confirmed and sourced |
| `Dialecta_Supabase_Scaling.md` | Operational companion to Data Architecture: write amplification per comment, the ordered list of what breaks first under load, required indexes, and the Phase 4/5 trigger conditions | No, confirmed. Still states "Ghost is the confirmed production stack" (line 203), which `drift-map.md` A4 already flags as superseded by ADR-001 and named in no ADR |
| `Dialecta_Tuning_Engine_Spec_v1.md` | Charter for a not yet built hidden admin page exposing every `// TUNING:` constant in the codebase (tier boundaries, Hot ranking weights, Axis Mapping knobs, wait windows) paired with disagreement analytics | No, confirmed. It is a charter for future work, not a description of something live; asking what the Tuning Engine does today has the answer that it is not built |
| `dialecta-profile-ghost-integration.md` | Ghost theme mount notes for the profile components; historical per ADR-001 but unmarked in `docs/` root | No change from `drift-map.md` A6/E6/E7, which already cover this file in more depth than a one-liner needs |

## Implies for Dialecta

- Two of the nine, `Dialecta_Founding_Philosophy.md` and `Dialecta_Growth_Scroll.md`, needed their
  one-liner corrected once actually read, not just confirmed. That is a real number for a set of
  nine, and argues for treating every D5 line the same way rather than trusting the fastest three
  to have been the risky ones.
- `Dialecta_Discourse_Layer_UX.md`'s missing Stage 2.5 section is the single most load-bearing gap
  in this set: it sits directly behind the classification-weighting provenance question filed this
  sprint.
- This map plus `2026-dialecta-self-snapshot-engine.md` plus `2026-dialecta-axis-mapping-v1.md`
  together account for all ten specs `drift-map.md` D5 named. The index remains unedited; nothing
  here substitutes for someone adding these ten rows to `Dialecta_Project_Index.md` itself, which
  is Dan's file.

*Filed 2026-09-20.*
