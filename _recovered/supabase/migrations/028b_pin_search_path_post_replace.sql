-- Migration 028b: re-pin search_path on initialise_contributor_axes
--
-- Migration 028 set search_path = '' on three functions, then used
-- CREATE OR REPLACE to rewrite initialise_contributor_axes with
-- qualified references. CREATE OR REPLACE resets per-function settings
-- unless they are baked into the new definition, so the search_path
-- pin was wiped on that function. The other two functions
-- (set_updated_at, quotes_set_updated_at) were not rewritten and
-- retain their pinned search_path from 028.
--
-- Fix: re-apply SET search_path = ''.

ALTER FUNCTION public.initialise_contributor_axes(text) SET search_path = '';
