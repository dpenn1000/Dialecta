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
} as const;

export type Strings = typeof strings;
