import { useState, useEffect, useRef } from "react";

// ─── Tokens from dialecta-design-spec.html v1.3 ───────────────────────────────
const T = {
  pageBg:       "linear-gradient(135deg,#a8a398 0px,#8c8780 175px,#f7f2e8 775px,#f7f2e8 100%)",
  navGrad:      "linear-gradient(135deg,#f7f2e8 0%,#1c1814 65%,#1c1814 100%)",
  navBorder:    "rgba(184,115,42,0.22)",
  subnavBg:     "linear-gradient(to bottom,#eceae4 0%,#d8d4cc 48%,#eceae4 100%)",
  subnavHi:     "rgba(255,255,255,0.94)",
  bgPrimary:    "#f7f2e8",
  bgSecondary:  "#efe8da",
  bgTertiary:   "#e8dfce",
  bgWhite:      "#fffdf8",
  bgDark:       "#1c1814",
  textPrimary:  "#1c1814",
  textBody:     "#3a342c",
  textSecondary:"#5a5248",
  textTertiary: "#7a7068",
  textMuted:    "#9a8e80",
  textOnDark:   "#f0ebe0",
  gold:         "#d4a84a",
  goldPale:     "#f5e8d0",
  amber:        "#b8732a",
  terra:        "#8c4a2f",
  borderLight:  "#e8e0d0",
  borderMedium: "#d8ceb8",
  borderDark:   "#c8bca4",
  borderRule:   "#b8732a",
  shadowSm:     "0 1px 3px rgba(28,24,20,0.04)",
  shadowMd:     "0 2px 8px rgba(28,24,20,0.06),0 0 0 1px rgba(28,24,20,0.02)",
  shadowLg:     "0 4px 20px rgba(28,24,20,0.08),0 0 0 1px rgba(28,24,20,0.02)",
  rSm: 4, rMd: 8, rLg: 12,
  fDisplay: "'Cormorant Garamond',serif",
  fBody:    "'DM Sans',sans-serif",
  fReading: "'Source Serif 4',Georgia,serif",
  fMono:    "'DM Mono',monospace",
};

const STATUS_CFG = {
  "Complete":    { bg:"#4a7c59",   fg:"#fff" },
  "In Progress": { bg:"#b8732a",   fg:"#fff" },
  "Specced":     { bg:"#d4a84a",   fg:"#1c1814" },
  "Not Started": { bg:"#7a7068",   fg:"#fff" },
  "Deferred":    { bg:"#8c4a2f",   fg:"#fff" },
};
const LAYER_COLORS = {
  "Foundation":"#6b7a8d","Discourse":"#b8732a","Identity":"#d4a84a",
  "Article":"#7a8c6e","Growth":"#5c8a7a","Visual":"#8a6e7a","Cross-Layer":"#7a7068",
};
const PHASES = [
  {id:1,name:"Pilot",    timeline:"0–3 mo"},
  {id:2,name:"Engine",   timeline:"3–6 mo"},
  {id:3,name:"Mapping",  timeline:"6–9 mo"},
  {id:4,name:"Platform", timeline:"9–18 mo"},
  {id:5,name:"Scale",    timeline:"18+ mo"},
];
const LAYERS   = ["Foundation","Discourse","Identity","Article","Growth","Visual","Cross-Layer"];
const STATUSES = ["Complete","In Progress","Specced","Not Started","Deferred"];
const STORAGE_KEY = "dialecta-dashboard-v2";

const DEFAULT_ITEMS = [
  {id:"p1-1",phase:1,layer:"Foundation", status:"Complete",    title:"Founding Philosophy",          artifact:"Dialecta_Founding_Philosophy.md",                 description:"Source thesis, Ten Articles, intellectual lineage, platform origin story.",dependencies:[],notes:""},
  {id:"p1-2",phase:1,layer:"Foundation", status:"Complete",    title:"Project Brief",                artifact:"Dialecta_Project_Brief.md",                       description:"Platform vision, core rules, tier system summary, mapping tools, tech stack, phased roadmap.",dependencies:[],notes:"Contains 1 pending Steelman→Advocate ref."},
  {id:"p1-3",phase:1,layer:"Visual",     status:"Complete",    title:"Design Spec v1.3",             artifact:"dialecta-design-spec.html",                       description:"Design tokens, typography, color system, 12-section component library. Canonical visual spec.",dependencies:[],notes:"Desktop-only until Responsive Foundations."},
  {id:"p1-4",phase:1,layer:"Discourse",  status:"Complete",    title:"Tier Psychology",              artifact:"Dialecta_Tier_Psychology.md",                     description:"Why behind the seven tier names: psychological effect, commenter-message tone standards.",dependencies:[],notes:"Old pillar names — low-severity scrub pending."},
  {id:"p1-5",phase:1,layer:"Foundation", status:"Complete",    title:"Pact Page / Onboarding",       artifact:"dialecta-pact.html",                              description:"Hero, philosophy, tier system visual, 3-comment classification quiz, single-path commitment ritual.",dependencies:["p1-4"],notes:"Desktop-only until Responsive Foundations. (Path A/B framing was a stale dashboard artifact — never spec'd, never built. Scrubbed during D6 audit.)"},
  {id:"p1-6",phase:1,layer:"Foundation", status:"Complete",    title:"Stewards Page (S13)",          artifact:"dialecta-s13-stewards.html",                      description:"Writer Orders, Cadence modifiers, Satirist note (full Charter forthcoming as companion document). Governance-adjacent.",dependencies:[],notes:"May graduate to its own layer. Description updated 2026-04-29 (a-b16 decision): the 'On the Satirist' prose section commits to a separate Charter doc; that's intentional. Inline formalization rejected in favor of standalone companion document later."},
  {id:"p1-7",phase:1,layer:"Foundation", status:"Complete",    title:"Editorial Voice",              artifact:"Dialecta_Editorial_Voice.md",                     description:"Writing bible: tone, quote principle, Stoic seed library, Growth Frame doctrine, commenter message design.",dependencies:[],notes:""},
  {id:"p1-8",phase:1,layer:"Foundation", status:"Complete",    title:"Ghost CMS Setup",              artifact:null,                                              description:"Ghost handles articles, subscriptions, and member management in Phase 1.",dependencies:[],notes:"Live at dialecta.org. Custom domain pointed. Both repos on GitHub."},
  {id:"p2-1a",phase:2,layer:"Foundation", status:"Complete",    title:"Two-Repo Structure",           artifact:"CLAUDE.md",                      description:"dialecta-api (Vercel serverless) and dialecta-theme (Ghost) as separate repos. Both version controlled. Vercel CLI linked.",dependencies:[],notes:"Theme canonical path: C:/dialecta-local/content/themes/dialecta-theme/. current/ is Ghost core symlink — never use as working path."},
  {id:"p2-1b",phase:2,layer:"Foundation", status:"Complete",    title:"Claude Code + Workflow Docs",  artifact:"dialecta-workflow-reference.md", description:"Claude Code installed and operational. CLAUDE.md ground truth in both repos. dialecta-workflow-reference.md (daily command reference) and dialecta-session-context.md (paste-in prompt for Claude.ai vs Claude Code routing).",dependencies:[],notes:""},
  {id:"p2-1c",phase:2,layer:"Foundation", status:"Complete",    title:"Theme Build Pipeline",         artifact:"package.json",                   description:"Four confirmed scripts in theme package.json: build, build:profile, watch, watch:profile. React 19 flags correct: --jsx-import-source=react --jsx=automatic.",dependencies:[],notes:"git init run in dialecta-theme — theme now version controlled."},
  {id:"p2-1",phase:2,layer:"Discourse",  status:"Complete",    title:"Classification Engine Spec",   artifact:"Dialecta_Classification_Engine_Specification.md", description:"Per-comment AI pipeline: claim threshold, 0–3 specificity spectrum, prompt architecture, tier boundary logic.",dependencies:["p1-4"],notes:""},
  {id:"p2-2",phase:2,layer:"Discourse",  status:"Complete",    title:"Comment Declaration UI",       artifact:"dialecta-discourse-layer.jsx",                description:"Three-step flow: write → AI analysis (gold-pale card, amber left bar) → self-declaration (7-tier grid) → posted.",dependencies:["p2-1"],notes:"First draft locked April 12. Spec v1.3 compliant."},
  {id:"p2-3",phase:2,layer:"Discourse",  status:"Complete",    title:"AI Classification Pipeline",   artifact:"api/classify.js",                                              description:"Live Anthropic API integration for real comment classification. Stage A fields logged per comment.",dependencies:["p2-1","p1-8"],notes:"Build pending Ghost CMS setup."},
  {id:"p2-4",phase:2,layer:"Foundation", status:"Complete",    title:"Data Architecture",            artifact:"Dialecta_Data_Architecture.md",                   description:"Three-layer architecture, nine data entities, four compute pipelines, Ghost integration. Ground truth document.",dependencies:[],notes:"Every future session designs against this."},
  {id:"p2-5",phase:2,layer:"Identity",   status:"Complete",    title:"Contributor Profile Page",     artifact:"dialecta-profile.jsx",                            description:"Fingerprint, archetype, history. Canonical petal-engine. Hardcoded API calls for Ghost push.",dependencies:["p2-6","p2-9"],notes:"Desktop-only until Responsive Foundations."},
  {id:"p2-6",phase:2,layer:"Identity",   status:"Complete",    title:"Fingerprint Engine",           artifact:"dialecta-fingerprint-engine.jsx",                 description:"Six-axis petal visualization engine. SVG. Tier history produces wave texture in inner rings.",dependencies:["p2-9"],notes:"Dedup: also lives inside profile.jsx — Cleanup Item 6."},
  {id:"p2-7",phase:2,layer:"Discourse",  status:"Complete",    title:"Community Voting Mechanic",    artifact:null,                                              description:"Upvote/downvote within tier, nominate for reclassification, re-review trigger threshold.",dependencies:["p2-3"],notes:""},
  {id:"p2-8",phase:2,layer:"Discourse",  status:"Complete",    title:"Self-Declaration Flow",        artifact:null,                                              description:"Commenter accepts or overrides AI tier suggestion. Both tiers stored and publicly displayed.",dependencies:["p2-2"],notes:""},
  {id:"p2-9",phase:2,layer:"Identity",   status:"Complete",    title:"Contributor Identity Spec",    artifact:"Dialecta_Contributor_Identity.md",                description:"Six Pillars (Acuity, Reach, Calibration, Magnanimity, Discourse, Consistency), Fingerprint, Eight Archetypes. v1.1.",dependencies:[],notes:""},
  {id:"p2-10",phase:2,layer:"Foundation",status:"Complete",    title:"Social UX Architecture",       artifact:"Dialecta_Social_UX_Architecture.md",              description:"Feed design, identity primitives, balance engineering. Homepage=Feed locked. Delta pushed to Phase 5.",dependencies:[],notes:"Aspirations optionally public. Practice Layer opt-in only."},
  {id:"p2-11",phase:2,layer:"Cross-Layer",status:"Complete",   title:"Phase 1 Terminology Scrubs",   artifact:null,                                              description:"Cumulative canonical scrubs from audit Phase A: Static→Stance, Off-the-Air→Breach (Tier Psychology, Classification Engine); Charity→Magnanimity, Specificity→Acuity, Range→Reach, Challenger→Skeptic (Social UX, Contributor Identity, system-reference); Steelman→Advocate (Article Editorial Template, Project Brief).",dependencies:[],notes:"Supersedes original Steelman→Advocate-only scope."},
  {id:"p2-17",phase:2,layer:"Foundation", status:"Complete",    title:"Ghost Content API Key",         artifact:"src/index.jsx",                  description:"Set Ghost Content API key in src/index.jsx to wire Live Feed on profile page with real Ghost posts.",dependencies:["p1-8"],notes:"Resolved during audit session."},
  {id:"p2-18",phase:2,layer:"Foundation", status:"Not Started", title:"12 Ghost Tags (canonical slugs)", artifact:null,                              description:"Create all 12 topic tags in Ghost Admin with exact canonical slugs matching topic taxonomy v2. Required before any feed or article card work.",dependencies:["p3-8"],notes:"Priority 2 next session."},
  {id:"p2-19",phase:2,layer:"Discourse",  status:"Complete",    title:"Comment Submission Wiring",      artifact:"src/dialecta-private-draft.jsx",  description:"POST /api/comment + POST /api/classify wired into the production discourse layer via the Private Draft compose ritual. Signed-out visitors see read-only feed with sign-in CTA in place of compose.",dependencies:["p2-3","p2-2"],notes:"Discharged 2026-04-29 by the engines build (a-b19). Closes M3 dependency."},
  {id:"p2-20",phase:2,layer:"Identity",   status:"Not Started", title:"Supabase Storage — Photo Uploads", artifact:null,                            description:"Supabase Storage bucket for contributor avatar uploads. Replace avatar_url string field with real upload flow.",dependencies:["p2-13"],notes:"Priority 4 next session."},
  {id:"p3-1",phase:3,layer:"Cross-Layer",status:"Complete",    title:"Opinion Maps — 2-Axis",        artifact:"dialecta-s02-ux-opinion-maps.jsx",               description:"Two-dimension Cartesian reader position plot with aggregate heat map.",dependencies:[],notes:"Rename to dialecta-opinion-maps.jsx pending (Cleanup #4)."},
  {id:"p3-2",phase:3,layer:"Cross-Layer",status:"Complete",    title:"Opinion Maps — Ternary",       artifact:"dialecta-s02-ux-opinion-maps.jsx",               description:"Triangular three-pole plot where values sum to 100%. Signature feature.",dependencies:[],notes:"Same artifact as 2-axis."},
  {id:"p3-3",phase:3,layer:"Identity",   status:"Complete",    title:"Archetype Picker UI",          artifact:"dialecta-s02-ux-opinion-maps.jsx",               description:"Eight-archetype aspiration selection interface.",dependencies:["p2-9"],notes:"Lives inside opinion maps artifact."},
  {id:"p3-4",phase:3,layer:"Article",    status:"Specced",     title:"Article Editorial Template",   artifact:"Dialecta_Article_Editorial_Template.md",         description:"Author submission flow, five declaration questions, Stage 2.5 amendment window, AI role definition.",dependencies:["p2-1"],notes:"Contains 2 pending Steelman→Advocate refs (Cleanup #5)."},
  {id:"p3-5",phase:3,layer:"Discourse",  status:"Complete",    title:"Advocate Engine",              artifact:null,                                              description:"Pre-comment strongest opposing view prompt. Acknowledgment flow before posting.",dependencies:["p2-1"],notes:"Terminology scrub from Steelman partially complete."},
  {id:"p4-1",phase:4,layer:"Growth",     status:"Complete",    title:"Growth Layer Principles",      artifact:"Dialecta_Growth_Layer_Principles.md",             description:"Ethical foundation: six principles, trustee framing, consent renewal, three-voice Self-Snapshot.",dependencies:["p2-9"],notes:"Aspiration Tool addendum complete April 12."},
  {id:"p2-12",phase:2,layer:"Foundation", status:"Complete",    title:"Vercel API Backend",           artifact:"api/classify.js",                description:"Three live routes: POST /api/classify (Claude Haiku classification), POST /api/comment (submit + classify + write to Supabase), GET+PATCH /api/profile/:id. CORS configured for dialecta.org.",dependencies:["p1-8"],notes:"All three routes tested end-to-end locally and in production. Two-repo structure: dialecta-api (Vercel) + dialecta-theme (Ghost). Claude Code operational. CLAUDE.md ground truth files in both repos."},
  {id:"p2-13",phase:2,layer:"Foundation", status:"Complete",    title:"Supabase Profiles Table",      artifact:"supabase/migrations/000_baseline_documentation.sql",description:"profiles table storing Dialecta-editable fields (display_name, bio, avatar_url, location) keyed on ghost_member_id. Ghost owns member record; Supabase extends it. RLS enabled. Baseline tables (profiles + comments + classifications) created via Supabase dashboard pre-migrations; documented in 000 for back-fill of authoritative DDL when convenient.",dependencies:["p2-4"],notes:"Original artifact reference '000_profiles_table.sql' was a phantom — no SQL file existed. Corrected to point at the baseline-documentation marker file."},
  {id:"p2-14",phase:2,layer:"Identity",   status:"Complete",    title:"Profile Page — Live Data",     artifact:"page-profile.hbs",               description:"ProfileRoot fetches live data from Vercel API, merges via mergeProfileWithGhost(), renders full profile component. Edit profile working via PATCH /api/profile/:id.",dependencies:["p2-5","p2-12","p2-13"],notes:"Avatar circles showing empty if Ghost member name field is blank. Live Feed still mock data."},
  {id:"p2-15",phase:2,layer:"Identity",   status:"Complete",    title:"Profile Data Layer",           artifact:"dialecta-profile-data.js",        description:"useProfileData() hook, updateProfile(), mergeProfileWithGhost(). Maps Supabase axis names to component names. Safe defaults for all fields.",dependencies:["p2-12"],notes:""},
  {id:"p2-16",phase:2,layer:"Identity",   status:"Complete",    title:"Settings Drawer / Hamburger Bridge", artifact:"dialecta-profile-settings.jsx", description:"Slide-in settings drawer. window.__dialectaOpenSettings global pattern established. default.hbs hamburger button not yet added. Settings can only be triggered via contributor name in hero currently.",dependencies:["p2-14"],notes:"Add id=dialecta-settings-btn to default.hbs to complete the bridge."},
  {id:"p3-6",phase:3,layer:"Article",     status:"Specced",     title:"Articles Feed Page (index.hbs)", artifact:null,                            description:"Ghost index.hbs article feed with Dialecta card design using twelve-topic color map. Ghost Content API key to wire Live Feed on profile page. Replace mock LIVE_FEED arrays with real Ghost posts.",dependencies:["p1-8","p3-4"],notes:"Blocks Live Feed wiring. New 12-topic canonical taxonomy locked — must replace old 9-topic TOPICS constant."},
  {id:"p3-7",phase:3,layer:"Article",     status:"Specced",     title:"Article Reading Page (post.hbs)", artifact:"dialecta-article-mockup.html",  description:"post.hbs with Ghost-native title/lede/meta, Declaration Strip (5 author fields from Supabase), prose body in Source Serif 4, sticky sidebar (opinion map, community stats, Position Delta panel), Discourse Layer mount point.",dependencies:["p3-4","p3-6"],notes:"Full mockup built. Declaration Layer form location decision deferred (standalone /submit vs Ghost webhook vs Admin injection)."},
  {id:"p3-8",phase:3,layer:"Foundation",  status:"Complete",    title:"Topic Taxonomy v2",            artifact:"dialecta-topic-colors-v2.html",   description:"Twelve canonical topics replacing old nine. Ordered by color wheel hue. Each topic has color (border/chip) and colorDeep (fingerprint petal fill) values. Ghost tags must be created manually with exact slugs.",dependencies:[],notes:"Old TOPICS constant in dialecta-profile.jsx is stale — must be updated before any feed work."},
  {id:"p4-0",phase:4,layer:"Growth",     status:"Complete",    title:"Growth Scroll",               artifact:"dialecta-growth-scroll-v5.jsx",          description:"Horizontal scrolling archival journal of the contributor fingerprint across time. Five snapshot entries, canonical fingerprint engine embedded, paper texture with deckle edges, Cinzel + IM Fell typography. Private by default.",dependencies:["p4-1"],notes:"Annotation generation, profile integration handoff, and Snapshot Curation Algorithm are deferred sessions."},
  {id:"p4-0b",phase:4,layer:"Growth",    status:"Not Started", title:"Snapshot Curation Algorithm",  artifact:null,                                           description:"Scoring function to determine which fp_snapshots surface as standalone entries vs. compression annotations. Normalised per-contributor. Considers fingerprint delta percentile, direction changes, event type weight, recency curve, and temporal gap.",dependencies:["p4-0"],notes:"Fully specced in Dialecta_Growth_Scroll.md. Cap of 6-8 visible entries. Bootstrap rules for new contributors."},
  {id:"p4-2",phase:4,layer:"Growth",     status:"Specced",     title:"Self-Snapshot Engine",         artifact:null,                                              description:"Three-voice snapshot: engine (AI), community, user self-description. Signal not verdict.",dependencies:["p4-1","p2-3","p2-7"],notes:"Blocked until Classification Engine + Community Voting live."},
  {id:"p4-3",phase:4,layer:"Growth",     status:"Specced",     title:"Aspiration Tool",              artifact:null,                                              description:"Aspiration declaration, 90-day shelf life, recommitment mechanic, research consent layer.",dependencies:["p4-1"],notes:"Aspirations optionally public. Expire rather than deleted."},
  {id:"p4-4",phase:2,layer:"Visual",     status:"In Progress", title:"Responsive Foundations",       artifact:null,                                              description:"Canonical breakpoints (~768px, ~1024px). Coordinated responsive pass across profile, post, pact, stewards pages. Promoted from Phase 4 → Phase 2 on 2026-04-27 because First Quills launch made mobile launch-essential, not deferred. (p4-6 'Responsive Profile Page' remains Phase 4 as the longer architectural cleanup that consolidates desktop+mobile parallel files into a single responsive component.)",dependencies:[],notes:"M4 of First Quills launch track. Stage B.2 done 2026-04-28: profile unified into single responsive component (a-b21); discharges p4-6 ahead of schedule. Discourse engines mobile-aware from day one (a-b19). Remaining sweep: Pact, Stewards, Opinion Maps, Design Spec preview, info pages, /quotes/."},
  {id:"p4-5",phase:4,layer:"Foundation", status:"Deferred",    title:"Next.js / Supabase Migration", artifact:null,                                              description:"Migrate from Ghost pilot to full custom build. Nine data entities. Full feature set, open to public.",dependencies:["p2-4","p1-8"],notes:""},
  {id:"p4-6",phase:4,layer:"Identity",   status:"Complete",    title:"Responsive Profile Page",      artifact:"src/dialecta-profile.jsx",                        description:"Canonical responsive build of contributor profile (replaces desktop + mobile parallel files).",dependencies:["p2-5","p4-4"],notes:"Discharged 2026-04-28 ahead of schedule by Stage B.2 of the responsive rebuild (a-b21): dialecta-profile.jsx now decides desktop vs. compact via internal useIsDesktop hook; dialecta-profile-mobile.jsx retired."},
  {id:"p5-1",phase:5,layer:"Cross-Layer",status:"Deferred",    title:"Delta Mechanic",               artifact:null,                                              description:"Opinion shift tracking before/after reading. The delta is as interesting as the position.",dependencies:["p3-1","p3-2"],notes:"Pushed to Phase 5 per Social UX Architecture. Reviser archetype depends on this."},
  {id:"p5-2",phase:5,layer:"Foundation", status:"Not Started", title:"Fine-Tuned ML Model",          artifact:null,                                              description:"Model trained on platform's own classified comments. Proprietary data moat.",dependencies:["p2-3","p2-7"],notes:""},
  {id:"p5-3",phase:5,layer:"Visual",     status:"Not Started", title:"React Native Mobile App",      artifact:null,                                              description:"Mobile app sharing most logic with web app.",dependencies:["p4-5"],notes:""},
  {id:"p5-4",phase:5,layer:"Foundation", status:"Not Started", title:"Governance Features",          artifact:null,                                              description:"User-submitted improvements, public proposals, community voting on platform changes.",dependencies:["p2-7"],notes:""},

  // ── Audit-derived items (Phase A/B coherence audit, April 2026) ─────────────
  {id:"a-0", phase:1,layer:"Cross-Layer",status:"Complete",    title:"Coherence Audit",                 artifact:"dialecta-coherence-audit.md",            description:"Three-phase audit comparing vision (specs in OneDrive) against build (active theme + API). Phase A: vision capture across 6 domains, 30+ docs read. Phase B: reality capture, build-vs-spec gap analysis. Phase C: decisions, sync, build queue lock.",dependencies:[],notes:"Closed 2026-04-27. Phase A complete (6 domains). Phase B complete-sufficient (D1+D2+D3+D6 executed; D4+D5 deferred — D4 collapses into a-b1 schema work, D5 has no built artifacts). Sync complete (8 files). See Audit tab for detail."},

  // New canonical specs authored during audit Phase A
  {id:"a-s1",phase:2,layer:"Identity",   status:"Complete",    title:"Relationship Types Spec",         artifact:"Dialecta_Relationship_Types.md",         description:"Four-type relationship model: Readers, Sources, Correspondents, Sparring Partners. ~140 lines.",dependencies:[],notes:"Authored during audit Phase A."},
  {id:"a-s2",phase:4,layer:"Growth",     status:"Complete",    title:"Self-Snapshot Engine Spec",       artifact:"Dialecta_Self_Snapshot_Engine.md",       description:"Three-voice composition: engine + community + user self-description. Signal not verdict. ~190 lines. Canonical spec backing build item p4-2.",dependencies:["p4-1"],notes:"Authored during audit Phase A."},
  {id:"a-s3",phase:4,layer:"Growth",     status:"Complete",    title:"Activity Rhythm View Spec",       artifact:"Dialecta_Activity_Rhythm_View.md",       description:"Pattern visualization without prescription. ~165 lines.",dependencies:[],notes:"Authored during audit Phase A."},
  {id:"a-s4",phase:2,layer:"Discourse",  status:"Complete",    title:"Discourse Layer UX Spec",         artifact:"Dialecta_Discourse_Layer_UX.md",         description:"v1.0 — full UX spec for three-stage classification flow. Pairs with 693-line dialecta-discourse-layer.jsx canonical prototype.",dependencies:["p2-1"],notes:"Synced from Claude.ai during Phase A."},
  {id:"a-s5",phase:2,layer:"Visual",     status:"Complete",    title:"WoodFrameProgressBar Component",  artifact:"Components/WoodFrameProgressBar.jsx",    description:"Standalone React component (~165 lines) extracted from dialecta-s11-private-draft-mode ReflectionBar. Three props: progress, remainingSeconds, label. Used in Stage 1 wait architecture.",dependencies:[],notes:"Extracted during audit Phase A."},

  // New build items decided during audit
  {id:"a-b1",phase:2,layer:"Foundation", status:"Complete",    title:"Schema Migration v1.1",           artifact:"supabase/migrations/001_v1_1_schema.sql",description:"Applied 2026-04-27. ALTER TYPE archetype_id added 5 canonical values; profiles.is_seed + comments.delta_acknowledged columns added; 4 new tables (feed_events, follows, sparring_partners, opinion_map_positions) created with text member_id (Phase 1 Ghost convention). Plus 002_seed_dev_users.sql: Maya/Wen/Anselm + 18 axis_scores + 3 archetype rows landed.",dependencies:["p2-4","p2-13"],notes:"Drafting surfaced 2 Phase B audit misses: (1) spec said uuid contributor_id but production correctly uses text member_id; (2) archetype_id enum was stale (3 of 9 canonical, missing 5). Both addressed in this migration. See audit doc Domain 4 Addendum."},
  {id:"a-b2",phase:2,layer:"Identity",   status:"Complete",    title:"Engine v2.0.0 Axis Refactor",     artifact:"src/dialecta-fingerprint-engine.jsx",    description:"Engine v1.0.0 uses retired axis keys (specificity, charity, originality). v2.0.0 renames to acuity, magnanimity, reach. 7 sub-steps: engine source, mock data, static PNG asset regen, page-fingerprint.hbs copy, two profile JSX consumers, profile-data.js translation cleanup.",dependencies:["p2-6"],notes:"Completed 2026-04-27 evening. All 5 files updated: dialecta-fingerprint-engine.jsx, dialecta-profile.jsx, dialecta-profile-mobile.jsx, dialecta-profile-data.js, index.jsx. Tradeoff pairs aligned to v1.1 spec. Translation layer in mergeProfileWithGhost dropped. Mock data updated. Version markers v1.0.0 → v2.0.0."},
  {id:"a-b3",phase:2,layer:"Identity",   status:"Complete",    title:"Archetype Scrub: Diplomat + Oracle",artifact:"src/dialecta-profile.jsx",             description:"Two non-canonical archetypes (Diplomat, Oracle) live in desktop profile JSX only. Mobile is already canonical (Advocate, Reviser). Scrub desktop file to match canonical 8 archetypes.",dependencies:["p2-9"],notes:"Discharged 2026-04-28 by Stage B.2 profile unification (a-b21). Verified 2026-04-29: ARCHETYPES const in the unified dialecta-profile.jsx contains exactly the canonical 8 (skeptic, synthesizer, advocate, builder, empiricist, contextualist, illuminator, reviser); no Diplomat or Oracle present. Closes M2."},
  {id:"a-b4",phase:2,layer:"Visual",     status:"In Progress", title:"Custom SVG Tier Icons (extract + share)", artifact:"page-pact.hbs",                  description:"Pact page already has custom inline SVG tier icons (lines 1032–1064): pediment/columns (Forum), lightning bolt (Spark), echo wave, cloud (Fog), flame (Heat), etc. Re-scope: extract these into a shared Handlebars partial or React component, then consume from Stewards / Profile / Article pages. Replace any remaining emoji tier markers.",dependencies:[],notes:"Engines build added dialecta-tier-badge.jsx (~280 lines) with its own custom per-tier SVGs serving the Discourse surfaces (no emojis, Tier Psychology rationale). Pact still has its own inline SVGs; the unification step (Pact migrating to consume from the shared component, or the React component absorbing Pact's specific iconography) is what's left."},
  {id:"a-b5",phase:2,layer:"Discourse",  status:"In Progress", title:"Comment API — Stage A + axis_events",artifact:"api/comment.js",                     description:"Two pieces: Stage A reasoning fields stored on classifications row + per-comment axis_events writes for the immutable ledger.",dependencies:["p2-3","a-b1"],notes:"Stage A: DONE. Migration 012 added the schema columns; api/comment.js writes claim_text, specificity_score, emotion, tribal_markers, tribal_example, article_engagement, opposing_view_engaged, borderline_flag, borderline_other_tier, commenter_message. axis_events writes: NOT DONE. Verified 2026-04-29 by grep: no API file references axis_events. Remaining work: derive axis deltas from classification + write append-only ledger rows on each comment."},
  {id:"a-b6",phase:2,layer:"Identity",   status:"Complete",    title:"Profile API — Joined Returns",    artifact:"api/profile/[id].js",                    description:"Currently only returns profiles row. Should return joined: comments + axis_scores + tier_history + archetype + relationships.",dependencies:["p2-12","a-b1"],notes:"Completed 2026-04-27. Joined response includes axisScores, archetype, stats (totalComments / articlesEngaged / tierCounts / forumPct), connections (disjoint readers / sources / correspondents / sparringPartners counts) plus full chip-display lists per category with axis-derived gradient colors. Lazy-create on first hit added later same day from parallel thread."},
  {id:"a-b7",phase:2,layer:"Foundation", status:"Complete",    title:"index.jsx HERO_PROFILES → API-fetched seeds", artifact:"src/index.jsx",            description:"Replace HERO_PROFILES hardcoded const + carousel mock with API calls fetching the 3 seed contributors (Maya/Wen/Anselm) via GET /api/profile/:id. Seed data already in production Supabase as of 2026-04-27 (a-b1 + 002_seed_dev_users.sql). API needs to expose joined entity returns first (a-b6).",dependencies:["p3-8","a-b2","a-b1","a-b6"],notes:"Completed 2026-04-27. HeroCarousel hook fetches 3 seeds in parallel via Promise.all on mount. Names became links to /profile/?id=... All persona text now from API (display_name, archetype.label, bio, resonance) — only HERO_SEED_IDS list remains hardcoded. Closed M1."},
  {id:"a-b8",phase:2,layer:"Foundation", status:"In Progress", title:"Operational Layer — Phase 1",     artifact:null,                                     description:"Pre-launch operational scope: Supavisor connection pooling, 8 SQL indexes (TBD list), Vercel compute upgrade, axis_scores incremental compute, article_feed_cache table.",dependencies:["p2-12","p2-13"],notes:"Vercel compute upgrade DONE (Pro tier, 2026-04-29). Two indexes added: idx_comments_hardened_at (mig 011), idx_classifications_borderline (mig 012). Supavisor pooling, remaining 6 indexes, axis_scores incremental compute, and article_feed_cache table still open."},

  // D6 (Article + Pact + Stewards reality) build items — added 2026-04-27
  {id:"a-b9", phase:2,layer:"Discourse",  status:"In Progress", title:"post.hbs — Tier Badge component",     artifact:"post.hbs",                              description:"3-tier display (author-declared / AI-suggested / community-voted) at the top of every published article. Mount point exists (#dialecta-tier-badge), component built but not yet wired to article-side classification.",dependencies:["p2-3","a-b1"],notes:"Component DONE: dialecta-tier-badge.jsx exports TIERS, TIER_BY_KEY, TierBadge, TierBadgePair primitives (engines build, 2026-04-29). post.hbs hero mount #dialecta-tier-badge intentionally empty until article-side classification surface lands (the component reads article.classification; that data path doesn't exist yet)."},
  {id:"a-b10",phase:2,layer:"Discourse",  status:"Deferred",    title:"post.hbs — Reclassification Nomination UI", artifact:"post.hbs",                        description:"Structured nomination form per Article Editorial Template lines 143–161: suggested tier (dropdown) + predefined reason (single-select A/B) + optional 140-char note (C). Forces thinking, generates machine-readable data, educates by reading.",dependencies:["a-b9"],notes:"Deferred to Phase 2.5 per engines-build handoff: 'No nominations table yet.' Reclassification flow architecture is documented in Dialecta_Discourse_Layer_UX.md."},
  {id:"a-b11",phase:2,layer:"Discourse",  status:"Specced",     title:"post.hbs — AI Analysis Disclosure UI", artifact:"post.hbs",                           description:"Per Article Editorial Template line 80: AI analysis is 'disclosed alongside the published article, never used to gate publication.' Renders the AI's tier reading + flagged passages + opinion-mapping suggestions visible to readers.",dependencies:["p2-3","a-b9"],notes:"D6 finding."},
  {id:"a-b12",phase:2,layer:"Discourse",  status:"Deferred",    title:"post.hbs — Stage 2.5 Nomination Amendment Window", artifact:"post.hbs",                description:"When reader nominations accumulate against a published article, the author gets another Stage 2.5 moment with the nomination data. Per Article Editorial Template lines 163–165.",dependencies:["a-b10"],notes:"Deferred to Phase 2.5; depends on a-b10 (nominations) which is also deferred. Comment-side equivalent (append-after-hardening) was explicitly dropped per engines-build handoff: article-side commitment only."},
  {id:"a-b13",phase:2,layer:"Discourse",  status:"Specced",     title:"post.hbs — Wait Window Enforcement",   artifact:"post.hbs",                              description:"Visible, ritual-framed wait time before article publication. Per Article Editorial Template lines 121–131. 'Framed as intention rather than punishment.'",dependencies:[],notes:"D6 finding. Sample copy: 'This is intentional. Publishing here carries weight.'"},
  {id:"a-b14",phase:2,layer:"Cross-Layer",status:"Complete",    title:"page-stewards.hbs — Republic→Community scrub", artifact:"page-stewards.hbs",                description:"Line in the doorway section read 'The Republic recognizes its Stewards…' — 'The Republic of Letters' is one of the rejected names from the Stewards Reflection naming arc. Replaced with 'The community recognizes…'.",dependencies:[],notes:"Resolved 2026-04-29 in M5 polish session. Edit landed at page-stewards.hbs line 942 (file evolved from the audit's line 861 reference). Em dash also replaced with comma per house style."},
  {id:"a-b15",phase:2,layer:"Visual",     status:"Specced",     title:"page-stewards.hbs — masthead logo treatment", artifact:"page-stewards.hbs",                  description:"Line 546 embeds ~198k-char base64 PNG inline as masthead-logo (line numbers shifted; current file is 1300+ lines). Decision required: replace with {{@site.logo}} reference, move to /assets/img/ static path, or replace with typographic masthead. Ghost nav already serves the wordmark sitewide.",dependencies:[],notes:"D6 finding. Active-theme decision — not a prototype scrub. 2026-04-29 user decision: tentatively (a) {{@site.logo}}, but DEFERRED at user request because page-stewards.hbs is being reviewed by another process. Revisit when that work completes."},
  {id:"a-b16",phase:2,layer:"Cross-Layer",status:"Complete",    title:"page-stewards.hbs — Satirist's Charter formalize-or-accept", artifact:"page-stewards.hbs",     description:"Dashboard p1-6 description named 'Satirist's Charter' but the active build has an 'On the Satirist' prose section that defers the full Charter to a separate companion document.",dependencies:[],notes:"Decided 2026-04-29 in M5 polish session: prose form accepted (option b). The section already states 'The full Satirist's Charter will be published as a companion document' — that defer-to-future framing is intentional. Inline formalization rejected; standalone Charter doc is a future deliverable. Dashboard p1-6 description updated to match."},

  // Diagnostic-derived items from a-b1 schema migration apply (2026-04-27)
  {id:"a-d1",phase:2,layer:"Foundation", status:"Complete",    title:"Data Architecture spec v1.1 → v1.2",artifact:"Dialecta_Data_Architecture.md",       description:"Added 'Identity Types: Phase 1 vs Phase 2' section clarifying that all Ghost-side identity refs (member_id, article_id) are text in Phase 1 (Ghost member IDs are 24-char hex, not UUIDs). Internal Supabase PKs and FKs remain uuid throughout.",dependencies:["a-b1"],notes:"Diagnostic-derived backflow. Earlier spec versions said uuid universally, conflating Ghost-sourced and Supabase-internal IDs."},
  {id:"a-d2",phase:2,layer:"Foundation", status:"Complete",    title:"Retire legacy archetype_id enum values", artifact:"supabase/migrations/007_archetype_enum_canonical_only.sql",description:"Production archetype_id enum had 6 stale values (specialist, generalist, sparring_partner, cartographer, witness, forming) pre-dating the canonical 8 archetype taxonomy. Retired via type-swap migration with pre-flight assertions guarding against legacy rows or unexpected columns.",dependencies:["a-b1"],notes:"Migration 007 applied to production. Verified 2026-04-29 via Supabase MCP query: pg_enum returned exactly the canonical 8 (advocate, builder, contextualist, empiricist, illuminator, reviser, skeptic, synthesizer)."},

  // ── Post-audit production builds (2026-04-27 → 2026-04-29) ────────────────
  // Reconciled into the dashboard 2026-04-29 (afternoon reconciliation pass).
  {id:"a-b17",phase:2,layer:"Article",    status:"Complete",    title:"Article Pipeline Phase 1A-1C",         artifact:"src/dialecta-editor.jsx",       description:"End-to-end article writing pipeline: articles table (mig 005), classify / submit / publish / reader endpoints, member-uuid auth (Path C-lite), 9-stage editor (~2200 lines, lifted from s11 design DNA), aesthetic-suggest with polished_html + JSON parse recovery, suggest-topics, classify-order, image upload, Polish migration script for retroactive cleanup.",dependencies:["p3-4","p2-13","a-b1"],notes:"Phase 1A: 2026-04-27 afternoon. Phase 1B: same evening. Phase 1C: 2026-04-27 night → 2026-04-28. Editor lives at /write/. House Ghost user attribution + Supabase byline override (post.hbs) is Phase 1D follow-up."},
  {id:"a-b18",phase:2,layer:"Visual",     status:"Complete",    title:"Article Display Surface",              artifact:"post.hbs",                       description:"Editorial-grade article reading: brass title hero (symmetric 7-stop gradient), drop cap, justified columns with hyphenation + hanging punctuation + old-style numerals, paragraph rhythm (block + first-line indent), thematic ⁂ rules, italic Cormorant pullquotes, sources styling, gold-leader lists, feature image with caption, end-of-article asterism marker.",dependencies:["a-b17","p3-7"],notes:"Shipped 2026-04-28. Three live articles polished retroactively via scripts/polish-articles.mjs. Subtitle hierarchy fix + per-card Polish selection are queued follow-ups. Brass + wood + paper tokens formalized as part of this work."},
  {id:"a-b19",phase:2,layer:"Discourse",  status:"Complete",    title:"Discourse Engines (Private Draft Stage 1 + Feed)", artifact:"src/dialecta-private-draft.jsx", description:"Private Draft Mode 9-stage compose ritual (compose / consent / reflecting / reflection / declare / stage25 / respond / final / posted) with audit-confirmed wait windows (8s / 12s / 60min). Discourse Layer feed (topology bar + control bar + comment cards with contrast strip + edit overlay with re-classify on save). Migrations 011 (comments.hardened_at) + 012 (full Stage A schema on classifications) applied. New endpoints api/comments (GET feed) + api/comment/[id] (PATCH/DELETE within malleability window). Shared dialecta-tier-badge.jsx primitive. Mobile-aware from day one.",dependencies:["p2-19","a-b1","a-b5"],notes:"Shipped 2026-04-29. Vercel Pro upgrade (12-function cap resolved). Discharges p2-19 entirely; substantially discharges a-b9 (component built; post.hbs hero mount on #dialecta-tier-badge still empty pending article-side classification surface)."},
  {id:"a-b20",phase:2,layer:"Identity",   status:"In Progress", title:"Steward Order Picker",                 artifact:"src/dialecta-profile-order.jsx", description:"OrderBadge (public claim) + OrderPatternCard (AI-proposes / author-confirms negotiation). Backed by /api/article/classify-order + /api/profile/order. 40 canonical Orders + The Satirist as the only declared one (never AI-proposed). Author always wins the public claim.",dependencies:["a-b6"],notes:"Component shipped 2026-04-29. Some endpoints (classify-order, profile/order) uncommitted in the API repo as of 2026-04-29 afternoon. Verify deployment status before declaring complete."},
  {id:"a-b21",phase:2,layer:"Visual",     status:"Complete",    title:"Mobile Responsive — Stage B.2 (Profile Unification)", artifact:"src/dialecta-profile.jsx",      description:"Retired the desktop/mobile parallel-component split. dialecta-profile.jsx now decides desktop vs. compact via internal useIsDesktop hook. dialecta-profile-responsive.jsx kept as backward-compat passthrough. dialecta-profile-mobile.jsx no longer in src/.",dependencies:["p4-4"],notes:"Shipped 2026-04-28. Discharges p4-6 (Responsive Profile Page) ahead of schedule. Discourse engines also mobile-aware from day one (a-b19). Remaining p4-4 sweep: Pact, Stewards, Opinion Maps, Design Spec preview, info pages, /quotes/."},
  {id:"a-b22",phase:2,layer:"Foundation", status:"Complete",    title:"Topics v2 Unification (src/topics.js)", artifact:"src/topics.js",                description:"src/topics.js is now the canonical TOPICS source for the compiled theme bundle. dialecta-profile.jsx and editor surfaces import from it. Three parallel copies must move together: src/topics.js (bundle), post.hbs (Handlebars inline), api/_topics.js (Vercel runtime); the source-file header documents this.",dependencies:["p3-8"],notes:"Shipped 2026-04-28. Closes the 'old 9-topic constant in dialecta-profile.jsx' landmine that was Cleanup #2 in API CLAUDE.md."},
  {id:"a-b23",phase:2,layer:"Foundation", status:"Complete",    title:"Quote Library Page",                   artifact:"page-quotes.hbs",                description:"Full /quotes/ page live. page-quotes.hbs + src/dialecta-quotes-app.jsx + src/dialecta-quotes-data.js + src/dialecta-quotes-mount.jsx + assets/js/quotes.js + api/quotes endpoint. Built in a parallel chat per dialecta-quote-library-instructions.md. Subtle quote placements in CONSENT and POSTED stages of the editor are the remaining ritual-surface use case from the original spec.",dependencies:[],notes:"Shipped 2026-04-28. Editor ritual-surface integration is queued as a small follow-up."},
];

// ─── Audit data — Phase A/B coherence audit, April 2026 ──────────────────────
const AUDIT_PHASE_A = [
  {domain:"Foundation",            status:"complete", count:5, notes:"Project Brief, Founding Philosophy, Editorial Voice, Project Index, Data Architecture v1.0→v1.1"},
  {domain:"Contributor Identity",  status:"complete", count:7, notes:"Contributor Identity v1.1, Tier Psychology, Discourse Layer UX, plus 4 NEW: Relationship Types, Self-Snapshot Engine, Activity Rhythm View, WoodFrameProgressBar"},
  {domain:"Discourse",             status:"complete", count:4, notes:"Classification Engine Spec, Social UX, Discourse Layer UX, Stewards Reflection"},
  {domain:"Data Architecture",     status:"complete", count:1, notes:"v1.0→v1.1: 3 new entities + delta_acknowledged column + feed_events expansion"},
  {domain:"Growth Layer",          status:"complete", count:4, notes:"Growth Layer Principles (5 Open Questions resolved), Growth Scroll spec + v5 prototype, Self-Snapshot, Activity Rhythm"},
  {domain:"Article + Pact + Stewards",status:"complete", count:4, notes:"Article Editorial Template, Pact, Stewards (S13), Stewards Reflection"},
];

const AUDIT_PHASE_B = [
  {domain:"Active Theme — index.jsx + profile",  status:"complete",   notes:"HERO_PROFILES uses old axes + 9-topic; profile-data.js has explicit canonical→legacy translation; profile-mount.jsx orphaned"},
  {domain:"Active Theme — fingerprint engine",   status:"complete",   notes:"v1.0.0 with retired axis keys — v2.0.0 refactor scoped (a-b2)"},
  {domain:"API Repo — classify.js + comment.js + profile/[id].js", status:"complete", notes:"classify.js canonical; comment.js + profile/[id].js gaps captured (a-b5, a-b6)"},
  {domain:"D6 — Article + Pact + Stewards",      status:"complete",   notes:"post.hbs scaffolded but unwired (5 new build items a-b9–a-b13). page-pact substantially complete with inline SVG tier icons. page-stewards strong; 3 small cleanups (a-b14 Republic→Community scrub, a-b15 masthead logo, a-b16 Charter formalize-or-accept)"},
  {domain:"D4 — Data Architecture reality",      status:"complete",   notes:"Migration drafting (a-b1) surfaced 2 findings: spec said uuid contributor_id but production correctly uses text member_id; archetype_id enum was 3-of-9 canonical (5 missing). Both addressed. Spec patched v1.1→v1.2 (a-d1). Legacy enum cleanup spawned (a-d2)."},
  {domain:"D5 — Growth Layer reality",           status:"deferred",   notes:"No built artifacts to audit. Audit happens at build-time per Phase 4 feature."},
];

const AUDIT_SYNC = [
  {file:"Dialecta_Tier_Psychology.md",                           detail:"v1.1, 323 lines"},
  {file:"Dialecta_Stewards_Reflection.txt",                      detail:"152 lines"},
  {file:"dialecta-logo-datauri.txt",                             detail:"DELETED — superseded by /Logos/ source assets"},
  {file:"Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md",detail:"307 lines, contextual reference"},
  {file:"dialecta-discourse-layer.jsx",                          detail:"693 lines, fully canonical reference for Phase 2"},
  {file:"Dialecta_Discourse_Layer_UX.md",                        detail:"v1.0"},
  {file:"dialecta-profile-ghost-integration.md",                 detail:"Revealed Oracle archetype as stale (a-b3)"},
  {file:"dialecta-fingerprint-engine.jsx",                       detail:"Confirmed v1.0.0 axis keys retired (a-b2)"},
];

const AUDIT_DECISIONS = [
  "Engine v1.0.0 → v2.0.0 axis refactor scoped (7 sub-steps) — see a-b2",
  "Two non-canonical archetypes confirmed (Diplomat + Oracle, desktop only) — see a-b3",
  "Custom SVG tier icons re-scoped: Pact already has them inline, extract + share — see a-b4",
  "5 Growth Layer Open Questions resolved (cross-referenced to Aspiration Tool addendum)",
  "Topic taxonomy v2 (12 topics) locked",
  "Practice Layer deferred to Phase 4+ (quality deferral, not schedule)",
  "Phase 4 (Next.js/Supabase migration) remains deferred — possibly never",
  "Maximalist Phase 1 confirmed — build everything possible before launch",
  "Litmus test established: 'if it doesn't impact other decisions and can wait, push to post-audit pipeline'",
  "D4 reframed: deferred → complete. Migration drafting (a-b1) surfaced findings the original Phase B passes missed.",
  "D5 deferred-with-reason: no built artifacts to audit — Phase 4 work",
  "p1-5 description scrubbed: 'Path A/B' was never spec'd, never built — single-path Pact ritual all along",
  "Schema Migration v1.1 (a-b1) APPLIED 2026-04-27 — additive: 4 tables, 2 columns, archetype enum +5 canonical values",
  "Seed contributors (Maya/Wen/Anselm) LANDED in production Supabase — 24 rows total, all flagged is_seed=true",
  "Data Architecture spec patched v1.1→v1.2: Identity Types section added (Phase 1 text vs Phase 2 uuid)",
  "Spawned: retire 6 legacy archetype_id enum values via type-swap migration (a-d2)",
  "AUDIT CLOSED 2026-04-27 — Phase 1 build queue may begin",
  // ── Post-audit decisions (2026-04-27 → 2026-04-29) ──────────────────────
  "Path C-lite auth model: members-only login + is_author flag. Articles attribute to a single house Ghost user; bylines override from Supabase",
  "Three-surface model locked 2026-04-29: Article comments (depth) / Profile (identity + private mirror) / Community (the social feed). Non-overlapping purposes",
  "Brass + wood + paper visual languages formalized as :root CSS tokens. NEVER inline gradient stops",
  "Wait windows audit-confirmed: 8s pre-reflection / 12s pre-Stage-2.5 lock / 60-min malleability. Encoded as module-level constants in dialecta-private-draft.jsx",
  "Vercel Pro tier upgrade 2026-04-29 (resolved Hobby's 12-function cap). Future routes can stay separate RESTful files",
  "Reconciliation pass 2026-04-29 (afternoon): 18 audit queue items inventoried by current status; a-d2 verified Complete via Supabase MCP; 7 new build items added (a-b17 through a-b23) reflecting article + engines + responsive + topics + quotes work shipped since the audit closed",
  "M5 polish pass 2026-04-29 (late afternoon): a-b3 closed retroactively (discharged by Stage B.2), a-b14 done (Republic→Community at page-stewards.hbs:942), a-b16 decided in favor of prose-with-companion-doc (p1-6 description reframed), a-b15 deferred at user request (page-stewards.hbs being reviewed by another process). Pact cohesion findings logged for Sprint 7 (13 inline gradient literals + parallel --pact-card-brass token; zero usage of canonical brass/wood/paper tokens; brass buttons canonical)",
];

const AUDIT_QUEUE = [
  // Statuses reconciled 2026-04-29 (afternoon reconciliation pass).
  {id:"a-b1", label:"✓ Schema Migration v1.1 — APPLIED 2026-04-27 (4 tables + 2 columns + enum +5 + seeds)"},
  {id:"a-b2", label:"✓ Engine v2.0.0 Axis Refactor — DONE 2026-04-27"},
  {id:"a-b3", label:"✓ Archetype Scrub: Diplomat + Oracle — DISCHARGED by Stage B.2 (profile unification); verified 2026-04-29"},
  {id:"a-b4", label:"◐ SVG Tier Icons — engines surfaces use shared dialecta-tier-badge.jsx; Pact still inline (unification pending)"},
  {id:"a-b5", label:"◐ Comment API — Stage A DONE (mig 012); axis_events writes still open"},
  {id:"a-b6", label:"✓ Profile API joined returns — DONE 2026-04-27"},
  {id:"a-b7", label:"✓ index.jsx HERO_PROFILES → API-fetched seeds — DONE 2026-04-27"},
  {id:"a-b8", label:"◐ Operational Layer — Vercel Pro + 2 indexes done; Supavisor + remaining indexes + cache open"},
  {id:"a-b9", label:"◐ post.hbs Tier Badge — component built; article-side mount empty pending classification surface"},
  {id:"a-b10",label:"⊘ Reclassification Nomination UI — DEFERRED Phase 2.5 (no nominations table)"},
  {id:"a-b11",label:"○ AI Analysis Disclosure UI — open, awaits article-side classification surface"},
  {id:"a-b12",label:"⊘ Stage 2.5 Nomination Amendment Window — DEFERRED Phase 2.5 (depends on a-b10)"},
  {id:"a-b13",label:"○ Article Wait Window Enforcement — open (comment-side wait windows already encoded in dialecta-private-draft.jsx)"},
  {id:"a-b14",label:"✓ page-stewards Republic→Community scrub — DONE 2026-04-29 (replaced with 'The community recognizes…')"},
  {id:"a-b15",label:"⏸ page-stewards masthead logo treatment — DEFERRED 2026-04-29 (page being reviewed by another process; user-requested hold)"},
  {id:"a-b16",label:"✓ page-stewards Satirist's Charter — DONE 2026-04-29 (prose form accepted; full Charter deferred to companion doc)"},
  {id:"p2-18",label:"○ 12 Ghost Tags with canonical slugs — open (blocks M3 completion)"},
  {id:"p2-19",label:"✓ Comment Submission Wiring — DONE via engines build (a-b19), 2026-04-29"},
  {id:"p2-20",label:"○ Supabase Storage — Photo Uploads (avatars; article images use api/article/upload-image, separate)"},
  {id:"a-d2", label:"✓ Retire 6 legacy archetype_id enum values — VERIFIED in production 2026-04-29 (Supabase MCP)"},
  // Post-audit production builds added in the reconciliation pass:
  {id:"a-b17",label:"✓ Article Pipeline Phase 1A-1C — DONE 2026-04-27 → 2026-04-28"},
  {id:"a-b18",label:"✓ Article Display Surface (editorial typography + brass tokens) — DONE 2026-04-28"},
  {id:"a-b19",label:"✓ Discourse Engines (Private Draft Stage 1 + Feed) — DONE 2026-04-29"},
  {id:"a-b20",label:"◐ Steward Order Picker — component shipped; some endpoints uncommitted"},
  {id:"a-b21",label:"✓ Mobile Responsive Stage B.2 (Profile unification) — DONE 2026-04-28"},
  {id:"a-b22",label:"✓ Topics v2 Unification (src/topics.js as canonical) — DONE 2026-04-28"},
  {id:"a-b23",label:"✓ Quote Library Page — DONE 2026-04-28"},
];

// Legend for AUDIT_QUEUE labels:
//   ✓  complete
//   ◐  in progress / partial
//   ○  open
//   ⊘  deferred

// ─── First Quills — Minimal Launch Roadmap (decided 2026-04-27) ──────────────
// 6 milestones from current state → 5–6 contributors writing real articles
// in production. Then content backlog accumulates → public launch.
const LAUNCH_MILESTONES = [
  {
    id:"M1", title:"Profile system live with seed data",
    items:["a-b6","a-b7"], sessions:"1–2",
    deliverable:"Visit /profile/seed:maya on live site → real data flowing from Supabase to React",
  },
  {
    id:"M2", title:"Engine canonical",
    items:["a-b2","a-b3"], sessions:"1–2",
    deliverable:"Profiles render with canonical axes (acuity / reach / magnanimity) + correct canonical 8 archetypes",
  },
  {
    id:"M3", title:"Discourse layer wired",
    items:["p2-18","p2-19","a-b5","a-b9"], sessions:"2–3",
    deliverable:"Write article in Ghost Admin → readers comment → tier classification fires → tier badges visible",
  },
  {
    id:"M4", title:"Mobile responsive foundations",
    items:["p4-4"], sessions:"2",
    deliverable:"Profile + Post + Pact + Stewards pages render correctly on phones; First Quills can use the platform from anywhere",
  },
  {
    id:"M5", title:"Onboarding polish",
    items:["a-b14","a-b16","a-b15"], sessions:"1–2",
    deliverable:"Site coherent enough to feel finished to a smart friend (Republic→Community scrub, Charter decision, masthead logo decision, Pact review-pass)",
  },
  {
    id:"M6", title:"First Quills onboarding",
    items:[], sessions:"1 prep + 4–8 weeks iteration",
    deliverable:"5–6 contributors (you + 4–5 invitees) writing real articles + commenting on each other in production. Content backlog goal: ~10–20 articles + ~50–100 comments before public launch.",
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({status}) {
  const c = STATUS_CFG[status] || STATUS_CFG["Not Started"];
  return <span style={{display:"inline-block",padding:"3px 8px",borderRadius:T.rSm,background:c.bg,color:c.fg,fontFamily:T.fMono,fontSize:"0.6rem",letterSpacing:"0.06em",textTransform:"uppercase",border:"1px solid rgba(0,0,0,0.08)",whiteSpace:"nowrap"}}>{status}</span>;
}

function ItemCard({item,items,expanded,onToggle,onEdit,changeStatus,isBlocked}) {
  const lc = LAYER_COLORS[item.layer] || T.textTertiary;
  return (
    <div onClick={()=>onToggle(item.id)} style={{background:T.bgWhite,borderRadius:T.rMd,marginBottom:8,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid ${lc}`,boxShadow:expanded?T.shadowMd:T.shadowSm,cursor:"pointer",opacity:item.status==="Deferred"?0.68:1,transition:"box-shadow 0.15s"}}>
      <div style={{padding:"10px 14px"}}>
        <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
          <StatusBadge status={item.status}/>
          {isBlocked && <span style={{fontFamily:T.fMono,fontSize:"0.58rem",padding:"2px 6px",borderRadius:T.rSm,color:T.amber,background:T.goldPale,border:`1px solid ${T.borderRule}`,letterSpacing:"0.06em",textTransform:"uppercase"}}>blocked</span>}
        </div>
        <div style={{fontFamily:T.fDisplay,fontSize:"0.95rem",fontWeight:500,color:T.textPrimary,lineHeight:1.3,marginBottom:5}}>{item.title}</div>
        <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:T.fMono,fontSize:"0.58rem",color:T.textTertiary,textTransform:"uppercase",letterSpacing:"0.06em"}}>
          <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:lc,flexShrink:0}}/>
          {item.layer}
          {item.artifact && <><span style={{color:T.borderMedium}}>·</span><span style={{color:T.amber,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.artifact}</span></>}
        </div>
      </div>
      {expanded && (
        <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${T.borderLight}`}}>
          {item.description && <p style={{fontFamily:T.fReading,fontSize:"0.88rem",color:T.textBody,lineHeight:1.65,margin:"0 0 10px"}}>{item.description}</p>}
          {item.notes && <p style={{fontFamily:T.fMono,fontSize:"0.62rem",color:T.textSecondary,lineHeight:1.5,margin:"0 0 10px",padding:"8px 10px",background:T.bgSecondary,borderRadius:T.rSm}}>{item.notes}</p>}
          {item.dependencies.length>0 && (
            <div style={{marginBottom:10}}>
              <span style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginRight:7}}>Depends on:</span>
              {item.dependencies.map(depId=>{
                const dep=items.find(i=>i.id===depId); if(!dep) return null;
                const met=dep.status==="Complete";
                return <span key={depId} style={{display:"inline-block",marginRight:4,marginBottom:3,padding:"2px 7px",borderRadius:T.rSm,background:met?"rgba(74,124,89,0.1)":T.goldPale,border:`1px solid ${met?"rgba(74,124,89,0.25)":T.borderRule}`,fontFamily:T.fMono,fontSize:"0.58rem",color:met?"#4a7c59":T.amber}}>{dep.title}</span>;
              })}
            </div>
          )}
          <div style={{display:"flex",gap:7,marginTop:10}}>
            <select onClick={e=>e.stopPropagation()} value={item.status} onChange={e=>{e.stopPropagation();changeStatus(item.id,e.target.value);}} style={{flex:1,padding:"5px 8px",borderRadius:T.rSm,border:`1px solid ${T.borderMedium}`,fontFamily:T.fMono,fontSize:"0.65rem",background:T.bgWhite,color:T.textBody,cursor:"pointer",outline:"none"}}>
              {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={e=>{e.stopPropagation();onEdit(item);}} style={{padding:"5px 16px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fDisplay,fontSize:"0.9rem",fontWeight:500,background:"transparent",color:T.amber,border:`1px solid rgba(184,115,42,0.35)`}}>Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseColumn({phase,items,allItems,expandedCard,onToggle,onEdit,changeStatus,blockedIds,onAdd}) {
  const done=items.filter(i=>i.status==="Complete").length;
  const pct=items.length?Math.round((done/items.length)*100):0;
  const full=pct===100&&items.length>0;
  return (
    <div style={{minWidth:264,maxWidth:280,flexShrink:0}}>
      <div style={{marginBottom:14,paddingBottom:10,borderBottom:`2px solid ${full?"#4a7c59":T.amber}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
          <div style={{fontFamily:T.fDisplay,fontSize:"1.05rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary}}>{phase.id}. {phase.name}</div>
          <div style={{fontFamily:T.fMono,fontSize:"0.6rem",color:full?"#4a7c59":T.textMuted}}>{pct}%</div>
        </div>
        <div style={{fontFamily:T.fMono,fontSize:"0.58rem",color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{phase.timeline}</div>
        <div style={{height:3,background:T.bgTertiary,borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:full?"#4a7c59":T.gold,borderRadius:2,transition:"width 0.4s"}}/>
        </div>
      </div>
      {items.length===0
        ? <div style={{fontFamily:T.fReading,fontSize:"0.82rem",color:T.textMuted,fontStyle:"italic",textAlign:"center",padding:"24px 0"}}>No items match filters</div>
        : items.map(item=><ItemCard key={item.id} item={item} items={allItems} expanded={expandedCard===item.id} onToggle={onToggle} onEdit={onEdit} changeStatus={changeStatus} isBlocked={blockedIds.has(item.id)}/>)
      }
      <button onClick={()=>onAdd(phase.id)} style={{width:"100%",padding:"8px",marginTop:4,borderRadius:T.rSm,cursor:"pointer",border:`1px dashed ${T.borderDark}`,background:"transparent",color:T.textMuted,fontFamily:T.fMono,fontSize:"0.6rem",letterSpacing:"0.06em",textTransform:"uppercase"}}>+ Add item</button>
    </div>
  );
}

function Modal({formData,onUpdate,onSave,onDelete,onClose,allItems,isNew}) {
  const iSt={width:"100%",padding:"10px 14px",borderRadius:T.rSm,boxSizing:"border-box",border:`1px solid ${T.borderMedium}`,fontFamily:T.fBody,fontSize:"0.88rem",background:T.bgWhite,color:T.textPrimary,outline:"none"};
  const lSt={display:"block",fontFamily:T.fBody,fontSize:"0.82rem",fontWeight:500,color:T.textPrimary,marginBottom:6};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(28,24,20,0.58)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:T.bgPrimary,borderRadius:T.rMd,width:"100%",maxWidth:520,padding:28,boxShadow:T.shadowLg,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${T.borderLight}`}}>
        <div style={{fontFamily:T.fDisplay,fontSize:"1.5rem",fontStyle:"italic",fontWeight:500,color:T.textPrimary,marginBottom:20}}>{isNew?"Add Item":"Edit Item"}</div>
        <div style={{marginBottom:16}}><label style={lSt}>Title *</label><input value={formData.title} onChange={e=>onUpdate("title",e.target.value)} style={iSt} placeholder="Item title" autoFocus/></div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:1}}><label style={lSt}>Phase</label><select value={formData.phase} onChange={e=>onUpdate("phase",parseInt(e.target.value))} style={iSt}>{PHASES.map(p=><option key={p.id} value={p.id}>Phase {p.id} — {p.name}</option>)}</select></div>
          <div style={{flex:1}}><label style={lSt}>Layer</label><select value={formData.layer} onChange={e=>onUpdate("layer",e.target.value)} style={iSt}>{LAYERS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={lSt}>Status</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {STATUSES.map(s=>{const c=STATUS_CFG[s];const a=formData.status===s;return <button key={s} onClick={()=>onUpdate("status",s)} style={{padding:"5px 12px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fDisplay,fontSize:"0.9rem",background:a?c.bg:T.bgWhite,color:a?c.fg:T.textBody,border:`1px solid ${a?c.bg:T.borderMedium}`}}>{s}</button>;})}
          </div>
        </div>
        <div style={{marginBottom:16}}><label style={lSt}>Artifact filename</label><input value={formData.artifact||""} onChange={e=>onUpdate("artifact",e.target.value||null)} style={{...iSt,fontFamily:T.fMono,fontSize:"0.72rem"}} placeholder="e.g. dialecta-profile.jsx"/></div>
        <div style={{marginBottom:16}}><label style={lSt}>Description</label><textarea value={formData.description} onChange={e=>onUpdate("description",e.target.value)} rows={3} style={{...iSt,resize:"vertical",fontFamily:T.fReading,lineHeight:1.6}}/></div>
        <div style={{marginBottom:16}}><label style={lSt}>Notes</label><textarea value={formData.notes} onChange={e=>onUpdate("notes",e.target.value)} rows={2} style={{...iSt,resize:"vertical"}} placeholder="Blockers, context..."/></div>
        <div style={{marginBottom:20}}>
          <label style={lSt}>Dependencies <span style={{fontFamily:T.fMono,fontSize:"0.6rem",color:T.textMuted,fontWeight:400}}>(click to toggle)</span></label>
          <div style={{maxHeight:110,overflowY:"auto",border:`1px solid ${T.borderMedium}`,borderRadius:T.rSm,padding:8,background:T.bgWhite,display:"flex",flexWrap:"wrap",gap:5}}>
            {allItems.filter(i=>i.id!==formData.id).map(i=>{const a=(formData.dependencies||[]).includes(i.id);return <button key={i.id} onClick={()=>{const d=formData.dependencies||[];onUpdate("dependencies",a?d.filter(x=>x!==i.id):[...d,i.id]);}} style={{padding:"2px 8px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fMono,fontSize:"0.58rem",border:"none",background:a?T.amber:T.bgTertiary,color:a?"#fff":T.textSecondary}}>{i.title}</button>;})}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>{!isNew&&<button onClick={()=>{if(confirm("Remove this item?"))onDelete(formData.id);}} style={{padding:"8px 16px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fDisplay,fontSize:"0.9rem",background:"transparent",color:"#c44a4a",border:"1px solid rgba(196,74,74,0.3)"}}>Remove</button>}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"8px 18px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fDisplay,fontSize:"0.9rem",background:"transparent",color:T.textSecondary,border:`1px solid ${T.borderMedium}`}}>Cancel</button>
            <button onClick={onSave} disabled={!formData.title?.trim()} style={{padding:"8px 22px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fDisplay,fontSize:"0.9rem",fontWeight:500,background:formData.title?.trim()?T.bgDark:T.bgTertiary,color:formData.title?.trim()?T.bgPrimary:T.textMuted,border:"none"}}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function DialectaDashboard() {
  const [items,setItems]         = useState(DEFAULT_ITEMS);
  const [loaded,setLoaded]       = useState(false);
  const [view,setView]           = useState("board");
  const [layerF,setLayerF]       = useState("All");
  const [statusF,setStatusF]     = useState("All");
  const [expanded,setExpanded]   = useState(null);
  const [modalOpen,setModalOpen] = useState(false);
  const [form,setForm]           = useState(null);
  const [toast,setToast]         = useState(null);
  const fileRef = useRef(null);

  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap";
    document.head.appendChild(link);
  },[]);

  useEffect(()=>{
    (async()=>{
      try{const r=await window.storage.get(STORAGE_KEY);if(r?.value){const p=JSON.parse(r.value);if(Array.isArray(p)&&p.length)setItems(p);}}catch{}
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{
    if(!loaded)return;
    window.storage.set(STORAGE_KEY,JSON.stringify(items)).catch(console.error);
  },[items,loaded]);

  const notify = msg=>{setToast(msg);setTimeout(()=>setToast(null),2600);};
  const openAdd = phase=>{setForm({title:"",phase,layer:"Foundation",status:"Not Started",artifact:"",description:"",notes:"",dependencies:[]});setModalOpen(true);};
  const openEdit = item=>{setForm({...item});setModalOpen(true);};
  const closeModal = ()=>{setModalOpen(false);setForm(null);};
  const upForm = (k,v)=>setForm(p=>({...p,[k]:v}));
  const saveItem = ()=>{
    if(!form?.title?.trim())return;
    const isNew=!items.find(i=>i.id===form.id);
    if(isNew){setItems(p=>[...p,{...form,id:`item-${Date.now()}`,addedAt:new Date().toISOString().split("T")[0]}]);notify("Item added");}
    else{setItems(p=>p.map(i=>i.id===form.id?form:i));notify("Item updated");}
    closeModal();
  };
  const deleteItem=(id)=>{setItems(p=>p.filter(i=>i.id!==id));closeModal();notify("Item removed");};
  const changeStatus=(id,s)=>setItems(p=>p.map(i=>i.id===id?{...i,status:s}:i));
  const exportJSON=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(items,null,2)],{type:"application/json"}));a.download=`dialecta-dashboard-${new Date().toISOString().split("T")[0]}.json`;a.click();notify("Exported");};
  const importJSON=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const p=JSON.parse(ev.target.result);if(Array.isArray(p)){setItems(p);notify(`Imported ${p.length} items`);}}catch{notify("Invalid file");}};r.readAsText(f);e.target.value="";};
  const reset=()=>{if(confirm("Reset to defaults?")){{setItems(DEFAULT_ITEMS);notify("Reset");}}};

  // ── Next Steps: unblocked non-complete items, ordered by phase ──
  const nextItems = items
    .filter(i => i.status !== "Complete" && i.status !== "Deferred")
    .map(i => ({
      ...i,
      isBlocked: i.dependencies.some(depId => {
        const dep = items.find(d => d.id === depId);
        return dep && dep.status !== "Complete";
      })
    }))
    .sort((a, b) => {
      if (a.isBlocked !== b.isBlocked) return a.isBlocked ? 1 : -1;
      if (a.phase !== b.phase) return a.phase - b.phase;
      const so = ["In Progress","Not Started","Specced"];
      return so.indexOf(a.status) - so.indexOf(b.status);
    });

  const stats=STATUSES.reduce((a,s)=>({...a,[s]:items.filter(i=>i.status===s).length}),{});
  const pct=Math.round((stats["Complete"]/items.length)*100);
  const filtered=items.filter(i=>(layerF==="All"||i.layer===layerF)&&(statusF==="All"||i.status===statusF));
  const blockedIds=new Set();
  items.forEach(item=>item.dependencies.forEach(depId=>{const dep=items.find(i=>i.id===depId);if(dep&&dep.status!=="Complete")blockedIds.add(item.id);}));
  const toggle=id=>setExpanded(p=>p===id?null:id);

  const nbtn=(subtle)=>({padding:"3px 11px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",background:"transparent",border:"1px solid",borderColor:subtle?"rgba(240,235,224,0.12)":"rgba(240,235,224,0.25)",color:subtle?"rgba(240,235,224,0.3)":"rgba(240,235,224,0.65)"});

  return (
    <div style={{minHeight:"100vh",background:T.pageBg,fontFamily:T.fBody}}>

      {/* Logo bar 52px */}
      <div style={{height:52,background:T.navGrad,borderBottom:`1px solid ${T.navBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",position:"sticky",top:0,zIndex:200}}>
        <div style={{fontFamily:T.fDisplay,fontSize:"1.5rem",fontStyle:"italic",fontWeight:500,color:T.bgPrimary,letterSpacing:"-0.01em",lineHeight:1}}>Dialecta</div>
        <div style={{display:"flex",gap:2}}>
          {[["board","Board"],["next","Next Steps"],["audit","Audit"],["launch","Launch"]].map(([v,label])=>(
            <button key={v} onClick={()=>setView(v)} style={{
              padding:"3px 12px",borderRadius:T.rSm,cursor:"pointer",
              fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",
              letterSpacing:"0.06em",border:"none",
              background:view===v?"rgba(212,168,74,0.25)":"transparent",
              color:view===v?T.gold:"rgba(240,235,224,0.45)",
            }}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={exportJSON} style={nbtn(false)}>Export JSON</button>
          <button onClick={()=>fileRef.current?.click()} style={nbtn(false)}>Import JSON</button>
          <button onClick={reset} style={nbtn(true)}>Reset</button>
          <input type="file" ref={fileRef} accept=".json" onChange={importJSON} style={{display:"none"}}/>
        </div>
      </div>

      {/* Sub-nav 34px — warm metallic */}
      <div style={{height:34,background:T.subnavBg,borderBottom:`1px solid ${T.navBorder}`,boxShadow:`inset 0 1px 0 ${T.subnavHi},inset 0 -1px 0 ${T.subnavHi}`,display:"flex",alignItems:"center",padding:"0 20px",position:"sticky",top:52,zIndex:199,overflowX:"auto"}}>
        {["All",...LAYERS].map(l=>(
          <button key={l} onClick={()=>setLayerF(l)} style={{display:"flex",alignItems:"center",gap:5,height:34,padding:"0 11px",cursor:"pointer",fontFamily:T.fBody,fontSize:"0.82rem",fontWeight:400,letterSpacing:"0.01em",border:"none",borderRight:"1px solid rgba(180,175,165,0.28)",background:layerF===l?"rgba(255,255,255,0.35)":"transparent",color:layerF===l?T.textPrimary:T.textSecondary,transition:"background 0.15s",whiteSpace:"nowrap",flexShrink:0}}>
            {l!=="All"&&<span style={{width:7,height:7,borderRadius:"50%",background:LAYER_COLORS[l],display:"inline-block",flexShrink:0}}/>}
            {l}
          </button>
        ))}
        <div style={{flex:1}}/>
        {["All",...STATUSES].map(s=>(
          <button key={s} onClick={()=>setStatusF(s)} style={{padding:"0 10px",height:34,cursor:"pointer",fontFamily:T.fMono,fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"0.06em",border:"none",background:statusF===s?"rgba(28,24,20,0.08)":"transparent",color:statusF===s?T.textPrimary:T.textMuted,transition:"background 0.15s",whiteSpace:"nowrap",flexShrink:0}}>{s}</button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{background:"rgba(247,242,232,0.7)",borderBottom:`1px solid ${T.borderLight}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.1em",color:T.textMuted,marginBottom:2}}>Overall</div>
          <div style={{fontFamily:T.fDisplay,fontSize:"1.7rem",fontStyle:"italic",color:T.textPrimary,lineHeight:1}}>{pct}<span style={{fontSize:"0.9rem",color:T.textMuted}}>%</span></div>
        </div>
        <div style={{width:1,height:32,background:T.borderLight}}/>
        {STATUSES.map(s=>(
          <div key={s}>
            <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginBottom:2}}>{s}</div>
            <div style={{fontFamily:T.fDisplay,fontSize:"1.25rem",fontStyle:"italic",color:STATUS_CFG[s].bg,lineHeight:1}}>{stats[s]}</div>
          </div>
        ))}
        <div style={{width:1,height:32,background:T.borderLight}}/>
        <div>
          <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginBottom:2}}>Total</div>
          <div style={{fontFamily:T.fDisplay,fontSize:"1.25rem",fontStyle:"italic",color:T.textPrimary,lineHeight:1}}>{items.length}</div>
        </div>
        <div style={{flex:1,minWidth:80}}><div style={{height:4,background:T.bgTertiary,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:T.gold,borderRadius:2,transition:"width 0.5s"}}/></div></div>
        <button onClick={()=>openAdd(1)} style={{padding:"7px 20px",borderRadius:T.rSm,cursor:"pointer",fontFamily:T.fDisplay,fontSize:"1rem",fontWeight:500,background:T.bgDark,color:T.bgPrimary,border:"none",flexShrink:0}}>+ New Item</button>
      </div>

      {/* Board / Next Steps / Audit / Launch */}
      {view === "launch" ? (
        <div style={{padding:"24px 24px 48px",maxWidth:920}}>
          <div style={{fontFamily:T.fDisplay,fontSize:"1.6rem",fontStyle:"italic",fontWeight:500,color:T.textPrimary,marginBottom:4}}>First Quills</div>
          <div style={{fontFamily:T.fMono,fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginBottom:8}}>
            Minimal launch roadmap · 6 milestones · ~4–6 weeks of build, then 4–8 weeks of usage iteration
          </div>
          <p style={{fontFamily:T.fReading,fontSize:"0.92rem",color:T.textBody,lineHeight:1.6,marginTop:0,marginBottom:24,maxWidth:680}}>
            5–6 trusted contributors (you + 4–5 invitees) writing real articles and commenting on each other before public launch. Solves the "empty room on day one" problem and surfaces real-world usage issues with people who'll forgive friction.
          </p>

          {LAUNCH_MILESTONES.map((m, idx) => {
            // Derive milestone status from referenced item statuses
            const refItems = m.items.map(id => items.find(i => i.id === id)).filter(Boolean);
            const allComplete = refItems.length > 0 && refItems.every(i => i.status === "Complete");
            const anyInProgress = refItems.some(i => i.status === "In Progress");
            const status = m.id === "M6" ? "pending" : allComplete ? "complete" : anyInProgress ? "in-progress" : "pending";
            const stColor = status==="complete" ? "#4a7c59" : status==="in-progress" ? T.amber : T.textMuted;
            const stMark  = status==="complete" ? "✓" : status==="in-progress" ? "◐" : "○";

            return (
              <div key={m.id} style={{
                background:T.bgWhite, borderRadius:T.rMd,
                border:`1px solid ${T.borderLight}`, borderLeft:`3px solid ${stColor}`,
                boxShadow:T.shadowSm, marginBottom:14, padding:"16px 20px",
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6,gap:12}}>
                  <div style={{fontFamily:T.fDisplay,fontSize:"1.1rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary}}>
                    <span style={{color:stColor,marginRight:8}}>{stMark}</span>
                    {m.id} — {m.title}
                  </div>
                  <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",color:T.textMuted,whiteSpace:"nowrap"}}>
                    {m.sessions}
                  </div>
                </div>
                <p style={{fontFamily:T.fReading,fontSize:"0.85rem",color:T.textBody,lineHeight:1.55,margin:"0 0 10px"}}>
                  <strong style={{color:T.textPrimary,fontWeight:500}}>Deliverable:</strong> {m.deliverable}
                </p>
                {m.items.length > 0 && (
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8,paddingTop:10,borderTop:`1px solid ${T.borderLight}`}}>
                    {m.items.map(itemId => {
                      const item = items.find(i => i.id === itemId);
                      if (!item) {
                        return (
                          <span key={itemId} style={{fontFamily:T.fMono,fontSize:"0.58rem",color:T.amber,padding:"3px 8px",borderRadius:T.rSm,background:T.goldPale,border:`1px solid ${T.borderRule}`}}>
                            {itemId} (not found)
                          </span>
                        );
                      }
                      const itemColor = item.status==="Complete" ? "#4a7c59" : item.status==="In Progress" ? T.amber : T.textMuted;
                      const itemBg    = item.status==="Complete" ? "rgba(74,124,89,0.08)" : item.status==="In Progress" ? T.goldPale : T.bgSecondary;
                      return (
                        <span key={itemId} style={{
                          display:"inline-flex",alignItems:"center",gap:6,
                          fontFamily:T.fMono,fontSize:"0.6rem",
                          padding:"3px 8px",borderRadius:T.rSm,
                          background:itemBg,border:`1px solid ${T.borderLight}`,
                          color:T.textBody,
                        }}>
                          <span style={{color:itemColor,fontFamily:T.fMono,fontSize:"0.55rem"}}>[{itemId}]</span>
                          <span style={{fontFamily:T.fReading,fontSize:"0.72rem",color:T.textBody}}>{item.title}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{background:T.bgSecondary,borderRadius:T.rMd,border:`1px solid ${T.borderLight}`,padding:"14px 18px",marginTop:14}}>
            <div style={{fontFamily:T.fDisplay,fontSize:"0.95rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary,marginBottom:8}}>After M6 → Public launch criteria</div>
            <ul style={{margin:0,paddingLeft:20,fontFamily:T.fReading,fontSize:"0.82rem",color:T.textBody,lineHeight:1.6}}>
              <li>Content backlog ≥ 10–20 articles + 50+ comments accumulated</li>
              <li>Discovered usage issues from First Quills cycle addressed</li>
              <li>Remaining post.hbs items completed OR explicitly cut from launch: <span style={{fontFamily:T.fMono,fontSize:"0.7rem",color:T.amber}}>a-b10, a-b11, a-b12, a-b13</span> (Reclassification UI, AI Disclosure, Amendment Window, Wait Window)</li>
              <li>Final visual polish round</li>
              <li>Decision: open public registration or stay invitation-only</li>
            </ul>
          </div>

          <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,textAlign:"center",marginTop:24}}>
            Roadmap locked 2026-04-27 · revisit at end of each milestone
          </div>
        </div>
      ) : view === "audit" ? (
        <div style={{padding:"24px 24px 48px",maxWidth:920}}>
          <div style={{fontFamily:T.fDisplay,fontSize:"1.6rem",fontStyle:"italic",fontWeight:500,color:T.textPrimary,marginBottom:4}}>Coherence Audit</div>
          <div style={{fontFamily:T.fMono,fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginBottom:24}}>
            Phase A complete · Phase B in progress · Sync complete · April 2026
          </div>

          {/* Phase A — Vision Capture */}
          <div style={{background:T.bgWhite,borderRadius:T.rMd,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid #4a7c59`,padding:"16px 20px",marginBottom:14,boxShadow:T.shadowSm}}>
            <div style={{fontFamily:T.fDisplay,fontSize:"1.05rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary,marginBottom:2}}>Phase A — Vision Capture</div>
            <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",color:T.textMuted,marginBottom:12}}>6 domains · {AUDIT_PHASE_A.reduce((s,d)=>s+d.count,0)} canonical docs</div>
            {AUDIT_PHASE_A.map(d => (
              <div key={d.domain} style={{display:"flex",gap:12,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${T.borderLight}`}}>
                <div style={{flex:"0 0 220px",fontFamily:T.fDisplay,fontSize:"0.92rem",color:T.textPrimary,fontWeight:500}}>
                  <span style={{color:"#4a7c59",marginRight:6}}>✓</span>{d.domain}
                  <span style={{fontFamily:T.fMono,fontSize:"0.58rem",color:T.textMuted,marginLeft:8}}>({d.count})</span>
                </div>
                <div style={{flex:1,fontFamily:T.fReading,fontSize:"0.82rem",color:T.textBody,lineHeight:1.5}}>{d.notes}</div>
              </div>
            ))}
          </div>

          {/* Phase B — Reality Capture */}
          <div style={{background:T.bgWhite,borderRadius:T.rMd,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid ${T.amber}`,padding:"16px 20px",marginBottom:14,boxShadow:T.shadowSm}}>
            <div style={{fontFamily:T.fDisplay,fontSize:"1.05rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary,marginBottom:2}}>Phase B — Reality Capture</div>
            <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",color:T.textMuted,marginBottom:12}}>Build vs. spec gap analysis</div>
            {AUDIT_PHASE_B.map(d => {
              const c = d.status==="complete" ? "#4a7c59" : d.status==="in-progress" ? T.amber : T.textMuted;
              const mark = d.status==="complete" ? "✓" : d.status==="in-progress" ? "◐" : "○";
              return (
                <div key={d.domain} style={{display:"flex",gap:12,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${T.borderLight}`}}>
                  <div style={{flex:"0 0 280px",fontFamily:T.fDisplay,fontSize:"0.9rem",color:T.textPrimary,fontWeight:500}}>
                    <span style={{color:c,marginRight:6}}>{mark}</span>{d.domain}
                  </div>
                  <div style={{flex:1,fontFamily:T.fReading,fontSize:"0.82rem",color:T.textBody,lineHeight:1.5}}>{d.notes}</div>
                </div>
              );
            })}
          </div>

          {/* Sync */}
          <div style={{background:T.bgWhite,borderRadius:T.rMd,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid #6b7a8d`,padding:"16px 20px",marginBottom:14,boxShadow:T.shadowSm}}>
            <div style={{fontFamily:T.fDisplay,fontSize:"1.05rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary,marginBottom:2}}>Sync — Claude.ai → OneDrive</div>
            <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",color:T.textMuted,marginBottom:12}}>{AUDIT_SYNC.length} files</div>
            {AUDIT_SYNC.map(s => (
              <div key={s.file} style={{display:"flex",gap:12,marginBottom:6,alignItems:"baseline"}}>
                <div style={{flex:"0 0 380px",fontFamily:T.fMono,fontSize:"0.7rem",color:T.amber,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.file}</div>
                <div style={{flex:1,fontFamily:T.fReading,fontSize:"0.8rem",color:T.textBody,lineHeight:1.5,fontStyle:"italic"}}>{s.detail}</div>
              </div>
            ))}
          </div>

          {/* Decisions */}
          <div style={{background:T.bgWhite,borderRadius:T.rMd,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid ${T.gold}`,padding:"16px 20px",marginBottom:14,boxShadow:T.shadowSm}}>
            <div style={{fontFamily:T.fDisplay,fontSize:"1.05rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary,marginBottom:12}}>Audit Decisions</div>
            {AUDIT_DECISIONS.map((d,i) => (
              <div key={i} style={{display:"flex",gap:10,marginBottom:7,fontFamily:T.fReading,fontSize:"0.85rem",color:T.textBody,lineHeight:1.55}}>
                <span style={{color:T.gold,flexShrink:0}}>·</span>
                <span>{d}</span>
              </div>
            ))}
          </div>

          {/* Build queue unlocked */}
          <div style={{background:T.bgWhite,borderRadius:T.rMd,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid ${T.bgDark}`,padding:"16px 20px",marginBottom:14,boxShadow:T.shadowSm}}>
            <div style={{fontFamily:T.fDisplay,fontSize:"1.05rem",fontWeight:600,fontStyle:"italic",color:T.textPrimary,marginBottom:2}}>Phase 1 Build Queue Unlocked</div>
            <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",color:T.textMuted,marginBottom:12}}>{AUDIT_QUEUE.length} items · ready to start once audit closes</div>
            {AUDIT_QUEUE.map(q => {
              const item = items.find(i=>i.id===q.id);
              const layer = item?.layer || "Cross-Layer";
              const lc = LAYER_COLORS[layer] || T.textTertiary;
              return (
                <div key={q.id} style={{display:"flex",gap:10,marginBottom:7,alignItems:"center"}}>
                  <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:lc,flexShrink:0}}/>
                  <span style={{fontFamily:T.fMono,fontSize:"0.6rem",color:T.textMuted,minWidth:42}}>{q.id}</span>
                  <span style={{fontFamily:T.fReading,fontSize:"0.85rem",color:T.textBody,lineHeight:1.5}}>{q.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,textAlign:"center",marginTop:24}}>
            Audit artifact: Fundamentals/Claude Integration/dialecta-coherence-audit.md
          </div>
        </div>
      ) : view === "next" ? (
        <div style={{padding:"24px 24px 48px",maxWidth:760}}>
          <div style={{fontFamily:T.fDisplay,fontSize:"1.6rem",fontStyle:"italic",fontWeight:500,color:T.textPrimary,marginBottom:4}}>Next Steps</div>
          <div style={{fontFamily:T.fMono,fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginBottom:24}}>
            {nextItems.filter(i=>!i.isBlocked).length} unblocked · {nextItems.filter(i=>i.isBlocked).length} blocked
          </div>
          {nextItems.length === 0
            ? <div style={{fontFamily:T.fReading,fontSize:"0.9rem",color:T.textMuted,fontStyle:"italic"}}>All items complete.</div>
            : nextItems.map((item,idx)=>{
                const lc = LAYER_COLORS[item.layer] || T.textTertiary;
                const phaseLabel = PHASES.find(p=>p.id===item.phase)?.name || "";
                return (
                  <div key={item.id} style={{
                    background:T.bgWhite,borderRadius:T.rMd,
                    border:`1px solid ${T.borderLight}`,
                    borderLeft:`3px solid ${item.isBlocked ? T.borderDark : lc}`,
                    boxShadow:T.shadowSm,marginBottom:10,padding:"12px 16px",
                    opacity:item.isBlocked?0.6:1,
                  }}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12,justifyContent:"space-between"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                          <StatusBadge status={item.status}/>
                          {item.isBlocked && <span style={{fontFamily:T.fMono,fontSize:"0.58rem",padding:"2px 6px",borderRadius:T.rSm,color:T.amber,background:T.goldPale,border:`1px solid ${T.borderRule}`,textTransform:"uppercase",letterSpacing:"0.06em"}}>blocked</span>}
                        </div>
                        <div style={{fontFamily:T.fDisplay,fontSize:"1rem",fontWeight:500,color:T.textPrimary,lineHeight:1.3,marginBottom:5}}>{item.title}</div>
                        {item.description && <p style={{fontFamily:T.fReading,fontSize:"0.85rem",color:T.textBody,lineHeight:1.6,margin:"0 0 8px"}}>{item.description}</p>}
                        {item.notes && <p style={{fontFamily:T.fMono,fontSize:"0.6rem",color:T.textSecondary,lineHeight:1.45,margin:0,padding:"6px 8px",background:T.bgSecondary,borderRadius:T.rSm}}>{item.notes}</p>}
                        {item.isBlocked && item.dependencies.length>0 && (
                          <div style={{marginTop:8}}>
                            <span style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.08em",color:T.textMuted,marginRight:6}}>Waiting on:</span>
                            {item.dependencies.map(depId=>{
                              const dep=items.find(i=>i.id===depId);
                              if(!dep||dep.status==="Complete") return null;
                              return <span key={depId} style={{display:"inline-block",marginRight:4,padding:"2px 7px",borderRadius:T.rSm,background:T.goldPale,border:`1px solid ${T.borderRule}`,fontFamily:T.fMono,fontSize:"0.58rem",color:T.amber}}>{dep.title}</span>;
                            })}
                          </div>
                        )}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        <div style={{fontFamily:T.fMono,fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.06em",color:T.textMuted}}>Phase {item.phase} · {phaseLabel}</div>
                        <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:T.fMono,fontSize:"0.58rem",color:T.textTertiary,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                          <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:lc}}/>
                          {item.layer}
                        </div>
                        <select
                          value={item.status}
                          onChange={e=>changeStatus(item.id,e.target.value)}
                          style={{marginTop:4,padding:"4px 6px",borderRadius:T.rSm,border:`1px solid ${T.borderMedium}`,fontFamily:T.fMono,fontSize:"0.6rem",background:T.bgWhite,color:T.textBody,cursor:"pointer",outline:"none"}}
                        >
                          {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      ) : (
      <div style={{overflowX:"auto",padding:"20px 20px 48px",display:"flex",gap:14,alignItems:"flex-start",minHeight:"calc(100vh - 190px)"}}>
        {PHASES.map(phase=>(
          <PhaseColumn key={phase.id} phase={phase}
            items={filtered.filter(i=>i.phase===phase.id)}
            allItems={items} expandedCard={expanded}
            onToggle={toggle} onEdit={openEdit}
            changeStatus={changeStatus} blockedIds={blockedIds}
            onAdd={openAdd}/>
        ))}
      </div>

      )}
      {modalOpen&&form&&<Modal formData={form} onUpdate={upForm} onSave={saveItem} onDelete={deleteItem} onClose={closeModal} allItems={items} isNew={!items.find(i=>i.id===form.id)}/>}

      {toast&&<div style={{position:"fixed",bottom:20,right:20,background:T.bgDark,color:T.textOnDark,padding:"9px 18px",borderRadius:T.rSm,fontFamily:T.fMono,fontSize:"0.65rem",letterSpacing:"0.05em",boxShadow:T.shadowLg,zIndex:9999}}>{toast}</div>}
    </div>
  );
}
