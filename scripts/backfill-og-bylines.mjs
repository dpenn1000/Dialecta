#!/usr/bin/env node
/**
 * backfill-og-bylines.mjs
 *
 * One-time pass: rewrite custom_excerpt on every member-authored Ghost
 * post so it begins with "By <Real Author>." This makes social-share
 * previews (Facebook / X / LinkedIn) name the real writer instead of
 * the house staff user (Daniel) that Path C-lite uses for attribution.
 *
 * Idempotent: if a post's custom_excerpt already starts with "By ",
 * we skip it. Re-running the script after future articles is safe.
 *
 * The submit pipeline (api/article/submit.js) now bakes the same
 * "By <Name>." prefix into custom_excerpt on every NEW submission, so
 * this backfill is for legacy posts that predate that change.
 *
 * Usage (from the API repo root, Node 20+):
 *   node --env-file=.env.local scripts/backfill-og-bylines.mjs --dry-run
 *   node --env-file=.env.local scripts/backfill-og-bylines.mjs
 *
 * Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY, GHOST_ADMIN_API_URL,
 * GHOST_ADMIN_API_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import { ghostAdminFetch } from '../api/_ghost-admin.js';
import { bylineExcerpt }   from '../api/_byline-excerpt.js';

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in env. Check .env.local.');
    process.exit(1);
  }
  if (!process.env.GHOST_ADMIN_API_URL || !process.env.GHOST_ADMIN_API_KEY) {
    console.error('Missing GHOST_ADMIN_API_URL or GHOST_ADMIN_API_KEY in env. Check .env.local.');
    process.exit(1);
  }

  console.log(DRY_RUN ? '── DRY RUN ── (no writes)' : '── APPLYING ──');
  console.log('Querying articles with author_member_id + ghost_post_id ...');

  const { data: articles, error: queryErr } = await supabase
    .from('articles')
    .select('id, ghost_post_id, author_member_id')
    .not('ghost_post_id', 'is', null)
    .not('author_member_id', 'is', null);

  if (queryErr) {
    console.error('Supabase articles query failed:', queryErr.message);
    process.exit(1);
  }
  if (!articles || articles.length === 0) {
    console.log('No member-authored articles. Done.');
    return;
  }
  console.log(`Found ${articles.length} candidate article(s).`);

  // Bulk-fetch the corresponding profiles to resolve display_name in one
  // query rather than per-article.
  const memberIds = Array.from(new Set(articles.map((a) => a.author_member_id)));
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('ghost_member_id, display_name')
    .in('ghost_member_id', memberIds);

  if (profilesErr) {
    console.error('Supabase profiles query failed:', profilesErr.message);
    process.exit(1);
  }
  const nameByMemberId = new Map((profiles || []).map((p) => [p.ghost_member_id, p.display_name]));

  let updated = 0;
  let skipped = 0;
  let failed  = 0;

  for (const article of articles) {
    const authorName = nameByMemberId.get(article.author_member_id);
    const tag = `${article.ghost_post_id} (${authorName || 'no name'})`;

    if (!authorName) {
      console.log(`  ! ${tag}  no display_name on profile — skipped`);
      skipped++;
      continue;
    }

    let post;
    try {
      const ghostResp = await ghostAdminFetch(
        `/posts/${article.ghost_post_id}/?fields=id,custom_excerpt,excerpt,html,updated_at,title`,
      );
      post = ghostResp.posts && ghostResp.posts[0];
      if (!post) throw new Error('Ghost returned no post');
    } catch (err) {
      console.log(`  X ${tag}  Ghost GET failed: ${err.message}`);
      failed++;
      continue;
    }

    // Pick the best base excerpt: custom_excerpt > auto-excerpt > generated from html.
    const currentBase  = (post.custom_excerpt && post.custom_excerpt.trim()) || (post.excerpt && post.excerpt.trim()) || '';
    const newExcerpt   = bylineExcerpt(authorName, currentBase, post.html);
    const currentEqual = (post.custom_excerpt || '') === (newExcerpt || '');

    if (!newExcerpt) {
      console.log(`  · ${tag}  no body to derive excerpt from — skipped`);
      skipped++;
      continue;
    }
    if (currentEqual) {
      console.log(`  = ${tag}  already correct — skipped`);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  · ${tag}`);
      console.log(`     before: ${(post.custom_excerpt || '(null)').slice(0, 90)}${(post.custom_excerpt || '').length > 90 ? '…' : ''}`);
      console.log(`     after:  ${newExcerpt.slice(0, 90)}${newExcerpt.length > 90 ? '…' : ''}`);
      updated++;
      continue;
    }

    try {
      await ghostAdminFetch(`/posts/${article.ghost_post_id}/?source=html`, {
        method: 'PUT',
        body: JSON.stringify({
          posts: [{
            id:             post.id,
            updated_at:     post.updated_at,
            custom_excerpt: newExcerpt,
          }],
        }),
      });
      console.log(`  + ${tag}  → "${newExcerpt.slice(0, 70)}${newExcerpt.length > 70 ? '…' : ''}"`);
      updated++;
    } catch (err) {
      console.log(`  X ${tag}  Ghost PUT failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nSummary: ${updated} ${DRY_RUN ? 'would-update' : 'updated'}, ${skipped} skipped, ${failed} failed. Total: ${articles.length}.`);
  if (DRY_RUN) console.log('Dry run complete. Re-run without --dry-run to apply.');
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
