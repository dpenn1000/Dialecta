# Self-Snapshot Engine v1.0: archetype is not Voice 1, 2, or 3

**Source:** `docs/Dialecta_Self_Snapshot_Engine.md`, version 1.0, April 2026. Cross-checked
against `docs/Dialecta_Growth_Layer_Principles.md` Principle 6. Read 2026-09-20.

## Summary

This is the spec `design-tensions.md` Tension 1 already draws on for its evidence, filed here on
its own because the index omits it (`drift-map.md` D5) and it had no standalone note. It specifies
the three-voice composition that implements Growth Layer Principle 6: Voice 1 is the
contributor's own self-description, captured verbatim through structured prompts, canonical,
never overwritten by the platform, right to be wrong about yourself included. Voice 2 is the
engine's observation, drawn from the same Stage A classification data as the Contributor Identity
fingerprint, framed as signal never verdict, with a named grammar rule (the engine may say "one
signal among many," never "you are a poor listener"). Voice 3 is the community's reflection,
drawn from reclassification and voting activity, same signal-not-verdict framing. Three operating
constraints must all hold: radical humility in the data, honoring self-perception even when it
diverges, and educational-by-structure rather than by lecture.

The data model composes from existing tables (`axis_scores`, `axis_events`, `classifications`,
`comment_votes`, `sparring_partners`) and adds exactly one new entity, `self_descriptions`
(contributor_id, prompt_id, statement_verbatim, recorded_at), read-only for Voices 2 and 3. Five
open questions remain: the Voice 1 prompt library, re-prompting frequency, visual treatment of
divergence, public visibility, and bootstrap state for a contributor with no history.

**The question the reading list actually posed.** Where does the assigned archetype sit in this
composition? I read the "Data Model" table and the "Relationship to Other Documents" section
directly rather than relying on `design-tensions.md`'s prior claim, and independently confirm the
same result: archetype does not appear in the Data Model table at all, only `self_descriptions`,
`axis_scores`/`axis_events`/`classifications`, and `comment_votes`/`classifications`/
`sparring_partners`. The one place archetype is mentioned, "Voice 2 sources its data from the
same pillar/archetype computation pipeline" (Relationship to Other Documents), says the two share
a data pipeline, not that archetype is displayed as or within Voice 2. More telling: the
document's own five Open Questions never ask where archetype belongs. It is not flagged as
unresolved by the spec that would resolve it; it is simply absent, which is a different and
harder to notice gap than an open question would be.

## Implies for Dialecta

- Confirms, from the primary text rather than from `design-tensions.md`'s summary of it, that any
  session on Tension 1 starts with nothing to find: the placement question was never asked here,
  so there is no buried answer to locate, only a decision to make.
- Because this spec is off the index, a builder asked "does a spec place the archetype in the
  Self-Snapshot" would need this exact file, which `Dialecta_Project_Index.md` never names.
  Reinforces `drift-map.md` D5's argument for a one-line map of the omitted specs (filed this
  sprint as `2026-dialecta-omitted-specs-map.md`).
- The bootstrap-state open question (a new contributor has no Voice 2 or Voice 3 data) has a
  direct dependency worth naming: `packages/core/src/axis-mapping.ts` hardcodes Consistency to 0
  pending a history-based rule (see `2026-dialecta-axis-mapping-v1.md`), so even an established
  contributor's Voice 2 is currently missing one of its six inputs, not only a brand-new one.

*Filed 2026-09-20.*
