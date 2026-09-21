/**
 * The client half of the publish path. The server half, and the real seam, is
 * src/app/api/article/route.ts.
 *
 * Replaces FinalStage.handlePublish (dialecta-editor.jsx 2471-2543), which made
 * two calls: /api/article/submit to create a Ghost draft plus a Supabase row,
 * then /api/article/publish to flip the Ghost post live. Ghost is gone
 * (ADR-001), so it is one call to one route that writes one row.
 *
 * What this never sends: an identity. The recovered submit carried
 * `member_uuid` in the body, which is the forgeable shape the comment route
 * was rebuilt to close. The route reads the author from the verified session
 * and nothing here can influence that.
 */
import type { WriterState } from './writer-state';

export type PublishResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; status: number; error: string; detail?: string };

interface PublishResponseBody {
  id?: unknown;
  slug?: unknown;
  error?: unknown;
  detail?: unknown;
}

export async function publishArticle(state: WriterState): Promise<PublishResult> {
  let response: Response;
  try {
    response = await fetch('/api/article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: state.article_id,
        title: state.title,
        excerpt: state.excerpt,
        topic: state.primary_tag,
        body_json: state.body_json,
        body_html: state.body_html,
        declaration: state.declaration,
        declared_tier: state.declared_tier,
        stage_2_5_choice: state.stage_2_5_choice ?? 'as_is',
        author_note: state.stage_2_5_choice === 'respond' ? state.author_note : null,
      }),
    });
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }

  let body: PublishResponseBody = {};
  try {
    body = (await response.json()) as PublishResponseBody;
  } catch {
    // A non-JSON failure (a proxy error page, a crash) falls through below.
  }

  if (response.ok && typeof body.id === 'string' && typeof body.slug === 'string') {
    return { ok: true, id: body.id, slug: body.slug };
  }
  return {
    ok: false,
    status: response.status,
    error: typeof body.error === 'string' ? body.error : `HTTP ${response.status}`,
    ...(typeof body.detail === 'string' ? { detail: body.detail } : {}),
  };
}

/**
 * THE ENGINE SEAM. The article classifier is not connected in this build.
 *
 * The recovered editor read the article through /api/article/classify-stream
 * (SSE, during POLISH_READ) or /api/article/classify (the REFLECTING fallback,
 * line 3622): claude-opus-4-7 with adaptive thinking and an 8,192 token
 * ceiling, which treasurer priced at $300 to $1,500 per ten thousand scripted
 * calls against a route with no cap. Connecting it needs a route in apps/web
 * that is session gated and rate limited the way api/comment/route.ts is, and
 * a decision on the model and the spend cap. Until then this returns null and
 * every stage that shows the reading says plainly that none ran.
 */
export async function requestArticleReading(): Promise<null> {
  return null;
}
