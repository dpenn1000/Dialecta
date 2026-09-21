-- A one-time claim token for Dan's own profile (dpenn1000), issued with
-- scripts/issue-claim-token.mjs on 2026-09-21 at his request (audit item 2.1).
-- Only the sha256 hash is stored; the raw token went to Dan directly. It
-- expires after 24 hours and is spent by the first successful claim.
insert into public.profile_claim_tokens (profile_id, token_hash, expires_at)
values (
  (select id from public.profiles where handle = lower('dpenn1000')),
  'd670c0c95fdd89ea359948ba9dcd119384ec37daab4ed9af4938228ab1012aff',
  '2026-09-22T15:03:43.276Z'
);
