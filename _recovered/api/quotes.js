import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';
import { verifyQuoteAdmin, verifyMember } from './_quote-admin.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// /api/quotes  (consolidated to a single function due to Vercel Hobby plan's
// 12-function ceiling — vercel.json rewrites all /api/quotes/* paths to this
// file; the `sub` query param holds the path tail).
//
// Routing (on `req.query.sub`):
//   undefined / empty       -> list (GET) or create (POST)
//   'random'                -> single random quote (GET, optional filters)
//   'suggest'               -> member-suggest (POST, always lands as draft)
//   'admins'                -> admin management (GET / POST / DELETE, admin only)
//   '<quote_id>'            -> single quote (GET, PATCH, DELETE)
//
// Auth model: every protected handler reads ?member_id=<uuid> (or x-member-id
// header) and verifies against is_quote_admin in Supabase. Same trust model
// as /api/profile.
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const sub = req.query.sub;
  const segments = sub ? sub.split('/').filter(Boolean) : [];
  const first = segments[0];

  if (!first) {
    if (req.method === 'GET')  return handleList(req, res);
    if (req.method === 'POST') return handleCreate(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (first === 'random') {
    if (req.method === 'GET') return handleRandom(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (first === 'suggest') {
    if (req.method === 'POST') return handleSuggest(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (first === 'admins') {
    return handleAdmins(req, res);
  }

  if (first === 'ai-suggest') {
    if (req.method === 'POST') return handleAISuggest(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Otherwise the first segment is a quote_id slug
  return handleSingleQuote(req, res, first);
}

// ─── /api/quotes/random ──────────────────────────────────────────────────────

async function handleRandom(req, res) {
  const { surface, pillar, archetype, tradition, theme } = req.query;

  const requiredTags = [];
  if (surface)   requiredTags.push(`surface-${surface}`);
  if (pillar)    requiredTags.push(`pillar-${pillar}`);
  if (archetype) requiredTags.push(`archetype-${archetype}`);
  if (tradition) requiredTags.push(`tradition-${tradition}`);
  if (theme)     requiredTags.push(`theme-${theme}`);

  try {
    let query = supabase
      .from('quotes')
      .select('quote_id, text, author, source, year, tags')
      .eq('status', 'live');

    if (requiredTags.length > 0) {
      query = query.contains('tags', requiredTags);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'No quotes match the requested filter',
        requiredTags,
      });
    }

    const random = data[Math.floor(Math.random() * data.length)];
    return res.status(200).json(random);
  } catch (err) {
    console.error('Random quote fetch error:', err);
    return res.status(500).json({
      error: 'Random quote fetch failed',
      detail: err.message,
    });
  }
}

// ─── /api/quotes (list / create) ─────────────────────────────────────────────

async function handleList(req, res) {
  const {
    status = 'live',
    surface, pillar, archetype, tradition, theme,
    author, search,
    limit = 200, offset = 0,
  } = req.query;

  if (!['live', 'draft', 'archived'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be one of: live, draft, archived',
    });
  }

  let isAdminContext = false;
  if (status !== 'live') {
    const auth = await verifyQuoteAdmin(req);
    if (!auth.isAdmin) {
      return res.status(auth.statusCode).json({ error: auth.error });
    }
    isAdminContext = true;
  }

  const requestedLimit = Math.min(parseInt(limit, 10) || 200, 500);
  const requestedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const requiredTags = [];
  if (surface)   requiredTags.push(`surface-${surface}`);
  if (pillar)    requiredTags.push(`pillar-${pillar}`);
  if (archetype) requiredTags.push(`archetype-${archetype}`);
  if (tradition) requiredTags.push(`tradition-${tradition}`);
  if (theme)     requiredTags.push(`theme-${theme}`);

  const selectFields = isAdminContext
    ? 'quote_id, text, author, source, year, tags, status, created_at, updated_at, created_by, updated_by'
    : 'quote_id, text, author, source, year, tags';

  try {
    let query = supabase
      .from('quotes')
      .select(selectFields, { count: 'exact' })
      .eq('status', status);

    if (requiredTags.length > 0) query = query.contains('tags', requiredTags);
    if (author) query = query.ilike('author', `%${author}%`);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(`text.ilike.%${safe}%,source.ilike.%${safe}%`);
    }

    query = query
      .order('quote_id', { ascending: true })
      .range(requestedOffset, requestedOffset + requestedLimit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.status(200).json({
      total: count ?? 0,
      limit: requestedLimit,
      offset: requestedOffset,
      quotes: data ?? [],
    });
  } catch (err) {
    console.error('Quote list fetch error:', err);
    return res.status(500).json({
      error: 'Quote list fetch failed',
      detail: err.message,
    });
  }
}

async function handleCreate(req, res) {
  const auth = await verifyQuoteAdmin(req);
  if (!auth.isAdmin) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  const { quote_id, text, author, source, year, tags, status } = req.body || {};

  if (!quote_id || !text) {
    return res.status(400).json({ error: 'quote_id and text are required' });
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(quote_id)) {
    return res.status(400).json({
      error: 'quote_id must be a slug (lowercase letters, digits, hyphens)',
    });
  }

  const requestedStatus = status || 'live';
  if (!['live', 'draft', 'archived'].includes(requestedStatus)) {
    return res.status(400).json({ error: 'status must be live, draft, or archived' });
  }

  try {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        quote_id,
        text,
        author: author ?? null,
        source: source ?? null,
        year: year ?? null,
        tags: Array.isArray(tags) ? tags : [],
        status: requestedStatus,
        created_by: auth.memberId,
        updated_by: auth.memberId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: `Quote with quote_id '${quote_id}' already exists`,
        });
      }
      throw error;
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Quote create error:', err);
    return res.status(500).json({ error: 'Quote create failed', detail: err.message });
  }
}

// ─── /api/quotes/suggest (member submit) ─────────────────────────────────────

async function handleSuggest(req, res) {
  const auth = await verifyMember(req);
  if (!auth.isMember) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  const { quote_id, text, author, source, year, tags } = req.body || {};

  if (!quote_id || !text) {
    return res.status(400).json({ error: 'quote_id and text are required' });
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(quote_id)) {
    return res.status(400).json({
      error: 'quote_id must be a slug (lowercase letters, digits, hyphens)',
    });
  }

  try {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        quote_id,
        text,
        author: author ?? null,
        source: source ?? null,
        year: year ?? null,
        tags: Array.isArray(tags) ? tags : [],
        status: 'draft', // member submissions always land as draft
        created_by: `member-suggest:${auth.memberId}`,
        updated_by: `member-suggest:${auth.memberId}`,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: `Quote with quote_id '${quote_id}' already exists. Choose a different slug.`,
        });
      }
      throw error;
    }

    return res.status(201).json({
      submitted: true,
      message: 'Suggestion received and queued for admin review.',
      quote: {
        quote_id: data.quote_id,
        text: data.text,
        author: data.author,
        source: data.source,
        year: data.year,
        tags: data.tags,
        status: data.status,
      },
    });
  } catch (err) {
    console.error('Quote suggest error:', err);
    return res.status(500).json({ error: 'Quote suggest failed', detail: err.message });
  }
}

// ─── /api/quotes/admins (admin management) ───────────────────────────────────

async function handleAdmins(req, res) {
  const auth = await verifyQuoteAdmin(req);
  if (!auth.isAdmin) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  if (req.method === 'GET')    return handleAdminList(req, res);
  if (req.method === 'POST')   return handleAdminGrant(req, res, auth);
  if (req.method === 'DELETE') return handleAdminRevoke(req, res, auth);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleAdminList(req, res) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('ghost_member_id, display_name, avatar_url')
      .eq('is_quote_admin', true)
      .order('display_name', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return res.status(200).json({ admins: data ?? [] });
  } catch (err) {
    console.error('Admin list error:', err);
    return res.status(500).json({ error: 'Admin list failed', detail: err.message });
  }
}

async function handleAdminGrant(req, res, auth) {
  const targetId = req.body?.ghost_member_id;
  if (!targetId) {
    return res.status(400).json({ error: 'ghost_member_id required in body' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_quote_admin: true })
      .eq('ghost_member_id', targetId)
      .select('ghost_member_id, display_name, is_quote_admin')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Member profile not found. They must visit the site at least once first to lazy-create their profile.',
        });
      }
      throw error;
    }

    return res.status(200).json({
      granted: true,
      admin: data,
      granted_by: auth.memberId,
    });
  } catch (err) {
    console.error('Admin grant error:', err);
    return res.status(500).json({ error: 'Admin grant failed', detail: err.message });
  }
}

async function handleAdminRevoke(req, res, auth) {
  const targetId = req.query?.ghost_member_id || req.body?.ghost_member_id;
  if (!targetId) {
    return res.status(400).json({ error: 'ghost_member_id required (query or body)' });
  }

  try {
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('ghost_member_id', { count: 'exact', head: true })
      .eq('is_quote_admin', true);

    if (countError) throw countError;

    if (count !== null && count <= 1) {
      return res.status(403).json({
        error: 'Cannot revoke the last quote admin (would lock the system). Grant another admin first.',
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_quote_admin: false })
      .eq('ghost_member_id', targetId)
      .select('ghost_member_id, display_name, is_quote_admin')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Member profile not found' });
      }
      throw error;
    }

    return res.status(200).json({
      revoked: true,
      member: data,
      revoked_by: auth.memberId,
    });
  } catch (err) {
    console.error('Admin revoke error:', err);
    return res.status(500).json({ error: 'Admin revoke failed', detail: err.message });
  }
}

// ─── /api/quotes/:quote_id (single) ──────────────────────────────────────────

async function handleSingleQuote(req, res, quote_id) {
  if (req.method === 'GET')    return handleSingleGet(req, res, quote_id);
  if (req.method === 'PATCH')  return handleSinglePatch(req, res, quote_id);
  if (req.method === 'DELETE') return handleSingleDelete(req, res, quote_id);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSingleGet(req, res, quote_id) {
  const memberId = req.query.member_id || req.headers['x-member-id'];
  let isAdmin = false;
  if (memberId) {
    const auth = await verifyQuoteAdmin(req);
    isAdmin = auth.isAdmin;
  }

  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_id', quote_id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Quote not found' });

    if (!isAdmin && data.status !== 'live') {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (!isAdmin) {
      const { id, created_at, updated_at, created_by, updated_by, status, ...slim } = data;
      return res.status(200).json(slim);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Quote get error:', err);
    return res.status(500).json({ error: 'Quote fetch failed', detail: err.message });
  }
}

async function handleSinglePatch(req, res, quote_id) {
  const auth = await verifyQuoteAdmin(req);
  if (!auth.isAdmin) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  const updates = { ...(req.body || {}) };
  delete updates.id;
  delete updates.quote_id;
  delete updates.created_at;
  delete updates.created_by;
  delete updates.updated_at;

  if (updates.status && !['live', 'draft', 'archived'].includes(updates.status)) {
    return res.status(400).json({ error: 'status must be live, draft, or archived' });
  }
  if (updates.tags !== undefined && !Array.isArray(updates.tags)) {
    return res.status(400).json({ error: 'tags must be an array' });
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No editable fields provided' });
  }

  updates.updated_by = auth.memberId;

  try {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('quote_id', quote_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Quote patch error:', err);
    return res.status(500).json({ error: 'Quote update failed', detail: err.message });
  }
}

async function handleSingleDelete(req, res, quote_id) {
  const auth = await verifyQuoteAdmin(req);
  if (!auth.isAdmin) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  try {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'archived', updated_by: auth.memberId })
      .eq('quote_id', quote_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      throw error;
    }

    return res.status(200).json({ archived: true, quote: data });
  } catch (err) {
    console.error('Quote delete error:', err);
    return res.status(500).json({ error: 'Quote archive failed', detail: err.message });
  }
}

// ─── /api/quotes/ai-suggest (admin only) ─────────────────────────────────────
//
// POST body: {
//   target_surface?, target_pillar?, target_archetype?, target_tradition?,
//   count? (default 5, max 10),
//   notes? (free-form curator hint)
// }
//
// Calls Claude Haiku with a structured prompt that includes the Three Tests,
// the existing entries at the requested target (so the AI doesn't duplicate),
// and any curator notes. Each candidate the model returns is inserted as a
// draft (status='draft', created_by='ai-suggest'). Admin reviews drafts in
// the UI and promotes or rejects each.
//
// Cost: ~$0.001 per call at typical sizes.

async function handleAISuggest(req, res) {
  const auth = await verifyQuoteAdmin(req);
  if (!auth.isAdmin) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const {
    target_surface,
    target_pillar,
    target_archetype,
    target_tradition,
    count = 5,
    notes,
  } = req.body || {};

  if (!target_surface && !target_pillar && !target_archetype && !target_tradition) {
    return res.status(400).json({
      error: 'At least one target (surface, pillar, archetype, or tradition) is required.',
    });
  }

  const requestedCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);

  const targetTags = [];
  if (target_surface)   targetTags.push(`surface-${target_surface}`);
  if (target_pillar)    targetTags.push(`pillar-${target_pillar}`);
  if (target_archetype) targetTags.push(`archetype-${target_archetype}`);
  if (target_tradition) targetTags.push(`tradition-${target_tradition}`);

  // Pull existing entries at this target so the AI can avoid duplicates
  let existing = [];
  try {
    const { data } = await supabase
      .from('quotes')
      .select('text, author, tags')
      .in('status', ['live', 'draft'])
      .overlaps('tags', targetTags)
      .limit(50);
    existing = data || [];
  } catch (e) {
    console.warn('AI suggest: existing-fetch warning (non-fatal):', e.message);
  }

  const existingFormatted = existing.length > 0
    ? existing.map((q, i) => `${i + 1}. "${q.text}" — ${q.author || 'Unknown'}`).join('\n')
    : '(none yet)';

  const prompt = `You are an editorial curator for the Dialecta Quote Library.

Dialecta is a discourse platform whose intellectual lineage runs through Stoic philosophy (Marcus Aurelius, Epictetus, Seneca), classical Greek thought (Aristotle, Socrates, Heraclitus, Plato), Jewish tradition (Buber, Heschel, Hillel, Maimonides), Christian wisdom and mysticism (Augustine, Aquinas, Meister Eckhart, Merton, Rohr), African and Ubuntu thought (Tutu, Achebe, Soyinka), Indigenous wisdom (Kimmerer, Chief Joseph), modern thinkers (Feynman, Kahneman, Einstein, Brooks, Frankl, Jung), and the speculative-fiction tradition (Banks, Le Guin, Roddenberry, Butler, Herbert, Lem, Dick, Asimov).

THE THREE TESTS — every candidate must pass all three:
1. PRECISION: illuminates the specific concept, not the general theme.
2. WEIGHT: the speaker has earned the right to be quoted on this subject through their life's work.
3. BREVITY: one sentence preferred, two sentences maximum.

For speculative fiction or in-world material: substitution test — could Marcus Aurelius have said this and carried the same meaning? If yes, it qualifies. In-world doctrines and character speech with authorial weight (Earthseed verses, Bene Gesserit Litany, Vulcan IDIC, etc.) are eligible.

ATTRIBUTION FORMAT: For spec-fic, use "Author, Work, Year (in-fiction speaker or document)". Example: "Frank Herbert, Dune, 1965 (Bene Gesserit Litany)".

PUNCTUATION: do not use em dashes in quote text. Substitute commas, colons, or periods.

TARGET: ${requestedCount} candidate quote(s) for: ${targetTags.join(' AND ')}

EXISTING ENTRIES at this target (do NOT duplicate any of these; avoid proposing additional quotes by these same authors unless you have a strong distinct line):
${existingFormatted}

${notes ? `CURATOR NOTES: ${notes}\n` : ''}

Output STRICT JSON only — an array of ${requestedCount} candidate objects. Each object must have these exact fields:
- text: the quote text (verbatim, accurate; do not paraphrase or modernize)
- author: human author name
- source: work or essay name plus chapter/year if known; for spec-fic add in-fiction speaker in parens
- year: integer year of original publication, or null if pre-modern or undated
- suggested_tags: array of tag strings using platform conventions (pillar-X, archetype-X, surface-X, theme-X, tradition-X). Always include the target tag(s) plus 2-4 thematic and tradition tags.

Do NOT include any prose outside the JSON. Begin response with [ and end with ].`;

  let candidates;
  try {
    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicResp.ok) {
      const errBody = await anthropicResp.text();
      throw new Error(`Anthropic API ${anthropicResp.status}: ${errBody.slice(0, 300)}`);
    }

    const result = await anthropicResp.json();
    const text = result.content?.[0]?.text || '';
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    candidates = JSON.parse(cleaned);

    if (!Array.isArray(candidates)) {
      throw new Error('AI response was not a JSON array');
    }
  } catch (err) {
    console.error('AI suggest API error:', err);
    return res.status(502).json({ error: 'AI generation failed', detail: err.message });
  }

  // Insert each candidate as a draft. On slug conflict, retry once with a
  // timestamp suffix; otherwise record in skipped.
  const inserted = [];
  const skipped = [];

  for (const c of candidates) {
    if (!c?.text) {
      skipped.push({ reason: 'missing text', candidate: c });
      continue;
    }

    const slugBase = (c.author || 'anon').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slugTail = (c.text || '').toLowerCase().split(/\s+/).slice(0, 3).join('-')
      .replace(/[^a-z0-9-]+/g, '').replace(/^-|-$/g, '');
    let quote_id = `${slugBase}-${slugTail}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!quote_id || quote_id.length < 3) {
      quote_id = `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    const tryInsert = async (slug) => {
      return await supabase
        .from('quotes')
        .insert({
          quote_id: slug,
          text: c.text,
          author: c.author ?? null,
          source: c.source ?? null,
          year: typeof c.year === 'number' ? c.year : null,
          tags: Array.isArray(c.suggested_tags) ? c.suggested_tags : [],
          status: 'draft',
          created_by: 'ai-suggest',
          updated_by: 'ai-suggest',
        })
        .select()
        .single();
    };

    try {
      let { data, error } = await tryInsert(quote_id);
      if (error?.code === '23505') {
        // Retry once with a timestamp suffix
        const retrySlug = `${quote_id}-${Date.now().toString(36).slice(-4)}`;
        ({ data, error } = await tryInsert(retrySlug));
        if (error) {
          skipped.push({ quote_id, reason: 'duplicate slug after retry' });
          continue;
        }
        quote_id = retrySlug;
      } else if (error) {
        throw error;
      }
      inserted.push(data);
    } catch (err) {
      console.error('AI suggest insert error:', err);
      skipped.push({ quote_id, reason: err.message });
    }
  }

  return res.status(200).json({
    requested: requestedCount,
    received: candidates.length,
    inserted,
    skipped,
  });
}
