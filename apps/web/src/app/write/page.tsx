import type { Metadata } from 'next';
import type { JSONContent } from '@tiptap/react';
import { isTier } from '@dialecta/core';
import Writer from '@/components/editor/writer';
import { INITIAL_STATE, type WriterState } from '@/components/editor/writer-state';
import { createClient } from '@/lib/supabase/server';
import { isTopicSlug } from '@/lib/topics';
import { strings } from '@/strings';

/**
 * /write: the article writer. Replaces the Ghost page _theme/page-write.hbs,
 * which mounted the compiled editor bundle into a div carrying
 * data-member-uuid, data-member-email and data-member-name from {{@member}}.
 *
 * The session is read here, on the server, through getClaims(), and the island
 * receives only what it displays: a name for the byline, whether a sign in
 * exists, whether it resolves to a profile. The publish route resolves the
 * author again on its own. `?article=<id>` opens one of the signed-in author's
 * published articles for revision; the row is fetched with the author filter
 * applied, so another author's id finds nothing.
 *
 * Signed-out visitors see the writer too, with a line saying publishing needs a
 * sign in. page-write.hbs showed them only "The editor is for members", but
 * its own comment put the real gate at the API ("the gate lives at the API
 * surface, not the page surface"), and the API gate is intact here. Drafting
 * touches nothing but this browser's localStorage.
 */

export const metadata: Metadata = {
  title: strings.writer.pageTitle,
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface WritePageProps {
  searchParams: Promise<{ article?: string | string[] }>;
}

function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** A stored article, shaped back into the writer's draft state for a revision. */
function toWriterState(row: Record<string, unknown>): WriterState {
  const declaration = row.declaration && typeof row.declaration === 'object' ? (row.declaration as Record<string, unknown>) : {};
  const bodyJson = row.body_json && typeof row.body_json === 'object' ? (row.body_json as JSONContent) : null;
  return {
    ...INITIAL_STATE,
    article_id: text(row.id) || null,
    slug: text(row.slug) || null,
    title: text(row.title),
    excerpt: text(row.excerpt),
    // body_json defaults to '{}' on the column; an empty object is not a
    // document, so fall back to the stored HTML for rows written before it.
    body_json: bodyJson && bodyJson.type === 'doc' ? bodyJson : null,
    body_html: text(row.body_html),
    primary_tag: isTopicSlug(row.topic) ? row.topic : null,
    declaration: {
      core_claim: text(declaration.core_claim),
      scope_boundary: text(declaration.scope_boundary),
      strongest_objection: text(declaration.strongest_objection),
      opinion_maps: Array.isArray(declaration.opinion_maps) ? (declaration.opinion_maps as Record<string, unknown>[]) : [],
    },
    declared_tier: isTier(row.declared_tier) ? row.declared_tier : null,
  };
}

export default async function WritePage({ searchParams }: WritePageProps) {
  let signedIn = false;
  let profileLinked = false;
  let authorName: string | null = null;
  let initialArticle: WriterState | null = null;

  if (isConfigured()) {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    signedIn = Boolean(claimsData?.claims?.sub);

    if (signedIn) {
      const { data: profileRows } = await supabase.rpc('get_own_profile_for_comment');
      const profile = Array.isArray(profileRows) ? profileRows[0] : undefined;
      if (profile && typeof profile.member_id === 'string') {
        profileLinked = true;
        authorName = typeof profile.member_name === 'string' && profile.member_name.trim() ? profile.member_name : null;

        const { article } = await searchParams;
        const articleId = Array.isArray(article) ? article[0] : article;
        if (articleId && UUID_RE.test(articleId)) {
          const { data: row } = await supabase
            .from('articles')
            .select('id, slug, title, excerpt, topic, body_json, body_html, declaration, declared_tier')
            .eq('id', articleId)
            .eq('author_member_id', profile.member_id)
            .maybeSingle();
          if (row) initialArticle = toWriterState(row as Record<string, unknown>);
        }
      }
    }
  }

  return (
    <main className="dialecta-wide">
      <Writer
        authorName={authorName}
        signedIn={signedIn}
        profileLinked={profileLinked}
        initialArticle={initialArticle}
      />
    </main>
  );
}
