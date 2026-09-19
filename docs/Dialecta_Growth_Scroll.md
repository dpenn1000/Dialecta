# Dialecta — Growth Scroll
*Session Record and Next Steps*
*April 16, 2026*

---

## What Was Built

The Growth Scroll is the primary visualization for Dialecta's Growth Layer. It is a horizontal scrolling archival journal that displays a contributor's intellectual fingerprint at key moments in their history, from their very first contribution to the present.

The design deliberately departs from dashboard and data visualization conventions. It is a **historical record** -- something you would find in an archive or a field notebook. The fingerprint is not analyzed or scored. It is simply shown, across time, as a witness.

---

## Canonical File

**`dialecta-growth-scroll-v5.jsx`**

A self-contained React component (~1120 lines) that embeds the full canonical Fingerprint engine (v1.0.0 from `dialecta-fingerprint-engine.jsx`) and renders the Growth Scroll from mock snapshot data.

---

## Design Decisions (Locked)

### Visual Format
- **Horizontal scroll** on a continuous paper strip. No pagination, no cards, no dividers. The paper is one physical object.
- **Dark surround** (`#1c1814` from design spec) above and below the paper. Black shows only at top and bottom -- the scroll runs full width edge to edge.
- **Deckle edges** at top and bottom of the paper strip, implemented as dark-fill SVG overlays that eat into the paper with an organic torn edge. The deckle scrolls with the paper content.

### Paper Treatment
- Base color: `#ede0c4` (warm aged paper)
- Three-layer SVG texture: fine fractalNoise grain (opacity 12%), horizontal fiber striations (opacity 8%), cross-grain fibers (opacity 5%)
- All layers use `mix-blend-mode: multiply`
- A thin paper-edge highlight and drop shadow run along the deckle line

### Typography
- **Cinzel** (Roman inscription letterforms) for all labels, dates, event names, axis tallies, metadata -- replaces DM Mono entirely
- **IM Fell English Italic** (Oxford University Press revival, 1670s) for annotation paragraphs and descriptive text
- **Cormorant Garamond** for display titles and headers
- DM Sans and DM Mono are not used anywhere in this component

### Fingerprint Rendering
- Uses the canonical `Fingerprint` component from `dialecta-fingerprint-engine.jsx` verbatim
- Each snapshot rendered at 194px (178px for seed entry), `showLabels={false}`
- Mock data formatted to exact engine spec: `graduations`, `tierMix`, `topicPhases` per axis
- Axis keys: `specificity`, `calibration`, `charity`, `discourse`, `consistency`, `originality`
- Topic phases assigned across `mental_health`, `economics`, `political_science`, `renewable_energy` -- creates ring color variation from center (early history) to outer edge (recent)
- Tier mix evolves across snapshots: early entries have more heat/fog turbulence; later entries are more forum-heavy and render calmer

### Scroll Entries
Five entries in the mock, in chronological order left to right:

| Entry | Date | Character |
|---|---|---|
| First Entry | 1 Sep 2024 | Seed dot only -- single Consistency graduation, everything else absent |
| Declaration | 14 Oct 2024 | Sparse, lopsided toward engagement axes |
| Recommitment | 9 Jan 2025 | Fuller, Acuity emerging alongside Consistency |
| Archetype Shift | 3 Apr 2025 | All six axes present, characteristic shape legible |
| Present | 16 Apr 2026 | Mature asymmetry, Acuity and Charity as defining poles |

### Performance
- `React.memo` on `EntryPanel` and `TitlePanel` -- no re-renders on scroll events
- `useMemo` for delta calculations, deckle paths, and fingerprint computation
- `willChange: "transform"` on outer container for GPU compositing
- `WebkitOverflowScrolling: "touch"` for smooth mobile scroll
- Fingerprint engine's internal `useMemo` caches ring math permanently since data objects are module-level constants

### Each Entry Contains
- **Date and event label** in Cinzel small caps
- **Fingerprint sketch** rendered by the canonical engine at that snapshot's state
- **Axis tally** -- each pillar name (3 chars) + graduation count in its canonical color; absent axes are faded
- **Annotation paragraph** in IM Fell English Italic -- observational, past tense, field-notes register
- **"Since last" delta** -- two-line block: label on first line, colored axis deltas on second line

---

## Annotation Voice (Provisional)

The annotation text in the mock establishes a register. It needs a formal spec before the generation layer is built.

**The voice is:**
- Observational, not evaluative
- Past tense throughout
- Field notes, not coaching
- Notices what is present and what is absent
- Never uses progress framing ("improved," "grew," "achieved")
- Never compares to other contributors
- May note direction changes, reversals, consolidations

**Examples from the mock:**
- *"Consistency and Discourse are the first axes to register clearly. The form is sparse, leaning toward engagement over depth."*
- *"A significant acceleration. All six axes now carry visible weight. The characteristic shape of this contributor is becoming legible."*
- *"The form has reached a mature asymmetry — depth and charitable engagement are this contributor's signature. The record is open."*

The phrase "The record is open" on the final entry is a deliberate choice -- it signals that this is not a terminus, just the most recent entry. Worth preserving.

---

## Integration Notes (Future Session)

The Growth Scroll sits **below the current fingerprint and Declared shelf** on the contributor profile. The current fingerprint is the final entry in the scroll -- the same object, one living and one archived. The transition between them is a design moment that needs deliberate handling: probably a thin ruled line with a quiet date annotation connecting the profile fingerprint to the top of the scroll.

The scroll is private by default, consistent with the Delta Mechanic and Growth Layer privacy principles. A contributor can make it public as part of their profile, in which case it becomes part of their public intellectual identity -- a statement of where they came from.

---

## Open Questions

1. **Annotation generation** -- the text is static mock copy. The generation layer needs a prompt spec that reliably hits the established register. Claude Haiku at ~$0.002/snapshot.

2. **Profile integration** -- the scroll needs to connect to the current fingerprint at the top of the profile. The "handoff" design is unresolved.

3. **Empty / sparse state** -- a contributor with only one or two snapshots should see a graceful minimal scroll, not a broken layout.

---

## Next Session Required: Snapshot Curation Algorithm

### The Problem

The `fp_snapshots` table accumulates a snapshot on every trigger event: aspiration declaration, recommitment, archetype shift, and milestone. An active contributor over several years could accumulate many snapshots. The scroll cannot show all of them -- entries would blur together and the narrative would collapse into noise.

### The Design Commitment

The scroll is a **narrative**, not a timeline. It surfaces **key moments** -- snapshots where something structurally meaningful happened -- and compresses quiet periods between them. This is editorial curation at read time, not deletion of data. The `fp_snapshots` ledger is never modified.

### The Core Principle (Agreed)

Significance is **normalized per contributor**. A contributor whose fingerprint moves in small increments over years deserves a scroll that honors those increments as their significant moments. There is no universal threshold -- the algorithm measures each contributor against their own historical range of motion.

### What Needs to Be Derived

A scoring function:

```
score(snapshot_i, contributor_history) → float [0, 1]
```

Where scores above ~0.55 surface the snapshot as a standalone entry, and scores below are absorbed into compression annotations.

The sub-scores feeding into this function:

**1. Fingerprint delta percentile**
- Compute the Euclidean distance between snapshot_i's fingerprint shape and its neighbors
- Normalize against this contributor's personal distribution of all historical deltas
- High percentile = high significance for this contributor

**2. Direction change detection**
- Did any axis reverse direction between the previous snapshot and this one?
- Reversals are inherently significant regardless of magnitude
- Consolidation after a reversal (axis stabilizing) is also meaningful

**3. Event type weight**
- Archetype shift: always surfaces (weight 1.0)
- First entry: always surfaces (weight 1.0)
- Recommitment with high delta: surfaces
- Recommitment with low delta: candidate for absorption
- Milestone: surfaces if fingerprint delta is above median

**4. Recency curve**
- Recent snapshots (within 12 months) get a lower significance threshold
- Older snapshots need higher delta to surface
- This ensures recent history is always granular

**5. Temporal gap**
- A snapshot after an unusually long gap (3x the contributor's normal interval) surfaces regardless of delta
- Unusual silence followed by re-engagement is itself a meaningful moment

### Bootstrap Period

New contributors (fewer than 6-8 snapshots) have no distribution to normalize against. During this period, all snapshots surface. The algorithm kicks in once enough data exists to establish a personal baseline. On the first read after bootstrap, the scroll may quietly reorganize -- no notification, just a more accurate mirror.

### Cap on Visible Entries

The scroll should surface **6-8 entries maximum** for legibility. As the contributor's history grows, the compression becomes more aggressive. The oldest surfaced entry is always the "First Entry" seed regardless of how many snapshots contributed to that period.

### Compression Annotations

When a quiet period is absorbed, the gap between two surfaced entries carries an annotation acknowledging the compression:

*"Fourteen months of steady development. No structural shifts in this period."*

This is a transparency mechanism -- the contributor always knows their history is curated, not missing.

### Session Deliverables

- Significance scoring formula (complete mathematical definition)
- Normalization function (personal delta distribution computation)
- Recency curve (decay function by snapshot age)
- Bootstrap rules (threshold for when algorithm activates)
- Direction-change detection (axis reversal and stabilization logic)
- Compression annotation voice spec
- Maximum entry cap and tie-breaking rules
- Test against 3-4 hypothetical contributor histories to validate

---

*Document compiled April 16, 2026. Growth Scroll v5 is the canonical prototype.*
*Next action: Algorithm Design Session (can be scheduled when ready).*
