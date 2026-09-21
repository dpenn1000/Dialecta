/**
 * Every string a person reads lives here so scripts/voice_check.py can check it.
 * Governed by docs/Dialecta_Editorial_Voice.md (v1.2). No em dashes, en dashes,
 * or "--" in anything below.
 *
 * commenterMessages are the reference messages from Editorial Voice, section
 * "Reference messages", copied verbatim. They are the fallback when the
 * classifier's own message fails validation, and the yardstick for reviewing it.
 */
import type { Tier } from '@dialecta/core';

export const strings = {
  site: {
    name: 'Dialecta',
    tagline: 'A platform for constructive dialogue, informed debate, and idea-first discourse.',
  },
  shell: {
    skipToContent: 'Skip to content',
    primaryNavLabel: 'Primary',
    footerNavLabel: 'Footer',
    nav: {
      articles: 'Articles',
      community: 'Community',
      stewards: 'Stewards',
      pact: 'The Pact',
      fingerprint: 'The Living Fingerprint',
      guidebook: 'Guidebook',
      about: 'About',
    },
    write: 'Write',
    signIn: 'Sign in',
    signOut: 'Sign out',
    signedIn: 'Signed in',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    drawerLabel: 'Site navigation',
    drawerSubtitle: 'A publication',
    footerNote:
      'A platform for constructive dialogue, informed debate, and idea-first discourse. Founded April 2026. Built on the belief that thinking well is worth rewarding.',
  },

  commenterMessages: {
    spark:
      "This raises something the article doesn't address. One sentence on why it matters would likely move this to Forum, or post as-is.",
    echo:
      "This restates the article's second claim closely. Adding what you'd change about it, or where it breaks, would give readers something new, or post as-is.",
    fog: "The reader can't locate what you believe here. One sentence stating the position would likely move this to Spark or Forum, or post as-is.",
    heat: "The feeling is clear, and there isn't yet a specific claim for others to engage with. One sentence about what specifically you think is wrong would likely move this to Forum, or post as-is.",
    stance:
      "The framing signals a side more than it engages the article's claim. Naming the specific point you disagree with would likely move this to Forum, or post as-is.",
    breach:
      "This names a person rather than an idea. It won't appear in the default view, and the reason is shown next to it. Editing the line about [name] would change that.",
  } satisfies Partial<Record<Tier, string>>,

  notices: {
    supabaseNotConfigured:
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example) to load articles.',
    articleNotFound: 'No article has that address.',
    noArticlesYet: 'No articles are published yet.',
  },

  /**
   * Platform analytics at /analytics, Dan's surface. Every metric names the
   * decision it changes and the method behind its number; the spec is
   * team/builder/2026-09-20-analytics-spec.md.
   */
  analytics: {
    title: 'Analytics',
    readAt: (at: string) =>
      `Read at ${at} through the anon client, so nothing on this page bypasses row-level security.`,
    gate: {
      development:
        'Development server: the admin gate is not enforced here. Everything shown is readable by any visitor holding the anon key.',
      admin: (uid: string) => `Signed in as ${uid}, which is on the admin list.`,
    },
    notConfigured:
      'Supabase is not configured, so there is nothing to read. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    decides: 'Decides',
    method: 'Method',
    ofTotal: (n: string, total: string) => `${n} of ${total}`,
    failed: (what: string, message: string) => `${what} could not be read: ${message}`,
    notReadHere: (what: string) => `${what} could not be read, so this cannot be checked.`,
    unknownTierKeys: (keys: string) => `tier_mix carries keys that are not tiers: ${keys}.`,
    rejected: (n: number) =>
      `${n} ${n === 1 ? 'row' : 'rows'} did not match the expected shape and ${n === 1 ? 'is' : 'are'} left out.`,
    truncated: (read: number, total: number) =>
      `First ${read.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} rows.`,

    sections: {
      activity: 'Activity',
      contribution: 'Contribution',
      membership: 'Membership',
      discourse: 'Discourse',
      engine: 'Fingerprint engine',
      closed: 'Closed to this page',
      faults: 'Known faults',
    },

    activity: {
      comment: 'Last comment',
      article: 'Last article',
      follow: 'Last follow',
      engine: 'Last engine write',
      live: 'Live',
      stopped: 'Stopped',
      none: 'No rows yet',
      ago: (days: number) => (days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`),
      newest: (date: string, ago: string) => `The newest row on the platform is from ${date}, ${ago}.`,
      decision: 'Whether the figures below describe a trend or a baseline.',
      method: (days: number) =>
        `Newest created_at on published comments, published articles and follows, and newest last_updated on axis_scores, all excluding fixtures. Live means within ${days} days of this read.`,
    },

    contribution: {
      comments: {
        label: 'Published comments',
        decision: 'Whether community voting, 35% of a final tier, has anything to vote on.',
        method: 'Exact count of comments with status published, excluding fixture members.',
      },
      commenters: {
        label: 'Commenters',
        sub: (share: string) => `The most active wrote ${share} of the comments.`,
        decision: 'Whether to recruit commenters or writers next.',
        method:
          'Distinct member_id across published comments. The share is the largest single commenter over all published comments.',
      },
      replies: {
        label: 'Replies',
        decision: 'Whether threading ships before anything that reads the Discourse pillar.',
        method:
          'Published comments with a parent_id. Discourse measures back and forth, and a reply is the only row that records it.',
      },
      articles: {
        label: 'Published articles',
        sub: (authors: number, fixtures: number) =>
          `by ${authors} ${authors === 1 ? 'author' : 'authors'}` +
          (fixtures > 0 ? `, plus ${fixtures} ${fixtures === 1 ? 'fixture article' : 'fixture articles'}` : ''),
        decision: 'Whether publishing cadence, rather than comment volume, is the constraint.',
        method: 'Exact count of published articles and distinct author_member_id, with fixture authors counted apart.',
      },
      arrivals: {
        label: 'Comments by week',
        sub: (weeks: number) => `in the last ${weeks} weeks`,
        range: (from: string, to: string) => `Weeks of ${from} to ${to}`,
        scale: (max: number) => `Tallest bar: ${max}`,
        empty: (weeks: number) => `No published comments in the last ${weeks} weeks.`,
        decision: 'Whether arrivals are rising, flat or stopped.',
        method: (weeks: number) =>
          `Published comments bucketed by created_at into ${weeks} weeks starting Monday, UTC. published_at is not used: one migration set it to the same instant on every existing row.`,
      },
      first: {
        label: 'Commenters in arrival order',
        name: 'Name',
        firstComment: 'First comment',
        count: 'Comments',
        more: (n: number) => `and ${n} more`,
        unnamed: 'No name on the comment',
        empty: 'Nobody has a published comment yet.',
        decision:
          'Who the Founding Voices cohort would be. It goes to the earliest active commenters, and nothing in the schema defines active yet.',
        method: (shown: number) =>
          `First created_at per member_id across published comments, oldest first, the first ${shown} shown. The name is the one on the member's newest comment.`,
      },
    },

    membership: {
      base: (profiles: number, fixtures: number) =>
        `${profiles} ${profiles === 1 ? 'profile' : 'profiles'}, plus ${fixtures} ${fixtures === 1 ? 'fixture' : 'fixtures'}. profiles has no created_at, so nothing records when a member joined and arrivals cannot be counted.`,
      underwriters: {
        label: 'Underwriters',
        sub: (profiles: number) => `of ${profiles} ${profiles === 1 ? 'profile' : 'profiles'}`,
        setBy: (system: number, member: number, unset: number) =>
          `Set by a payment: ${system}. By a member: ${member}. Unrecorded: ${unset}.`,
        decision:
          'Whether the price decision is due. A tier set by a payment would carry set_by system; any other value was set by hand.',
        method:
          "Profiles whose subscription_tier is the internal key pro, labelled Underwriter as the subscription model requires. subscription_tier_set_by is read as system, a member id, or empty, and the id itself is never shown.",
      },
      cohorts: {
        label: 'Founding cohorts',
        charterWriters: 'Charter Writers',
        charterUnderwriters: 'Charter Underwriters',
        foundingVoices: 'Founding Voices or peer gifts',
        undocumented: (n: number) => `${n} ${n === 1 ? 'profile carries' : 'profiles carry'} gift flags in a combination the subscription model does not document.`,
        decision: 'When each founding cohort closes.',
        method:
          'By the columns docs/SUBSCRIPTION-MODEL.md names. Charter Writers: is_charter, is_gifted, no gift_expires_at. Charter Underwriters: is_charter without is_gifted. Founding Voices: is_gifted with a gift_expires_at and no is_charter, which a peer gift also matches, because gifted_by_member_id is withheld from this client.',
      },
      pact: {
        label: 'Signed the Pact',
        sub: (authors: number) => `${authors} of those ${authors === 1 ? 'is an author' : 'are authors'}`,
        decision: 'Whether commenting can require a signed Pact without shutting most existing members out.',
        method: 'Profiles with a pact_agreed_at, over profiles that are not fixtures. Authors by is_author.',
      },
    },

    discourse: {
      live: {
        label: 'Tier mix, live contributors',
        decision:
          'Whether the classifier has met enough Heat, Stance and Breach on real traffic to trust those boundaries.',
        method:
          'Sum of axis_scores.tier_mix across rows that are not fixtures. One unit is one axis an item reached, so each item counts once per axis its tier touches: on 2026-09-21 an article reached five, a Forum comment three and the Echo comment one, which weights the lower tiers down. One tier per comment lives in classifications, which this page cannot read.',
      },
      fixture: {
        label: 'Tier mix, fixtures',
        decision: 'Whether fixtures come off before any public surface quotes a platform-wide tier figure.',
        method: 'The same sum over fixture rows. These carry a tier mix with no events behind it.',
      },
      absent: (names: string) => `None from live contributors: ${names}.`,
      counts: (floor: number) => `Counts rather than shares: below ${floor} units, one item moves a share too far to read.`,
      empty: 'No tier mix recorded.',
      texture: {
        label: 'Turbulence and clarity, live',
        turbulence: 'Turbulence',
        clarity: 'Clarity',
        decision:
          "Whether a real contributor's fingerprint can show texture yet. At turbulence 0 it renders perfectly calm.",
        method:
          'Turbulence is Heat plus Stance over the six tiers other than Breach, and clarity is Forum over Forum, Echo and Fog. These are the recovered engine\'s formulas (dialecta-fingerprint-engine.jsx, deriveAxisMetrics, lines 199 to 205), which it applies per axis and this page applies to all live rows pooled. packages/core does not export them, so this is a second definition.',
        none: 'No live tier mix to derive from.',
      },
      articles: {
        label: 'Article tiers',
        unresolved: (n: number) => `${n} without a final tier.`,
        decision: 'Whether published essays hold the tier they ask of commenters.',
        method: 'final_tier on published articles by authors who are not fixtures, one per article.',
        empty: 'No published articles by live authors.',
      },
    },

    engine: {
      events: {
        label: 'Axis events recorded',
        sub: (comments: number) => `against ${comments} published ${comments === 1 ? 'comment' : 'comments'}`,
        decision: 'Whether the fingerprint has any input to render from.',
        method:
          'Sum of axis_scores.comment_count on rows that are not fixtures. The column counts axis events from articles and comments alike. axis_events itself is closed to this page; on 2026-09-21 the service role counted 27 rows there and this sum read 27.',
      },
      graduations: {
        label: 'Graduations, live',
        sub: (fixture: number, share: string) => `plus ${fixture} on fixtures, ${share} of the total`,
        decision: 'Whether any platform-wide fingerprint figure is safe to show.',
        method: 'Sum of graduation_count, split by the fixture tests below.',
      },
      topics: {
        label: 'Topic history coverage',
        sub: (axes: string) => (axes ? `only on ${axes}` : 'on no axis'),
        decision: 'Whether restoring topicPhases in the contributor carousel changes what real profiles show.',
        method:
          'Live axis_scores rows whose topic_history has a first element, read as topic_history->0 so the size of the history never matters. An axis with no history renders in its fallback colour.',
      },
      archetypes: {
        label: 'Archetypes assigned',
        decision: 'Whether initialise_contributor_axes() gets fixed before the next contributor arrives.',
        method: 'Live contributors with an axis_scores row who also have an archetypes row.',
      },
      coverage: {
        label: 'Profiles with a fingerprint',
        decision: 'How many members initialise_contributor_axes() has left without axis rows.',
        method:
          'Live contributors in axis_scores over profiles that are not fixtures. A difference of counts, because ghost_member_id, the join between the two, is withheld from this client. On 2026-09-21 the service role matched every fingerprint to a profile, so the difference was exact.',
      },
      fixtures: {
        carry: (live: number, fixture: number) =>
          `${live} live ${live === 1 ? 'contributor' : 'contributors'} and ${fixture} ${fixture === 1 ? 'fixture' : 'fixtures'} carry a fingerprint.`,
        agree: (n: number) => `Both fixture tests find the same ${n} ${n === 1 ? 'member' : 'members'}.`,
        profiles: (n: number) => `profiles.is_seed marks ${n}.`,
        disagree: (n: number) =>
          `The two fixture tests disagree on ${n} ${n === 1 ? 'member' : 'members'}, so a fixture figure below may include a live member or miss a fixture.`,
        method:
          'Two independent tests: a seed: prefix on member_id, and an axis row whose tier_mix sums higher than its comment_count, which is a tier mix with no events behind it.',
      },
    },

    closed: {
      lede: 'These tables hold rows this page cannot read. Each one is probed on every load, and a table that starts returning rows is flagged, because it may be exposed to every visitor too.',
      measured: (at: string) =>
        `Access measured ${at} from pg_policy, has_table_privilege and has_column_privilege.`,
      columns: 'Readable, with columns withheld from anon and authenticated. The probe selects a withheld column and expects a refusal.',
      policyFalse: 'Read policy is false, so only the service role, which bypasses row-level security, sees a row.',
      serviceOnly: 'Read policy names the service role only.',
      holds: 'Closed, as measured',
      opened: (n: number) =>
        `Returned ${n} ${n === 1 ? 'row' : 'rows'}. The access map is stale, and the table may be exposed.`,
      changed: (message: string) => `Behaves differently from the map: ${message}`,
      answers: {
        profiles: 'Which profile is which member: the join from a profile to its comments and its fingerprint, and who gave a gift.',
        classifications: 'Comment tiers one per comment, and how often the AI and the commenter agree.',
        axis_events: 'The engine ledger by source, article against comment.',
        share_events: 'Reach by channel.',
        celebration_events: 'Milestones shown to contributors.',
        tier_nominations: 'Community voting, 35% of a final tier.',
        fp_snapshots: 'Fingerprint snapshots over time.',
        aspirations: 'Declared aspirations.',
      },
    },

    faults: {
      measured: (at: string) => `Causes measured ${at}. The line marked Now is read on every load.`,
      cause: 'Cause',
      now: 'Now',
      fix: 'Fix',
      cleared: 'The symptom is gone. Check the cause before removing this entry.',
      initialise: {
        title: 'initialise_contributor_axes() aborts on every call',
        cause:
          "It inserts 'forming' into archetypes.archetype_id, and that enum holds only the eight archetype names; 'forming' is a value of archetype_confidence. The function is one transaction, so its axis_scores insert rolls back with it.",
        now: (without: number, total: number) =>
          `${without} of ${total} live ${total === 1 ? 'contributor' : 'contributors'} with a fingerprint ${without === 1 ? 'has' : 'have'} no archetype row.`,
        nowProfiles: (without: number, profiles: number) =>
          `${without} of ${profiles} ${profiles === 1 ? 'profile has' : 'profiles have'} no axis rows at all.`,
        fix: "migrator: write archetype_id as null with confidence 'forming', or add the placeholder to the enum. packages/core already models it as FORMING, outside ARCHETYPE_IDS.",
      },
      ledger: {
        title: 'Nothing in this repository writes axis_events or axis_scores',
        cause:
          'packages/core/src/axis-mapping.ts holds the ledger logic and, by design, no writer, and no route calls it. The handoffs name api/_axis-mapping.js as the April writer, and that file is not in this repository.',
        now: (ago: string) => `Last engine write ${ago}.`,
        fix: 'builder: write the ledger on the service role beside the classification insert in api/comment/route.ts.',
      },
      classifications: {
        title: 'Classifications are written from one route per codebase',
        cause:
          'apps/web/src/app/api/comment/route.ts line 244 here, and api/comment.js line 168 in the legacy API production still runs. Both write on the service role, and only the service role can read the result.',
        now: 'One tier per comment cannot be shown on this page.',
        fix: 'migrator: an admin-only function that returns aggregate counts, never rows.',
      },
      publishedAt: {
        title: 'comments.published_at is a backfill',
        cause:
          'Migration 20260920193044_publish_the_three_existing_comments set it to now() on every row that existed.',
        now: (n: number, distinct: number) =>
          `${n} published ${n === 1 ? 'comment carries' : 'comments carry'} ${distinct} distinct published_at ${distinct === 1 ? 'value' : 'values'}.`,
        fix: 'None needed. Arrivals on this page use created_at.',
      },
      commentCount: {
        title: 'axis_scores.comment_count counts axis events',
        cause:
          'Each article or comment adds one per axis it reaches, and articles count as well. packages/core names the same counter eventCount.',
        now: (events: number, comments: number) =>
          `${events} counted against ${comments} published ${comments === 1 ? 'comment' : 'comments'}.`,
        fix: 'migrator: rename the column or comment it, so nobody sums it as a comment count.',
      },
    },
  },

  login: {
    heading: 'Sign in',
    tagline: 'Sign in to comment, and to keep your Thinking Fingerprint attached to your name.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    sendLink: 'Send me a sign in link',
    sending: 'Sending',
    magicLinkSent: (email: string) => `Check ${email || 'your email'} for a link to finish signing in.`,
    magicLinkFailed: 'That link could not be sent. Check the address and try again.',
    continueWithGoogle: 'Continue with Google',
    signInFailed: 'That sign in link was not valid or has expired. Try again.',
  },

  comment: {
    malformedRequest: 'That request could not be read.',
    signInRequired: 'Sign in to comment.',
    profileRequired: 'Set up your profile before commenting.',
    profileIncomplete: 'Add a display name to your profile before commenting.',
    emailRequired: 'Your account has no email on file. Add one before commenting.',
    bodyRequired: 'Write something before submitting.',
    invalidArticle: 'article_id, article_slug and article_title are all required.',
    invalidParent: 'parent_id must be a valid id if provided.',
    invalidTier: 'That is not one of the seven tiers.',
    invalidClaims: 'article_claims must be a list of strings if provided.',
    rateLimited: "That's the fifth comment in ten minutes. Wait a few minutes and try again.",
    classificationFailed: 'The classification engine could not read this comment. Try again in a moment.',
    submissionFailed: 'That comment could not be submitted. Try again in a moment.',
  },

  /**
   * The brass reflection bar's defaults, from dialecta-reflection-bar.jsx
   * (lines 104-107), verbatim.
   */
  reflection: {
    eyebrow: 'Reflection',
    readyLabel: 'Ready',
    readingLabel: 'Reading',
    holdMessage: 'The reading has arrived. The moment is being held.',
  },

  /**
   * The writer at /write. Stage copy is the recovered editor's own
   * (_recovered-next/lib/theme/dialecta-editor.jsx), verbatim unless a note
   * says otherwise. Where it changed, the reason is that the recovered line
   * described something this build does not do.
   */
  writer: {
    pageTitle: 'Write',
    wordmark: 'Dialecta',
    railLabel: 'Writing stages',
    writingAs: (name: string) => `Writing as ${name}`,
    signIn: 'Sign in',
    // New. The recovered page showed nothing at all to a signed out visitor.
    signedOut: 'Sign in to publish. Drafting works without it, and the draft stays in this browser.',
    // New. Why publishing stops: the seam list atop src/app/api/article/route.ts.
    noProfile:
      'This sign in is not linked to a contributor profile yet, so publishing will stop at the last step. The draft stays in this browser until it can go.',
    editing: (title: string) => `Editing ${title}`,

    rail: {
      draft: 'Draft',
      declare: 'Declare',
      reflect: 'Reflection',
      stage25: 'Stage 2.5',
      posted: 'Posted',
    },

    restored: 'A draft from a previous session was restored.',
    discard: 'Discard and start fresh',
    discardConfirm: 'Discard the restored draft and start fresh?',

    save: {
      never: 'not yet saved',
      justNow: 'saved just now',
      seconds: (s: number) => `saved ${s} seconds ago`,
      // The recovered indicator read "saved 1 minutes ago" at one minute.
      minutes: (m: number) => (m === 1 ? 'saved a minute ago' : `saved ${m} minutes ago`),
    },

    words: (n: number) => `${n} ${n === 1 ? 'word' : 'words'}`,

    compose: {
      stageLabel: 'Stage 1 of 4',
      heading: 'Compose',
      sub: 'Write freely. Voice and intent are yours. Reflection comes after.',
      titleLabel: 'Title',
      titlePlaceholder: 'A working title is enough. You can refine it later.',
      // New: the recovered editor had no lede. post.hbs renders one above the byline.
      ledePlaceholder: 'A line or two under the title, if the piece wants one.',
      bodyLabel: 'Body',
      bodyPlaceholder: 'Begin writing. The article wants its own pace.',
      topicsLabel: 'Topics',
      primaryTopic: 'Primary topic',
      secondaryTags: 'Secondary tags',
      secondaryAside: '(optional, open)',
      tagPlaceholder: 'Add a tag, then Enter',
      addTag: 'Add',
      removeTag: (tag: string) => `Remove ${tag}`,
      continue: 'Continue to reflection',
      needTitle: 'A title is needed.',
      needWords: 'The body needs at least 50 words.',
      needTopic: 'Choose a primary topic.',
      tools: {
        h2: 'Section header (H2)',
        h3: 'Sub-section header (H3)',
        bold: 'Bold',
        italic: 'Italic',
        bulletList: 'Bulleted list',
        paragraph: 'Plain paragraph (clears heading or list)',
      },
    },

    consent: {
      stageLabel: 'Stage 2 of 4',
      heading: 'A pause before the declaration',
      lineDone: 'The draft is done.',
      lineWhat:
        'What follows is reflection. You will declare your claim, hear what the engine notices, and decide how to publish.',
      lineUnhurried: 'Publishing here is unhurried by design.',
      lineSaved: 'Your draft is auto-saved. You can step back and refine at any time. Nothing publishes until you choose.',
      back: 'Back to compose',
      continue: "Continue when you're ready",
    },

    declare: {
      stageLabel: (breath: number) => `Stage 2 of 4 · Declaration ${breath} of 2`,
      heading: 'Declare',
      breathOneSub: 'What is the article making, and what edges does it set?',
      // Trimmed from "...where does it land, and where might readers split?":
      // the reader split is the opinion map, which is not in this build.
      breathTwoSub: 'What is the strongest case against, and where does it land?',
      coreClaimLabel: 'Core Claim, required',
      coreClaimPrompt: 'In one or two sentences, what is this article actually arguing?',
      coreClaimPlaceholder: 'Your claim, in your own words. The engine will read independently and compare.',
      scopeLabel: 'Scope Boundary, required',
      scopePrompt: 'What is this article not arguing? What common misreading do you want to preempt?',
      scopePlaceholder: 'Naming the edge of the argument is itself a sign of clarity.',
      back: 'Back',
      toBreathTwo: 'Continue to second breath',
      breathOneHint: 'Both questions need at least a sentence.',
      objectionLabel: 'Strongest Objection, required',
      objectionPrompt:
        "What is the strongest case against your position? You don't have to agree with it, just name it.",
      objectionPlaceholder:
        'State the strongest version of the opposing case. Naming it well sets the floor of the discussion.',
      tierLabel: 'Suggested Tier, required',
      tierPrompt: 'Using the same tier system as comments, where do you think this article lands?',
      mapsLabel: 'Opinion Mapping',
      // New: stands in for OpinionMapsInput, which is not in this build.
      mapsDeferred: 'Opinion maps are not in this build. The article publishes without one.',
      backToBreathOne: 'Back to first breath',
      send: 'Send to reflection',
      needObjection: 'Strongest objection needs at least a sentence.',
      needTier: 'Pick a tier.',
    },

    /** "The Forum", "The Spark": the editor's own tier labels. */
    tierLabel: (name: string) => `The ${name}`,

    /** The editor's tier meanings, TIERS[].meaning (lines 127-142), verbatim. */
    tierMeanings: {
      forum:
        'Specific claim, well-supported, engages substance. Strong disagreement is welcome here, if it is about something specific.',
      spark: 'An interesting idea, underdeveloped. The seed of something good, but stops short.',
      echo: 'Restates the article or a prior position without adding to it.',
      fog: 'Vague or unclear. Reader cannot determine the core position or argument.',
      heat: 'High emotion, absent or buried claim. Passion without a point.',
      stance: 'Tribal framing dominant. Identity-signaling overshadows substance.',
      breach: 'A personal attack on a person, not an idea. The Pact has been broken.',
    } satisfies Record<Tier, string>,

    /** ARTICLE_REFLECTION_PHASES (lines 3088-3099), verbatim, in order. */
    reflectionPhases: [
      { main: 'Reading your words.', sub: 'The engine takes the article in line by line.' },
      {
        main: 'Finding the question your article puts to readers.',
        sub: 'What stance is a reader being asked to take by the end?',
      },
      {
        main: 'Naming the positions a real person could hold.',
        sub: 'The honest names for the stances along that question.',
      },
      {
        main: 'Weighing the structure against your declaration.',
        sub: 'Tier, specificity, the engagement with the strongest objection.',
      },
      { main: 'Letting the moment land.', sub: 'The reading is finished. We are not in a hurry.' },
    ],

    reflection: {
      stageLabel: 'Stage 3 of 4',
      heading: 'Reflection',
      // The recovered sub, "The engine has read the article...", is not true in
      // this build, so the card says what did happen.
      sub: 'Your declaration, as the engine will read it once it is connected.',
      yourDeclaration: 'Your declaration',
      coreClaim: 'Core claim',
      scope: 'Scope',
      objection: 'Objection',
      declaredTier: 'Declared tier',
      engineReading: 'Engine reading',
      engineOff:
        'No engine reading ran on this draft. The article classifier is not connected in this build, so there is nothing yet to compare your declaration against.',
      back: 'Back to declaration',
      continue: 'Continue',
    },

    stage25: {
      stageLabel: 'Stage 4 of 4 · Three options',
      heading: 'What now?',
      sub: 'The engine has spoken. None of these choices is wrong. Take whichever your work and your judgment lead toward.',
      amendKicker: 'Option A',
      amendTitle: 'Amend',
      amendLede:
        "Take the engine's reading back to the draft. Edit. Resubmit. The classification re-runs against your revised version.",
      amendFooter: 'Re-edit',
      respondKicker: 'Option B',
      respondTitle: 'Respond for the Record',
      respondLede:
        "Leave the article as it is. Add a public note saying where you agree or disagree with the engine's reading. Both are visible together.",
      respondFooter: 'Keep, with note',
      asIsKicker: 'Option C',
      asIsTitle: 'Post As-Is',
      asIsLede:
        "Publish without amendment and without a note. The engine's reading is disclosed alongside the article. The community proceeds with full information.",
      asIsFooter: 'Publish unchanged',
      back: 'Back to reflection',
      aside:
        'A reasoned disagreement nudges the tier slightly toward your declared position. The engine and the community stay primary.',
    },

    respond: {
      stageLabel: 'Respond for the record',
      heading: 'On the record',
      sub: 'Speak in your own words. Agreement, disagreement, both serve the record. Your note publishes alongside the article.',
      declaredPosition: 'Your declared position',
      standBy: 'Stand by your tier, or amend it here. Your note publishes either way.',
      noteLabel: 'Your note',
      notePlaceholder:
        "A few sentences are enough. Where do you agree with the engine's reading? Where do you disagree, and why?",
      back: 'Back to options',
      continue: 'Continue to publish',
      needNote: 'Write a note to continue',
      needNoteDetail:
        'The note above needs at least a sentence (20+ characters). It publishes alongside the article, so it will be read.',
    },

    final: {
      label: 'The publish moment',
      heading: 'Publish',
      sub: 'This is intentional. Publishing here carries weight. We will be ready when you are.',
      summaryKicker: 'About to publish',
      untitled: '(untitled)',
      declared: 'Declared',
      engine: 'Engine',
      choice: 'Choice',
      note: 'Note',
      // Both replace the recovered em dash fallback.
      notDeclared: 'Not declared',
      engineNotConnected: 'Not connected',
      choiceAmended: 'Amended',
      choiceResponded: 'Responded for the record',
      choiceAsIs: 'Posted as-is',
      errorLabel: 'Publish paused',
      backToNote: 'Back to note',
      backToOptions: 'Back to options',
      publish: 'Publish',
      update: 'Publish the revision',
      publishing: 'Publishing…',
      releasing: 'Releasing to the record.',
    },

    posted: {
      label: 'Posted',
      heading: 'It is part of the record now.',
      // Shortened from "...was published with the engine's reading disclosed
      // alongside": no engine reading exists to disclose in this build.
      line: (title: string) => `${title}, by you, was published.`,
      yourArticle: 'Your article',
      declared: 'Declared',
      view: 'View the article',
      another: 'Write another',
      closing: 'The community can now nominate a reclassification. The record stays open.',
    },

    pact: 'The Pact',
  },

  /** The published article page, from post.hbs. */
  articlePage: {
    breadcrumb: 'Articles',
    readingTime: (minutes: number) => `${minutes} min read`,
    revise: 'Revise this article',
    notFoundHeading: 'Article not found',
  },

  /** Errors the publish route returns. The writer shows them in the publish box. */
  article: {
    malformedRequest: 'That request could not be read.',
    signInRequired: 'Sign in to publish.',
    profileRequired:
      'This sign in is not linked to a contributor profile yet. Publishing needs one, because the byline is the profile an article belongs to.',
    profileIncomplete: 'Add a display name to your profile before publishing.',
    titleRequired: 'An article needs a title.',
    bodyRequired: 'An article needs a body.',
    invalidTopic: 'That is not one of the twelve primary topics.',
    invalidTier: 'That is not one of the seven tiers.',
    invalidId: 'That article id is not valid.',
    notFound: 'No article of yours has that id.',
    // Named after the database condition behind it, so the fix is findable.
    schemaNotReady:
      'The articles table is missing a column this route writes. The articles content migration has not reached this database.',
    ghostPostIdRequired:
      'The articles table still requires a Ghost post id on every row, and a native article has none. This is one schema change away from working.',
    writePolicyMissing:
      'The articles table has no policy that lets an author write their own row yet, so the database refused the insert.',
    slugExhausted: 'Every address tried for this title is taken. Change the title slightly and publish again.',
    publishFailed: 'That article could not be published. Try again in a moment.',
    /** Development only: shown under the error to name the fix. Never sent in production. */
    diagnostics: {
      noProfileRow:
        'get_own_profile_for_comment() returned no row for this session: profiles.user_id is not set for it. The claim_profile() flow links a sign in to a profile.',
      ghostPostIdFix: 'alter table public.articles alter column ghost_post_id drop not null;',
    },
  },
} as const;

export type Strings = typeof strings;
