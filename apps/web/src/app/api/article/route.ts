/**
 * POST /api/article: publish an article, or publish a revision of one.
 *
 * THIS IS THE PUBLISH SEAM. It replaces two recovered routes and one Ghost
 * round trip. The recovered writer (dialecta-editor.jsx 2471-2543) called
 * /api/article/submit, which created a Ghost draft and a Supabase row, then
 * /api/article/publish, which flipped the Ghost post live. ADR-001 leaves
 * Ghost, ADR-003 makes Supabase the article store, so this is one route that
 * writes one row, `status = 'published'`, and the article is readable at
 * /articles/<slug> through the public read policy the moment it commits.
 *
 * Identity, the rule this route is built around: the author is resolved from
 * the verified session and never from the request. The recovered submit took
 * `member_uuid` from the body; this route has no identity field to take.
 * getClaims() verifies the JWT, then get_own_profile_for_comment() resolves
 * the caller's own profile inside a SECURITY DEFINER function
 * (profiles.user_id = auth.uid()), exactly as api/comment/route.ts does.
 * author_member_id is that profile's member_id and author_profile_id its id,
 * both from the same row. The row is written through the
 * session-scoped client, so row-level security judges it; there is no
 * service-role write anywhere in this path.
 *
 * WHAT THIS NEEDS BEFORE IT CAN SUCCEED, verified tonight against the other
 * builder session that owns supabase/ (2026-09-21):
 *
 *   1. A session that resolves to a profile. profiles.user_id is null on all
 *      14 profiles and profile_claim_tokens has 0 rows, so
 *      get_own_profile_for_comment() returns nothing for every session until
 *      the claim_profile() flow runs for a real user. Fails here as 403,
 *      strings.article.profileRequired.
 *   2. articles.ghost_post_id relaxed from NOT NULL. A native article has no
 *      Ghost post id and this route will not invent one. The schema owner's
 *      one line:  alter table public.articles alter column ghost_post_id drop not null;
 *      Fails here as 503, strings.article.ghostPostIdRequired.
 *   3. An insert and update policy for authors on articles. None exists; the
 *      schema owner drafted one (articles_author_insert / articles_author_update,
 *      with current_member_is_author() in the check) and did not apply it,
 *      because (1) means it would match nobody tonight. Fails here as 503,
 *      strings.article.writePolicyMissing.
 *
 * The content columns (slug, title, excerpt, topic, published_at, body_html,
 * body_json, declared_claims) landed tonight in migration 20260921040353.
 * If a database without them is ever pointed at, this fails as 503,
 * strings.article.schemaNotReady, naming the column Postgres reported.
 *
 * Not checked here: profiles.is_author, the gate page-write.hbs described.
 * The drafted policy enforces it in the database through
 * current_member_is_author(), which is the stronger place for it, because
 * `authenticated` cannot read profiles.user_id to check it from here.
 */
import { isTier, type Tier } from '@dialecta/core';
import { createClient } from '@/lib/supabase/server';
import { sanitizeArticleHtml } from '@/lib/sanitize-html';
import { isTopicSlug, type TopicSlug } from '@/lib/topics';
import { slugify, slugSuffix } from '@/lib/slug';
import { strings } from '@/strings';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TITLE = 200;
const MAX_EXCERPT = 400;
const MAX_NOTE = 2000;
const MAX_BODY_CHARS = 1_000_000;
const SLUG_ATTEMPTS = 4;
const STAGE_25_CHOICES = ['amend', 'respond', 'as_is'] as const;
type Stage25Choice = (typeof STAGE_25_CHOICES)[number];

/** Postgres and PostgREST error codes this route maps to a named precondition. */
const PG = {
  undefinedColumn: '42703',
  postgrestUnknownColumn: 'PGRST204',
  notNullViolation: '23502',
  uniqueViolation: '23505',
  insufficientPrivilege: '42501',
} as const;

interface DbError {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  if (t.length > max) return undefined;
  return t === '' ? null : t;
}

function textOf(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
}

/**
 * Database detail is shown only outside production: it names the table, the
 * column and the policy, which is what a builder needs and what an author
 * reading the publish box does not.
 */
function detailOf(error: DbError, fix?: string): string | undefined {
  if (process.env.NODE_ENV === 'production') return undefined;
  return [error.code, error.message, error.details, error.hint, fix].filter(Boolean).join('\n');
}

function isUniqueSlugViolation(error: DbError): boolean {
  return error.code === PG.uniqueViolation && /slug/i.test(`${error.message ?? ''} ${error.details ?? ''}`);
}

/** Map a write failure to the precondition it names. */
function writeFailure(error: DbError): Response {
  if (error.code === PG.undefinedColumn || error.code === PG.postgrestUnknownColumn) {
    return Response.json({ error: strings.article.schemaNotReady, detail: detailOf(error) }, { status: 503 });
  }
  if (error.code === PG.notNullViolation && /ghost_post_id/.test(`${error.message ?? ''} ${error.details ?? ''}`)) {
    return Response.json(
      {
        error: strings.article.ghostPostIdRequired,
        detail: detailOf(error, strings.article.diagnostics.ghostPostIdFix),
      },
      { status: 503 },
    );
  }
  if (error.code === PG.insufficientPrivilege) {
    return Response.json({ error: strings.article.writePolicyMissing, detail: detailOf(error) }, { status: 503 });
  }
  console.error('article route: write failed', error);
  return Response.json({ error: strings.article.publishFailed, detail: detailOf(error) }, { status: 500 });
}

interface ValidatedArticle {
  id: string | null;
  title: string;
  excerpt: string | null;
  topic: TopicSlug | null;
  bodyJson: Record<string, unknown>;
  bodyHtml: string;
  declaration: {
    core_claim: string;
    scope_boundary: string;
    strongest_objection: string;
    opinion_maps: unknown[];
  };
  declaredTier: Tier | null;
  stage25Choice: Stage25Choice;
  authorNote: string | null;
}

function validate(payload: Record<string, unknown>): ValidatedArticle | Response {
  const bad = (error: string) => Response.json({ error }, { status: 400 });

  let id: string | null = null;
  if (payload.id !== undefined && payload.id !== null) {
    if (typeof payload.id !== 'string' || !UUID_RE.test(payload.id)) return bad(strings.article.invalidId);
    id = payload.id;
  }

  const title = typeof payload.title === 'string' ? payload.title.replace(/\s+/g, ' ').trim() : '';
  if (!title || title.length > MAX_TITLE) return bad(strings.article.titleRequired);

  const excerpt = optionalText(payload.excerpt, MAX_EXCERPT);
  if (excerpt === undefined) return bad(strings.article.malformedRequest);

  let topic: TopicSlug | null = null;
  if (payload.topic !== undefined && payload.topic !== null) {
    if (!isTopicSlug(payload.topic)) return bad(strings.article.invalidTopic);
    topic = payload.topic;
  }

  if (!isPlainObject(payload.body_json) || payload.body_json.type !== 'doc') return bad(strings.article.bodyRequired);
  // body_json is stored as sent, so bound it the way body_html is bounded.
  if (JSON.stringify(payload.body_json).length > MAX_BODY_CHARS * 2) return bad(strings.article.bodyRequired);
  if (typeof payload.body_html !== 'string' || payload.body_html.length > MAX_BODY_CHARS) {
    return bad(strings.article.bodyRequired);
  }

  // Sanitized at write time so the stored row is clean for every other
  // consumer; the article page sanitizes again at read time regardless (see
  // lib/sanitize-html.ts on why storage cleanliness alone is not enough).
  const bodyHtml = sanitizeArticleHtml(payload.body_html).trim();
  if (!textOf(bodyHtml)) return bad(strings.article.bodyRequired);

  const d = isPlainObject(payload.declaration) ? payload.declaration : {};
  const field = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_NOTE) : '');
  const declaration = {
    core_claim: field(d.core_claim),
    scope_boundary: field(d.scope_boundary),
    strongest_objection: field(d.strongest_objection),
    opinion_maps: Array.isArray(d.opinion_maps) ? d.opinion_maps : [],
  };

  let declaredTier: Tier | null = null;
  if (payload.declared_tier !== undefined && payload.declared_tier !== null) {
    if (!isTier(payload.declared_tier)) return bad(strings.article.invalidTier);
    declaredTier = payload.declared_tier;
  }

  const stage25Choice: Stage25Choice = STAGE_25_CHOICES.includes(payload.stage_2_5_choice as Stage25Choice)
    ? (payload.stage_2_5_choice as Stage25Choice)
    : 'as_is';

  const authorNote = stage25Choice === 'respond' ? (optionalText(payload.author_note, MAX_NOTE) ?? null) : null;

  return {
    id,
    title,
    excerpt,
    topic,
    bodyJson: payload.body_json,
    bodyHtml,
    declaration,
    declaredTier,
    stage25Choice,
    authorNote,
  };
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!isPlainObject(parsed)) {
      return Response.json({ error: strings.article.malformedRequest }, { status: 400 });
    }
    payload = parsed;
  } catch {
    return Response.json({ error: strings.article.malformedRequest }, { status: 400 });
  }

  const article = validate(payload);
  if (article instanceof Response) return article;

  const supabase = await createClient();

  // Identity from the verified session. getClaims(), never getSession(): see
  // api/comment/route.ts for why the unverified cookie claim is not a gate.
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return Response.json({ error: strings.article.signInRequired }, { status: 401 });
  }

  // Seam precondition 1: the session must resolve to a profile.
  const { data: profileRows, error: profileError } = await supabase.rpc('get_own_profile_for_comment');
  if (profileError) {
    console.error('article route: get_own_profile_for_comment failed', profileError);
    return Response.json(
      { error: strings.article.publishFailed, detail: detailOf(profileError as DbError) },
      { status: 500 },
    );
  }
  const profile = Array.isArray(profileRows) ? profileRows[0] : undefined;
  const memberId: unknown = profile?.member_id;
  const profileId: unknown = profile?.profile_id;
  if (!profile || typeof memberId !== 'string' || !memberId || typeof profileId !== 'string') {
    return Response.json(
      {
        error: strings.article.profileRequired,
        detail: process.env.NODE_ENV === 'production' ? undefined : strings.article.diagnostics.noProfileRow,
      },
      { status: 403 },
    );
  }
  if (!profile.member_name || !String(profile.member_name).trim()) {
    return Response.json({ error: strings.article.profileIncomplete }, { status: 400 });
  }

  const declaredClaims = article.declaration.core_claim ? [article.declaration.core_claim] : [];

  const content = {
    title: article.title,
    excerpt: article.excerpt,
    topic: article.topic,
    body_json: article.bodyJson,
    body_html: article.bodyHtml,
    declared_claims: declaredClaims,
    // The recovered editor's own columns, live on articles since before
    // tonight: the author's declaration, their tier, their Stage 2.5 choice
    // and the note that goes with Respond for the Record.
    declaration: article.declaration,
    declared_tier: article.declaredTier,
    stage_2_5_choice: article.stage25Choice,
    author_note: article.authorNote,
  };

  // A revision. The slug and the first published_at are kept, so an address
  // that was shared keeps working. Ownership is checked twice on purpose:
  // here in the filter, and by the update policy once it exists.
  if (article.id) {
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update(content)
      .eq('id', article.id)
      .eq('author_member_id', memberId)
      .select('id, slug')
      .maybeSingle();
    if (updateError) return writeFailure(updateError);
    if (!updated || typeof updated.slug !== 'string') {
      return Response.json({ error: strings.article.notFound }, { status: 404 });
    }
    return Response.json({ id: updated.id, slug: updated.slug }, { status: 200 });
  }

  // A new article. The slug is derived here from the title, never accepted
  // from the client, and retried with a short suffix on a collision.
  const base = slugify(article.title);
  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${slugSuffix()}`;
    const { data: inserted, error: insertError } = await supabase
      .from('articles')
      .insert({
        ...content,
        slug,
        // Both from the one session-resolved profile row. author_member_id is
        // the source of authorship; author_profile_id (migration
        // 20260921041813) is what the byline embed joins on, because joining
        // on author_member_id reads profiles.ghost_member_id, which is closed
        // to anon. No trigger keeps the two in step yet, so both are written.
        author_member_id: memberId,
        author_profile_id: profileId,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single();
    if (!insertError && inserted) {
      return Response.json({ id: inserted.id, slug: inserted.slug }, { status: 201 });
    }
    if (insertError && isUniqueSlugViolation(insertError)) continue;
    return writeFailure(insertError ?? { message: 'insert returned no row' });
  }
  return Response.json({ error: strings.article.slugExhausted }, { status: 409 });
}
