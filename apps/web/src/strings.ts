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

  /**
   * The site shell (src/components/shell/): header, primary navigation, the
   * editorial drawer and the footer. The seven nav labels are the live Ghost
   * navigation's, verbatim (the Ghost admin menu, mirrored in
   * _recovered-next/app/components/SiteNav.js NAV_LINKS). drawerSubtitle is
   * _theme/default.hbs's drawer header. footerNote is the Pact page footer,
   * _theme/page-pact.hbs line 1551, verbatim.
   */
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

    /**
     * The persistent right rail (src/components/shell/site-sidebar.tsx), ported
     * from _recovered-next/lib/theme/dialecta-sidebar.jsx's non-article branch:
     * QuoteHero, PulseCard's isArticle=false read, LiveNowCard,
     * RecentlyPublishedCard, StewardsCard, in that order. Council ruling
     * (council/log/2026-09-20-port-or-rewrite.md, dialecta-sidebar.jsx row):
     * "generateMockPulse deleted or replaced with a real endpoint, not shipped
     * as fabricated data." Live already disclosed Live Now as mocked; On
     * Dialecta and Stewards Today did not, so both gained the same disclosure
     * here rather than shipping numbers or names as if they were live.
     * Recently Published is the one card backed by a real query.
     */
    rail: {
      onDialecta: {
        label: 'On Dialecta',
        description: 'Readers and composers moving across the site, once presence is live.',
        mockedNote: 'Live signal coming.',
      },
      liveNow: {
        label: 'Live Now',
        mockedNote: 'Live signal coming.',
      },
      recentlyPublished: {
        label: 'Recently Published',
        empty: 'Nothing published yet.',
      },
      stewardsToday: {
        label: 'Stewards Today',
        mockedNote: 'Live signal coming.',
        stewards: [
          { name: 'Maya Reiss', order: 'Memoirist' },
          { name: 'Wen Liu', order: 'Theorist' },
          { name: 'Father Anselm Okafor', order: 'Glossator' },
        ],
      },
      /**
       * Six entries from design/dialecta-quote-library.html (curated, Council
       * "Three Tests" set), spanning six different archetypes so the rail
       * does not read as one voice. One is picked per render, server side.
       */
      quotes: [
        { text: 'The unexamined life is not worth living.', author: 'Socrates' },
        {
          text: 'When the facts change, I change my mind. What do you do, sir?',
          author: 'John Maynard Keynes',
        },
        {
          text: "If you can't explain it simply, you don't understand it well enough.",
          author: 'Albert Einstein',
        },
        {
          text: 'Those who cannot remember the past are condemned to repeat it.',
          author: 'George Santayana',
        },
        {
          text: 'It is impossible for a man to learn what he thinks he already knows.',
          author: 'Epictetus',
        },
        { text: 'One should not act or speak as if asleep.', author: 'Heraclitus' },
      ],
    },
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

  /**
   * The contributor profile at /profile/[id] and the Thinking Fingerprint on it.
   * Owned by the profile builder. Copy is the recovered profile's own
   * (_recovered-next/lib/theme/dialecta-profile.jsx) after a voice pass: every
   * dash is rewritten, and a line that described something this build does not
   * do is changed and noted beside it.
   */
  profile: {
    metaDescription: (name: string) => `${name} on Dialecta: Thinking Fingerprint, archetype and writing.`,
    notFoundHeading: 'Contributor not found',
    notFound: 'No contributor has that address.',
    unnamed: 'Unnamed contributor',

    // Hero, left column.
    platformChip: 'Platform',
    formingLabel: 'Pattern still forming',
    aspiringTo: 'Aspiring to',
    setAspiration: 'Set aspiration',
    seeWriting: { own: 'See my writing', other: 'See their writing' },
    handle: (slug: string) => `@${slug}`,
    /** The contributor card's meta line: "Joined April 2026". */
    joined: (date: string) => `Joined ${date}`,
    /** The contributor card's glyph when no Order is assigned. The recovered fallback. */
    orderFallbackOrnament: '✒',

    // Hero, right column.
    contributor: 'Contributor',
    member: 'Member',
    fingerprintTitle: 'Thinking Fingerprint',
    caption: {
      // The recovered caption said "Strong on X and Y" for any count above
      // zero, which its own comment called too strong at two graduations.
      // These state the count instead of grading it.
      two: (a: string, na: number, b: string, nb: number) => `Most graduations on ${a} (${na}) and ${b} (${nb}).`,
      one: (a: string, n: number) => `${n} ${n === 1 ? 'graduation' : 'graduations'} so far, all on ${a}.`,
      newborn: "Six seed points, one for each pillar. A pillar's first graduation draws its first ring.",
      unavailable: 'The fingerprint could not be read just now.',
    },
    devUnlinked:
      'Development note: axis_scores is keyed on ghost_member_id, which the public key cannot read, and SUPABASE_SERVICE_ROLE_KEY is not set for the one server-side lookup that bridges a profile to it. The fingerprint stays unread until one of the two changes.',
    devLookupFailed:
      'Development note: the server-side lookup from this profile to its ghost_member_id ran and returned nothing. The server log names the error, if there was one.',

    fingerprint: {
      aria: (name: string, summary: string) => `Thinking Fingerprint for ${name}. ${summary}`,
      newborn: 'No graduations yet: six seed points inside the guide ring.',
      summary: (list: string) => `Graduations by pillar: ${list}.`,
      pillar: (name: string, n: number) => `${name} ${n}`,
    },

    // Tabs and the Engagement pane.
    tabsLabel: 'Profile sections',
    tabs: { engagement: 'Engagement', about: 'About', influences: 'Influences', articles: 'Articles', growth: 'Growth' },
    stats: {
      comments: 'Comments',
      // Replaces the recovered "Forum density", which needs each comment's
      // tier; that lives in classifications, closed to the public key.
      graduations: 'Graduations',
      articles: 'Articles',
      readers: 'Readers',
    },
    connections: {
      heading: 'Connections',
      readers: { label: 'Readers', desc: 'Following this contributor.' },
      sources: { label: 'Sources', desc: 'Followed by this contributor.' },
      correspondents: { label: 'Correspondents', desc: 'Mutual follows.' },
      sparring: { label: 'Sparring Partners', desc: 'Earned through sustained debate.' },
    },
    comments: {
      heading: 'Recent comments',
      // The recovered placeholder promised each comment's tier. Tiers live in
      // classifications, which this page cannot read, so they are not shown.
      empty: 'Comments this contributor publishes appear here.',
      on: (title: string) => `On ${title}`,
    },

    // The About pane.
    about: {
      heading: 'About this Contributor',
      noBioOwn: 'No bio yet. A short paragraph on who you are and what you think about.',
      noBio: 'No bio yet.',
      wrestlingHeading: "What I'm wrestling with",
      wrestlingPrompt: "Name a single open question you're working through right now. Refresh it whenever it changes.",
      mindHeading: "Where I've changed my mind",
      mindPrompt: 'Where you used to land, where you land now, and what shifted you. Up to three entries.',
      from: 'From',
      to: 'To',
      tiersHeading: 'The Four Connection Tiers',
      tiers: [
        {
          label: 'Readers',
          desc: "People who follow you. They want to read what you think, without you needing to read them back. The asymmetry is honest: you don't owe anyone reciprocity.",
        },
        {
          label: 'Sources',
          desc: "People you follow. Voices you're learning from. Naming them makes intellectual humility visible, and makes the people you're paying attention to part of your public identity.",
        },
        {
          label: 'Correspondents',
          desc: "Mutual follows. People you've each chosen to keep up with: a sustained two-way relationship that both parties have opted into.",
        },
        {
          label: 'Sparring Partners',
          desc: "Auto-derived from engagement. People you've debated with across multiple articles. Earned, never declared. Noticed by the platform when a real intellectual relationship forms.",
        },
      ],
    },

    // The Influences pane.
    influences: {
      eyebrow: 'Intellectual DNA',
      heading: 'Books that shaped how this contributor thinks',
      byAuthor: (author: string) => `by ${author}`,
      emptyOwn: [
        'Name the works that shaped how you think.',
        'Books, series, publications, papers: anything literary you keep returning to.',
      ],
      empty: 'No influences shared yet.',
    },
    fieldNotes: {
      eyebrow: 'Field Notes',
      // The recovered heading was first person ("how I think") beside a third
      // person books heading. One voice for both.
      heading: 'Images that inform how this contributor thinks',
      sub: 'Not a gallery. Things that catch the eye.',
      emptyOwn: [
        'Four photos that inform how you think.',
        'A bookshelf, a window view, a notebook page. Not posed, not curated.',
      ],
      empty: 'No field notes yet.',
    },

    // The Articles pane.
    articles: {
      heading: 'Articles',
      untitled: 'Untitled article',
    },

    // The Growth pane: live's two sections (home.js), structure and empty
    // states only until fp_snapshots and the self-snapshot are ported.
    growth: {
      scroll: {
        heading: 'Growth Scroll',
        empty: 'The record begins. Future moments will be added as they fire, starting from your first contribution.',
      },
      selfSnapshot: {
        heading: 'Self-Snapshot',
        intro:
          "The contributor's own words sit at the center. The engine's indicators and the community's reflection sit alongside. Where the voices diverge is honest information; what to do with it is theirs.",
        empty: "Self-snapshots aren't shown here yet.",
      },
    },

    // The feed under the tabs, "what's alive" on this profile.
    feed: {
      heading: "What's alive",
      spotlight: 'Thread Spotlight',
      opinionShift: 'Opinion shift',
      joinThread: 'Join this thread',
      by: (name: string) => `by ${name}`,
      // The recovered feed was the viewer's platform-wide stream. On a public
      // profile with no viewer identity it is this contributor's own: their
      // published articles and the public milestones about them.
      empty: 'No articles or milestones yet. Both appear here as they happen.',
      ago: {
        now: 'just now',
        minutes: (n: number) => `${n} min ago`,
        hours: (n: number) => `${n} hr ago`,
        days: (n: number) => `${n}d ago`,
        weeks: (n: number) => `${n}w ago`,
      },
      someone: 'A contributor',
      event: {
        archetypeShift: (name: string, from: string | null, to: string | null) =>
          `${name} shifted from ${from ?? 'a prior archetype'} toward ${to ?? 'a new archetype'}.`,
        milestone: (name: string, pillar: string | null, threshold: string | null) =>
          `${name}'s ${pillar ?? 'fingerprint'} pillar reached ${threshold ?? 'a new milestone'}.`,
        sparringRecognized: (name: string, other: string | null) =>
          `${name} and ${other ?? 'another contributor'} are now Sparring Partners.`,
        sparringShift: (name: string, other: string | null) =>
          `${name}'s sparring relationship with ${other ?? 'a partner'} is shifting in shape.`,
        aspirationDeclared: (name: string, label: string | null) =>
          `${name} declared an aspiration: ${label ?? 'a new archetype'}.`,
        recommitment: (name: string) => `${name} recommitted to their aspiration after the ninety-day check-in.`,
        firstForum: (name: string) => `${name} earned their first Forum-tier comment.`,
        newReader: (name: string, followee: string | null) => `${name} started reading ${followee ?? 'someone new'}.`,
        correspondent: (name: string, other: string | null) =>
          `${name} and ${other ?? 'another contributor'} became Correspondents.`,
        delta: (name: string) => `${name} published a Delta acknowledgment.`,
        other: (name: string) => `${name} reached a new milestone.`,
      },
    },

    // The archetype modal. Guidance text is the recovered profile's, which the
    // Contributor Identity spec names as the canonical home for it.
    archetypeModal: {
      eyebrowOwn: 'Aspiration',
      eyebrow: 'Archetypes',
      heading: 'The eight archetypes',
      introOwn:
        'Your archetype is assigned from how you engage. An aspiration is one you declare, and each archetype below names the behaviors that move you toward it.',
      intro: 'Each archetype names a cognitive move the platform recognizes from a body of comment history.',
      assignedOwn: 'Your assigned archetype',
      assigned: 'Assigned archetype',
      locked: 'Locked',
      toward: (label: string) => `Moving toward ${label}`,
      hint: 'Select an archetype to read what moves someone toward it.',
      clear: 'Clear aspiration',
      done: 'Done',
      close: 'Close',
      // Nothing in apps/web writes profiles.aspirational_archetype yet.
      notSaved: 'Saving an aspiration is not wired up yet, so this choice lasts until the page reloads.',
      open: 'Read about the eight archetypes',
    },
    archetypes: {
      skeptic: {
        label: 'The Skeptic',
        icon: '🔎',
        desc: 'Questions premises before accepting conclusions.',
        guidance:
          "Challenge stated assumptions before engaging conclusions. Identify what would have to be true for the author's claim to hold, then ask whether it is.",
      },
      synthesizer: {
        label: 'The Synthesizer',
        icon: '🌀',
        desc: 'Finds unexpected connections across domains.',
        guidance:
          'Engage across more topic areas and connect them explicitly. Reference an idea from one article while commenting on another. The primary signal is topic breadth across the six pillars.',
      },
      advocate: {
        label: 'The Advocate',
        icon: '⚖',
        desc: 'Argues the strongest version of views they disagree with.',
        guidance:
          'Before disputing a position, state it in its strongest form, stronger than its own defenders usually manage. Then engage what you have built rather than a weaker version of it. Comments that name a counter-argument before answering it are the primary Advocate signal.',
      },
      builder: {
        label: 'The Builder',
        icon: '🏗',
        desc: 'Extends ideas into practical frameworks.',
        guidance:
          'Extend as well as critique. After identifying a flaw, propose a structure that fixes it. Comments that add scaffolding to an idea register as Builder behavior.',
      },
      empiricist: {
        label: 'The Empiricist',
        icon: '🔬',
        desc: 'Grounds every claim in evidence and data.',
        guidance:
          'Name your sources. Cite studies, data, or named research in place of intuition. The platform tracks claim Acuity and evidence grounding as the primary Empiricist signals.',
      },
      contextualist: {
        label: 'The Contextualist',
        icon: '🗺',
        desc: 'Situates ideas in their historical and cultural frame.',
        guidance:
          'Place arguments in time and place. Comments that explain why an idea landed differently in a different era or context, and show why that difference matters, are the core Contextualist signal.',
      },
      illuminator: {
        label: 'The Illuminator',
        icon: '💡',
        desc: 'Makes complex ideas accessible without losing nuance.',
        guidance:
          'Restate a complex argument in simpler terms, then show why the simplification matters. The platform tracks comments that reduce jargon without reducing accuracy.',
      },
      reviser: {
        label: 'The Reviser',
        icon: '↻',
        desc: 'Publicly updates their position when given good reasons.',
        guidance:
          'When an argument or piece of evidence changes your mind, say so, and say what changed it. This archetype is the only one defined by movement over time, so progress shows up across articles rather than within a single one. Changing your mind well is a skill, and here it is a recognized one.',
      },
    },

    // /profile/fingerprint-lab, development only.
    lab: {
      title: 'Fingerprint lab',
      intro:
        'Development only. The profile renderer on fixed inputs: the three demo contributors as their axis_scores rows read on 2026-09-21, the recovered profile mock with topic history, and the two states nearly every real profile is in today. Every number comes from FINGERPRINT_RENDER in packages/core.',
      demoNote: (resonance: number) =>
        `Demo fixture. Tier mix and graduations from axis_scores, no topic history, resonance ${resonance}.`,
      mock: 'Recovered profile mock',
      mockNote: 'USER.fingerprint from dialecta-profile.jsx: topic history on every pillar, resonance 0.62.',
      early: 'Early',
      earlyNote: 'Two or three graduations a pillar and none on Discourse: the shape of the three real profiles with axis rows.',
      newborn: 'Newborn',
      newbornNote: 'No axis rows at all: eight of the eleven real profiles.',
      small: 'Avatar size, 120px, no labels',
    },

    // Steward Orders, from dialecta-profile-order.jsx. The profile row stores
    // the label and family; the ornament is looked up here by id.
    orderFamilies: {
      essayistic: 'Essayistic',
      argumentative: 'Argumentative',
      synthetic: 'Synthetic',
      scholarly: 'Scholarly',
      narrative: 'Narrative',
      practitioner: 'Practitioner',
      journalistic: 'Journalistic',
      pedagogical: 'Pedagogical',
      speculative: 'Speculative',
      declared: 'Declared',
    },
    orders: {
      essayist: { label: 'The Essayist', family: 'essayistic', ornament: '❦' },
      aphorist: { label: 'The Aphorist', family: 'essayistic', ornament: '✦' },
      memoirist: { label: 'The Memoirist', family: 'essayistic', ornament: '✥' },
      diarist: { label: 'The Diarist', family: 'essayistic', ornament: '❧' },
      blogger: { label: 'The Blogger', family: 'essayistic', ornament: '✜' },
      pamphleteer: { label: 'The Pamphleteer', family: 'argumentative', ornament: '❖' },
      polemicist: { label: 'The Polemicist', family: 'argumentative', ornament: '❂' },
      dialectician: { label: 'The Dialectician', family: 'argumentative', ornament: '✺' },
      provocateur: { label: 'The Provocateur', family: 'argumentative', ornament: '✤' },
      cartographer: { label: 'The Cartographer', family: 'synthetic', ornament: '✧' },
      anthologist: { label: 'The Anthologist', family: 'synthetic', ornament: '❀' },
      translator: { label: 'The Translator', family: 'synthetic', ornament: '✠' },
      theorist: { label: 'The Theorist', family: 'synthetic', ornament: '✪' },
      philologist: { label: 'The Philologist', family: 'scholarly', ornament: '✦' },
      lexicographer: { label: 'The Lexicographer', family: 'scholarly', ornament: '✜' },
      historian: { label: 'The Historian', family: 'scholarly', ornament: '❦' },
      empiricist: { label: 'The Empiricist', family: 'scholarly', ornament: '✤' },
      fabulist: { label: 'The Fabulist', family: 'narrative', ornament: '✿' },
      playwright: { label: 'The Playwright', family: 'narrative', ornament: '✥' },
      screenwriter: { label: 'The Screenwriter', family: 'narrative', ornament: '❂' },
      biographer: { label: 'The Biographer', family: 'narrative', ornament: '❀' },
      clinician: { label: 'The Clinician', family: 'practitioner', ornament: '✚' },
      diagnostician: { label: 'The Diagnostician', family: 'practitioner', ornament: '✦' },
      naturalist: { label: 'The Naturalist', family: 'practitioner', ornament: '❧' },
      correspondent: { label: 'The Correspondent', family: 'journalistic', ornament: '✠' },
      annalist: { label: 'The Annalist', family: 'journalistic', ornament: '❖' },
      reportorial: { label: 'The Reportorial', family: 'journalistic', ornament: '✜' },
      critic: { label: 'The Critic', family: 'journalistic', ornament: '✺' },
      marginalia: { label: 'The Marginalia', family: 'journalistic', ornament: '✥' },
      glossator: { label: 'The Glossator', family: 'pedagogical', ornament: '❦' },
      futurist: { label: 'The Futurist', family: 'speculative', ornament: '✪' },
      satirist: { label: 'The Satirist', family: 'declared', ornament: '✦' },
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

  /**
   * The claim page (app/claim/page.tsx), where a legacy member links their
   * sign in to the profile they already have. Every failed check gets the
   * same sentence, so the page never says which one failed (security,
   * council/security/positions/2026-09-20-path-to-launch.md).
   */
  claim: {
    pageTitle: 'Claim your profile',
    heading: 'Claim your profile',
    missingCode: 'This link is missing its claim code. Use the link exactly as it was sent to you.',
    signInPrompt: "Sign in first. You'll return here to finish linking your profile.",
    signInCta: 'Sign in',
    explain: 'This finishes linking your sign in to your existing profile and comments.',
    submitCta: 'Claim my profile',
    failed: 'That claim link is not valid, has expired, or was already used. Ask for a new one if you still need it.',
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

  /**
   * /fingerprint, The Living Fingerprint (src/app/fingerprint), ported from
   * _theme/page-fingerprint.hbs. Every line is the template's own, verbatim,
   * unless its note says otherwise. title and description are the Ghost
   * page's meta as dialecta.org/fingerprint/ served it on 2026-09-20.
   *
   * contributors.kicker through contributors.about are the live carousel,
   * _recovered-next/lib/theme/fingerprint-page-mount.jsx lines 130-158. Its
   * names, archetype labels and bios were never in the template: the carousel
   * read them from /api/profile/seed:* at run time, and they are copied here
   * as that API returned them on 2026-09-20. Two bios carried an em dash;
   * each fix is marked on the line.
   *
   * Each figure's alt is the template's img alt, now the SVG's aria-label.
   */
  fingerprintPage: {
    title: 'The Fingerprint | a visual trace of how you actually think',
    description:
      "The Living Fingerprint: Dialecta's pattern-of-thought visual. Six pillars drawn from your real contributions. What you actually think, made visible.",
    eyebrow: 'Dialecta · Identity Element',
    heading: 'The Thinking *Fingerprint*',
    lede: "An identity artifact that grows with you. No two contributors produce the same shape, and they shouldn't.",

    contributors: {
      label: 'Three Contributors',
      title: 'The same six axes. Three completely different lives.',
      desc: 'Select a contributor to see how their fingerprint reflects their actual engagement history: the topics they wrote about, the tiers they earned, the axes they developed.',
      kicker: 'Three Contributors',
      heading: 'Compare',
      intro:
        'Three mature contributors with dramatically different engagement patterns. The same six pillars produce radically different shapes depending on how each person actually behaves.',
      /** New: the picker's accessible name. The live picks were unlabelled divs. */
      pickLabel: 'Choose a contributor',
      about: 'About',
      people: {
        'maya-reiss': {
          name: 'Maya Reiss',
          archetype: 'The Reviser',
          bio: 'Retired librarian. Eighteen months on Dialecta, about seventy comments. Writes weekly and carefully, mostly about theology with secondary interests in mental health and psychology. Updates her positions publicly when the evidence shifts. Reads more than she replies.',
        },
        'wen-zhao': {
          name: 'Wen Zhao',
          archetype: 'The Synthesizer',
          // Dash fix: the em dash after "learned the hard way" is a colon.
          bio: 'Software engineer, 34. Six months on Dialecta, almost daily. Arrived politically fired up and learned the hard way: early Discourse rings carry visible Heat and Stance from political fights that have since calmed. These days writes mostly about music theory, acoustics, and the cross-domain patterns he sees as an engineer.',
        },
        'father-anselm-okafor': {
          name: 'Father Anselm Okafor',
          archetype: 'The Contextualist',
          // Dash fix: the em dash after "is theology" is a full stop, and "Small" takes its capital.
          bio: "Catholic priest and theology teacher, 68. Ten months on Dialecta, about ninety comments. Almost everything he writes is theology. Small inflections in Calibration and Discourse come from pastoral conversations where psychology and mental health touch his work. Works within the tradition rather than inventing new framings, and wouldn't have it any other way.",
        },
      },
    },

    stages: {
      label: '02 · Stages of Growth',
      title: 'A fingerprint grows ring by ring.',
      desc: "The same contributor seen at four moments in her life on the platform. Each axis develops independently; some petals bloom faster than others. That's the point.",
      items: {
        newborn: {
          count: '0 comments',
          title: 'Newborn',
          desc: 'Six seed points marking the potential of who you could become. The center holds.',
          alt: 'Newborn fingerprint',
        },
        early: {
          count: '~5 comments',
          title: 'Early',
          desc: 'First petals appear. A young reader writes about her own anxiety, raw and unformed: more venting than claiming. Discourse already carries Heat. The fingerprint tilts low, speaking before thinking.',
          alt: 'Early fingerprint',
        },
        emerging: {
          count: '~50 comments',
          title: 'Emerging',
          desc: 'A character begins to show. Mental-health experience is still the foundation, but psychology now appears in her recent rings. Old Heat persists at the center; outer rings calm. Calibration grows as she learns to update her positions publicly.',
          alt: 'Emerging fingerprint',
        },
        mature: {
          count: '200+ comments',
          title: 'Mature',
          desc: 'A fully-formed identity. Innermost rings blue from early anxiety writing, middle rings teal from clinical psychology, outer rings warm brown from the philosophical questions psychology opens up. The Discourse petal still carries a small Heat core: the learning scar of someone who arrived writing from feeling and figured out how to reason.',
          alt: 'Mature fingerprint',
        },
      },
    },

    archetypes: {
      label: '03 · How to Read a Fingerprint',
      title: 'Eight archetypes. Eight shapes.',
      desc: 'Certain axes compete for the same cognitive budget. Acuity trades against Reach. Discourse trades against Calibration and Magnanimity. A contributor cannot max everything at once. The trade-offs make a true circle structurally impossible and force every fingerprint into a real shape.',
      sublabel: 'Archetype',
      items: {
        skeptic: {
          title: 'The Skeptic',
          desc: 'Questions premises before accepting conclusions. High Acuity reaches the rim with high Consistency. Magnanimity sits shorter than its neighbors because she is sharper than she is generous. Tier history is Forum-clean. The halo reads cool steel: she works in philosophy, science, and the psychology of judgment.',
          alt: 'Skeptic fingerprint',
        },
        synthesizer: {
          title: 'The Synthesizer',
          desc: 'Finds unexpected connections across domains. Reach extends to the edge while Consistency stays modest, the signature of someone whose positions evolve as new connections appear. Calibration runs high, Magnanimity higher. Tier history is Forum and Spark, no Breach. The halo carries every color: there is no domain she has not engaged with.',
          alt: 'Synthesizer fingerprint',
        },
        advocate: {
          title: 'The Advocate',
          desc: 'Argues the strongest version of opposing views. Heavy Calibration and Magnanimity, heavy Discourse. The contributor others want to argue with because she treats their arguments better than they do. Discourse carries visible wave texture; high-volume engagement with hard positions leaves a wake before calming. Topic focus: politics and economics.',
          alt: 'Advocate fingerprint',
        },
        builder: {
          title: 'The Builder',
          desc: 'Extends ideas into practical frameworks. Acuity is precise and Consistency runs high; frameworks have to hold. Discourse and Magnanimity sit shorter because she is building, not debating. Tier history is Forum-heavy. The halo reads warm: science, technology, environment, the domains where ideas turn into things.',
          alt: 'Builder fingerprint',
        },
        empiricist: {
          title: 'The Empiricist',
          desc: 'Grounds every claim in evidence and data. Acuity reaches the rim with Calibration close behind; new data updates the position, but only when the data is real. Tier history is the cleanest on the platform, almost pure Forum across every axis. The halo reads green and clinical-blue: science, health, environment.',
          alt: 'Empiricist fingerprint',
        },
        contextualist: {
          title: 'The Contextualist',
          desc: 'Situates ideas in their historical and cultural frame. Magnanimity and Reach are tall: she sees how positions arise from where the contributor stands. Acuity is moderate because she is not prosecuting one claim, she is mapping the field. The halo reads warm brown and deep purple: history, culture, philosophy, theology.',
          alt: 'Contextualist fingerprint',
        },
        illuminator: {
          title: 'The Illuminator',
          desc: 'Makes complex ideas accessible without losing nuance. High Acuity, high Magnanimity, high Reach. She has to understand it, frame it generously, and know enough domains to translate between them. Discourse is shorter because she is teaching, not debating. Tier history is Forum-clean. The halo carries arts purple, philosophy indigo, and a band of science blue.',
          alt: 'Illuminator fingerprint',
        },
        reviser: {
          title: 'The Reviser',
          desc: 'Publicly updates positions when shown evidence. Signature: extraordinarily high Calibration, the axis that measures willingness to revise. Her tier history is unusually clean because the process of public updating protects her from Fog and Heat. Modest Reach; she refines rather than invents. The halo reads green: renewable energy is her dominant territory.',
          alt: 'Reviser fingerprint',
        },
      },
    },

    texture: {
      label: '04 · Reading the Texture',
      title: 'Same shape. Different history.',
      /** *what* and *how* are the template's <em>, rendered by components/content/rich.tsx. */
      desc: 'Two contributors can have identical graduation counts and still produce wildly different fingerprints. The shape comes from *what* was earned. The texture comes from *how* it was earned. Purity drives color saturation, turbulence generates visible wave patterns in the rings, and clarity modulates how crisp the lines render. The texture remembers.',
      items: {
        calm: {
          label: 'Calm Waters',
          title: 'The Confident Path',
          desc: 'A clinical psychologist who came up through a clean academic path. Her primary territory is psychology, with a middle period writing about music and the neuroscience of listening: visible as a band of purple in her middle rings. Pristine tier history across every axis. Lines render crisp and the rings sit smooth.',
          alt: 'Calm Waters fingerprint',
        },
        turbulent: {
          label: 'Turbulent Waters',
          title: 'The Climbed Path',
          desc: 'Same field, same final graduations, same purple middle-period interest in music. But this clinician came up through messier conversations. Heat, Stance, and Fog scattered through her history. Visible wave activity ripples through the rings, and the lines render slightly diffuse where Fog dominated. The texture remembers the climb.',
          alt: 'Turbulent Waters fingerprint',
        },
      },
    },

    colophon: {
      name: 'Dialecta',
      edition: 'Thinking Fingerprint · v1 · April 2026',
      tag: 'Ideas are the protagonist.',
    },
  },

  /** The site-wide 404, src/app/not-found.tsx, for any address no route answers. New copy. */
  notFoundPage: {
    heading: 'Page not found',
    body: 'Nothing is published at this address.',
    home: 'Read the articles',
  },

  /**
   * The discourse layer under an article: the comment feed and the comment
   * composer (src/components/discourse), ported from
   * _recovered-next/lib/theme/dialecta-discourse-layer.jsx and
   * dialecta-private-draft.jsx. Recovered copy is verbatim unless a note says
   * otherwise. Where it changed, the recovered line described something this
   * build does not do.
   */
  discourse: {
    kicker: 'The Conversation',
    guidebook: 'What do these mean?',

    tiers: {
      /** "The Forum": the recovered badge's own label. */
      label: (name: string) => `The ${name}`,
      /** dialecta-tier-badge.jsx TIERS[].meaning, verbatim. */
      meanings: {
        forum: 'Specific claim, engaged with content. Disagreement welcome here.',
        spark: 'An interesting idea, underdeveloped. Potential, not yet realized.',
        echo: 'Restates the article or a prior comment without adding.',
        fog: "Unclear. The reader can't identify what you believe.",
        heat: 'Emotional, without a specific claim. Passion without a point.',
        stance: 'Tribal framing or identity signaling. A position planted, not a conversation joined.',
        breach: 'A personal attack on a person, not an idea. The Pact has been broken.',
      } satisfies Record<Tier, string>,
    },

    topology: {
      emptyTitle: "The conversation hasn't started yet",
      // "will appear above" in the recovered panel; the shape replaces this panel.
      emptyBody:
        'Comments here are classified by depth and care, not by who wrote them. The shape of the conversation will appear here as comments arrive.',
      shape: (n: number) => `The shape of this conversation · ${n} ${n === 1 ? 'comment' : 'comments'}`,
      stripLabel: 'Comments by tier',
      legendLabel: 'Filter by tier',
      segment: (tier: string, n: number) => `Filter to ${tier}: ${n} ${n === 1 ? 'comment' : 'comments'}`,
    },

    control: {
      label: 'Filter and sort',
      showingOnly: 'Showing only',
      showAll: 'Show all',
      sort: 'Sort',
      quality: 'Quality',
      newest: 'Newest',
    },

    feed: {
      label: 'Comments',
      unavailable: "The conversation couldn't be loaded. Reloading the page tries again.",
      noneInTier: (tier: string) => `No ${tier} comments yet.`,
    },

    card: {
      you: 'You',
      replyTag: 'Reply',
      reply: 'Reply',
      replyTo: (name: string) => `Reply to ${name}`,
      ai: 'AI',
      selfDeclared: 'self-declared',
      engineVoice: 'Engine voice',
      contrastDeclared: 'Commenter declared',
      contrastEngine: 'Engine read',
      // The recovered strip ended "Community voting will settle it." Voting is not in this build.
      contrastTail: 'Both reads stay on the record.',
      specificity: (n: number) => `specificity ${n}/3`,
      specificityLabel: (n: number) => `Specificity ${n} of 3`,
      pending: 'Pending review',
      pendingNote: 'Only you can see this until it is published.',
      /** Discourse Layer UX, "The Breach variant", its dash replaced by a colon. */
      breach:
        'Content suppressed: targets a person, not an idea. Visible here with explanation per platform transparency policy.',
      suppressed: 'This comment is suppressed, so its text is not shown here.',
      unread: "The classifier hasn't read this comment yet, so its text is held until it has a tier.",
      anonymous: 'A contributor',
    },

    time: {
      justNow: 'just now',
      minutes: (n: number) => `${n}m ago`,
      hours: (n: number) => `${n}h ago`,
      days: (n: number) => `${n}d ago`,
      weeks: (n: number) => `${n}w ago`,
    },

    /** What stands in for the composer when commenting is closed to this viewer. */
    access: {
      signedOut: 'Reading is open to everyone. Commenting needs a sign in, by an emailed link or with Google.',
      signIn: 'Sign in',
      noEmail: 'This account has no email on file, and a comment needs one. Add an email to the account to comment.',
      noProfile:
        "This sign in isn't linked to a contributor profile yet. A comment is signed with its profile's display name, so commenting needs one.",
      incomplete: 'Add a display name to your profile to comment. It appears on every comment you post.',
      unavailable: "Commenting isn't available right now. Reading is unaffected.",
    },

    compose: {
      open: 'Add a comment',
      resume: 'Return to your draft',
      writingAs: (name: string) => `Writing as ${name}`,
      /** Discourse Layer UX, Stage 1's nudge bar, its dash replaced by a colon. */
      nudge: 'Forum level: identify a specific claim and engage with it directly.',
      respondingTo: 'Responding to',
      draftLabel: 'Your comment · private draft',
      // The recovered placeholder went on "Type @ to mention a contributor."
      // The mention picker is not in this build.
      placeholder: 'Write what you actually think, the way you actually think it.',
      words: (n: number) => `${n} ${n === 1 ? 'word' : 'words'}`,
      // The recovered line read "saved locally" and nothing saved it. This build does.
      saved: 'saved in this browser',
      private: 'no one sees this yet',
      restored: 'Your draft from before was restored.',
      explainer:
        "When you're ready, the engine will read what you've written and describe what it's doing. Not judge it. You'll see what it found before anyone else does.",
      cancel: 'Cancel',
      continue: 'Continue',
      moreWords: (n: number) => `${n} more ${n === 1 ? 'word' : 'words'} to continue`,
      replyingTo: (name: string) => `Replying to ${name}`,
      cancelReply: 'Cancel reply',
      preview:
        'Development preview. Nothing is sent: the reading is a stand-in built from the reference commenter messages.',
    },

    rail: {
      label: 'Comment stages',
      draft: 'Draft',
      declare: 'Self-declare',
      reflect: 'Reflection',
      posted: 'Posted',
    },

    declare: {
      label: 'Self-declaration',
      headingBefore: 'Which tier do',
      headingEm: 'you',
      headingAfter: 'think this is?',
      // The recovered declaration came after the reading, with the engine's
      // suggestion ringed in pale brass. /api/comment reads and records in one
      // call, so the declaration comes first and travels with the comment.
      sub: 'Your choice shows on your comment. The engine reads the comment next, and if its read differs from yours, both show side by side as part of the record.',
      gridLabel: 'The seven tiers',
      back: 'Back',
      continue: 'Continue',
    },

    consent: {
      label: 'Before you submit',
      headingBefore: 'Once submitted, your comment is',
      headingEm: 'yours permanently.',
      // The recovered briefing promised sixty minutes to edit, rewrite or
      // delete. No edit or delete path exists in this build.
      lineRead: 'Submitting records your comment and hands it to the classifier, which reads it while you wait.',
      lineVisible:
        "Other readers see it once it's published. Until then only you can, and it can't be edited or deleted after this point.",
      principleLabel: 'The principle',
      principle:
        'Slowness is a feature. The wait is not friction: it is ritual. The moment your post becomes permanent is designed to feel earned.',
      back: 'Back',
      submit: 'I understand. Submit.',
    },

    reflecting: {
      eyebrow: 'Reading',
      readyLabel: 'Ready',
      readingLabel: 'Reading',
      hold: 'The reading has arrived. Sitting with it before showing you.',
      /** REFLECTION_PHASES (dialecta-private-draft.jsx lines 78-82), verbatim. */
      phases: [
        { at: 0, main: 'The engine is reading your draft', sub: 'Looking for the claim inside it.' },
        { at: 2800, main: 'Considering specificity and shape', sub: 'How clear is the proposition?' },
        { at: 5600, main: 'Weighing the engagement', sub: 'Are you in the article, or near it?' },
      ],
    },

    posted: {
      label: 'The reflection',
      headingBefore: "Here's what the engine",
      headingEm: 'noticed.',
      // The recovered sub went on "You'll decide what to do with it." The
      // comment is already recorded here, so there is nothing left to decide.
      sub: 'Not a verdict. A description.',
      claimLabel: 'The claim we found',
      claimNone: "The engine couldn't identify a specific claim. That's information too.",
      strengthLabel: 'What this does well',
      shapeLabel: 'The shape of it',
      specificity: (n: number) => `Specificity · ${n}/3`,
      emotion: (e: string) => `Emotion · ${e}`,
      engagement: (e: string) => `Engagement · ${e}`,
      suggestedLabel: 'Suggested tier',
      closeTo: 'close to',
      closeToTail: 'one specific move would push it',
      engineRead: 'Engine read',
      selfDeclared: 'Self-declared',
      // The recovered line read "Contrast visible · community can weigh in".
      // Community nomination is not in this build.
      contrast: 'Both reads show on your comment',
      statusPending: 'Submitted · pending review',
      statusPendingLine: 'Only you can see it until it is published.',
      statusPublished: 'Published',
      statusPublishedLine: 'It is in the conversation now.',
      another: 'Write another comment',
    },

    errors: {
      network: "The comment couldn't reach the server. Check the connection and try again.",
      unreadable: "The server's response could not be read. Try again in a moment.",
    },
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
  /**
   * The content pages (builder, 2026-09-21): the front page, the article index,
   * the Pact, the Guidebook, Community, About and the Stewards. Ported from the
   * live Ghost theme (_theme/index.hbs and page-*.hbs) and the recovered
   * community components (_recovered-next/lib/theme/dialecta-community*.jsx).
   * The copy is Dan's, verbatim, except dash fixes, each marked below and
   * listed in the port report. Inline emphasis is **bold** and *italic*, and a
   * newline is a line break in a display heading; components/content/rich.tsx
   * renders both.
   */
  content: {
    front: {
      joinCta: {
        label: "Ideas are the protagonist.",
        sub: "Join the conversation. Classify arguments, map your position, track how your thinking evolves.",
        createAccount: "Create account",
        signIn: "Already a member? Sign in",
      },
    },
    articlesIndex: {
      title: "Articles",
      eyebrow: "The Library",
      heading: "Every *Article*",
      lede: "Pull up a chair. Open a piece. Stay a while. Ideas this carefully made repay the reader who lingers.",
    },
    pact: {
      title: "The Pact",
      description: "Not terms and conditions. Not rules imposed from above. A mutual agreement between you and a place that intends to take your thinking seriously.",
      cornerMark: "Dialecta",
      cornerSub: "MMXXVI",
      hero: {
        eyebrow: "Before you enter",
        heading: "This is *the pact.*",
        lede: "Not terms and conditions. Not rules imposed from above. A mutual agreement between you and a place that intends to take your thinking seriously.",
        body: "Read the charter below, try the tier-reading exercise, and decide whether this is a place you want to contribute to. When you’re ready, sign at the bottom.",
        folio: "§ I",
      },
      mission: {
        eyebrow: "Why this exists",
        heading: "Most platforms reward\nthe *wrong thing.*",
        body: [
          "The loudest voice wins. The most outraged post spreads furthest. Certainty is rewarded; nuance is penalized. You’ve felt the pull toward simpler, sharper, angrier. That pull isn’t your weakness. It’s the system working exactly as designed.",
          "**Dialecta is built on a different design.** The mechanics that elsewhere reward reflexive anger and tribal conformity are here reoriented toward something else: curiosity, honest engagement, and the kind of thinking that only happens when you slow down enough to actually think.",
        ],
        callout: "The question isn’t whether social media influences us. It’s how much we’re willing to be shaped by it without noticing.",
        calloutAttribution: "From the essay that started this",
        closing: "This platform isn’t neutral. It’s **actively trying to make you a clearer thinker**, not by telling you what to think, but by showing you how you think, and giving you the tools to do it better.",
      },
      classification: {
        mark: "§ III · The Classification",
        eyebrow: "The classification system",
        heading: "Every voice finds\nits *place.*",
        body: "Comments are never hidden. They’re sorted into visible tiers based on what they’re doing, not what they believe. Strong disagreement belongs in The Forum. Vague outrage lives in The Heat. The system doesn’t silence you. It describes you, and invites you to say more.",
        tiers: [
          {
            key: "forum",
            kicker: "Tier I",
            name: "The Forum",
            desc: "Constructive, specific, fact-referenced or clearly reasoned. Strong disagreement belongs here, if it’s about something specific.",
          },
          {
            key: "spark",
            kicker: "Tier II",
            name: "The Spark",
            desc: "A genuinely interesting idea, but underdeveloped. The seed of something good. Invites expansion rather than resolution.",
          },
          {
            key: "echo",
            kicker: "Tier III",
            name: "The Echo",
            desc: "Restates the article or a prior comment without adding to it. Not harmful, just not propulsive.",
          },
          {
            key: "fog",
            kicker: "Tier IV",
            name: "The Fog",
            desc: "Vague, unclear, or disconnected. The reader can’t tell what the person believes or what point they’re making.",
          },
          {
            key: "heat",
            kicker: "Tier V",
            name: "The Heat",
            desc: "Emotionally charged without constructive specificity. The argument is often in there. It just hasn’t been separated from the feeling yet.",
          },
          {
            key: "stance",
            kicker: "Tier VI",
            name: "The Stance",
            desc: "Heavy rhetoric, tribal framing, or coded language signaling team membership over idea engagement. More flag-planting than thinking.",
          },
          {
            key: "breach",
            kicker: "Tier VII",
            name: "The Breach",
            desc: "Name-calling, slander, targeted personal attacks. Suppressed from default view, not deleted, with the reason shown transparently.",
          },
        ],
      },
      process: {
        mark: "§ IV · The Process",
        eyebrow: "The process",
        heading: "How your words find\ntheir *tier.*",
        // Verbatim. philosopher ruled "Every decision is contestable" false as written: a comment’s
        // tier is contestable, the fingerprint is not (council/philosopher/positions/
        // 2026-09-20-the-pact-review.md, item 3). Changing a promise is Dan’s call, not a port’s.
        body: "Classification isn’t done to you. You participate in it, alongside an AI engine and the community around you. Every stage is transparent. Every decision is contestable.",
        stages: [
          {
            num: "I",
            title: "You write freely",
            body: "No template, no prompt. Write what you actually think, the way you actually think it.",
          },
          {
            num: "II",
            title: "The engine reflects",
            body: "Before you post, an AI reads your submission, not to judge it but to describe what it’s doing. It identifies your **core claim**, detects rhetorical patterns, and suggests a tier with a plain-language reason. It names the **strongest element in your writing** first.",
          },
          {
            num: "II.5",
            title: "You respond to the reflection",
            body: "You can **amend** your submission, **respond for the record**, or **post as-is**. None of these choices are wrong. Your response, if reasoned, carries weight in the final classification.",
          },
          {
            num: "III",
            title: "The community engages",
            body: "Readers can nominate your post for reclassification, up or down, and must give a reason. Their nominations are visible. The system is always contestable.",
          },
        ],
      },
      wait: {
        mark: "§ V · The Wait Architecture",
        eyebrow: "The wait architecture",
        heading: "Slowness is\na *feature.*",
        body: [
          "Every timer in this system is the platform saying: **this thought is worth sitting with.** The waits are disclosed, not hidden. They are not friction. They are ritual. The moment the platform makes your post permanent is designed to feel earned.",
          "Once your post hardens, it’s yours permanently. You can append to it at any time. Your additions are visible and tracked. Public refinement of your thinking is treated here as a strength, not a liability.",
        ],
        rows: [
          {
            label: "After writing, before AI analysis appears",
            time: "8 sec",
          },
          {
            label: "After AI analysis, before Stage 2.5 options activate",
            time: "12 sec",
          },
          {
            label: "Full comment reflection window",
            time: "30 min",
          },
          {
            label: "Article submission reflection window",
            time: "24 hrs",
          },
          {
            label: "Community reclassification nomination",
            time: "20 sec",
          },
        ],
      },
      purpose: {
        mark: "§ VI · The Deeper Purpose",
        eyebrow: "The deeper purpose",
        heading: "This platform is trying\nto *grow you.*",
        body: [
          "The tier system isn’t the point. The point is what happens when you engage with it over time. Every AI reflection that names a pattern in your thinking is a chance to see something about yourself that most environments never show you.",
          "When the engine detects a pattern, **emotional frontloading, tribal reflex, certainty performance**, it names it, explains why it happens, and links you to a short, honest explainer. One pattern per submission. Always framed as human, never as deficiency.",
        ],
        patternTag: "Pattern",
        patterns: [
          {
            title: "Emotional Frontloading",
            sub: "Leading with feeling rather than claim. The argument is in there. It just hasn’t been separated from the emotion carrying it.",
          },
          {
            title: "Tribal Reflex",
            sub: "Evaluating arguments by who is making them, not what they contain. Agreement or disagreement before engagement.",
          },
          {
            title: "Certainty Performance",
            sub: "Expressing more confidence than the evidence warrants, because uncertainty reads as weakness in social environments.",
          },
          {
            title: "False Binary",
            sub: "Collapsing a spectrum into a choice. Team A or Team B, when the reality lives in the space between.",
          },
        ],
        // Verbatim. philosopher ruled the privacy promise false as written: the Thinking Fingerprint
        // is a second, public-by-default record of related history that this section never names
        // (the-pact-review.md, item 5). Changing a promise is Dan’s call, not a port’s.
        closing: "Your private profile tracks which patterns have appeared in your writing over time, not as a score, not as a judgment, but as a **personal map of your own tendencies.** The goal isn’t to correct you. It’s to make you more legible to yourself.",
      },
      quiz: {
        mark: "§ VII · Learn by Doing",
        eyebrow: "Learn by doing",
        heading: "Can you read\nthe *tier?*",
        intro: "Before you commit, try classifying three real comments. This is the fastest way to understand what the system actually sees, and what it misses.",
        count: (n: number) => `Comment ${n} of 3`,
        questions: [
          {
            comment: "\"This entire piece ignores the fact that renewable energy simply doesn't work at scale. Anyone who believes otherwise hasn't looked at the actual numbers. Wake up.\"",
            correct: "**The Heat, correct.** There’s a factual claim buried here (doesn’t work at scale) but it arrives without evidence, wrapped in dismissal. The feeling is leading the argument, not the argument itself. A Forum version of this comment would cite the specific numbers it claims exist.",
            wrong: "**The Heat is the closest read.** There’s a factual claim in here, scale limitations, but it’s never substantiated. Wake up signals frustration rather than evidence. The Stance would require more explicit tribal framing; The Forum would require the actual numbers it gestures at.",
          },
          {
            comment: "\"I think the article makes a strong point about incentive structures, but it doesn't address the transition cost problem, which seems like a significant gap. What's the argument for why market signals alone would handle it?\"",
            correct: "**The Forum, correct.** This comment names a specific gap in the argument (transition costs), acknowledges what the article did well, and asks a precise question. Disagreement with a cited reason and a genuine question, that’s exactly what The Forum rewards.",
            wrong: "**The Forum is the right call here.** Notice the structure: it names what worked, identifies a specific gap, and asks a genuine question rather than making an assertion. That combination is what separates Forum from everything below it.",
          },
          {
            comment: "\"Something about this resonates with me, though I'm not sure I fully agree. There's probably more to it.\"",
            correct: "**The Fog, correct.** The commenter has a feeling but hasn’t located an idea yet. Something resonates and there’s probably more to it, neither sentence tells us what they actually think. Not harmful, not dismissive, just genuinely unclear. An invitation to say more.",
            wrong: "**The Fog is the right tier here.** This isn’t The Spark, there’s no seed of an idea, just a vague sense of one. It isn’t Echo because it doesn’t restate anything. It’s Fog: the reader genuinely can’t tell what position the commenter holds.",
          },
        ],
        next: "Next comment →",
        seeResult: "See your result →",
        score: (score: number) => `${score}/3`,
        scoreLabel: "Comments correctly classified",
        messages: [
          "You’re exactly who this platform is for. The tier system takes time to internalize. That’s intentional. Every reflection is a chance to sharpen the eye.",
          "A solid start. One of these distinctions is genuinely subtle. Most people miss it the first time. That’s the system working as designed.",
          "Strong reading. You’re already thinking the way this platform rewards. The third distinction is the hardest one in practice.",
          "You have the eye. Welcome. The community will benefit from how you see.",
        ],
      },
      commitment: {
        mark: "§ VIII · The Commitment",
        eyebrow: "The commitment",
        heading: "I understand and want\nto *participate.*",
        pactText: "I am here to engage with ideas, not to signal my team. I understand that my words carry weight and that the platform will hold them accountable, not to punish me, but to take me seriously. I welcome the mirror. I am willing to be surprised by what I find in my own thinking.",
        signaturePrompt: "Sign your name below",
        signaturePlaceholder: "Your full name",
        signatureAria: "Your signature",
        signatureNameLabel: "Signed in your hand",
        fontPickerLabel: "Pick your hand",
        fontChip: "Aa",
        // The live template already reads "I Understand &middot; Enter". The em dash the Council
        // found is the prototype’s (components/dialecta-pact.html, line 1311). A middle dot, as live.
        commit: "I Understand · Enter",
        // New copy, the signing seam: identity does not reach this page yet (the port report).
        seam: "The signature is not recorded yet. Nothing typed here leaves this page.",
        signedOut: "The Pact is a commitment, not a checkbox. Sign in to take it.",
        signInToCommit: "Sign in to commit",
        noAccount: "Don't have an account yet?",
        join: "Join Dialecta",
      },
      // The live folio joins II and VIII with an en dash; a range takes a hyphen.
      folioLong: "§ II-VIII",
      footerMark: "Dialecta",
      footerNote: "A platform for constructive dialogue, informed debate, and idea-first discourse. Founded April 2026. Built on the belief that thinking well is worth rewarding.",
    },
    guidebook: {
      title: "The Living Guidebook",
      description: "How Dialecta works: the philosophy, the tier system, the AI classification engine, and the opinion mapping tools.",
      eyebrow: "Dialecta · Reference",
      heading: "The *Living* Guidebook",
      lede: "How Dialecta works: the philosophy, the tier system, the AI classification engine, and the opinion mapping tools. This document updates as the platform evolves. Nothing is hidden from view.",
      philosophy: {
        label: "01 · Mission",
        title: "Philosophy & Core Rules",
        desc: "What Dialecta is, why it was built, and what it asks of you.",
        prose: [
          "Dialecta is a platform where **ideas are the protagonist**, not identities or political teams. The goal isn’t to make people agree. It’s to make disagreement more honest, more specific, and more interesting. Ideas arrive stripped of tribal labels and are evaluated on their own merits.",
          "Reward loops are extraordinarily powerful shapers of human behavior. Dialecta doesn’t reject that insight. It redirects it. The mechanics that elsewhere reward reflexive anger and group conformity are here reoriented toward curiosity, independent reasoning, and honest engagement. **The goal: make thinking well the most satisfying thing you can do here.**",
          "This works not by asking people to be better but by engineering an environment where thoughtful engagement is the path of least resistance. Empty polarized statements are discouraged not by censorship but by classification. Passionate disagreement is welcome. Vague outrage is not.",
        ],
        rules: [
          "No name-calling, slander, or targeted personal attacks.",
          "No binary left/right labeling of ideas. Ideas stand on their own merits.",
          "Empty polarized statements are discouraged, not deleted.",
          "Passionate disagreement is welcome. Vague outrage is not.",
          "Full platform transparency: how the engine works is always visible to you.",
          "User-submitted improvement ideas are welcome and publicly voteable.",
        ],
      },
      tiers: {
        label: "02 · Classification",
        title: "The Seven Tiers",
        desc: "Comments are never hidden. They’re sorted into visible tiers. The default view surfaces the highest-quality commentary; every tier is browseable. Lighter badges signal higher-quality discourse, and the brightness ladder makes the value system visible at a glance.",
        cards: [
          {
            key: "forum",
            name: "The Forum",
            zone: "Zone 1 · Aspiration",
            desc: "Constructive, specific, fact-referenced or clearly reasoned. Engages with actual content. Strong disagreement is welcome here, if it’s about something specific. Requires a Level 2 or 3 claim: a falsifiable proposition someone else could engage with on substance.",
            exampleLabel: "Example",
            example: "\"The author overstates algorithmic control because he ignores that heavy users actively seek out the content they receive. It's not imposed on them. Pew Research 2024 shows the top 20% of users by time are also the heaviest active posters.\"",
          },
          {
            key: "spark",
            name: "The Spark",
            zone: "Zone 1 · Aspiration",
            // Live joins the two levels with an en dash; a numeric range takes a hyphen.
            desc: "A genuinely interesting idea, but underdeveloped. Invites expansion. The seed of something good. Level 1-2 claim that hasn’t yet been developed with reasoning or evidence. One more paragraph and this would likely be Forum.",
            exampleLabel: "Example",
            example: "\"The real issue isn't the algorithm. It's that we've stopped expecting social media to be boring sometimes. Tolerance for dull moments might be the missing variable here.\"",
          },
          {
            key: "echo",
            name: "The Echo",
            zone: "Zone 2 · Description",
            desc: "Restates the article or a prior comment without adding to it. Not harmful, just not propulsive. May contain a claim, but it mirrors what already exists rather than advancing the discussion. The person should feel observed, not judged.",
            exampleLabel: "Example",
            example: "\"I agree completely. Social media really has changed how we communicate and it's not for the better.\"",
          },
          {
            key: "fog",
            name: "The Fog",
            zone: "Zone 2 · Description",
            desc: "Vague, unclear, or disconnected. The reader can’t tell what the person believes or what point they’re making. Level 0 claim. Nothing to engage with on substance. A single concrete sentence about what they actually think would change this classification.",
            exampleLabel: "Example",
            example: "\"There's a lot going on here and I think we all need to think more carefully about these things, because it's complicated and nobody really understands it.\"",
          },
          {
            key: "heat",
            name: "The Heat",
            zone: "Zone 2 · Description",
            desc: "Emotionally charged without constructive specificity. Passion without a point. A comment can be angry, sharp, or contemptuous and still qualify for Forum, if it’s anchored to a specific claim. The emotional register is never the disqualifier. The absence of a claim is.",
            exampleLabel: "Example",
            example: "\"This article is absolutely outrageous. I can't believe this is being published. Anyone who buys this argument has clearly never thought seriously about any of it.\"",
          },
          {
            key: "stance",
            name: "The Stance",
            zone: "Zone 3 · Boundary",
            desc: "Heavy rhetoric, tribal framing, or coded language that signals team membership over idea engagement. A position planted rather than a conversation joined. Categorically different from Zone 2: the comment has crossed from individual expression into structural territory the platform cannot reward.",
            exampleLabel: "Example",
            example: "\"Only someone who has never lived in the real world and gets all their news from the mainstream media would write something like this. This is what the elites want you to believe.\"",
          },
          {
            key: "breach",
            name: "The Breach",
            zone: "Zone 3 · Boundary",
            desc: "Name-calling, slander, or targeted personal attacks. Content is suppressed from the default view (not deleted), with a transparent reason shown. The only tier where posting is blocked pending review. Nothing on Dialecta is ever permanently deleted; the boundary exists to protect discourse, not to punish people.",
            exampleLabel: "What this means",
            example: "Content targeting an individual rather than engaging with their idea. The Pact has been broken. You may still amend before the review window closes.",
          },
        ],
        ladder: "**The brightness ladder:** Lightness equals honor. The highest tier is the lightest, almost paper itself. Each tier steps down in luminosity until Breach arrives at a deep, near-black red. Gold to amber to sage to slate to orange to rust to wine. The neutral middle is a calm pause between the warmth of aspiration and the warmth of warning. The gradient is not arbitrary. It makes the value system visible before you read a single word.",
      },
      engine: {
        label: "03 · How It Works",
        title: "The Classification Engine",
        desc: "Classification is a combination of AI pre-analysis, commenter self-declaration, and community voting. All three signals are visible to everyone. Transparency is the feature, not a disclaimer.",
        stages: [
          {
            num: "1",
            name: "AI Pre-Analysis: instant, on submit",
            desc: "Before a comment is published, the engine analyzes it. It identifies the core claim being made, flags counter-arguments present or absent, detects rhetorical patterns (tribal signaling, ad hominem, specificity level), and assigns a suggested tier with a plain-language reason shown to the commenter.",
            note: "Sample message: “This reads as The Heat: it expresses strong feeling but doesn’t identify a specific claim to support or challenge. Want to add one before posting? Or post as-is.” The AI is a mirror, not a gatekeeper. This moment of friction, not blocking, just reflecting, is where behavior change happens.",
          },
          {
            num: "2",
            name: "Commenter Self-Declaration",
            desc: "The commenter can accept the AI’s suggestion or override it with their own declared tier. That declaration is visible on the comment. If they claim Forum-level and the community disagrees, the contrast itself becomes interesting data, and the algorithm tracks it. Self-declaration isn’t just metadata. It’s a commitment, and articulate self-awareness counts.",
            note: null,
          },
          {
            num: "3",
            name: "Community Voting",
            desc: "Readers can upvote or downvote comments within their current tier, and nominate a comment for reclassification. Enough nominations trigger a re-review event. Because tier placement is public and contestable, people want to land in The Forum. This is accountability without censorship.",
            note: "Algorithm weights: AI suggestion 40% · Community voting 35% · Self-declaration 15% · Stage 2.5 response quality 10%.",
          },
        ],
        readsHeading: "How the Engine Reads a Comment",
        promptLabel: "Classification Standard, Dialecta v1.0",
        prompt: "Read the comment against the article it is responding to. Work through the questions below in order. Don't skip ahead to a tier until you've answered them. The answer usually follows naturally from the analysis.\n\n─────────────────────────────────────────\nSTEP 1: FIND THE CLAIM\n─────────────────────────────────────────\nIs the commenter actually saying something specific? Quote or paraphrase it. If there’s no identifiable claim, note it. It matters for what comes next.\n\nIf a claim exists, how developed is it?\n\n  · Just an assertion: you know which side they’re on, but not why. (“The author overstates this.”)\n  · Specific enough to argue with. Someone could push back on the substance.\n  · Fully supported: reasoning, evidence, or a named counter-argument is present.\n\n─────────────────────────────────────────\nSTEP 2: READ THE TEMPERATURE\n─────────────────────────────────────────\nHow charged is the language? Emotion alone doesn’t place a comment. A furious comment with a specific claim can still land in Forum. What you’re listening for is whether the heat is carrying something substantive, or whether it’s standing in for it.\n\n─────────────────────────────────────────\nSTEP 3: CHECK FOR TRIBAL SIGNALS\n─────────────────────────────────────────\nIs the comment engaging with the article’s actual argument, or is it performing group membership? Watch for coded language, sweeping in-group/out-group frames, and rhetoric that signals a team rather than a position.\n\n─────────────────────────────────────────\nSTEP 4: PLACE IT\n─────────────────────────────────────────\nForum:   Has a specific claim. Engages with the article. Reasoning is present. Emotion is fine here.\nSpark:   The seed of something good. Say more.\nEcho:    Agrees or restates without adding anything new.\nFog:     Can’t tell what they actually think.\nHeat:    Feeling is loud; the point is buried or absent.\nStance:  Group signaling is doing the work, not argument.\nBreach:  Targets a person, not an idea.\n\n─────────────────────────────────────────\nSTEP 5: WRITE THE NOTE\n─────────────────────────────────────────\nOne or two sentences. Say what the comment is doing, not what it should be. Name something specific. If there’s one move that would change the placement, name it plainly.\n\nDon’t lecture. Don’t appeal to their better nature. Always leave the door open to post as-is.",
        tone: "**Tone standard:** Name what *is* there before noting what isn’t. Say “reads as” rather than “has been classified as”, the difference between an observation and a verdict. One suggestion per note, never a list. The only exception is Breach, where posting is held. Every other tier ends with an implicit invitation to post anyway.",
      },
      claim: {
        label: "04 · The Standard",
        title: "The Claim Specificity Spectrum",
        desc: "A claim is a falsifiable or arguable proposition specific enough that another person could engage with it on substance. Claim presence isn’t binary. The engine assesses specificity level from 0 to 3. This is the primary discriminator between tiers.",
        levels: [
          {
            level: "Level 0",
            name: "No Claim",
            desc: "Pure feeling, label, or tribal signal. Nothing to engage with on substance. Maps to: Fog, Heat, or Stance depending on register.",
            example: "“This is exactly the kind of thinking that’s destroying discourse.”",
          },
          {
            level: "Level 1",
            name: "Vague Claim",
            desc: "An assertion exists but is too general to engage specifically. You know which side they’re on, not what they think. Maps to: Spark or Echo.",
            example: "“The author way overstates how much algorithms control us.”",
          },
          {
            level: "Level 2",
            name: "Specific Claim",
            desc: "An identifiable proposition. Someone could directly agree or disagree with it on substance. Minimum threshold for Forum.",
            example: "“The author overstates algorithmic control because he ignores that heavy users actively seek out the content they receive.”",
          },
          {
            level: "Level 3",
            name: "Developed Claim",
            desc: "A specific proposition with supporting reasoning, evidence, or a named counter-argument. Full engagement. Strong Forum placement.",
            example: "“Pew Research (2024) shows the top 20% of users by time are also the heaviest active posters, suggesting the conditioning runs both ways, not one-directionally.”",
          },
        ],
      },
      mapping: {
        label: "05 · Spatial Representation",
        title: "Opinion Mapping Tools",
        desc: "Replace binary agree/disagree with dimensional, spatial representations of where readers stand. No scores. No sides. Positions as landscapes. Axes and poles are defined per-article by the AI and editors based on the actual debate a piece opens up.",
        maps: [
          {
            badge: "Launch Default",
            title: "2-Axis Cartesian Plot",
            desc: "Two independent dimensions. Reader places a dot. The aggregate creates a heat map cloud. Visual, intuitive, works on mobile. Clusters reveal real community topology without collapsing to a score.",
            example: "Example: Renewable Energy\nX: Cost-first <--------> Planet-first\nY: Market-driven <--------> Policy-driven",
          },
          {
            badge: "Signature Feature",
            title: "Ternary Plot",
            desc: "A triangular plot where a point represents a simultaneous blend of three positions. All values sum to 100%. Moving toward one pole pulls from the others. Academic credibility in political science and economics.",
            example: "Example: Mental Health\nPole A: Individual responsibility\nPole B: Community / social systems\nPole C: Medical / institutional",
          },
          {
            badge: "Multi-Axis",
            title: "Radar / Spider Chart",
            // Live joins both ranges with en dashes; a numeric range takes a hyphen.
            desc: "5-7 independent axes, each rated 0-10. Reader adjusts sliders and sees their shape. Aggregate shows the community's average shape. Best for rich articles with many independent dimensions.",
            example: "Example axes, Economics\nEvidence quality · Moral weight\nPractical feasibility · Historical precedent\nPersonal relevance",
          },
          {
            badge: "Advanced",
            title: "Barycentric Multi-Pole",
            desc: "Extends ternary to 4+ poles. Editorial analysis view rather than reader-facing interactive. The AI may suggest this automatically when an article's analysis detects four or more genuinely independent axes of disagreement.",
            example: "Triggered automatically when AI detects 4+\nindependent dimensions of genuine reader\ndisagreement within the article.",
          },
        ],
        delta: "The **delta mechanic** tracks opinion shift before and after reading. The delta is often as interesting as the position itself: it reveals what the article actually moved, and how far. Phase 2 functionality; current tools support single-moment placement. Authors can suggest axes in their editorial template; the AI and editors refine them before publication.",
      },
      governance: {
        label: "06 · Platform Governance",
        title: "How to Submit Improvements",
        desc: "User-submitted improvement ideas are publicly visible and community-voteable. Platform governance is itself a demonstration of Dialecta’s values. If you think something should work differently, say so, specifically.",
        prose: "Every improvement proposal is subject to the same quality bar as a comment. The most useful proposals identify a specific problem, name what they think would be better, and explain why the current approach falls short. Vague frustration is noted but doesn’t move the dial. A well-reasoned proposal with a specific mechanism can.",
        formTitle: "Submit a Platform Idea",
        formDesc: "Be specific. Name the problem, propose the change, say why it matters. Proposals are publicly visible and community-voteable.",
        fields: [
          {
            id: "proposal",
            label: "Your proposal in one sentence",
            placeholder: "e.g. Add a 72-hour cooldown before Breach comments can be appealed",
            multiline: false,
          },
          {
            id: "problem",
            label: "The problem this solves",
            placeholder: "Describe what currently doesn’t work well, and for whom...",
            multiline: true,
          },
          {
            id: "approach",
            label: "Why this approach (and not another)",
            placeholder: "Name at least one alternative you considered and why this is better...",
            multiline: true,
          },
        ],
        submit: "Submit Proposal",
        // New copy, the proposal seam: the live form had no handler and no table exists for it.
        seam: "Proposals are not collected yet. Nothing typed here is sent.",
        stewards: "All proposals are reviewed by the Stewards: contributors who have earned elevated trust through sustained high-quality engagement. The Stewards don’t control outcomes; they curate visibility. Final decisions are made transparently, with reasoning published alongside each outcome.",
      },
    },
    community: {
      title: "Community",
      description: "Every member with a Dialecta profile. Search, filter by archetype or Steward Order, and find the voices you want to follow.",
      eyebrow: "The Community",
      heading: "Where the *discourse* lives",
      subtitleContributors: "Every member with a Dialecta profile. Search, filter by archetype or Steward Order, and find the voices you want to follow.",
      subtitleFeed: "Articles climbing on Forum-tier engagement, threads worth rereading, and the people quietly raising the level. Curated, never algorithmically amplified.",
      tabs: {
        feed: "Feed",
        contributors: "Contributors",
        aria: "Community views",
      },
      contributors: {
        searchPlaceholder: "Search by name, bio, archetype, or Order…",
        searchLabel: "Search contributors",
        search: "Search",
        filters: "Filters",
        archetype: "Archetype",
        order: "Order",
        sort: "Sort",
        any: "Any",
        sortName: "A → Z",
        sortArchetype: "By archetype",
        clear: "Clear all filters",
        count: (n: number) => `${n} ${n === 1 ? 'contributor' : 'contributors'}`,
        author: "· author",
        // The live directory printed "The The Essayist": order_label already carries "The".
        orderChip: (label: string) => (/^the\s/i.test(label) ? label : `The ${label}`),
        viewWriting: "View their writing →",
        anonymous: "Anonymous",
        noMatch: "No contributors match those filters.",
        none: "No contributors yet.",
        // The live line appended the raw error ("Could not load contributors: 500"); the error stays in the server log.
        loadFailed: "Could not load contributors.",
      },
      feed: {
        allTypes: "All types",
        types: {
          article: "Articles",
          spotlight: "Spotlights",
          identity: "Identity Events",
          topology: "Opinion Map",
        },
        allTopics: "All topics",
        hot: "Hot",
        newest: "Newest",
        trending: "Trending · Forum-engaged",
        recent: "Recent article",
        // dialecta-community-feed.jsx EVENT_PRESENTATION, fallbacks and all. `who` is null when the subject cannot be named (data.ts).
        events: {
          archetype_shift: {
            eyebrow: "Archetype shift",
            headline: (who: string | null, to?: string) => `${who ?? 'A contributor'} is moving toward ${to || 'a new pattern'}.`,
          },
          fingerprint_milestone: {
            eyebrow: "Fingerprint milestone",
            headline: (who: string | null, pillar?: string, threshold?: string) => `${who ?? 'A contributor'}'s ${pillar || 'pillar'} crossed ${threshold ?? 'a milestone'}.`,
          },
          sparring_partner_recognized: {
            eyebrow: "Sparring Partners",
            headline: (who: string | null, partner?: string) => `${who ?? 'A contributor'} & ${partner || 'someone'} are sparring partners now.`,
          },
          sparring_partner_archetype_shift: {
            eyebrow: "Sparring archetype shift",
            headline: (who: string | null, to?: string) => `${who ?? 'A sparring partner'} is shifting toward ${to || 'a new pattern'}.`,
          },
          aspiration_declared: {
            eyebrow: "Aspiration declared",
            headline: (who: string | null, aspiration?: string) => `${who ?? 'A contributor'} declared: "${aspiration || '...'}"`,
          },
          recommitment: {
            eyebrow: "Recommitment",
            headline: (who: string | null, aspiration?: string) => `${who ?? 'A contributor'} recommitted to ${aspiration || 'an aspiration'}.`,
          },
          first_forum_comment: {
            eyebrow: "First Forum-tier",
            headline: (who: string | null) => `${who ?? 'A contributor'} just earned their first Forum-tier comment.`,
          },
          new_reader: {
            eyebrow: "New Reader",
            headline: (who: string | null, reader?: string) => `${reader || 'Someone new'} is now reading ${who ?? 'this contributor'}.`,
          },
          correspondent_established: {
            eyebrow: "Correspondents",
            headline: (who: string | null, partner?: string) => `${who ?? 'A contributor'} & ${partner || 'someone'} are correspondents.`,
          },
          source_milestone: {
            eyebrow: "Source milestone",
            headline: (who: string | null, milestone?: string) => `${who ?? 'A Source'} reached ${milestone || 'a milestone'}.`,
          },
          delta_acknowledged_published: {
            eyebrow: "Delta acknowledged",
            headline: (who: string | null) => `${who ?? 'A contributor'} published a Delta acknowledgement.`,
          },
        },
        genericEvent: "Event",
        genericHeadline: (who: string | null, type: string) => `${who ?? 'A contributor'} · ${type}`,
        spotlight: "Thread Spotlight · Forum × Forum",
        spotlightOn: (title: string) => `On ${title}`,
        spotlightFallback: "A Forum-tier exchange worth re-reading.",
        spotlightAuthor: "Contributor",
        joinThread: "Join the thread →",
        topology: "Opinion Topology",
        topologyFallback: "Community opinion shifted on this thread.",
        noMatch: "No items match those filters.",
        quiet: "The feed is quiet right now. Check back soon.",
        growing: "Thread spotlights, identity events, and opinion-map shifts will appear here as the community grows.",
        loadFailed: "Could not load feed.",
      },
      author: {
        back: "← Back to Community",
        visitProfile: "Visit full profile →",
        writingEyebrow: "Their Writing",
        articles: "Articles",
        noArticles: "No articles yet",
        allTopics: "All topics",
        allTiers: "All tiers",
        noMatch: "No articles match those filters.",
        notPublished: (name: string) => `${name} hasn't published yet.`,
        thisContributor: "This contributor",
        anonymous: "Anonymous Contributor",
        loadFailed: "Could not load this contributor.",
        // New copy, after notices.articleNotFound: an ?author= id that matches no profile.
        notFound: "No contributor has that address.",
      },
      // The recovered components' relativeDate(), verbatim.
      relative: {
        justNow: "just now",
        minutes: (n: number) => `${n}m ago`,
        hours: (n: number) => `${n}h ago`,
        days: (n: number) => `${n}d ago`,
        weeks: (n: number) => `${n}w ago`,
        months: (n: number) => `${n}mo ago`,
        years: (n: number) => `${n}y ago`,
      },
    },
    about: {
      title: "About",
      description: "Not identities. Not political teams. Not the loudest voice or the most outraged post. Just the idea itself, stripped of tribal labels, evaluated on its own merits.",
      eyebrow: "About Dialecta",
      heading: "Where ideas are\nthe *protagonist.*",
      lede: "Not identities. Not political teams. Not the loudest voice or the most outraged post. Just the idea itself, stripped of tribal labels, evaluated on its own merits.",
      sections: [
        {
          numeral: "01",
          label: "The Problem",
          title: "The platforms got the\nincentives *wrong.*",
          blocks: [
            {
              kind: "body",
              text: "Reward loops are extraordinarily powerful shapers of human behavior. The major platforms understood this and designed environments that reward outrage, identity performance, and tribal confirmation. Not because they wanted those outcomes, but because those behaviors maximized the metric they were optimizing for: engagement at any cost.",
            },
            {
              kind: "body",
              text: "The result, at scale, is a civilization measurably angrier, more fragmented, and less capable of honest disagreement. Not because people got worse. Because the environment selects for the worst behaviors available and calls it connection.",
            },
            {
              kind: "quote",
              text: "Human behavior is less influenced by stated values than by environmental incentives. Whatever a system rewards, humanity will adapt toward.",
              cite: "Dialecta Founding Philosophy",
            },
            {
              kind: "body",
              text: "This isn’t a cynical claim. It’s the premise for a different kind of design. If the same force that shaped behavior toward outrage can be redirected, the question becomes: what does an environment look like when it’s designed to reward thinking well instead?",
            },
          ],
        },
        {
          numeral: "02",
          label: "The Wager",
          title: "Redirecting the\n*reward loop.*",
          blocks: [
            {
              kind: "body",
              text: "Dialecta doesn’t ask its contributors to be better people. It engineers conditions where thinking well is the most rewarding thing you can do here. The mechanics that elsewhere reward reflexive anger and group conformity are reoriented toward clarity, specificity, and honest engagement.",
            },
            {
              kind: "strip",
              label: "The founding bet",
              text: "Design an environment that rewards specificity, intellectual honesty, and genuine engagement. Then watch what *emerges.*",
            },
            {
              kind: "body",
              text: "This means the platform isn’t neutral. Nothing is. The only question is whether it’s shaping the people inside it toward or away from their better capacities. Dialecta has made its choice. Every design decision (the tier system, the AI reflection prompt, the Thinking Fingerprint, the Stewards) exists to serve that single direction of travel.",
            },
          ],
        },
        {
          numeral: "03",
          label: "The Philosophy",
          title: "Three threads,\none *platform.*",
          blocks: [
            {
              kind: "principles",
              items: [
                {
                  word: "Post-Scarcity",
                  names: "The Condition",
                  desc: "The era of information scarcity is over. What’s scarce now is the capacity to evaluate it: to distinguish the specific from the vague, the reasoned from the reflexive. Dialecta is a bet that this capacity can become socially rewarding.",
                },
                {
                  word: "Relationism",
                  names: "The Anthropology",
                  desc: "People are formed by the quality of the conversations they inhabit. A comment doesn’t exist in isolation: it participates in a discourse, and that discourse either raises or degrades the people inside it.",
                },
                {
                  word: "Formation",
                  names: "The Stakes",
                  desc: "Discourse isn’t transactional. Articulating a belief, having it challenged, refining it: that happens to you. The platform’s design choices carry moral weight because they shape the kinds of people who inhabit it.",
                },
              ],
            },
          ],
        },
        {
          numeral: "04",
          label: "The Balance",
          title: "Excellence as invitation,\n*never as gatekeeping.*",
          blocks: [
            {
              kind: "body",
              text: "Dialecta is literary, organic, and proud. It’s also genuinely open, not as a compromise of its standards but as the fullest expression of them. There’s a level of excellence here that serves as an example of how things can be done. But it can never be shameful or belittling.",
            },
            {
              kind: "quote",
              text: "People can’t grow if they aren’t invited, encouraged, or able to picture themselves in a different future.",
              cite: "From the Stewards session, the mission statement beneath the mission statement",
            },
            {
              kind: "body",
              text: "The tier system doesn’t hide low-quality commentary; it describes it, and invites the writer to say more. The AI reflection doesn’t block submission; it holds a mirror. The Thinking Fingerprint doesn’t rank contributors against each other; it makes each person more legible to themselves. The platform takes its contributors seriously enough to push back. That’s the highest form of respect it knows how to offer.",
            },
          ],
        },
      ],
      builderNote: {
        label: "A note from the builder",
        text: "Dialecta started as a family blog, a place for people I trusted to engage seriously with the questions I was turning over. It grew when it became clear that the problem it was trying to solve at a small scale was the same problem public discourse faces everywhere. The environment selects for the wrong behavior, and then we wonder why discourse degrades. This platform is a serious attempt to run the experiment in the other direction. It’s early. It’s unfinished. And I’ve never been more convinced that the question it’s asking is the right one.",
        signature: "Daniel Pennington, Founder",
        watermark: "Dialecta",
      },
      cta: {
        title: "The door is *open.*",
        body: "Read the Pact. Understand what the platform asks of you and what it offers in return. If it sounds like a place you want to contribute to, you’re already the kind of person we built it for.",
        primary: "Read the Pact",
        secondary: "Meet the Stewards",
      },
    },
    stewards: {
      title: "The Stewards",
      description: "The Stewards are Dialecta’s writers, recognized not by appointment but by readers who have come to trust their work over time.",
      eyebrow: "A Foundational Page of Dialecta",
      prefix: "The Stewards of",
      logoAlt: "Dialecta",
      pair: [
        "Trusted by their readers",
        "chosen by their work",
      ],
      openingLead: "The Stewards are Dialecta’s writers",
      openingRest: ", recognized not by appointment but by readers who have come to trust their work over time.",
      opening: "The Orders below aren’t a closed circle. They’re a portrait of the kinds of writing this place wants to make possible, and a path for anyone who wants to grow toward them. No committee to impress, no credential to claim, no follower count to accrue. Just the work, the readers who read it, and time.",
      cadence: {
        eyebrow: "The Modifier",
        title: "Cadence: the rhythm of contribution",
        lede: "Frequency isn’t its own Order. A once-a-year writer and a weekly writer can share an identity at different rhythms. Every Steward’s Order is paired with a cadence drawn from publishing: a Magnum Opus Steward publishing four times a year carries the same weight as a Serial Steward publishing weekly. Depth over volume.",
        items: [
          {
            key: "daily",
            name: "Daily",
            desc: "Newspaper-cadence. Writes most days.",
          },
          {
            key: "serial",
            name: "Serial",
            desc: "Regular columnist’s rhythm. Weekly to fortnightly.",
          },
          {
            key: "periodical",
            name: "Periodical",
            desc: "Monthly-ish. Considered, scheduled.",
          },
          {
            key: "quarterly",
            name: "Quarterly",
            desc: "Long gestation. Fewer, larger pieces.",
          },
          {
            key: "occasional",
            name: "Occasional",
            desc: "Writes when there is something to say.",
          },
          {
            key: "magnum",
            name: "Magnum Opus",
            desc: "Rare-but-major. One piece a year that lands like a book.",
          },
        ],
      },
      orders: {
        eyebrow: "The Stewardship",
        title: "The Orders",
        lede: "Ten families of writers and more than thirty distinct kinds of writing, drawn from the full literary, scholarly, journalistic, and practitioner traditions. Pick a family below to step into it.",
        navAria: "Stewardship families",
        index: "Index",
        indexIntro: "Each family holds a handful of distinct kinds of writers, recognized by the platform from observed patterns over time, never appointed. Step into any of them.",
        familyLabel: "Family",
      },
      // Two em dashes fixed: the Practitioner and Declared family descriptions (the port report).
      families: [
        {
          key: "essayistic",
          name: "Essayistic",
          tagline: "Voice-driven thinkers who circle a question instead of spearing it.",
          description: "The personal voice tradition. Writers who treat thinking as exploration, who let uncertainty breathe instead of pretending it’s already resolved. The line of Montaigne and Didion, of every honest first-person sentence the open web ever produced.",
          orders: [
            {
              ornament: "❦",
              name: "The Essayist",
              essence: "Thinks in essays the way other people think in conversations.",
              definition: "Personal voice, exploratory structure, willing to circle a question rather than spear it. Comfortable not knowing the answer at the start, comfortable still uncertain at the end, if the uncertainty has been earned.",
              tellLabel: "Tell:",
              tell: "*“I’ve been turning this over for a while…”*",
              declared: false,
            },
            {
              ornament: "✦",
              name: "The Aphorist",
              essence: "Compresses. Where others need a thousand words, this writer needs forty.",
              definition: "Sentences you remember after you’ve forgotten the piece they came from. The hardest of the literary forms to do well, because every word has to carry what an essay would distribute across paragraphs.",
              tellLabel: "Tell:",
              tell: "*Pieces shorter than the comments they generate.*",
              declared: false,
            },
            {
              ornament: "✥",
              name: "The Memoirist",
              essence: "Mines personal experience for what it can teach beyond itself.",
              definition: "Not navel-gazing. The self as case study, the life as evidence. The reader leaves with something that turns out to be about them, not about the writer.",
              tellLabel: "Tell:",
              tell: "*“I didn’t understand this until it happened to me.”*",
              declared: false,
            },
            {
              ornament: "❧",
              name: "The Diarist",
              essence: "Writes in real time, in installments, thinking out loud across weeks or months.",
              definition: "The reader watches the idea form. Conclusions evolve in public. The form trades certainty for honesty about how thinking actually works.",
              tellLabel: "Tell:",
              tell: "*Dated entries, evolving conclusions.*",
              declared: false,
            },
            {
              ornament: "✜",
              name: "The Blogger",
              essence: "Reclaiming the word: the honest, frequent, personal-voice writer who built the open web.",
              definition: "Conversational, linkable, generous with the reader’s time. The descendant of the early bloggers who treated the form as correspondence with strangers, before the platforms ate it.",
              tellLabel: "Tell:",
              tell: "*Feels like a letter from a smart friend.*",
              declared: false,
            },
          ],
        },
        {
          key: "argumentative",
          name: "Argumentative",
          tagline: "Writers who stage a position and defend it, in good faith.",
          description: "Persuaders, polemicists, and dialecticians. They name what they believe, name what they oppose, and earn every claim. Welcome here when the work meets Forum-level standards: specific claims, named counter-arguments, no Heat.",
          orders: [
            {
              ornament: "❖",
              name: "The Pamphleteer",
              essence: "Writes to move you. Argument-forward, unafraid of a position.",
              definition: "The honorable descendant of Paine and Swift. Not a ranter, a persuader with a thesis and a spine. Pieces you could hand someone and say *read this.*",
              tellLabel: "Tell:",
              tell: "*Titles you remember, claims you can repeat from memory.*",
              declared: false,
            },
            {
              ornament: "❂",
              name: "The Polemicist",
              essence: "Sharper cousin of the Pamphleteer. Names opponents, doesn’t pretend to neutrality.",
              definition: "Welcome here *if* the work meets Forum-level standards: specific claims, named counter-arguments, no Heat. The form is honorable when it’s honest about being a fight.",
              tellLabel: "Tell:",
              tell: "*Titles that take a side, and earn it.*",
              declared: false,
            },
            {
              ornament: "✺",
              name: "The Dialectician",
              essence: "Thinks by staging the argument on the page itself.",
              definition: "Sets thesis against antithesis, lets them grapple, finds the synthesis honestly. Reads like a Platonic dialogue in modern dress. The strongest version of the opposing view is presented before the critique, every time.",
              tellLabel: "Tell:",
              tell: "*“The strongest version of the opposing view is this…” and means it.*",
              declared: false,
            },
            {
              ornament: "✤",
              name: "The Provocateur",
              essence: "Asks the question nobody wanted asked, in good faith.",
              definition: "Not contrarian for sport, genuinely curious about the unexamined assumption. The Provocateur’s value is measured by whether the question they raised was worth raising, not by how much it stung.",
              tellLabel: "Tell:",
              tell: "*Pieces that begin “What if we’re wrong about…”*",
              declared: false,
            },
          ],
        },
        {
          key: "synthetic",
          name: "Synthetic",
          tagline: "Cartographers and connectors of the intellectual landscape.",
          description: "Writers who map territory others walk through unconsciously. They translate across disciplines, anthologize the scattered, and build the frameworks that let everyone else ask better questions.",
          orders: [
            {
              ornament: "✧",
              name: "The Cartographer",
              essence: "Maps the intellectual terrain of a topic.",
              definition: "Shows you the camps, the fault lines, the unexplored country. Doesn’t tell you where to stand; shows you where standing is *possible*. The reader leaves knowing where everything sits in relation to everything else.",
              tellLabel: "Tell:",
              tell: "*“There are at least four ways to read this…”*",
              declared: false,
            },
            {
              ornament: "❀",
              name: "The Anthologist",
              essence: "Curates and connects. Surfaces work, threads it together.",
              definition: "Part-writer, part-editor in spirit. Makes the longer conversation legible by gathering pieces that, read together, tell a story nobody told on purpose.",
              tellLabel: "Tell:",
              tell: "*“Five pieces from the last year that, read together…”*",
              declared: false,
            },
            {
              ornament: "✠",
              name: "The Translator",
              essence: "Moves ideas across languages, traditions, or disciplines.",
              definition: "Makes the economist legible to the theologian and vice versa, without flattening either. The Translator’s authority is in *fidelity to both sides* of whatever divide they’re crossing.",
              tellLabel: "Tell:",
              tell: "*“What [field A] calls X, [field B] has been calling Y for a hundred years.”*",
              declared: false,
            },
            {
              ornament: "✪",
              name: "The Theorist",
              essence: "Builds frameworks. Less interested in any single question than in the architecture that lets you ask better questions.",
              definition: "Philosophers, systems thinkers, the scaffolding-builders. Introduces vocabulary the reader ends up using afterward, often without remembering where they got it.",
              tellLabel: "Tell:",
              tell: "*Coins the term you find yourself repeating.*",
              declared: false,
            },
          ],
        },
        {
          key: "scholarly",
          name: "Scholarly",
          tagline: "Deep-readers, footnote-followers, and primary-source pilgrims.",
          description: "The patient writers who do the work nobody else has time for. Original languages, primary texts, and the studies behind every citation. The honest scholar always tells you which premises a conclusion depends on.",
          orders: [
            {
              ornament: "✦",
              name: "The Philologist",
              essence: "Deep reader. Goes to the primary text, the original language, the footnote nobody followed.",
              definition: "Scholarly without being inaccessible. The kind of writer who can show you that the translation everyone quotes has been quietly softening the thing it translates for two hundred years.",
              tellLabel: "Tell:",
              tell: "*“The translation we usually quote actually softens what the original says.”*",
              declared: false,
            },
            {
              ornament: "✜",
              name: "The Lexicographer",
              essence: "Obsessed with definitions.",
              definition: "Believes most arguments are really about words people haven’t agreed on yet, and sets out to fix that. The Lexicographer’s pieces tend to clarify whole conversations that had been going in circles for years.",
              tellLabel: "Tell:",
              tell: "*“Before we go further, what do we actually mean by…”*",
              declared: false,
            },
            {
              ornament: "❦",
              name: "The Historian",
              essence: "Long view. Connects today’s question to the centuries-long version of itself.",
              definition: "Refuses presentism without being nostalgic. Shows that arguments we think are new have been had before, sometimes well, sometimes badly, and that knowing which is which changes how we have them now.",
              tellLabel: "Tell:",
              tell: "*“This argument is older than you think.”*",
              declared: false,
            },
            {
              ornament: "✤",
              name: "The Empiricist",
              essence: "Data-forward. Brings the numbers, the studies, the meta-analyses.",
              definition: "And, crucially, brings the *humility about what data can and can’t tell you* that separates good empiricism from scientism. The best Empiricists are the most honest about what their evidence doesn’t show.",
              tellLabel: "Tell:",
              tell: "*“Three studies say X. Here’s why I only half-believe them.”*",
              declared: false,
            },
          ],
        },
        {
          key: "narrative",
          name: "Narrative",
          tagline: "Writers who carry ideas on the backs of characters.",
          description: "Story as method. Parables, scenes, scripts, and lives. Writers who know that the right anecdote does what a thousand abstractions can’t, and use the form to reach truths argument alone can’t touch.",
          orders: [
            {
              ornament: "✿",
              name: "The Fabulist",
              essence: "Teaches through story. Parables, scenes, characters who carry the idea on their backs.",
              definition: "The argument arrives sideways and stays longer for it. The reader remembers the character, and the idea rides along in the memory of the character.",
              tellLabel: "Tell:",
              tell: "*Opens with a person, not a premise.*",
              declared: false,
            },
            {
              ornament: "✥",
              name: "The Playwright",
              essence: "Thinks in scenes and voices.",
              definition: "Stages ideas as encounters between people who actually disagree, and lets the friction do the teaching. When dialogue appears on the page, it earns its place there: every voice is doing intellectual work.",
              tellLabel: "Tell:",
              tell: "*Dialogue on the page, and it earns its place there.*",
              declared: false,
            },
            {
              ornament: "❂",
              name: "The Screenwriter",
              essence: "Visual thinker. Pieces move like shots: economy, pacing, the cut.",
              definition: "Knows that what you don’t show matters as much as what you do. The reader can see the piece while reading it, which makes the argument harder to forget.",
              tellLabel: "Tell:",
              tell: "*You can *see* the piece while reading it.*",
              declared: false,
            },
            {
              ornament: "❀",
              name: "The Biographer",
              essence: "Writes lives.",
              definition: "Believes you understand an idea best by understanding the person who carried it. Pieces are structured around a single human and the world they moved through; the idea is the by-product of attending closely to the life.",
              tellLabel: "Tell:",
              tell: "*Structured around a single human and the world they moved through.*",
              declared: false,
            },
          ],
        },
        {
          key: "practitioner",
          name: "Practitioner",
          tagline: "Field-knowers who write from inside their craft.",
          description: "Writers whose authority comes from hours, not citations. Doctors, therapists, naturalists, social workers: the people who have watched the thing happen, repeatedly, and can tell you what they actually saw.",
          orders: [
            {
              ornament: "✚",
              name: "The Clinician",
              essence: "Writes from practice. Doctor, therapist, counselor, nurse, social worker.",
              definition: "Authority is grounded in working directly with people and their suffering. The voice is careful, ethically alert, never reduces a person to a case. What follows the words *“in twenty years of practice”* is neither anecdote nor data, but the pattern that lives between them.",
              tellLabel: "Tell:",
              tell: "*“In twenty years of practice, I’ve noticed…”*",
              declared: false,
            },
            {
              ornament: "✦",
              name: "The Diagnostician",
              essence: "Sharper, more analytical cousin of the Clinician.",
              definition: "Less interested in the bedside and more interested in the *reasoning*: why we think what we think about a condition, where the diagnostic categories came from, what they get right and wrong. A meta-practitioner.",
              tellLabel: "Tell:",
              tell: "*“The DSM calls this X, but the phenomenon is older and stranger than the label.”*",
              declared: false,
            },
            {
              ornament: "❧",
              name: "The Naturalist",
              essence: "Patient observer. Reports what’s actually there in a system, a community, a phenomenon.",
              definition: "Resists the urge to moralize. Field-notes voice. The Naturalist’s piece often refuses to draw the conclusion the reader expects, and the refusal is the point.",
              tellLabel: "Tell:",
              tell: "*“Here’s what I saw. Make of it what you will.”*",
              declared: false,
            },
          ],
        },
        {
          key: "journalistic",
          name: "Journalistic",
          tagline: "Chroniclers, correspondents, and critics who keep the record.",
          description: "Field writers and old-school reporters. Who, what, when, where, why, verified. Plus the critics who read other work carefully and the chroniclers who record what happened, in order, with fidelity.",
          orders: [
            {
              ornament: "✠",
              name: "The Correspondent",
              essence: "Field writer. Reports from somewhere: a place, a community, a subculture, a personal experience the reader doesn’t have access to.",
              definition: "Earned authority through presence. The Correspondent’s credibility comes from having been in the room, and the writing has to earn its right to the reader’s trust by showing the room.",
              tellLabel: "Tell:",
              tell: "*“I spent six weeks with…”*",
              declared: false,
            },
            {
              ornament: "❖",
              name: "The Annalist",
              essence: "Chronicler. Records what happened, in order, with fidelity.",
              definition: "Less interested in the hot take than in the durable account. The Annalist’s pieces are the ones future writers will cite when they want to know what actually happened.",
              tellLabel: "Tell:",
              tell: "*Dates, sequence, receipts.*",
              declared: false,
            },
            {
              ornament: "✜",
              name: "The Reportorial",
              essence: "Old-school journalist instincts. Who, what, when, where, why, verified.",
              definition: "Sources named, claims checked, opinion clearly fenced from fact. The Reportorial Order is one of Dialecta’s quietest and most important; these are the writers whose work the rest of the platform is allowed to build on.",
              tellLabel: "Tell:",
              tell: "*A methods note at the bottom.*",
              declared: false,
            },
            {
              ornament: "✺",
              name: "The Critic",
              essence: "In the literary sense: reads other work carefully and writes about it with authority.",
              definition: "Reviews, close readings, the considered judgment. The Critic takes other writers seriously enough to disagree in detail, which is the highest form of attention one writer can pay another.",
              tellLabel: "Tell:",
              tell: "*Takes other writers seriously enough to disagree in detail.*",
              declared: false,
            },
            {
              ornament: "✥",
              name: "The Marginalia",
              essence: "Writes in response.",
              definition: "Best work happens in dialogue with other pieces, other writers, the long argument. The platform’s connective tissue. The Marginalia keeps the conversation a conversation rather than a series of monologues.",
              tellLabel: "Tell:",
              tell: "*“[Writer] made a case last month that deserves a closer look.”*",
              declared: false,
            },
          ],
        },
        {
          key: "pedagogical",
          name: "Pedagogical",
          tagline: "Patient teachers who walk you through the difficult text.",
          description: "The line of the medieval glossator. Take a hard idea and write the line-by-line gloss that makes it walkable for everyone else. One of the most generous Orders in the Stewardship.",
          orders: [
            {
              ornament: "❦",
              name: "The Glossator",
              essence: "Explainer in the medieval-monk tradition.",
              definition: "Takes a difficult text or idea and writes the patient, line-by-line gloss that makes it walkable for everyone else. The platform's best teacher, and one of the most generous Orders in the Stewardship.",
              tellLabel: "Tell:",
              tell: "*“Let’s go through this carefully.”*",
              declared: false,
            },
          ],
        },
        {
          key: "speculative",
          name: "Speculative",
          tagline: "Disciplined dreamers who name their assumptions out loud.",
          description: "Speculation, futurism, and thought-experiment, held to a standard. Not prediction-as-entertainment but careful extrapolation with the premises visible, so readers can disagree with the right ones.",
          orders: [
            {
              ornament: "✪",
              name: "The Futurist",
              essence: "Disciplined speculation.",
              definition: "Not prediction-as-entertainment, careful extrapolation with the assumptions made visible. The honest Futurist tells you exactly which premises their forecast depends on, so you can disagree with the right ones.",
              tellLabel: "Tell:",
              tell: "*“If these three things hold, then…”*",
              declared: false,
            },
          ],
        },
        {
          key: "declared",
          name: "Declared",
          tagline: "The Orders writers must claim for themselves, under heightened scrutiny.",
          description: "Most Orders are recognized by the platform from observed patterns. The Declared are the exception: writers who accept a charter the platform alone cannot enforce, in exchange for a sharper standard. The Satirist’s badge is the proof that Dialecta’s principles are real.",
          orders: [
            {
              ornament: "✦",
              name: "The Satirist",
              essence: "The platform’s only declared Order. Held to its own charter.",
              definition: "Satire is one of the oldest tools for critiquing ideas without attacking people. The Satirist of Dialecta accepts heightened scrutiny: the target must be an idea, a system, a claim, or an absurdity, never an identifiable individual or group defined by identity. The form must reward careful reading. A piece tagged as satire is read in a different register by both the engine and the readership. The Satirist’s badge is one of the proofs that Dialecta’s principles are real.",
              tellLabel: "Tell:",
              tell: "*“The strongest version of this argument is so absurd it survives only in writing.”*",
              declared: true,
            },
          ],
        },
      ],
      satirist: {
        eyebrow: "A Note on the Declared Order",
        title: "On the Satirist",
        lede: "Most Orders are recognized by the platform from observed patterns of writing over time. Writers don’t choose; they’re seen. The Satirist is the exception: the Order’s writers must declare themselves, accepting heightened scrutiny under a charter specific to the form. A platform that allows only earnest discourse looks afraid of its own rules. A platform that allows satire, and holds it to the same standard of substance, demonstrates that the rules are about substance, not tone. The Satirist’s badge is one of the proofs that Dialecta’s principles are real. The full Satirist’s Charter will be published as a companion document.",
      },
      doorway: {
        eyebrow: "How a Steward is recognized",
        title: "The door is *open*",
        motto: "Chosen by their work.",
        body: [
          "No one applies to be a Steward of Dialecta. No one is appointed. The community recognizes its Stewards the way it recognizes its best ideas: by reading what they’ve written, by watching how they’ve written it over time.",
          "The path is open to any reader who chooses to walk it. Write seriously, write specifically, write with care for the reader on the other side. The work does the rest.",
          "This is the only credential the platform issues, and the only one it asks of you.",
        ],
      },
      footerNote: "The Stewards page is a living document. New Orders will be added as Dialecta grows and recognizes kinds of writers it hasn’t yet anticipated. The principles that govern recognition won’t change.",
      footerMeta: "Dialecta · Session 13 · Stewards · v1",
    },
  },
} as const;

export type Strings = typeof strings;
