/**
 * Server-side fetcher for /contributor/<handle>/moment/<id>.
 *
 * A "moment" is a row in `celebration_events`. The fetch verifies the
 * URL's handle matches the moment's member, so handle/id pairs can't
 * be probed independently (a guess at a random handle for a known id
 * 404s rather than rendering someone else's moment under a stranger's
 * profile).
 *
 * Returns a denormalized object that's everything the OG card and
 * SSR page need to render in one shot, or null on:
 *   - malformed handle or id
 *   - moment not found
 *   - profile not found for that member
 *   - handle mismatch (handle in URL ≠ handle on profile)
 */

import { createClient } from '@supabase/supabase-js';

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'getMomentByHandleAndId: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.'
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

const UUID_RE   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HANDLE_RE = /^[a-z0-9_-]{3,24}$/;

export async function getMomentByHandleAndId(handle, momentId) {
  if (!handle || typeof handle !== 'string') return null;
  if (!momentId || typeof momentId !== 'string') return null;
  const h = handle.toLowerCase().trim();
  const m = momentId.toLowerCase().trim();
  if (!HANDLE_RE.test(h)) return null;
  if (!UUID_RE.test(m))   return null;

  const supa = getSupabase();

  // 1. Fetch the celebration event row.
  const { data: event, error: eventErr } = await supa
    .from('celebration_events')
    .select('id, member_id, event_type, context, occurred_at, shared_at')
    .eq('id', m)
    .maybeSingle();

  if (eventErr) {
    console.error('getMomentByHandleAndId: event fetch failed:', eventErr.message);
    return null;
  }
  if (!event) return null;

  // 2. Fetch the contributor profile by member_id. Only the columns
  //    we actually use; profiles.archetype isn't a real column (it's
  //    derived elsewhere in the codebase from axisScores), and
  //    selecting it here previously failed the whole query silently.
  //    signature_font drives the celebration card's name typography.
  const { data: profile, error: profileErr } = await supa
    .from('profiles')
    .select('handle, display_name, avatar_url, signature_font, ghost_member_id')
    .eq('ghost_member_id', event.member_id)
    .maybeSingle();

  if (profileErr) {
    console.error('getMomentByHandleAndId: profile fetch failed:', profileErr.message);
    return null;
  }
  if (!profile) return null;

  // 3. Handle ownership check: the URL handle must match this
  //    profile's canonical handle. Defense against random
  //    /contributor/<stranger>/moment/<known-id> probes.
  if ((profile.handle || '').toLowerCase() !== h) return null;

  return {
    moment: {
      id:           event.id,
      event_type:   event.event_type,
      context:      event.context || {},
      occurred_at:  event.occurred_at,
      shared_at:    event.shared_at,
    },
    contributor: {
      handle:         profile.handle,
      display_name:   profile.display_name || '',
      avatar_url:     profile.avatar_url || null,
      signature_font: profile.signature_font || 'Mrs Saint Delafield',
    },
  };
}

// Map a signature font family name to its bundled TTF filename in
// /assets/fonts/signatures/. Mirrors fetch-branding-assets.mjs.
const SIGNATURE_FONT_FILES = {
  'Mrs Saint Delafield':  'MrsSaintDelafield.ttf',
  'Cherish':              'Cherish.ttf',
  'Give You Glory':       'GiveYouGlory.ttf',
  'Hurricane':            'Hurricane.ttf',
  'Love Light':           'LoveLight.ttf',
  'Nothing You Could Do': 'NothingYouCouldDo.ttf',
  'Oooh Baby':            'OoohBaby.ttf',
  'Qwigley':              'Qwigley.ttf',
  'WindSong':             'WindSong.ttf',
};

export function signatureFontFile(family) {
  return SIGNATURE_FONT_FILES[family] || SIGNATURE_FONT_FILES['Mrs Saint Delafield'];
}

/**
 * Map event_type + context to the visible celebration content.
 *
 * The content is structured around the FOCAL piece (primary): the
 * thing the celebration is actually celebrating (the comment they
 * posted, the article title, the quote, etc.). The kicker is the
 * small label classifying what kind of moment it is. The secondary
 * is a thin context line.
 *
 * primary is what gets rendered LARGE on the card; it should be the
 * actual content snippet whenever possible — that's the "exciting
 * window into the soul of Dialecta" we're aiming for.
 */
export function describeMoment(event_type, context) {
  const c = context || {};
  switch (event_type) {
    case 'first_comment':
      return {
        kicker:        'First Comment',
        primary:       c.comment_body || '',
        primaryStyle:  'quote',
        secondary:     c.article_title ? `on ${c.article_title}` : null,
      };
    case 'first_article':
      return {
        kicker:        'First Article',
        primary:       c.article_title || '',
        primaryStyle:  'title',
        secondary:     'Published on Dialecta',
      };
    case 'first_quote':
      return {
        kicker:        'First Quote',
        primary:       c.quote_text || '',
        primaryStyle:  'quote',
        secondary:     c.quote_attribution ? `— ${c.quote_attribution}` : 'In the Dialecta library',
      };
    case 'delta_acknowledged':
      return {
        kicker:        'A Δ Acknowledged',
        primary:       c.comment_body || 'Someone shifted because of you',
        primaryStyle:  'quote',
        secondary:     c.article_title ? `on ${c.article_title}` : null,
      };
    case 'tier_promoted': {
      const prior = c.prior_tier ? c.prior_tier.charAt(0).toUpperCase() + c.prior_tier.slice(1) : '';
      const next  = c.new_tier   ? c.new_tier.charAt(0).toUpperCase()   + c.new_tier.slice(1)   : '';
      return {
        kicker:        'Tier Promoted',
        primary:       c.article_title || 'An article ascended',
        primaryStyle:  'title',
        secondary:     prior && next ? `${prior} → ${next}` : null,
      };
    }
    case 'follower_milestone': {
      const n = Number(c.count) || 1;
      const word = n === 1 ? '1 follower' : `${n} followers`;
      return {
        kicker:        'Follower Milestone',
        primary:       word,
        primaryStyle:  'count',
        secondary:     'on Dialecta',
      };
    }
    case 'became_steward':
      return {
        kicker:        'Became a Steward',
        primary:       c.role || 'A new Steward',
        primaryStyle:  'title',
        secondary:     'of the Dialecta order',
      };
    default:
      return {
        kicker:        'A Moment',
        primary:       'on Dialecta',
        primaryStyle:  'title',
        secondary:     null,
      };
  }
}
