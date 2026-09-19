# Dialecta — Session Handoff Brief
## Opinion Maps + Delta Mechanic: Shared Component Architecture
*Paste this at the top of a new chat to begin the session.*

---

## What this session builds

Two prototypes exist and need to be unified into a shared component architecture. The goal is a set of React components designed as outboard API-callable modules: self-contained, portable, callable from anywhere in the Ghost/React environment with clean inputs and outputs.

**Existing prototypes:**
- `dialecta-s02-ux-opinion-maps.jsx` — The Opinion Maps tool (ternary plot + 2-axis Cartesian). Community aggregate view. Built in Session 2.
- `dialecta-delta-mechanic.html` — The Delta Mechanic flow (pre-read snapshot → reading → post-read snapshot → delta reveal → public choice → draft). Built in Session 6. Currently standalone HTML; needs to be ported to React.

**What this session produces:**
1. A shared `<PositionPlot>` primitive component — the draggable 2D plot engine used by both tools
2. A `<TernaryPlot>` primitive — the triangular plot engine used by Opinion Maps
3. `<OpinionMap>` — consuming component for the community aggregate view (wraps PositionPlot or TernaryPlot depending on article config)
4. `<DeltaCapture>` — consuming component for the before/after reader flow (wraps PositionPlot, manages stateful before/after pair)
5. A clear props/callback API for each so they can be called from Ghost article templates

---

## Architecture decision (made in prior session — do not re-derive)

The two tools share the 2D plot interaction but serve different moments and manage different state:

| | OpinionMap | DeltaCapture |
|---|---|---|
| Trigger | After reading | Before + after reading |
| Output | Community aggregate position | Individual movement vector |
| State | Stateless per session | Stateful: requires before/after pair |
| User | All readers | Opt-in readers |

**Correct structure:** One shared `<PositionPlot>` primitive (handles drag interaction, axis labels, community dots, SVG rendering), with `<OpinionMap>` and `<DeltaCapture>` as separate consuming components built on top of it. They do not merge into a single file.

---

## Canonical design values (do not iterate on these — use exactly)

```
Page background: linear-gradient(135deg, #a8a398 0px, #8c8780 175px, #f7f2e8 775px, #f7f2e8 100%)
Nav bar 1 (logo): height 52px, background: linear-gradient(135deg, #f7f2e8 0%, #1c1814 65%, #1c1814 100%)
Nav bar 2 (sub-nav): height 34px, metallic gradient
Max-width: 1060px
Gold: #d4a84a  |  Gold bright: #b8862e
Fonts: Cormorant Garamond (display) · DM Sans (body) · Source Serif 4 (reading) · DM Mono (labels/mono)
Border light: #e8e0d0  |  Border medium: #d8ceb8
Text primary: #1c1814  |  Text body: #3a342c  |  Text secondary: #5a5248
```

Grain overlay on body:
```css
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.035'/%3E%3C/svg%3E")
```

---

## Proposed component API (starting point — refine as needed)

### `<PositionPlot>`
```jsx
<PositionPlot
  axes={{ xLeft, xRight, yTop, yBot }}   // axis pole labels
  value={{ x, y }}                        // current dot position [0,1]
  before={{ x, y }}                       // optional: shows ghost dot + arrow
  communityDots={[{ x, y }, ...]}        // optional: community aggregate dots
  locked={false}                          // if true: display only, no drag
  size={260}                              // px
  onDrag={(value) => void}               // called on every drag update
  onDrop={(value) => void}               // called on mouseup/touchend
/>
```

### `<TernaryPlot>`
```jsx
<TernaryPlot
  poles={[{ label, color }, ...]}         // three pole definitions
  value={{ a, b, c }}                     // current position (sums to 1)
  communityDots={[{ a, b, c }, ...]}
  locked={false}
  size={320}
  onDrop={(value) => void}
/>
```

### `<OpinionMap>`
```jsx
<OpinionMap
  articleId={string}
  mapType={'cartesian' | 'ternary'}
  config={{                               // article-specific axis/pole config
    axes?: { xLeft, xRight, yTop, yBot },
    poles?: [{ label, color }, ...]
  }}
  communityData={[...]}                   // from API
  onPositionSubmit={(value) => void}      // fires on reader placement
/>
```

### `<DeltaCapture>`
```jsx
<DeltaCapture
  articleId={string}
  axes={{ xLeft, xRight, yTop, yBot }}
  onDeltaComplete={({ before, after, delta, publicChoice, draft }) => void}
/>
```

---

## Files to upload at the start of this session

Upload all of these before starting work:

| File | Why |
|---|---|
| `dialecta-s02-ux-opinion-maps.jsx` | Source of the existing Opinion Maps prototype — the ternary and 2D plot implementations live here |
| `dialecta-delta-mechanic.html` | Source of the existing Delta Mechanic prototype — the six-stage flow and 2D plot drag logic live here |
| `Dialecta_Delta_Mechanic_Spec.md` | Full specification for the delta mechanic: stage definitions, data model, Reviser pathway logic, copy standards, open questions |
| `dialecta-design-spec.html` | Canonical design spec v1.3 — use for any visual values not listed above |
| `dialecta-logo-datauri.txt` | Logo asset (retrieve with: `project_knowledge_search("dialecta-logo-datauri")` if in a project context) |

---

## Session constraints and scope

**In scope:**
- Port the delta mechanic HTML prototype to React JSX
- Extract the shared `<PositionPlot>` primitive from both prototypes
- Extract `<TernaryPlot>` from the Opinion Maps prototype
- Build `<OpinionMap>` and `<DeltaCapture>` as consuming components
- Define the clean props/callback API for each component
- Deliver as separate JSX files: `dialecta-position-plot.jsx`, `dialecta-ternary-plot.jsx`, `dialecta-opinion-map.jsx`, `dialecta-delta-capture.jsx`

**Out of scope (do not design or build):**
- Backend API or data persistence — components receive data as props, emit via callbacks
- Ternary delta variant (movement vector inside triangular space) — deferred to its own session
- Responsive/mobile treatment — deferred to Responsive Foundations session
- Authentication or session management

**Do not re-derive:**
- Design values (use the canonical list above exactly)
- The six-stage delta flow (fully specified in the spec document)
- The component split decision (PositionPlot primitive + two consumers)

---

## Open questions to resolve during this session

1. **Ternary drag interaction:** The existing opinion maps prototype uses a canvas or SVG triangle. Extract and confirm the barycentric coordinate math before abstracting it into the primitive.
2. **Community dot rendering:** OpinionMap shows community dots; DeltaCapture does not. Confirm this stays as a prop (`communityDots`) rather than a separate component concern.
3. **DeltaCapture reading stage:** The current prototype simulates reading progress with a timer. In production this is driven by actual scroll/reading events from the article. For now the component should accept a `readingComplete={bool}` prop to advance past the reading stage externally.
4. **Draft seeding:** The current prototype generates a seeded draft from the movement vector. Confirm whether this logic lives in `<DeltaCapture>` or gets called out to the Anthropic API. The spec says the platform "drafts something" — this could be a Claude API call with the movement vector as input rather than a local template.

---

## Naming and file output convention

Output files to `/mnt/user-data/outputs/` with these exact names:
- `dialecta-position-plot.jsx`
- `dialecta-ternary-plot.jsx`
- `dialecta-opinion-map.jsx`
- `dialecta-delta-capture.jsx`

Chat naming convention: `[Layer] — [Topic]`
Suggested name for this chat: `Discourse — Opinion Maps + Delta Components`

---

*Handoff prepared at end of Session 6 (Delta Mechanic). Prior session: Session 6 built the delta mechanic spec and prototype. Next session after this one: Classification Engine prompt architecture (Session 7, unblocked independently).*
