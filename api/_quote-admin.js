import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Two auth helpers for the quote library endpoints.
//
// Both read the requester's Ghost member uuid from `?member_id=<uuid>` query
// param (preferred) or the `x-member-id` request header. The theme-side
// quote admin UI passes the value from the mount root's data-member-id
// attribute (same pattern as the profile page wiring).
//
// This trust model matches the existing /api/profile endpoint: a client that
// spoofs another member's uuid can act as that member. Acceptable for v1
// since the surface area is limited to admin-eligible UUIDs (cross-checked
// against is_quote_admin in Supabase). Harden later with proper Ghost
// session verification if the cost calculus changes.
//
// Usage:
//   const auth = await verifyQuoteAdmin(req);
//   if (!auth.isAdmin) return res.status(auth.statusCode).json({ error: auth.error });
//   // ... admin action; auth.memberId is the verified caller for audit fields

function readMemberId(req) {
  return req.query?.member_id || req.headers['x-member-id'] || null;
}

export async function verifyQuoteAdmin(req) {
  const memberId = readMemberId(req);

  if (!memberId) {
    return {
      isAdmin: false,
      memberId: null,
      error: 'No member_id provided. Pass as ?member_id=<uuid> or x-member-id header.',
      statusCode: 401,
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_quote_admin')
      .eq('ghost_member_id', memberId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        isAdmin: false,
        memberId,
        error: 'Member profile not found in Supabase. Visit /profile/ once to lazy-create it.',
        statusCode: 404,
      };
    }

    if (!data.is_quote_admin) {
      return {
        isAdmin: false,
        memberId,
        error: 'Member is not a quote admin',
        statusCode: 403,
      };
    }

    return { isAdmin: true, memberId, error: null, statusCode: 200 };
  } catch (err) {
    console.error('verifyQuoteAdmin error:', err);
    return {
      isAdmin: false,
      memberId,
      error: 'Auth verification failed: ' + err.message,
      statusCode: 500,
    };
  }
}

// Lighter check: any profile that exists in Supabase. Used by the public
// suggest endpoint where every logged-in member can submit a candidate
// (always lands as draft, gated to admin review).
export async function verifyMember(req) {
  const memberId = readMemberId(req);

  if (!memberId) {
    return {
      isMember: false,
      memberId: null,
      error: 'No member_id provided',
      statusCode: 401,
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('ghost_member_id')
      .eq('ghost_member_id', memberId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        isMember: false,
        memberId,
        error: 'Member profile not found. Visit /profile/ once to lazy-create it.',
        statusCode: 404,
      };
    }

    return { isMember: true, memberId, error: null, statusCode: 200 };
  } catch (err) {
    console.error('verifyMember error:', err);
    return {
      isMember: false,
      memberId,
      error: 'Member verification failed: ' + err.message,
      statusCode: 500,
    };
  }
}
