# Supabase Storage: the 6MB line between standard and resumable (TUS) uploads

**Source:** Supabase Docs, "Resumable Uploads",
https://supabase.com/docs/guides/storage/uploads/resumable-uploads (read 2026-09-20)

## Summary

Supabase recommends standard uploads only up to 6MB. Above that, or whenever the network is
unreliable enough that progress and resumability matter, uploads go through the open TUS protocol
instead. TUS chunk size is fixed at 6MB, and the docs state it in the imperative, "it must be set
to 6MB (for now) do not change it," which reads as a server-side constraint rather than a tunable
default. A TUS upload session's URL stays valid for 24 hours; past that, the client starts a new
upload rather than resuming the old one. For throughput, Supabase's guidance is to hit the
project's dedicated storage hostname (`https://<project-id>.storage.supabase.co`) rather than the
general project URL. The client side needs a TUS-speaking library, `tus-js-client` for plain JS or
Uppy with its TUS plugin for a prebuilt multi-framework upload UI; there is no bare-fetch path for
the resumable case the way there is for a standard upload. The page says nothing about Next.js
Route Handler specifics, body size limits, or streaming; that gap is carried forward rather than
resolved here.

## Implies for Dialecta

- A-10's TipTap editor uploads images to `article-media`. A single size check at the point of
  upload has to branch to a different code path, not a different option on the same call: standard
  and TUS uploads are different client APIs, not a flag on one function.
- Whichever image pipeline A-10 builds needs `tus-js-client` (or Uppy) as an actual new dependency
  if any article image can plausibly exceed 6MB; neither is in `apps/web/package.json` today.
- Untested assumption worth flagging before A-10 is scoped: whether a Next.js Route Handler placed
  in front of a TUS upload, if one is interposed rather than uploading straight from the browser to
  Supabase, needs its own body-size-limit configuration is not answered by the Supabase docs and
  has not been checked against Next.js's own. Carried to the reading list as a new lead.

*Filed 2026-09-20*
