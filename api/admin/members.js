/**
 * /api/admin/members
 *
 * GET full member directory with activity-level data, gated by the
 * `members.view` capability. This is the admin-side counterpart to
 * /api/profile/_list (which is the public Community directory).
 *
 * Response shape:
 *   {
 *     members: [
 *       {
 *         ghost_member_id, display_name, email, avatar_url, bio, location,
 *         is_author, is_admin, is_quote_admin, is_seed,
 *         pact_agreed_at, order_assigned_at,
 *         archetype: { id, label } | null,
 *         order:     { id, label, family } | null,
 *         roles:     [role_id, ...],
 *         comment_count, published_articles, total_graduations,
 *         follower_count, following_count,
 *         last_active_at,        // max of last comment, last article, last axis_event, profile.updated_at
 *         ghost_created_at,      // member created in Ghost (joined date)
 *         ghost_last_seen_at,    // last sign-in per Ghost
 *       },
 *       ...
 *     ],
 *     summary: {
 *       total, authors, admins, pact_signed, active_7d, active_30d, dormant_30d
 *     }
 *   }
 *
 * Performance: one query per data source, then joined in JS. Ghost member
 * fields (email, created_at, last_seen_at) are fetched in a single bulk
 * /members/?filter=id:[...] call. Acceptable for the invited-launch
 * cohort (≤ a few hundred members); if the cohort grows large, swap to
 * a Postgres view materialized nightly.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { verifyCapability } from '../_capabilities.js';
import { ghostAdminFetch } from '../_ghost-admin.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyCapability(req, 'members.view');
  if (!auth.ok) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  try {
    // 1. Profiles (everyone in the directory).
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, ghost_member_id, display_name, avatar_url, bio, location, is_author, is_admin, is_quote_admin, is_seed, pact_agreed_at, order_id, order_label, order_family, order_assigned_at, updated_at, subscription_tier, is_charter, is_gifted, gifted_by_member_id, gift_expires_at, subscription_tier_updated_at')
      .order('updated_at', { ascending: false });
    if (pErr) throw pErr;

    if (!profiles || profiles.length === 0) {
      return res.status(200).json({ members: [], summary: emptySummary() });
    }

    const memberIds = profiles.map((p) => p.ghost_member_id);
    const profileIds = profiles.map((p) => p.id);

    // 2. Fan out activity data in parallel.
    const [
      archetypeResult,
      axisResult,
      commentAggResult,
      articleAggResult,
      followerResult,
      followingResult,
      rolesResult,
    ] = await Promise.all([
      supabase
        .from('archetypes')
        .select('member_id, archetype_id, archetype_label')
        .in('member_id', memberIds),
      supabase
        .from('axis_scores')
        .select('member_id, graduation_count, last_updated')
        .in('member_id', memberIds),
      supabase
        .from('comments')
        .select('member_id, created_at')
        .in('member_id', memberIds),
      supabase
        .from('articles')
        .select('author_member_id, status, created_at')
        .in('author_member_id', memberIds),
      supabase
        .from('follows')
        .select('followee_id')
        .in('followee_id', memberIds),
      supabase
        .from('follows')
        .select('follower_id')
        .in('follower_id', memberIds),
      supabase
        .from('profile_admin_roles')
        .select('profile_id, role_id, expires_at')
        .in('profile_id', profileIds),
    ]);

    // Pivot into per-member maps.
    const archetypeByMember = new Map();
    for (const row of archetypeResult.data || []) {
      archetypeByMember.set(row.member_id, {
        id:    row.archetype_id,
        label: row.archetype_label,
      });
    }

    const graduationsByMember = new Map();
    const axisLastByMember    = new Map();
    for (const row of axisResult.data || []) {
      graduationsByMember.set(
        row.member_id,
        (graduationsByMember.get(row.member_id) || 0) + (row.graduation_count || 0),
      );
      const prev = axisLastByMember.get(row.member_id);
      if (!prev || (row.last_updated && row.last_updated > prev)) {
        axisLastByMember.set(row.member_id, row.last_updated);
      }
    }

    const commentCountByMember = new Map();
    const lastCommentByMember  = new Map();
    for (const row of commentAggResult.data || []) {
      commentCountByMember.set(
        row.member_id,
        (commentCountByMember.get(row.member_id) || 0) + 1,
      );
      const prev = lastCommentByMember.get(row.member_id);
      if (!prev || (row.created_at && row.created_at > prev)) {
        lastCommentByMember.set(row.member_id, row.created_at);
      }
    }

    const articleCountByMember = new Map();
    const lastArticleByMember  = new Map();
    for (const row of articleAggResult.data || []) {
      if (row.status === 'published') {
        articleCountByMember.set(
          row.author_member_id,
          (articleCountByMember.get(row.author_member_id) || 0) + 1,
        );
      }
      const prev = lastArticleByMember.get(row.author_member_id);
      if (!prev || (row.created_at && row.created_at > prev)) {
        lastArticleByMember.set(row.author_member_id, row.created_at);
      }
    }

    const followerCountByMember = new Map();
    for (const row of followerResult.data || []) {
      followerCountByMember.set(row.followee_id, (followerCountByMember.get(row.followee_id) || 0) + 1);
    }
    const followingCountByMember = new Map();
    for (const row of followingResult.data || []) {
      followingCountByMember.set(row.follower_id, (followingCountByMember.get(row.follower_id) || 0) + 1);
    }

    const rolesByProfileId = new Map();
    const nowIso = new Date().toISOString();
    for (const row of rolesResult.data || []) {
      if (row.expires_at && row.expires_at <= nowIso) continue;
      if (!rolesByProfileId.has(row.profile_id)) rolesByProfileId.set(row.profile_id, []);
      rolesByProfileId.get(row.profile_id).push(row.role_id);
    }

    // 3. Bulk Ghost fetch for email + created_at + last_seen_at. We skip
    // seed:* member ids since those aren't real Ghost members. Chunk by 100
    // to stay under URL length limits when the cohort grows.
    const realMemberIds = memberIds.filter((id) => !id.startsWith('seed:'));
    const ghostByMember = new Map();
    if (realMemberIds.length > 0) {
      const chunks = chunkArray(realMemberIds, 80);
      for (const chunk of chunks) {
        try {
          const filter = chunk.map((mid) => `id:${mid}`).join(',');
          const ghostResp = await ghostAdminFetch(
            '/members/?filter=' + encodeURIComponent(filter) +
            '&fields=id,name,email,created_at,last_seen_at' +
            '&limit=' + Math.max(chunk.length, 1)
          );
          for (const m of ghostResp.members || []) {
            ghostByMember.set(m.id, m);
          }
        } catch (e) {
          console.warn('admin/members: ghost backfill failed for chunk:', e.message);
        }
      }
    }

    // 4. Compose final member rows.
    const members = profiles.map((p) => {
      const ghost   = ghostByMember.get(p.ghost_member_id) || {};
      const fallbackName = ghost.name && ghost.name.trim()
        ? ghost.name.trim()
        : (ghost.email ? ghost.email.split('@')[0] : null);

      const lastCandidates = [
        lastCommentByMember.get(p.ghost_member_id),
        lastArticleByMember.get(p.ghost_member_id),
        axisLastByMember.get(p.ghost_member_id),
        ghost.last_seen_at,
      ].filter(Boolean);
      const last_active_at = lastCandidates.length > 0
        ? lastCandidates.reduce((a, b) => (a > b ? a : b))
        : (p.updated_at || null);

      return {
        ghost_member_id:   p.ghost_member_id,
        display_name:      p.display_name || fallbackName || null,
        email:             ghost.email || null,
        avatar_url:        p.avatar_url,
        bio:               p.bio,
        location:          p.location,
        is_author:         !!p.is_author,
        is_admin:          !!p.is_admin,
        is_quote_admin:    !!p.is_quote_admin,
        is_seed:           !!p.is_seed,
        pact_agreed_at:    p.pact_agreed_at,
        order_assigned_at: p.order_assigned_at,
        archetype:         archetypeByMember.get(p.ghost_member_id) || null,
        order: p.order_id
          ? { id: p.order_id, label: p.order_label, family: p.order_family }
          : null,
        roles:             rolesByProfileId.get(p.id) || [],
        comment_count:     commentCountByMember.get(p.ghost_member_id) || 0,
        published_articles: articleCountByMember.get(p.ghost_member_id) || 0,
        total_graduations: graduationsByMember.get(p.ghost_member_id) || 0,
        follower_count:    followerCountByMember.get(p.ghost_member_id) || 0,
        following_count:   followingCountByMember.get(p.ghost_member_id) || 0,
        last_active_at,
        ghost_created_at:  ghost.created_at || null,
        ghost_last_seen_at: ghost.last_seen_at || null,
        subscription_tier:    p.subscription_tier || 'free',
        is_charter:           p.is_charter === true,
        is_gifted:            p.is_gifted === true,
        gifted_by_member_id:  p.gifted_by_member_id || null,
        gift_expires_at:      p.gift_expires_at || null,
        subscription_tier_updated_at: p.subscription_tier_updated_at || null,
      };
    });

    // 5. Summary stats for the section header strip.
    const now = Date.now();
    const sevenDays  = 7  * 24 * 3600 * 1000;
    const thirtyDays = 30 * 24 * 3600 * 1000;
    let active_7d  = 0;
    let active_30d = 0;
    let dormant_30d = 0;
    let authors    = 0;
    let admins     = 0;
    let pact_signed = 0;

    for (const m of members) {
      if (m.is_author) authors += 1;
      if (m.roles.length > 0 || m.is_admin) admins += 1;
      if (m.pact_agreed_at) pact_signed += 1;
      if (m.last_active_at) {
        const age = now - new Date(m.last_active_at).getTime();
        if (age < sevenDays)  active_7d  += 1;
        if (age < thirtyDays) active_30d += 1;
        else                  dormant_30d += 1;
      } else {
        dormant_30d += 1;
      }
    }

    return res.status(200).json({
      members,
      summary: {
        total:        members.length,
        authors,
        admins,
        pact_signed,
        active_7d,
        active_30d,
        dormant_30d,
      },
    });
  } catch (err) {
    console.error('admin/members list error:', err);
    return res.status(500).json({ error: 'Failed to list members', detail: err.message });
  }
}

function chunkArray(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function emptySummary() {
  return { total: 0, authors: 0, admins: 0, pact_signed: 0, active_7d: 0, active_30d: 0, dormant_30d: 0 };
}
