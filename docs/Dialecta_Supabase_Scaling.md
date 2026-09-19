# Dialecta. Supabase Scaling and Performance Considerations
*Operational reference for build logic review and pre-launch optimization.*
*Version 1.0. April 2026.*

---

## Purpose

This document captures the database scaling logic that needs to be built into `dialecta-api` and the theme query patterns before public launch. It is the operational companion to `Dialecta_Data_Architecture.md`. Where that document defines what the data is, this document defines how it behaves under load.

Three principles:

1. Storage is not the first wall. Connection saturation and `axis_scores` recompute cost are.
2. The data model is correct. The risk is operational hygiene, not architecture.
3. Every line below is implementable now without changing the schema.

---

## Write Amplification Per Comment

A single comment submission writes to multiple tables. This is the load profile to design against:

| Table | Rows written | Sync or async | Notes |
|---|---|---|---|
| `comments` | 1 | Sync | The raw record |
| `classifications` | 1 | Sync | Stage A and B fields, ~1 to 2 KB |
| `axis_events` | 2 to 4 typical | Async | Append-only ledger, never updated |
| `axis_scores` | 6 (overwrite) | Async | Recomputed from ledger replay |
| `archetypes` | 0 to 1 | Async | Only on threshold cross |
| `fp_snapshots` | 0 to 1 | Async | Only on milestone events |
| `feed_events` | 0 to 2 | Async | Only on surface-worthy events |

Net new storage per comment: roughly 3 to 5 KB. The cost is not in row size. It is in the recompute pattern on `axis_scores` and the lock contention if multiple comments by the same contributor land near-simultaneously.

---

## What Breaks First, In Order

### 1. Connection saturation (first traffic spike)

Vercel serverless functions can fan out database connections faster than Supabase's direct pool allows. The three live API routes (`POST /api/classify`, `POST /api/comment`, `GET+PATCH /api/profile/:id`) will each hold a connection for the duration of their handler.

**Fix:** Use Supavisor transaction-mode pooler, not the direct connection. The connection string difference is the port and a path segment. Verify in `dialecta-api` that `SUPABASE_SERVICE_ROLE_KEY` is paired with the pooled URL, not the direct URL.

### 2. `axis_scores` recompute latency for power users

The current spec recomputes `axis_scores` by replaying `axis_events` for the contributor on every classification event. For a contributor with 1,000 lifetime comments touching 2 to 4 axes each, that is 2,000 to 4,000 ledger reads on every new comment they post.

**Fix options, ranked:**

**A. Incremental update with periodic reconciliation (recommended).** Apply the new axis delta to the materialized `axis_scores` row directly. Run a full ledger replay on a nightly job to catch drift. This keeps writes O(1) per comment regardless of contributor history.

**B. Lazy recompute on read.** Mark `axis_scores` dirty on write. Recompute on next profile load. Hides the cost from comment posting at the price of slower profile renders for active users.

**C. Pure replay (current spec).** Honest and simple. Does not scale past roughly 800 to 1,200 lifetime comments per contributor on a small Supabase compute instance.

Recommendation: implement A. Keep the nightly reconcile job logging any drift detected. If drift is consistently zero after one month, the reconcile becomes weekly.

### 3. Feed reads under article virality

A single article with 500 comments served to 5,000 readers is the realistic spike scenario. Each page load joins comments, classifications, and aggregates votes per tier. This is the second hottest read path after profile loads.

**Fix:** Materialized view keyed by `(article_id, final_tier)` with comment counts and a precomputed top-N slice per tier. Refresh on classification events for that article. Alternative: a `comments_feed_cache` table written by the same async pipeline that handles `feed_events`.

### 4. Compute tier ceiling on the database itself

Supabase Pro ships with a Micro compute instance by default. Shared CPU, ~1 GB RAM. The `axis_scores` replay pattern is RAM-sensitive. You can hit p95 query degradation well before storage limits.

**Fix:** Upgrade to Small compute add-on before launch. This removes shared-CPU variance and doubles RAM. The first compute jump is the high-leverage one. Verify current compute size in Supabase dashboard, project settings, infrastructure.

---

## Required Indexes

These need to exist in the Supabase migration before any meaningful traffic. Verify each in the SQL editor:

```sql
-- axis_events ledger replay (the hottest read path)
CREATE INDEX IF NOT EXISTS idx_axis_events_contributor_axis
  ON axis_events (contributor_id, axis, created_at);

-- axis_scores lookup for fingerprint render
CREATE INDEX IF NOT EXISTS idx_axis_scores_contributor
  ON axis_scores (contributor_id);

-- fp_snapshots for growth scroll
CREATE INDEX IF NOT EXISTS idx_fp_snapshots_contributor_time
  ON fp_snapshots (contributor_id, snapshot_at DESC);

-- archetypes lookup
CREATE INDEX IF NOT EXISTS idx_archetypes_contributor
  ON archetypes (contributor_id);

-- comment feed reads per article and tier
CREATE INDEX IF NOT EXISTS idx_classifications_comment
  ON classifications (comment_id);

CREATE INDEX IF NOT EXISTS idx_comments_article_status
  ON comments (article_id, status, published_at DESC)
  WHERE status = 'published';

-- feed_events surface
CREATE INDEX IF NOT EXISTS idx_feed_events_contributor_time
  ON feed_events (primary_contributor_id, created_at DESC);

-- comment_votes aggregation
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment
  ON comment_votes (comment_id, vote_type);
```

The partial index on `comments(status='published')` is intentional. Drafts and suppressed records never need to participate in feed reads.

---

## Connection Pool Configuration

Supavisor transaction mode is the right setting for this workload. Sequence:

1. In Supabase dashboard, project settings, database, find the pooler connection string. Note the port (typically 6543) versus direct (5432).
2. In `dialecta-api`, set environment variable `SUPABASE_DB_URL` (or whichever the routes use) to the pooler URL.
3. Verify Vercel function timeouts are set conservatively. The `POST /api/classify` route should have a hard ceiling matching the Anthropic API timeout, no longer.
4. Each route should release its connection in a `finally` block. Long-running requests holding pooled connections will starve other routes.

---

## Compute Tier Sizing Guidance

Verify pricing in the Supabase dashboard before acting. Relative ordering and principle do not change.

| Compute size | Typical RAM | When it makes sense |
|---|---|---|
| Micro (default) | ~1 GB | Pre-launch testing only |
| Small | ~2 GB | Launch through ~10,000 active users |
| Medium | ~4 GB | ~10,000 to 50,000 active users |
| Large | ~8 GB | Past 50,000 active users, or before Phase 5 microservice spinout |

The signal for jumping a tier is sustained p95 query time creeping above ~200ms on profile loads, not a specific user count. Watch the dashboard, not the calendar.

---

## Materialized View Strategy

Two views worth precomputing:

### Article comment feed

```sql
CREATE MATERIALIZED VIEW article_feed_cache AS
SELECT
  c.article_id,
  cls.final_tier,
  COUNT(*) AS comment_count,
  jsonb_agg(
    jsonb_build_object(
      'comment_id', c.id,
      'author_id', c.author_id,
      'published_at', c.published_at,
      'tier', cls.final_tier
    ) ORDER BY c.published_at DESC
  ) FILTER (WHERE c.status = 'published') AS recent_comments
FROM comments c
JOIN classifications cls ON cls.comment_id = c.id
WHERE c.status = 'published'
GROUP BY c.article_id, cls.final_tier;

CREATE UNIQUE INDEX ON article_feed_cache (article_id, final_tier);
```

Refresh strategy: trigger `REFRESH MATERIALIZED VIEW CONCURRENTLY article_feed_cache` from the same async pipeline that writes `feed_events`, scoped to the affected `article_id` only. Concurrent refresh requires the unique index above.

### Contributor fingerprint summary (optional, Phase 2)

If `axis_scores` queries become the hot read after the article feed is cached, a per-contributor materialized summary joining `axis_scores` plus current `archetype` plus latest `fp_snapshot` reduces three queries to one.

Do not build this on day one. Add it only if monitoring shows the profile load is the bottleneck.

---

## Pre-Launch Checklist

The five operational items that need to be true before `dialecta.org` points to the live stack:

- [ ] Supavisor transaction pooler enabled, all `dialecta-api` routes using pooled connection string.
- [ ] All indexes from the SQL block above present in the production database.
- [ ] Compute tier upgraded from Micro to Small.
- [ ] `axis_scores` update strategy decision made and implemented. Recommendation: incremental with nightly reconcile.
- [ ] `article_feed_cache` materialized view created and refresh trigger wired to the async pipeline.

The five monitoring checks that need to be set up before opening to broader traffic:

- [ ] Supabase dashboard p95 query time visible weekly.
- [ ] Connection count graph visible. Alert at 80% of pool capacity.
- [ ] Database size growth rate tracked monthly.
- [ ] Vercel function duration p95 tracked per route.
- [ ] Anthropic API rate limit headroom logged per `/api/classify` call.

---

## Phase Boundaries

When the architecture forces a real rethink, not just a tier upgrade:

**Phase 4 trigger (potential Next.js + Supabase migration):** Currently deferred per platform direction. Ghost is the confirmed production stack. If a migration is later pursued, the data layer survives it since Ghost only owns articles and member auth — Dialecta's data model (comments onward) requires no migration.

**Phase 5 trigger (dedicated comment microservice):** Begin planning when:
- `axis_events` table exceeds ~50 million rows, or
- p95 classification pipeline latency exceeds 2 seconds at the 95th percentile of contributor history depth, or
- Supabase compute is at Large and still degrading.

None of these are near-term concerns. They are documented here so the trigger conditions are explicit rather than judged on feel.

---

## What Is Already Working In Your Favor

Three architectural choices already made that pay off at scale:

1. `feed_events.display_payload` precomputed at write time means the social feed renders without joins.
2. `tier_mix` as jsonb on `axis_scores` avoids a separate aggregation table for fingerprint render.
3. The synchronous and asynchronous split in the comment pipeline means the user-facing path stays fast even when downstream is busy. Only the Anthropic classification call blocks the user.

The work above is operational reinforcement of an architecture that is already sound. None of it requires schema changes.

---

*Companion document to `Dialecta_Data_Architecture.md`. Reference both during build logic review.*
