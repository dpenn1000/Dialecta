/**
 * POST /api/comment: the comment write path, server side.
 *
 * Server path only. No composer client calls this yet (`dialecta-discourse-layer.jsx`
 * is not ported in this increment; see team/builder/positions-2026-09-20-estimate-revised.md,
 * "Port or rewrite": the discourse layer's comment UI is a port, not written
 * from here). This route is what that future composer calls.
 *
 * The one defect this route exists to close, closed by construction rather
 * than by patch: the recovered production handler (_recovered/api/comment.js)
 * takes `member_uuid` from the request body and checks only that it is a
 * non-empty string (line 123), then matches it against `profiles.ghost_member_id`,
 * a column the anon key could read. Anyone who could read that column, which
 * was everyone, could post as anyone. Fixed here by never reading identity
 * from the request at all: `supabase.auth.getClaims()` verifies the caller's
 * JWT locally against Supabase's JWKS (team/builder/practices.md, "Server
 * code decides authorization on getClaims(); getSession() is not a gate"),
 * and every identity field on the row (member_id, member_name, member_email)
 * is read from that verified session or the profile it resolves to, never
 * from the body.
 *
 * Two Supabase clients, deliberately, per supabase/CLAUDE.md's own rule
 * ("insert and update of own rows through auth.uid(). Pipeline writes use
 * the service role from server code only."): the comment itself is the
 * commenter's own row, written through the session-scoped client under the
 * RLS policies in supabase/migrations/20260920200500_comment_write_identity.sql;
 * the classification is Dialecta's own computed judgment about that row, a
 * pipeline write, made through the service-role client in
 * src/lib/supabase/service.ts. Neither client is the anon-key browser client;
 * both only ever run here, server side.
 */
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sanitizeArticleHtml } from '@/lib/sanitize-html';
import { classifyComment, ClassificationRequestError } from '@/lib/classify';
import { isTier, resolveFinalTier, ClassificationParseError, type Tier } from '@dialecta/core';
import { strings } from '@/strings';

// Requirement 3 (team/builder/brief.md, this increment): a rate limit on the
// classification call, because every comment write fires a priced Anthropic
// call (council/security/positions/2026-09-20-path-to-launch.md: "A spend
// cap or rate limit on /api/classify... a day, maybe two, additive").
// Database-backed rather than in-memory or a new Redis/Upstash dependency:
// Vercel functions are stateless between invocations so in-memory counting
// does not reliably hold, this route already talks to Postgres for the
// write itself, and the SELECT policy added alongside this route already
// scopes a read to the caller's own rows, which is exactly what a per-caller
// count needs. Simplest correct thing, per the brief; not IP-based, because
// this path already requires a claimed session, a stronger identity than an
// IP address.
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_COMMENTS = 5;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CommentRequestBody {
  article_id?: unknown;
  article_slug?: unknown;
  article_title?: unknown;
  article_claims?: unknown;
  body?: unknown;
  parent_id?: unknown;
  self_declared_tier?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let payload: CommentRequestBody;
  try {
    const parsed: unknown = await request.json();
    if (!isPlainObject(parsed)) {
      return Response.json({ error: strings.comment.malformedRequest }, { status: 400 });
    }
    payload = parsed;
  } catch {
    return Response.json({ error: strings.comment.malformedRequest }, { status: 400 });
  }

  const { article_id, article_slug, article_title, article_claims, body, parent_id, self_declared_tier } = payload;

  if (typeof article_id !== 'string' || typeof article_slug !== 'string' || typeof article_title !== 'string' ||
      article_id.trim() === '' || article_slug.trim() === '' || article_title.trim() === '') {
    return Response.json({ error: strings.comment.invalidArticle }, { status: 400 });
  }
  if (!UUID_RE.test(article_id)) {
    return Response.json({ error: strings.comment.invalidArticle }, { status: 400 });
  }
  if (typeof body !== 'string' || body.trim() === '') {
    return Response.json({ error: strings.comment.bodyRequired }, { status: 400 });
  }
  let parentId: string | null = null;
  if (parent_id !== undefined && parent_id !== null) {
    if (typeof parent_id !== 'string' || !UUID_RE.test(parent_id)) {
      return Response.json({ error: strings.comment.invalidParent }, { status: 400 });
    }
    parentId = parent_id;
  }
  let selfDeclaredTier: Tier | null = null;
  if (self_declared_tier !== undefined && self_declared_tier !== null) {
    if (typeof self_declared_tier !== 'string' || !isTier(self_declared_tier)) {
      return Response.json({ error: strings.comment.invalidTier }, { status: 400 });
    }
    selfDeclaredTier = self_declared_tier;
  }
  let articleClaims: string[] = [];
  if (article_claims !== undefined && article_claims !== null) {
    if (!Array.isArray(article_claims) || article_claims.some((c) => typeof c !== 'string')) {
      return Response.json({ error: strings.comment.invalidClaims }, { status: 400 });
    }
    articleClaims = article_claims;
  }

  const supabase = await createClient();

  // Identity comes from the session, never the request (requirement 1).
  // getClaims(), never getSession(): getSession() reads the cookie's own
  // unverified claim, the same trust-the-client shape as the defect this
  // route exists to close, just moved from a request body to a cookie.
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const sub = claimsData?.claims?.sub;
  const sessionEmail = claimsData?.claims?.email;
  if (claimsError || !sub) {
    return Response.json({ error: strings.comment.signInRequired }, { status: 401 });
  }
  if (!sessionEmail) {
    return Response.json({ error: strings.comment.emailRequired }, { status: 403 });
  }

  // The caller's own profile, resolved through the verified session
  // (get_own_profile_for_comment() reads profiles.user_id = auth.uid()
  // inside a SECURITY DEFINER function; see the migration for why a plain
  // select can't do this under the current column grants). This is the
  // session-verified equivalent of the recovered handler's
  // `.eq('ghost_member_id', member_uuid)` lookup, the one line that made
  // the original endpoint spoofable.
  const { data: profileRows, error: profileError } = await supabase.rpc('get_own_profile_for_comment');
  if (profileError) {
    console.error('comment route: get_own_profile_for_comment failed', profileError);
    return Response.json({ error: strings.comment.submissionFailed }, { status: 500 });
  }
  const profile = profileRows?.[0];
  if (!profile) {
    return Response.json({ error: strings.comment.profileRequired }, { status: 403 });
  }
  if (!profile.member_name || !String(profile.member_name).trim()) {
    return Response.json({ error: strings.comment.profileIncomplete }, { status: 400 });
  }

  // Rate limit the classification call (requirement 3), before it fires.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count: recentCount, error: countError } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', profile.member_id)
    .gte('created_at', windowStart);
  if (countError) {
    console.error('comment route: rate limit count failed', countError);
    return Response.json({ error: strings.comment.submissionFailed }, { status: 500 });
  }
  if ((recentCount ?? 0) >= RATE_LIMIT_MAX_COMMENTS) {
    return Response.json({ error: strings.comment.rateLimited }, { status: 429 });
  }

  // Sanitize at write time (requirement 2), through the same module the
  // article read/write path uses, so a future comment read path never has
  // to guess whether this row is already clean.
  const cleanBody = sanitizeArticleHtml(body).trim();
  if (!cleanBody) {
    return Response.json({ error: strings.comment.bodyRequired }, { status: 400 });
  }

  let classification;
  try {
    classification = await classifyComment(cleanBody, articleClaims);
  } catch (err) {
    if (err instanceof ClassificationRequestError || err instanceof ClassificationParseError) {
      console.error('comment route: classification failed', err);
      return Response.json({ error: strings.comment.classificationFailed }, { status: 502 });
    }
    throw err;
  }

  // Requirement 4: do not set final_tier from client input. resolveFinalTier
  // (@dialecta/core, the locked 40/35/15/10 weighting) is the mechanism, not
  // a hand-rolled override guard: with no community votes and no Stage 2.5
  // response yet, ai (40%) always outweighs self-declaration alone (15%),
  // so final_tier equals ai_suggested_tier regardless of what
  // self_declared_tier the caller sends. Provable, not just intended: see
  // packages/core/test/resolution.test.ts, "self-declaration alone cannot
  // beat the AI, even with perfect Stage 2.5 quality." This is the
  // resolution the recovered handler's `self_declared_tier || ai_suggested_tier`
  // line skipped, which is what let a comment owner set their own tier
  // (reviewer's blocker two, exchange/open/2026-09-19-002-handoff-pr-3-review.md).
  const { finalTier } = resolveFinalTier({
    aiTier: classification.ai_suggested_tier,
    selfDeclaredTier,
  });

  // The comment: the commenter's own row, through the session-scoped
  // client, under this migration's insert policy. status is passed
  // explicitly even though the column defaults to the same value
  // (requirement 5): the policy's own with check pins it to
  // 'pending_review' too, so this is documentation of an enforced fact, not
  // the only thing enforcing it. No promotion pipeline exists yet
  // (requirement 5); nothing past this insert moves status off that
  // default.
  const { data: comment, error: insertError } = await supabase
    .from('comments')
    .insert({
      article_id,
      article_slug,
      article_title,
      parent_id: parentId,
      member_id: profile.member_id,
      member_name: profile.member_name,
      member_email: sessionEmail,
      body: cleanBody,
      status: 'pending_review',
    })
    .select('id, status')
    .single();
  if (insertError || !comment) {
    console.error('comment route: comment insert failed', insertError);
    return Response.json({ error: strings.comment.submissionFailed }, { status: 500 });
  }

  // The classification: Dialecta's own computed judgment about the row
  // above, not the commenter's own content, so it is a pipeline write on
  // the service role (see src/lib/supabase/service.ts), not the
  // session-scoped client. classifications carries no authenticated RLS
  // policy at all, by design (baseline migration, "classifications_service_only");
  // this is the one path that may write it.
  //
  // opposing_view_engaged: ClassificationResult folds the model's
  // yes/partially/no answer to a boolean (packages/core/src/classification.ts,
  // "yes and partially are true, no is false"), but the live column is the
  // 3-valued enum public.opposing_view_level ('yes'|'partially'|'no')
  // (baseline migration: "THE FIX: a true 3-value enum live, not the
  // archived migration's boolean"). That is a real mismatch between
  // packages/core's parsed type and the live schema, not something this
  // route can resolve without either changing a shared, tested type or the
  // column: folding back to 'yes'/'no' here is the minimal safe choice
  // (never inserts an invalid enum value) but is lossy, a 'partially'
  // answer is indistinguishable from 'yes' once stored. Flagged, not fixed,
  // in this increment; see the report for the recommended follow-up.
  const serviceClient = createServiceClient();
  const { error: classificationInsertError } = await serviceClient
    .from('classifications')
    .insert({
      comment_id: comment.id,
      claim_text: classification.claim_text,
      specificity_score: classification.specificity,
      emotion: classification.emotion,
      tribal_markers: classification.tribal_markers,
      tribal_example: classification.tribal_example,
      article_engagement: classification.article_engagement,
      opposing_view_engaged: classification.opposing_view_engaged ? 'yes' : 'no',
      ai_suggested_tier: classification.ai_suggested_tier,
      self_declared_tier: selfDeclaredTier,
      borderline_flag: classification.borderline_flag,
      borderline_other_tier: classification.borderline_other_tier,
      commenter_message: classification.commenter_message,
      final_tier: finalTier,
      strength: null,
    });
  if (classificationInsertError) {
    // The comment row above already committed and is not rolled back: two
    // separate inserts, not one transaction, the same non-atomic shape the
    // recovered handler had (its Step 4 throws into a 500 after its Step 3
    // insert already committed too). A real fix wraps both in one RPC;
    // out of scope for this increment. Reported as a failure rather than
    // swallowed, because the response below promises fields that do not
    // exist without this row.
    console.error('comment route: classification insert failed after comment insert', classificationInsertError, {
      commentId: comment.id,
    });
    return Response.json({ error: strings.comment.submissionFailed }, { status: 500 });
  }

  // --- axis_events hook: intentionally unwired (requirement 6) --------------
  // The recovered handler derives axis_events and fires notifications here,
  // in the same flow. packages/core/src/axis-mapping.ts ports the axis
  // mapping (deriveAxisEvents-equivalent: axisDeltasFor / replayAxisScores)
  // but nothing in apps/web calls it yet. Per security's sequencing rule
  // (council/security/positions/2026-09-20-path-to-launch.md, rebuttal
  // point 4): the write-identity fix in this file ships inside the same
  // commit as the Wait Window / Stage 2.5 promotion pipeline, not ahead of
  // it, because that pipeline would otherwise promote a forged comment
  // exactly as designed with nothing to notice. That pipeline does not
  // exist yet, so this hook stays unwired rather than half-wired. The
  // increment that builds promotion imports axisDeltasFor and
  // replayAxisScores from '@dialecta/core' and calls them here, after the
  // classification insert above, on the service role client (a pipeline
  // write, same reasoning as the classification insert itself).
  // ---------------------------------------------------------------------------

  return Response.json(
    {
      comment_id: comment.id,
      status: comment.status,
      ai_suggested_tier: classification.ai_suggested_tier,
      final_tier: finalTier,
      commenter_message: classification.commenter_message,
    },
    { status: 201 },
  );
}
