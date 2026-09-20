-- Migration 026b: correct the signature_font default + backfill.
--
-- The 026 migration set the default to 'Pinyon Script' based on a stale
-- comment in page-pact.hbs. The page actually renders signatures in
-- Mrs Saint Delafield. Fix the default and backfill any rows that picked
-- up the wrong default before the picker UI shipped (i.e., everyone).

ALTER TABLE public.profiles
  ALTER COLUMN signature_font SET DEFAULT 'Mrs Saint Delafield';

UPDATE public.profiles
   SET signature_font = 'Mrs Saint Delafield'
 WHERE signature_font = 'Pinyon Script';
