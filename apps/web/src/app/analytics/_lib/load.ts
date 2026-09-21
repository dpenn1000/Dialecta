/**
 * Every query the analytics page runs, and nothing else. Server only: it is
 * imported by page.tsx alone, never by a client component.
 *
 * Every read goes through createClient(), the anon key plus the visitor's own
 * session, so this page can never show more than row-level security already
 * lets that visitor see. The service role is deliberately not used: see the
 * access section of team/builder/2026-09-20-analytics-spec.md.
 *
 * Only the columns each figure needs are selected. comments.member_email is
 * readable with the anon key today, and this page never asks for it.
 */
import { createClient } from '@/lib/supabase/server';
import { CLOSED, type ClosedEntry } from './access-map';
import { FIXTURE_PREFIX, type RawAnalytics } from './derive';
import { countOnly, readAll, readBounded, type Loaded } from './measure';
import { ARCHETYPE_COLUMNS, ARTICLE_COLUMNS, AXIS_COLUMNS, COMMENT_COLUMNS, FOLLOW_COLUMNS, PROFILE_COLUMNS } from './rows';

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function loadAnalytics(): Promise<RawAnalytics> {
  const supabase = await createClient();

  const probeAll = Promise.all(
    CLOSED.map(async (entry) => {
      // At most one value plus the exact count. A withheld column fails here
      // with 42501 and a false policy returns 0. The one value is never kept:
      // countOnly reads the count and drops the row.
      const probe = await countOnly(
        supabase.from(entry.table).select(entry.probeColumn, { count: 'exact' }).range(0, 0),
      );
      return [entry.table, probe] as const;
    }),
  );

  const [comments, articles, axis, archetypes, profiles, lastFollow, probed] = await Promise.all([
    readAll((from, to) =>
      supabase
        .from('comments')
        .select(COMMENT_COLUMNS, { count: 'exact' })
        .eq('status', 'published')
        .order('id')
        .range(from, to),
    ),
    readAll((from, to) =>
      supabase
        .from('articles')
        .select(ARTICLE_COLUMNS, { count: 'exact' })
        .eq('status', 'published')
        .order('id')
        .range(from, to),
    ),
    readAll((from, to) =>
      supabase.from('axis_scores').select(AXIS_COLUMNS, { count: 'exact' }).order('id').range(from, to),
    ),
    readAll((from, to) =>
      supabase.from('archetypes').select(ARCHETYPE_COLUMNS, { count: 'exact' }).order('id').range(from, to),
    ),
    readAll((from, to) =>
      supabase.from('profiles').select(PROFILE_COLUMNS, { count: 'exact' }).order('id').range(from, to),
    ),
    // The newest follow by a live member only: one row, whatever the table's size.
    readBounded(
      supabase
        .from('follows')
        .select(FOLLOW_COLUMNS)
        .not('follower_id', 'like', `${FIXTURE_PREFIX}%`)
        .order('created_at', { ascending: false })
        .limit(1),
    ),
    probeAll,
  ]);

  const probes = Object.fromEntries(probed) as Record<ClosedEntry['table'], Loaded<number>>;
  return { comments, articles, axis, archetypes, profiles, lastFollow, probes };
}
