import 'server-only';

/**
 * Every Supabase read the discourse layer makes, and the only file in
 * components/discourse that imports a Supabase client. Import it from server
 * components only; islands get what it returns as props. When lib/data
 * exists (the architect seat's rebuild map), this file moves there whole.
 *
 * Every column is named. comments.member_email is closed to the public key
 * (20260921044120_close_comments_member_email_to_public.sql), so a `select *`
 * fails, and nothing here would want it.
 *
 * No client carries the <Database> generic, so nothing checks these queries
 * against the schema at compile time. Every row is checked here at runtime
 * instead, and a row that does not fit is dropped rather than rendered.
 *
 * Replaces the recovered layer's read path, useArticleComments() in
 * _recovered-next/lib/theme/dialecta-discourse-layer.jsx, which fetched
 * GET /api/comments?viewer=<member uuid> from the browser: a client-supplied
 * identity deciding what the server returned. Here the viewer is the
 * verified session (getClaims) and the rows are whatever RLS lets that
 * session read.
 */
import { isTier, resolveFinalTier, type Tier } from '@dialecta/core';
import { createClient } from '@/lib/supabase/server';
import type {
  CommentMention,
  CommentStatus,
  CommentTier,
  DiscourseComment,
  DiscourseData,
  OwnReading,
  ViewerState,
  Withheld,
} from './types';

type ServerClient = Awaited<ReturnType<typeof createClient>>;
type Row = Record<string, unknown>;

// member_id is read so the server can tell the viewer's own comments apart.
// It never leaves this file: toComment() does not copy it.
const COMMENT_COLUMNS = 'id, parent_id, member_id, member_name, body, status, created_at, mentions';

// A classification comes through two SECURITY DEFINER functions, since the
// table itself is closed to both client roles (migration 20260921063139).
// comment_tiers returns the public half every card shows: comment_id,
// ai_suggested_tier, self_declared_tier, final_tier, specificity_score,
// classified_at. own_comment_readings returns the private half, the commenter
// message among it, and answers only for the caller's own comments.
type ClassificationRead = 'comment_tiers' | 'own_comment_readings';

/** Enough for any article this platform has; the recovered read had no limit at all. */
const COMMENT_LIMIT = 500;

const STATUSES: readonly CommentStatus[] = ['published', 'pending_review', 'suppressed'];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rows(data: unknown): Row[] {
  if (!Array.isArray(data)) return [];
  return data.filter((r): r is Row => typeof r === 'object' && r !== null && !Array.isArray(r));
}

function str(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function nonBlank(v: unknown): string | null {
  const s = str(v);
  return s && s.trim() ? s.trim() : null;
}

function tierOrNull(v: unknown): Tier | null {
  return isTier(v) ? v : null;
}

function specificityOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3 ? v : null;
}

function statusOrNull(v: unknown): CommentStatus | null {
  return STATUSES.find((s) => s === v) ?? null;
}

/**
 * /api/comment stores `sanitizeArticleHtml(body)`, which is DOMPurify output:
 * HTML. The composer escapes &, < and > before it posts, so what it stores is
 * escaped text that DOMPurify leaves alone, and this turns it back into the
 * text that was typed. The card renders the result as a React text node, so
 * decoding cannot open an injection. Rows written before September are raw
 * text with no entities in them, and pass through unchanged. One pass, so
 * "&amp;lt;" decodes one level, to "&lt;".
 */
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
};

function decodeStoredText(stored: string): string {
  return stored.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, ref: string) => {
    if (ref[0] === '#') {
      const code = ref[1] === 'x' || ref[1] === 'X' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff)
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[ref.toLowerCase()] ?? match;
  });
}

/**
 * comments.mentions holds { member_id, handle, display_name } objects. The
 * member id is dropped here; the card highlights the @token in the body and
 * does not link it, because /profile/[id] does not yet say what an id is.
 */
function toMentions(v: unknown): CommentMention[] {
  const out: CommentMention[] = [];
  for (const m of rows(v)) {
    const handle = nonBlank(m.handle);
    const displayName = nonBlank(m.display_name);
    const token = handle ?? displayName;
    if (token) out.push({ token, displayName: displayName ?? token });
  }
  return out;
}

/**
 * The checks /api/comment makes (session, profile, email, display name), so
 * the page can say why commenting is closed before anyone writes a draft the
 * route would refuse. The profile is read before the email check, unlike the
 * route, because the member id it returns is what marks the viewer's own
 * comments, and that holds whether or not they can post. The id stays on the
 * server.
 */
async function resolveViewer(supabase: ServerClient): Promise<{ viewer: ViewerState; memberId: string | null }> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const sub = claimsData?.claims?.sub;
  if (claimsError || typeof sub !== 'string' || !sub) {
    return { viewer: { kind: 'signed-out' }, memberId: null };
  }

  const { data: profileData, error: profileError } = await supabase.rpc('get_own_profile_for_comment');
  if (profileError) {
    console.error('discourse: get_own_profile_for_comment failed', profileError);
    return { viewer: { kind: 'unavailable' }, memberId: null };
  }
  const profile = rows(profileData)[0];
  if (!profile) return { viewer: { kind: 'no-profile' }, memberId: null };

  const memberId = nonBlank(profile.member_id);
  const email = claimsData?.claims?.email;
  if (typeof email !== 'string' || !email) return { viewer: { kind: 'no-email' }, memberId };

  const name = nonBlank(profile.member_name);
  if (!name) return { viewer: { kind: 'incomplete' }, memberId };

  return { viewer: { kind: 'ready', name }, memberId };
}

/**
 * Comments on one article. Two generations of key live in comments.article_id,
 * which is text: the April rows hold the Ghost post id, and /api/comment
 * writes articles.id, a uuid, because it validates the field as one. The
 * uuid is matched directly. The Ghost-era rows are matched by slug, and only
 * rows whose article_id is not uuid-shaped, which is every Ghost post id and
 * no row the route can write: a new comment cannot attach itself to this
 * article by naming its slug. This keeps articles.ghost_post_id where
 * apps/web/CLAUDE.md puts it, touched by the import script alone.
 */
async function readComments(supabase: ServerClient, article: { id: string; slug: string }): Promise<Row[]> {
  const byId = `article_id.eq.${article.id}`;
  const filter = SLUG_RE.test(article.slug)
    ? `${byId},and(article_slug.eq.${article.slug},article_id.not.like.*-*)`
    : byId;

  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_COLUMNS)
    .or(filter)
    .order('created_at', { ascending: true })
    .limit(COMMENT_LIMIT);
  if (error) throw new Error(`comments read failed: ${error.message}`);
  return rows(data);
}

/**
 * The newest classification per comment, read on the session's own client.
 * Each function restates the comments read policies (published, or the
 * caller's own), so it returns a tier for nothing this session could not
 * already read. An empty list returns before the call: own_comment_readings
 * refuses anon, and a signed-out reader has no comments of their own.
 */
async function readLatest(
  supabase: ServerClient,
  fn: ClassificationRead,
  commentIds: string[],
): Promise<Map<string, Row>> {
  const latest = new Map<string, Row>();
  if (commentIds.length === 0) return latest;
  const { data, error } = await supabase.rpc(fn, { comment_ids: commentIds });
  if (error) throw new Error(`${fn} failed: ${error.message}`);
  for (const row of rows(data)) {
    const id = str(row.comment_id);
    if (id && !latest.has(id)) latest.set(id, row);
  }
  return latest;
}

/**
 * The ids among these whose body this session may be shown: classified, and
 * not Breach, by the same tier rule every card applies. The one definition of
 * that rule for every surface that shows a comment's words; the discourse feed
 * applies it card by card in toComment(), and the profile's recent comments
 * call this. A comment it leaves out shows no body anywhere.
 */
export async function commentIdsWithShowableBodies(
  supabase: ServerClient,
  commentIds: string[],
): Promise<Set<string>> {
  const showable = new Set<string>();
  for (const [id, row] of await readLatest(supabase, 'comment_tiers', commentIds)) {
    const tier = toTier(row);
    if (tier && tier.final !== 'breach') showable.add(id);
  }
  return showable;
}

function toTier(row: Row | undefined): CommentTier | null {
  if (!row) return null;
  const ai = tierOrNull(row.ai_suggested_tier);
  if (!ai) return null;
  const self = tierOrNull(row.self_declared_tier);
  // final_tier when the pipeline wrote one. Otherwise the locked weighting
  // over the signals present, which with no votes is the AI read (40% over
  // 15%). The recovered card fell back to the self-declared tier here, the
  // same shortcut that let a commenter set their own tier on the write path.
  const final =
    tierOrNull(row.final_tier) ?? resolveFinalTier({ aiTier: ai, selfDeclaredTier: self }).finalTier;
  return { ai, self, final };
}

function toComment(
  row: Row,
  tierRow: Row | undefined,
  memberId: string | null,
): DiscourseComment | null {
  const id = str(row.id);
  const status = statusOrNull(row.status);
  const createdAt = str(row.created_at);
  const rawBody = str(row.body);
  if (!id || !UUID_RE.test(id) || !status || !createdAt || rawBody === null) return null;

  const rowMember = str(row.member_id);
  const isOwn = memberId !== null && rowMember === memberId;
  // RLS already returns only published rows plus the viewer's own. Checked
  // again so a policy change cannot widen what this page shows.
  if (status !== 'published' && !isOwn) return null;

  const tier = toTier(tierRow);
  let withheld: Withheld | null = null;
  if (status === 'suppressed') withheld = 'suppressed';
  else if (!tier) withheld = 'unread';
  else if (tier?.final === 'breach') withheld = 'breach';

  const parentId = str(row.parent_id);
  return {
    id,
    parentId: parentId && UUID_RE.test(parentId) ? parentId : null,
    authorName: nonBlank(row.member_name) ?? '',
    body: withheld ? null : decodeStoredText(rawBody),
    withheld,
    createdAt,
    status,
    isOwn,
    tier,
    specificity: specificityOrNull(tierRow?.specificity_score),
    mentions: withheld ? [] : toMentions(row.mentions),
  };
}

function toReading(commentId: string, row: Row): OwnReading {
  return {
    commentId,
    claimText: nonBlank(row.claim_text),
    strength: nonBlank(row.strength),
    commenterMessage: nonBlank(row.commenter_message),
    specificity: specificityOrNull(row.specificity_score),
    emotion: nonBlank(row.emotion),
    engagement: nonBlank(row.article_engagement),
    borderlineOther: row.borderline_flag === true ? tierOrNull(row.borderline_other_tier) : null,
  };
}

/**
 * The whole discourse read for one article page render: who is looking, the
 * comments they may see with their tiers, and the private reading of any
 * comment that is theirs.
 *
 * Fails closed. If the tiers cannot be read, the feed shows a notice rather
 * than a list of untiered comments, since without a tier nothing says a
 * body is not a Breach. The viewer state is still returned, so the composer
 * can work while the feed cannot.
 */
export async function loadDiscourse(article: { id: string; slug: string }): Promise<DiscourseData> {
  const renderedAt = new Date().toISOString();
  let supabase: ServerClient;
  try {
    supabase = await createClient();
  } catch (err) {
    console.error('discourse: no Supabase client', err);
    return { viewer: { kind: 'unavailable' }, comments: [], ownReadings: [], unavailable: true, renderedAt };
  }

  let viewer: ViewerState = { kind: 'signed-out' };
  let memberId: string | null = null;
  try {
    ({ viewer, memberId } = await resolveViewer(supabase));
  } catch (err) {
    console.error('discourse: viewer lookup failed', err);
    viewer = { kind: 'unavailable' };
  }

  try {
    const commentRows = await readComments(supabase, article);
    const ids = commentRows.map((r) => str(r.id)).filter((id): id is string => id !== null && UUID_RE.test(id));
    const tiers = await readLatest(supabase, 'comment_tiers', ids);

    const comments: DiscourseComment[] = [];
    for (const row of commentRows) {
      const id = str(row.id);
      const comment = toComment(row, id ? tiers.get(id) : undefined, memberId);
      if (comment) comments.push(comment);
    }

    const ownIds = comments.filter((c) => c.isOwn).map((c) => c.id);
    const readingRows = await readLatest(supabase, 'own_comment_readings', ownIds);
    const ownReadings: OwnReading[] = [];
    for (const [commentId, row] of readingRows) ownReadings.push(toReading(commentId, row));

    return { viewer, comments, ownReadings, unavailable: false, renderedAt };
  } catch (err) {
    console.error('discourse: conversation read failed', err);
    // The writer's diagnostics pattern (strings.article.diagnostics): name the
    // failure on the page in development, where the server log may be out of
    // reach. The message names env vars and tables, never their values.
    const diagnostic = err instanceof Error ? err.message : String(err);
    return {
      viewer,
      comments: [],
      ownReadings: [],
      unavailable: true,
      renderedAt,
      ...(process.env.NODE_ENV === 'development' ? { diagnostic } : {}),
    };
  }
}
