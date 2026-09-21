/**
 * The discourse layer's server half: reads the conversation for one article
 * (./data.ts, the only file here that imports a Supabase client) and hands
 * it to the island as props. The article page mounts this below the body.
 */
import './discourse.css';
import { loadDiscourse } from './data';
import { DiscourseRoot } from './discourse-root';
import type { ComposerArticle } from './types';

/** The classifier's context caps, so a long claims list cannot bloat every comment call. */
const MAX_CLAIMS = 10;
const MAX_CLAIM_CHARS = 500;

/**
 * articles.declared_claims is jsonb with no enforced shape: every live row is
 * an empty array today. /api/comment takes article_claims as a list of
 * strings, so a string passes through and an object contributes its first
 * string field of claim, text or statement. Anything else is skipped.
 */
export function toArticleClaims(declared: unknown): string[] {
  if (!Array.isArray(declared)) return [];
  const out: string[] = [];
  for (const item of declared) {
    let text: unknown = item;
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      text = [record.claim, record.text, record.statement].find((v) => typeof v === 'string');
    }
    if (typeof text === 'string' && text.trim()) out.push(text.trim().slice(0, MAX_CLAIM_CHARS));
    if (out.length >= MAX_CLAIMS) break;
  }
  return out;
}

export async function DiscourseSection({ article, preview = false }: { article: ComposerArticle; preview?: boolean }) {
  const data = await loadDiscourse({ id: article.id, slug: article.slug });
  return <DiscourseRoot article={article} data={data} preview={preview} />;
}
