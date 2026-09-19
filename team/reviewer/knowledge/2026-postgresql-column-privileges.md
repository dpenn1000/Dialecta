# PostgreSQL, column-level privileges

**Source:** PostgreSQL Global Development Group, "GRANT", PostgreSQL 18.6 documentation, read 2026-09-19. https://www.postgresql.org/docs/current/sql-grant.html

## Summary

Four privileges take a column list: `SELECT`, `INSERT`, `UPDATE` and `REFERENCES`. The form is
`GRANT UPDATE (column_name) ON TABLE table_name TO role`.

The rule that decides how a fix has to be written, quoted in full because the obvious approach
fails silently:

> "A user may perform `SELECT`, `INSERT`, etc. on a column if they hold that privilege for
> either the specific column or its whole table. Granting the privilege at the table level and
> then revoking it for one column will not do what one might wish: the table-level grant is
> unaffected by a column-level operation."

Column privileges are additive, not subtractive. `revoke update (final_tier)` against a role
that holds table-level `UPDATE` changes nothing at all and raises no error. The table-level
grant has to go first, and then the permitted columns are granted back one by one.

Two things this page does not say, recorded so the note is not read as more settled than it is.
It does not describe the error raised when a role updates a column it lacks privilege on, and
it does not discuss how column privileges interact with row-level security. The two-layer
framing, grants then rows, comes from Supabase rather than from here; see
[2026-supabase-default-grants](2026-supabase-default-grants.md). The Postgres side of that
claim is carried as a lead.

## The remedy for PR 3, worked

Blocker B2 of `exchange/open/2026-09-19-002-handoff-pr-3-review.md` names the hole twice
without naming the fix. This is the fix, as a forward migration, since
`supabase/CLAUDE.md` forbids editing a shipped one.

For `public.comments`, the author writes the body and nothing else. Tier, status and the
hardening timestamp belong to the pipeline.

```sql
revoke update on public.comments from anon, authenticated;
grant update (body) on public.comments to authenticated;
```

The existing row policy stays exactly as it is. It still answers which row, and the grant now
answers which column. Both have to pass.

For `public.articles`, the author owns the content columns. The publishing gate and the
amendment window do not belong to them.

```sql
revoke update on public.articles from anon, authenticated;
grant update (title, slug, excerpt, topic, body_json, body_html, declared_claims, map_config, suggested_axes)
  on public.articles to authenticated;
```

`status`, `published_at` and `amend_until` are deliberately absent. Whether an author may
publish their own article at all is a spec question, not a review finding; if the answer is
yes, it goes through a server action that also sets `published_at` and `amend_until`, which is
the same shape the foundation migration already uses for `classifications`.

For `public.aspirations`, `expires_at` and `declared_at` come off the list so an owner cannot
extend their own 90 day window.

```sql
revoke update on public.aspirations from anon, authenticated;
grant update (statement, reason, target_archetype, axis_commitments, visibility, research_consent, research_consent_at)
  on public.aspirations to authenticated;
```

Three cautions on all of the above.

`INSERT` needs the same treatment and is not covered by any of these statements. A user who
cannot update `comments.status` can still set it at insert time, because the insert policy
checks only `auth.uid() = author_id`. The same revoke and grant pattern applies to `INSERT`
with its own column list.

`SELECT` is untouched on purpose. PostgREST needs it to return the row, including under
`RETURNING`.

`service_role` is not named in any revoke, because the pipeline writes every column.

## Implies for Dialecta

- Row 3 of [review-checklist](review-checklist.md) can now state the remedy rather than only
  the question, which was the gap flagged when that file was written.
- The failure mode to watch in a fix for B2 is a migration that writes `revoke update
  (final_tier) on public.comments from authenticated` and looks correct in review. It is a
  no-op. Any column-level revoke against a role holding the table-level grant is a finding on
  its own, and a silent one.
- Check 2 gains a column list step for any table where the owner and the pipeline both write.
  In this schema that is `comments`, `articles` and `aspirations`. `axis_events`,
  `classifications` and `fp_snapshots` are pipeline only and need no grant to `authenticated`
  at all, which is a stronger position than a policy.

*Filed 2026-09-19*
