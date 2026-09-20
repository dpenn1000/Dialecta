# Live storage surface

**Source:** This agent, measuring Supabase project `mguulnibvzusfvyuowwh` on 2026-09-20 with
read-only queries against `storage.buckets`, `storage.objects`, `pg_policies` and
`has_table_privilege`. Nothing was uploaded and no object was fetched.

## What exists

One bucket, `feedback-screenshots`. It is `public = true`, carries a 5,242,880 byte size limit and
an allowed MIME list of `image/png`, `image/jpeg`, `image/jpg`, `image/gif`, `image/webp`, and holds
zero objects. Migration `021_feedback_screenshots_bucket.sql` in the deployed `dialecta-api` tree is
where it comes from.

`article-media` does not exist. The reading list entry for this lead assumed it did, on the basis
that migration 0002 in `C:\Dialecta\supabase\migrations` creates it. That migration has never been
applied to the live project, which is the same fact root `CLAUDE.md` records about the two September
migrations generally. The lead was written from the repository rather than from the database. The
bucket to reason about is `feedback-screenshots`.

## What the controls are

`storage.objects` has RLS enabled, `FORCE` off, and zero policies. `storage.buckets` is the same.
With RLS on and no policy, every command is denied for any role without `bypassrls`, so an upload,
an update or a delete with the publishable key fails, and so does a select through PostgREST.

`anon` nonetheless holds SELECT, INSERT, UPDATE and DELETE grants on both `storage.objects` and
`storage.buckets`. This is the same absent defense in depth measured on the `public` schema in
`2026-live-grant-and-policy-surface.md`. The first permissive storage policy anyone writes lands on
an already open grant. On `storage.buckets` that includes INSERT, so a policy written carelessly
there would let a caller create buckets, not just objects.

The bucket being `public = true` is a separate control path and it does not consult RLS. Supabase
serves objects in a public bucket from `/storage/v1/object/public/<bucket>/<path>` with no
authorization check. For this bucket the two facts combine as follows: nobody can put an object in
with the publishable key, and anybody at all can read an object that is in, if they know or can
guess its path.

## Implies for Dialecta

- Exposure today is zero, because the bucket is empty. Rank this as a note rather than a blocker,
  per the mandate's rule about what is reachable today.
- It stops being zero on the first upload. The bucket exists to hold feedback screenshots, and a
  screenshot is whatever happened to be on the contributor's screen, which is the least predictable
  PII source on the platform. A public bucket is the wrong default for it. The fix is to set
  `public = false` and serve through signed URLs, and it is cheapest now, before anything is stored
  and before any URL is in circulation.
- The writing path will be `api/admin/feedback.js` or its unenumerated `api/admin/feedback/`
  subtree, both in the deployed `dialecta-api`. Those handlers use `SUPABASE_SERVICE_KEY`, which
  carries `bypassrls`, so the empty policy set will not stop them and does not indicate that
  uploads are impossible. Read those handlers before concluding anything about who can cause an
  upload.
- Path guessability is the whole control on a public bucket. If the writer names objects by
  feedback id or by sequence, the set is enumerable. If it names them with a random component, it
  is not. That is a property of the handler, not of the bucket, and it is unread.
- Re-measure `storage.objects` policy count on any migration that touches storage. Zero policies is
  currently doing the work that a deliberate policy should do, and zero is indistinguishable from
  nobody having gotten to it yet.

*Filed 2026-09-20*
