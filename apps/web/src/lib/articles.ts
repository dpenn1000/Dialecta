/**
 * Article reads. Articles are native rows in Supabase (ADR-001/003); there is
 * no Ghost in this app. Server-only: uses the cookie-aware server client.
 */
import { createClient } from '@/lib/supabase/server';

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  topic: string | null;
  published_at: string | null;
  author: { display_name: string } | null;
}

export interface Article extends ArticleSummary {
  body_html: string;
  declared_claims: unknown[];
}

const SUMMARY_COLUMNS = 'id, slug, title, excerpt, topic, published_at, author:profiles!articles_author_id_fkey(display_name)';

/** True when the public Supabase env is present. Pages render a notice otherwise. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type Row<T> = Omit<T, 'author'> & { author: { display_name: string } | { display_name: string }[] | null };

function oneAuthor<T extends { author: unknown }>(row: Row<T>): T {
  const a = row.author;
  return { ...row, author: Array.isArray(a) ? (a[0] ?? null) : a } as T;
}

export async function getPublishedArticles(limit = 20): Promise<ArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`articles query failed: ${error.message}`);
  return (data ?? []).map((r) => oneAuthor<ArticleSummary>(r as unknown as Row<ArticleSummary>));
}

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(`${SUMMARY_COLUMNS}, body_html, declared_claims`)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`article query failed: ${error.message}`);
  return data ? oneAuthor<Article>(data as unknown as Row<Article>) : null;
}
