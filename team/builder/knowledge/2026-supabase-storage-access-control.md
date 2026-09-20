# Supabase Storage access control and uploads

**Source:** Supabase Docs, "Storage Access Control", https://supabase.com/docs/guides/storage/security/access-control and "Standard Uploads", https://supabase.com/docs/guides/storage/uploads/standard-uploads (both read 2026-09-19)

## Summary

`storage.objects` is an ordinary table under row level security, and each storage action maps to a SQL operation: an upload needs `INSERT`, a download needs `SELECT`, and an overwrite through `upsert` needs both `SELECT` and `UPDATE`. The access control page states that Storage allows no uploads to a bucket without RLS policies, so a bucket with only a read policy is readable and closed to writes. Policies are written against the row, and the documented patterns scope a user to a folder with `(storage.foldername(name))[1] = (select auth.jwt()->>'sub')` or to their own rows with `owner_id`. Service keys bypass RLS entirely and are described as being for trusted server-side clients only. On the upload call itself, a plain `upload` does not overwrite: the default behaviour is a `400 Asset Already Exists` error, and `upsert: true` or the `x-upsert` header changes that. The standard upload path is recommended for files up to 6MB and supports up to 5GB, with resumable TUS uploads suggested above 6MB. Correction to the lead: the bucket does exist, but not in a file called migration 0002. There is no numbered migration in this repo; the bucket is created in `supabase/migrations/20260919000100_articles_native.sql`, the second of two files, both dated 2026-09-19.

## Implies for Dialecta

- The claim that nothing has written to `article-media` holds, and the reason is in the migration. It creates the bucket public and adds one policy, `article media is public to read`, which is `for select` only. There is no insert policy, so no client can upload today.
- A-10 therefore needs a migration before it needs a route handler. That migration is `migrator` work, not builder work, and the boundary is worth naming in the handoff rather than discovering mid-item.
- The migration comment already names the intended design, signed upload URLs issued by a server action to the article's author. That keeps the service key on the server and gives the browser a scoped, expiring credential instead of a general insert policy.
- Uploading with the service role key from a route handler would work and would skip RLS entirely, which makes the route handler the only thing standing between a contributor and the whole bucket. The signed URL path is the one the migration anticipates.
- A-10 stores images for articles, so `upsert` matters for an autosaved draft that re-uploads the same filename. Without it the second save returns 400 rather than replacing the asset.

*Filed 2026-09-19*
