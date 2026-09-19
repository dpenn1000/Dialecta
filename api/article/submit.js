/**
 * api/article/submit.js
 *
 * Author submission endpoint. Accepts a draft article + 5-question
 * declaration from a Ghost member with `is_author = true` on their
 * Supabase profile. Runs classification, creates a Ghost draft attributed
 * to the house Ghost staff user, writes a Supabase articles row with the
 * real author's member_id, and returns the AI analysis for Stage 2.5.
 *
 * Auth model (Path C-lite, the launch shape):
 *   - Authors are MEMBERS, not Ghost staff. A single member account is
 *     the only login a writer needs.
 *   - The endpoint receives member_uuid (from {{@member.uuid}} in
 *     page-write.hbs) and verifies the member's Supabase profile has
 *     is_author = true.
 *   - All articles attribute to a single house Ghost staff user
 *     (DIALECTA_HOUSE_GHOST_USER_ID env var; today this is Daniel's
 *     staff ID). The real author byline is rendered later from Supabase
 *     via theme override on post.hbs.
 *   - This decouples Dialecta identity (Supabase) from Ghost's CMS-author
 *     concept and keeps the auth flow to one login per writer forever.
 *
 * The Ghost post is created with status='draft'. Publication is a
 * separate /api/article/publish call after Stage 2.5.
 *
 * POST body:
 *   {
 *     title:                string,
 *     html:                 string,                  // article body HTML
 *     declaration: {
 *       core_claim:           string,
 *       scope_boundary:       string,
 *       strongest_objection:  string,
 *       opinion_axes?:        [{ axis_a, axis_b, type }]
 *     },
 *     declared_tier:        tier,
 *     member_uuid:          string,                  // Ghost member UUID
 *     tags?:                [{ slug, name }],
 *     custom_excerpt?:      string,
 *   }
 *
 * Response:
 *   {
 *     article_id:     uuid,
 *     ghost_post_id:  text,
 *     ghost_post_url: text,
 *     ai_analysis:    {...},
 *     author_name:    text                           // from Supabase profile
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';
import { requireCompleteProfile } from '../_profile-validation.js';
import { bylineExcerpt } from '../_byline-excerpt.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const HOUSE_GHOST_USER_ID = process.env.DIALECTA_HOUSE_GHOST_USER_ID;

const TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

// Aligned with opinion-mapper SKILL v2.1.0+ (topic-as-question):
// topic must be a question 15-60 chars ending in `?`. Pole caps unchanged.
// Count is the legacy field (max maps in declaration.opinion_maps); the
// candidate_maps response shape is a separate concept.
const AXIS_LIMITS = {
  topic: { min: 15, max: 60 },
  pole:  { min: 3,  max: 20 },
  count: 2,
};

function topicEndsInQuestion(topic) {
  return typeof topic === 'string' && topic.trim().endsWith('?');
}

// Three valid map shapes (each entry in declaration.opinion_maps):
//   ternary:   { type:'ternary',   topic, poles:[a,b,c],            author_position?:{a,b,c} }
//   cartesian: { type:'cartesian', axes:[{topic,axis_a,axis_b}]×2,  author_position?:{x,y}   }
//   binary:    { type:'binary',    topic, axis_a, axis_b,           author_position?:{x}     }
//
// Multi-map rules:
//   - 0, 1, or 2 entries
//   - At most ONE binary entry per article
//   - Binary CANNOT be the only map; it must be paired with a ternary or
//     cartesian primary
const inUnit = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1;

function validateMapEntry(map, idx) {
  if (!map || typeof map !== 'object') {
    return `opinion_maps[${idx}] must be an object`;
  }
  const lim = AXIS_LIMITS;
  const lenOk = (s, lo, hi) => {
    const v = typeof s === 'string' ? s.trim() : '';
    return v.length >= lo && v.length <= hi;
  };

  if (map.type === 'ternary') {
    if (!lenOk(map.topic, lim.topic.min, lim.topic.max)) {
      return `opinion_maps[${idx}] (ternary): topic must be ${lim.topic.min}-${lim.topic.max} chars`;
    }
    if (!topicEndsInQuestion(map.topic)) {
      return `opinion_maps[${idx}] (ternary): topic must be a question ending in "?"`;
    }
    if (!Array.isArray(map.poles) || map.poles.length !== 3) {
      return `opinion_maps[${idx}] (ternary): poles must be exactly 3 strings`;
    }
    for (let i = 0; i < 3; i++) {
      if (!lenOk(map.poles[i], lim.pole.min, lim.pole.max)) {
        return `opinion_maps[${idx}] (ternary): poles[${i}] must be ${lim.pole.min}-${lim.pole.max} chars`;
      }
    }
    if (map.author_position != null) {
      const ap = map.author_position;
      if (typeof ap !== 'object' || !inUnit(ap.a) || !inUnit(ap.b) || !inUnit(ap.c)) {
        return `opinion_maps[${idx}] (ternary): author_position must be {a,b,c} in [0,1]`;
      }
      if (Math.abs(ap.a + ap.b + ap.c - 1) > 0.05) {
        return `opinion_maps[${idx}] (ternary): author_position {a,b,c} must sum to ~1`;
      }
    }
    return null;
  }

  if (map.type === 'cartesian') {
    if (!Array.isArray(map.axes) || map.axes.length !== 2) {
      return `opinion_maps[${idx}] (cartesian): axes must be exactly 2 entries`;
    }
    for (let i = 0; i < 2; i++) {
      const a = map.axes[i];
      if (!a || typeof a !== 'object') {
        return `opinion_maps[${idx}] (cartesian): axes[${i}] must be an object`;
      }
      if (!lenOk(a.topic, lim.topic.min, lim.topic.max)) {
        return `opinion_maps[${idx}] (cartesian): axes[${i}].topic must be ${lim.topic.min}-${lim.topic.max} chars`;
      }
      if (!topicEndsInQuestion(a.topic)) {
        return `opinion_maps[${idx}] (cartesian): axes[${i}].topic must be a question ending in "?"`;
      }
      if (!lenOk(a.axis_a, lim.pole.min, lim.pole.max)) {
        return `opinion_maps[${idx}] (cartesian): axes[${i}].axis_a must be ${lim.pole.min}-${lim.pole.max} chars`;
      }
      if (!lenOk(a.axis_b, lim.pole.min, lim.pole.max)) {
        return `opinion_maps[${idx}] (cartesian): axes[${i}].axis_b must be ${lim.pole.min}-${lim.pole.max} chars`;
      }
    }
    if (map.author_position != null) {
      const ap = map.author_position;
      if (typeof ap !== 'object' || !inUnit(ap.x) || !inUnit(ap.y)) {
        return `opinion_maps[${idx}] (cartesian): author_position must be {x,y} in [0,1]`;
      }
    }
    return null;
  }

  if (map.type === 'binary') {
    if (!lenOk(map.topic, lim.topic.min, lim.topic.max)) {
      return `opinion_maps[${idx}] (binary): topic must be ${lim.topic.min}-${lim.topic.max} chars`;
    }
    if (!topicEndsInQuestion(map.topic)) {
      return `opinion_maps[${idx}] (binary): topic must be a question ending in "?"`;
    }
    if (!lenOk(map.axis_a, lim.pole.min, lim.pole.max)) {
      return `opinion_maps[${idx}] (binary): axis_a must be ${lim.pole.min}-${lim.pole.max} chars`;
    }
    if (!lenOk(map.axis_b, lim.pole.min, lim.pole.max)) {
      return `opinion_maps[${idx}] (binary): axis_b must be ${lim.pole.min}-${lim.pole.max} chars`;
    }
    if (map.author_position != null) {
      const ap = map.author_position;
      if (typeof ap !== 'object' || !inUnit(ap.x)) {
        return `opinion_maps[${idx}] (binary): author_position must be {x} in [0,1]`;
      }
    }
    return null;
  }

  return `opinion_maps[${idx}].type must be 'ternary', 'cartesian', or 'binary' (got ${JSON.stringify(map.type)})`;
}

// Normalize a map for structural comparison. Strips author_position (which
// can drift by small amounts without representing a real disagreement) and
// trims string fields. Returns a stable shape for JSON.stringify equality.
function normalizeMapForCompare(map) {
  if (!map || typeof map !== 'object') return null;
  const t = (s) => typeof s === 'string' ? s.trim() : '';
  if (map.type === 'ternary') {
    return {
      type: 'ternary',
      topic: t(map.topic),
      poles: Array.isArray(map.poles) ? map.poles.map(t) : [],
    };
  }
  if (map.type === 'cartesian') {
    return {
      type: 'cartesian',
      axes: Array.isArray(map.axes) ? map.axes.map((a) => ({
        topic:  t(a?.topic),
        axis_a: t(a?.axis_a),
        axis_b: t(a?.axis_b),
      })) : [],
    };
  }
  if (map.type === 'binary') {
    return {
      type: 'binary',
      topic:  t(map.topic),
      axis_a: t(map.axis_a),
      axis_b: t(map.axis_b),
    };
  }
  return { type: map.type || 'unknown' };
}

function didOverrideOpinionMaps(aiMaps, finalMaps) {
  const aiNorm    = (Array.isArray(aiMaps)    ? aiMaps    : []).map(normalizeMapForCompare);
  const finalNorm = (Array.isArray(finalMaps) ? finalMaps : []).map(normalizeMapForCompare);
  return JSON.stringify(aiNorm) !== JSON.stringify(finalNorm);
}

function validateOpinionMaps(maps) {
  if (maps == null) return null;  // optional; treated as no-map
  if (!Array.isArray(maps)) {
    return `expected an array, got ${typeof maps}`;
  }
  if (maps.length === 0) return null;
  if (maps.length > 2) {
    return `at most 2 maps per article (got ${maps.length})`;
  }

  // Per-entry shape check
  for (let i = 0; i < maps.length; i++) {
    const err = validateMapEntry(maps[i], i);
    if (err) return err;
  }

  // Binary-pairing rule: binary cannot be the only map; at most one binary
  const binaryCount = maps.filter((m) => m?.type === 'binary').length;
  if (binaryCount > 1) {
    return 'at most one binary map per article';
  }
  if (binaryCount === 1 && maps.length === 1) {
    return 'binary cannot be the only map; pair it with a ternary or cartesian primary';
  }

  return null;
}

// Back-compat shim. Old data lives at declaration.opinion_axes; new data at
// declaration.opinion_maps. Submission flow accepts either; if both are
// present, opinion_maps wins. The legacy validator path only fires when a
// caller still uses the old shape (e.g. older editor build).
function legacyValidateOpinionAxes(axes) {
  if (!Array.isArray(axes)) return null;
  if (axes.length === 0) return null;
  // Single ternary
  if (axes.length === 1 && axes[0]?.type === 'ternary') {
    return validateMapEntry(axes[0], 0);
  }
  // Two cartesian: convert to one map record and validate
  if (axes.length === 2 && axes.every((a) => !a?.type || a.type === 'cartesian')) {
    return validateMapEntry({ type: 'cartesian', axes }, 0);
  }
  return `legacy opinion_axes shape unrecognized (${axes.length} records, types [${axes.map((a) => a?.type ?? 'undef').join(', ')}])`;
}

function htmlToPlaintext(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!HOUSE_GHOST_USER_ID) {
    return res.status(500).json({
      error: 'DIALECTA_HOUSE_GHOST_USER_ID is not configured on the server. The article-submission endpoint cannot attribute to a Ghost author until it is set.',
    });
  }

  const {
    title,
    html,
    declaration,
    declared_tier,
    member_uuid,
    tags,
    custom_excerpt,
    feature_image,
    polish_level,
    polish_options,
  } = req.body || {};

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!html || typeof html !== 'string' || html.length < 200) {
    return res.status(400).json({ error: 'html is required and must be at least 200 characters' });
  }
  if (!declaration || !declaration.core_claim) {
    return res.status(400).json({ error: 'declaration.core_claim is required' });
  }
  if (!declared_tier || !TIERS.includes(declared_tier)) {
    return res.status(400).json({ error: 'declared_tier is required and must be a valid tier' });
  }
  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required (Ghost member UUID from the {{@member}} session)' });
  }

  // ── opinion_maps shape contract ────────────────────────────────────────
  // 0 to 2 maps per article. Each map is self-contained: type +
  // topic/poles/axes + optional author_position. Binary type may only
  // appear paired with a ternary or cartesian primary; never alone.
  // Limits MUST match theme/src/dialecta-editor.jsx AXIS_LIMITS.
  if (declaration.opinion_maps !== undefined) {
    const mapsShapeError = validateOpinionMaps(declaration.opinion_maps);
    if (mapsShapeError) {
      return res.status(400).json({
        error: 'declaration.opinion_maps is malformed',
        detail: mapsShapeError,
      });
    }
  } else if (declaration.opinion_axes !== undefined) {
    // Back-compat: older clients may still send opinion_axes. Validate that
    // shape and continue. The reclassify pipeline migrates such records to
    // opinion_maps.
    const legacyErr = legacyValidateOpinionAxes(declaration.opinion_axes);
    if (legacyErr) {
      return res.status(400).json({
        error: 'declaration.opinion_axes is malformed (legacy shape)',
        detail: legacyErr,
      });
    }
  }

  try {
    // Step 1: verify the member has is_author = true on their Supabase profile.
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('ghost_member_id, display_name, is_author')
      .eq('ghost_member_id', member_uuid)
      .maybeSingle();

    if (profileErr) throw profileErr;

    // Validate profile completeness. display_name powers the byline that
    // renders on post.hbs (Supabase override of the house Ghost author);
    // empty would publish an article with no visible author. The Discourse
    // Layer / editor reads `action` from this response and renders a CTA.
    const incomplete = requireCompleteProfile(profile, ['display_name']);
    if (incomplete) {
      return res.status(incomplete.status).json(incomplete.body);
    }
    if (!profile.is_author) {
      return res.status(403).json({
        error: 'Not authorized to publish articles',
        detail: 'This member is not flagged as an author. Authors are granted via the Pact onboarding ritual.',
        action: { label: 'Visit the Pact', url: '/pact/' },
      });
    }

    // Step 2: extract plaintext for classifier.
    const article_text = htmlToPlaintext(html);
    if (article_text.length < 200) {
      return res.status(400).json({
        error: 'After HTML-to-text conversion, article body is too short (less than 200 characters)',
      });
    }

    // Step 3: classify via internal HTTP call.
    const host  = req.headers['x-forwarded-host'] || req.headers.host || 'dialecta.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const classifyUrl = proto + '://' + host + '/api/article/classify';

    const classifyResp = await fetch(classifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_text, declaration, declared_tier }),
    });

    if (!classifyResp.ok) {
      const text = await classifyResp.text();
      console.error('Classification call failed:', classifyResp.status, text);
      return res.status(502).json({
        error: 'Classification engine failed',
        detail: classifyResp.status + ': ' + text.slice(0, 500),
      });
    }

    const ai_analysis = await classifyResp.json();

    // Step 3.5: run polish (server-side, always-on as of Polish v2). The
    // author's submitted HTML is preserved as articles.original_html;
    // Ghost receives the polished version. Resolved level defaults to
    // 'light' if unspecified or invalid.
    const VALID_LEVELS = new Set(['light', 'standard', 'editorial', 'custom']);
    const resolvedLevel = polish_level && VALID_LEVELS.has(polish_level) ? polish_level : 'light';

    let polishedHtml   = html;
    let polishChangeLog = [];
    let polishApplied  = resolvedLevel;

    try {
      const polishUrl = proto + '://' + host + '/api/article/aesthetic-suggest';
      const polishResp = await fetch(polishUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          article_html:   html,
          polish_level:   resolvedLevel,
          polish_options: polish_options || null,
        }),
      });
      if (polishResp.ok) {
        const polish = await polishResp.json();
        if (polish.polished_html && typeof polish.polished_html === 'string') {
          polishedHtml = polish.polished_html;
          polishChangeLog = Array.isArray(polish.change_log) ? polish.change_log : [];
        }
      } else {
        const polishText = await polishResp.text();
        console.error('Polish call failed (continuing with original HTML):', polishResp.status, polishText.slice(0, 300));
      }
    } catch (polishErr) {
      // Polish failure is non-fatal — fall back to original HTML so the
      // submission still succeeds. Log so we can investigate.
      console.error('Polish exception (continuing with original HTML):', polishErr);
    }

    // Step 4: create Ghost draft attributed to the house staff user with
    // the POLISHED HTML. The real author byline gets rendered on post.hbs
    // from Supabase data (theme-side override). We also bake the real
    // author's name into custom_excerpt as a "By <Name>." prefix so that
    // downstream social-share previews (og:description, twitter:description)
    // name the actual writer instead of the house staff user. See
    // api/_byline-excerpt.js for the formatting + length-capping logic.
    const finalExcerpt = bylineExcerpt(
      profile.display_name,
      custom_excerpt,
      polishedHtml,
    );
    const ghostResp = await ghostAdminFetch('/posts/?source=html', {
      method: 'POST',
      body: JSON.stringify({
        posts: [
          {
            title,
            html:            polishedHtml,
            custom_excerpt:  finalExcerpt,
            feature_image:   feature_image || null,
            status:          'draft',
            tags:            tags || [],
            authors:         [{ id: HOUSE_GHOST_USER_ID }],
          },
        ],
      }),
    });

    const post = ghostResp.posts[0];

    // Step 5: write Supabase articles row with original_html preserved
    // (so admins can re-polish at a different level later) plus the
    // polish settings applied.
    const { data: row, error: insertErr } = await supabase
      .from('articles')
      .insert({
        ghost_post_id:     post.id,
        author_member_id:  profile.ghost_member_id,
        status:            'classified',
        declared_tier,
        ai_suggested_tier: ai_analysis.ai_suggested_tier,
        final_tier:        ai_analysis.ai_suggested_tier,
        declaration,
        ai_analysis,
        original_html:     html,
        polish_level:      polishApplied,
        polish_options:    polish_options || null,
        polish_change_log: polishChangeLog,
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('Supabase insert error:', insertErr);
      return res.status(500).json({
        error: 'Article saved to Ghost as draft, but Supabase write failed',
        detail: insertErr.message,
        ghost_post_id: post.id,
      });
    }

    // Step 5b: log opinion-map disagreement if the author's final shape
    // differs from the AI's top-confidence candidate. Failures here are
    // non-fatal; we log and continue so a logging hiccup does not block
    // submission. Per skill v2.2.0, the AI returns a ranked list of 2-4
    // candidates; the "AI recommendation" for override-comparison purposes
    // is the highest-confidence candidate (candidate_maps[0]).
    try {
      const finalMaps   = Array.isArray(declaration.opinion_maps) ? declaration.opinion_maps : [];
      const candidates  = Array.isArray(ai_analysis.candidate_maps) ? ai_analysis.candidate_maps : [];
      const aiMaps      = candidates.length > 0 ? [candidates[0]] : [];
      if (didOverrideOpinionMaps(aiMaps, finalMaps)) {
        const { error: overrideErr } = await supabase
          .from('opinion_map_overrides')
          .insert({
            article_id:        row.id,
            ghost_post_id:     post.id,
            ai_recommendation: aiMaps,
            final_approved:    finalMaps,
            editor_note:       typeof declaration.editor_note === 'string'
                                 && declaration.editor_note.trim()
                                 ? declaration.editor_note.trim()
                                 : null,
          });
        if (overrideErr) {
          console.error('opinion_map_overrides insert failed (non-fatal):', overrideErr);
        }
      }
    } catch (logErr) {
      console.error('opinion_map_overrides logging exception (non-fatal):', logErr);
    }

    return res.status(200).json({
      article_id:     row.id,
      ghost_post_id:  post.id,
      ghost_post_url: post.url,
      ai_analysis,
      author_name:    profile.display_name,
    });
  } catch (error) {
    console.error('Article submit error:', error);
    return res.status(500).json({
      error: 'Article submission failed',
      detail: error.message,
    });
  }
}
