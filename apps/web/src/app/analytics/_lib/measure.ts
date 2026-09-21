/**
 * Reading rows without silently losing any.
 *
 * PostgREST caps a response at its max-rows setting, 1,000 on Supabase by
 * default, and returns the first page with no error. At the scale this page
 * has to survive (1,400 contributors is 8,400 axis_scores rows), an unpaged
 * select would drop 88% of the engine's input and still render. So every row
 * read pages through .range() on a stable order, keeps the exact count from
 * the first page, and reports truncation instead of hiding it.
 */
import type { PostgrestError } from '@supabase/supabase-js';

export const PAGE_SIZE = 1000;
export const ROW_CEILING = 50_000;
const RANGE_NOT_SATISFIABLE = 'PGRST103';

export interface Failure {
  code: string | null;
  message: string;
}

export type Loaded<T> = { ok: true; value: T } | { ok: false; failure: Failure };

export interface RowSet {
  rows: unknown[];
  /** Exact count from the database, or the rows read when the count is unavailable. */
  total: number;
  truncated: boolean;
}

interface PageResponse {
  data: unknown[] | null;
  error: PostgrestError | null;
  count: number | null;
}

export function toFailure(error: PostgrestError): Failure {
  return { code: error.code || null, message: error.message || 'no message returned' };
}

/**
 * page(from, to) must build a fresh query ordered by a unique column and ask
 * for count: 'exact'. Pages advance by the rows actually returned, so a server
 * cap below PAGE_SIZE still reads everything.
 */
export async function readAll(page: (from: number, to: number) => PromiseLike<PageResponse>): Promise<Loaded<RowSet>> {
  const rows: unknown[] = [];
  let total: number | null = null;
  let from = 0;
  while (from < ROW_CEILING) {
    const to = Math.min(from + PAGE_SIZE, ROW_CEILING) - 1;
    const { data, error, count } = await page(from, to);
    // PGRST103 is PostgREST's "requested range not satisfiable". After the
    // first page it means rows were deleted mid-read, which ends the read.
    if (error && from > 0 && error.code === RANGE_NOT_SATISFIABLE) break;
    if (error) return { ok: false, failure: toFailure(error) };
    if (from === 0) total = count;
    const batch = data ?? [];
    if (batch.length === 0) break;
    rows.push(...batch);
    from += batch.length;
    if (total !== null && rows.length >= total) break;
  }
  const known = total ?? rows.length;
  return { ok: true, value: { rows, total: known, truncated: rows.length < known } };
}

/** A count with no rows attached. */
export async function countOnly(
  query: PromiseLike<{ error: PostgrestError | null; count: number | null }>,
): Promise<Loaded<number>> {
  const { error, count } = await query;
  if (error) return { ok: false, failure: toFailure(error) };
  if (count === null) return { ok: false, failure: { code: null, message: 'the database returned no count' } };
  return { ok: true, value: count };
}

/** A query that is already bounded, such as a limit(1), read as one set. */
export async function readBounded(query: PromiseLike<PageResponse>): Promise<Loaded<RowSet>> {
  const { data, error } = await query;
  if (error) return { ok: false, failure: toFailure(error) };
  const rows = data ?? [];
  return { ok: true, value: { rows, total: rows.length, truncated: false } };
}
