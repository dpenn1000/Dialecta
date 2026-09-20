/**
 * dialecta-quotes-data.js
 *
 * Client-side data layer for the quote library admin page. Wraps the
 * /api/quotes/* endpoints with React hooks and small action helpers.
 *
 * Public:
 *   useQuoteList(filters)       → { quotes, total, loading, error, reload }
 *   useAdminStatus(memberId)    → { isAdmin, loading }
 *   useAdminList(memberId)      → { admins, loading, error, reload }
 *   createQuote(memberId, body) → POST /api/quotes (admin)
 *   suggestQuote(memberId, body)→ POST /api/quotes/suggest (member)
 *   updateQuote(memberId, id, body) → PATCH /api/quotes/:id (admin)
 *   archiveQuote(memberId, id)  → DELETE /api/quotes/:id (admin)
 *   grantAdmin(memberId, target)→ POST /api/quotes/admins (admin)
 *   revokeAdmin(memberId, target)→ DELETE /api/quotes/admins (admin)
 *
 * The memberId param is the caller's Ghost member uuid. Public reads (live
 * status, no admin features) work without it; admin and member-suggest
 * actions require it.
 */

import { useState, useEffect, useCallback } from 'react';

// ─── API base ─────────────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return 'https://dialecta.vercel.app';
}

function buildQueryString(params) {
  const entries = Object.entries(params).filter(
    ([_, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

// ─── Fetch helpers ────────────────────────────────────────────────────────

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { _raw: text }; }
  if (!res.ok) {
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// ─── List quotes (browse + drafts + archive) ──────────────────────────────

export function useQuoteList({
  status = 'live',
  surface,
  pillar,
  archetype,
  tradition,
  theme,
  author,
  search,
  limit = 200,
  offset = 0,
  memberId,
} = {}) {
  const [quotes, setQuotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQueryString({
        status, surface, pillar, archetype, tradition, theme, author, search,
        limit, offset,
        member_id: status !== 'live' ? memberId : undefined,
      });
      const data = await jsonFetch(`${apiBase()}/api/quotes${qs}`);
      setQuotes(data.quotes || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, surface, pillar, archetype, tradition, theme, author, search, limit, offset, memberId]);

  useEffect(() => { load(); }, [load]);

  return { quotes, total, loading, error, reload: load };
}

// ─── Admin status check (for the current member) ──────────────────────────

export function useAdminStatus(memberId) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Cheapest probe: call the admins-list endpoint, which itself
        // requires admin auth. 200 = admin, 403 = member but not admin,
        // 404 = no profile yet.
        await jsonFetch(`${apiBase()}/api/quotes/admins?member_id=${encodeURIComponent(memberId)}`);
        if (!cancelled) setIsAdmin(true);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [memberId]);

  return { isAdmin, loading };
}

// ─── Admin list (for the admins panel) ────────────────────────────────────

export function useAdminList(memberId) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!memberId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await jsonFetch(
        `${apiBase()}/api/quotes/admins?member_id=${encodeURIComponent(memberId)}`
      );
      setAdmins(data.admins || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => { load(); }, [load]);
  return { admins, loading, error, reload: load };
}

// ─── Action helpers ───────────────────────────────────────────────────────

export async function createQuote(memberId, body) {
  return jsonFetch(`${apiBase()}/api/quotes?member_id=${encodeURIComponent(memberId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function suggestQuote(memberId, body) {
  return jsonFetch(`${apiBase()}/api/quotes/suggest?member_id=${encodeURIComponent(memberId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function updateQuote(memberId, quoteId, body) {
  return jsonFetch(
    `${apiBase()}/api/quotes/${encodeURIComponent(quoteId)}?member_id=${encodeURIComponent(memberId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

export async function archiveQuote(memberId, quoteId) {
  return jsonFetch(
    `${apiBase()}/api/quotes/${encodeURIComponent(quoteId)}?member_id=${encodeURIComponent(memberId)}`,
    { method: 'DELETE' }
  );
}

export async function grantAdmin(memberId, targetGhostMemberId) {
  return jsonFetch(`${apiBase()}/api/quotes/admins?member_id=${encodeURIComponent(memberId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ghost_member_id: targetGhostMemberId }),
  });
}

export async function revokeAdmin(memberId, targetGhostMemberId) {
  return jsonFetch(
    `${apiBase()}/api/quotes/admins?member_id=${encodeURIComponent(memberId)}&ghost_member_id=${encodeURIComponent(targetGhostMemberId)}`,
    { method: 'DELETE' }
  );
}

export async function aiSuggestQuotes(memberId, params) {
  return jsonFetch(`${apiBase()}/api/quotes/ai-suggest?member_id=${encodeURIComponent(memberId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

// ─── Slug helper ──────────────────────────────────────────────────────────

// Generate a URL-safe slug from author + first words of text. Falls back to
// a timestamp suffix if the natural slug already exists (caller handles 409).
export function suggestSlug(author, text) {
  const a = (author || 'anon').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const t = (text || '').toLowerCase().split(/\s+/).slice(0, 3).join('-')
    .replace(/[^a-z0-9-]+/g, '').replace(/^-|-$/g, '');
  return `${a}-${t}`.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'quote';
}
