/**
 * What this page cannot read, and why.
 *
 * This is a copy of a database fact, which the house rule says to avoid, and
 * the reason it exists anyway: the anon role cannot read pg_policy or the
 * privilege functions through PostgREST, so the page has no way to ask. The
 * original is the database; the queries that produced this map were
 * has_table_privilege and has_column_privilege for anon and authenticated, and
 * pg_get_expr over pg_policy, run on mguulnibvzusfvyuowwh at MEASURED_AT.
 *
 * What keeps the copy honest is the probe. Every load asks each entry for one
 * value and a count, and an entry that answers differently from this map is
 * flagged on the page. It has already earned its place: the first version of
 * this map listed profiles as closed outright, from has_table_privilege alone
 * plus an information_schema.column_privileges read that returned nothing,
 * because information_schema only shows grants the reading role is party to
 * and the MCP reads as supabase_read_only_user. On its first load the page
 * reported that profiles returned 14 rows. has_column_privilege showed why:
 * migration 20260920192954 re-granted 39 of the 42 columns.
 *
 * The probe catches a closed entry that starts returning rows, which is both a
 * stale map and possibly an exposure. It cannot tell a closed table from an
 * empty one.
 */
import type { Failure, Loaded } from './measure';

export const MEASURED_AT = '2026-09-21 04:30 UTC';

/** Postgres insufficient_privilege, which PostgREST passes through for a missing grant. */
const INSUFFICIENT_PRIVILEGE = '42501';

/**
 * columns: the table is readable but these columns are not granted.
 * policyFalse: the read policy is USING (false).
 * serviceOnly: the only read policy names service_role.
 */
export type Closure = 'columns' | 'policyFalse' | 'serviceOnly';

export interface ClosedEntry {
  table:
    | 'profiles'
    | 'classifications'
    | 'axis_events'
    | 'share_events'
    | 'celebration_events'
    | 'tier_nominations'
    | 'fp_snapshots'
    | 'aspirations';
  closure: Closure;
  /** What the probe selects. For a column closure, the withheld column itself. */
  probeColumn: string;
  /** The live policy or grant, verbatim where it came from pg_get_expr. */
  detail: string;
}

export const CLOSED: readonly ClosedEntry[] = [
  {
    table: 'profiles',
    closure: 'columns',
    probeColumn: 'ghost_member_id',
    detail: 'SELECT on 39 of 42 columns; ghost_member_id, gifted_by_member_id and user_id withheld',
  },
  { table: 'classifications', closure: 'policyFalse', probeColumn: 'id', detail: 'classifications_service_only USING (false)' },
  { table: 'axis_events', closure: 'policyFalse', probeColumn: 'id', detail: 'axis_events_service_only USING (false)' },
  { table: 'share_events', closure: 'policyFalse', probeColumn: 'id', detail: 'share_events_service_only USING (false)' },
  {
    table: 'celebration_events',
    closure: 'serviceOnly',
    probeColumn: 'id',
    detail: 'celebration_events_service_role_all TO service_role USING (true)',
  },
  { table: 'tier_nominations', closure: 'policyFalse', probeColumn: 'id', detail: 'tier_nominations_service_only USING (false)' },
  { table: 'fp_snapshots', closure: 'policyFalse', probeColumn: 'id', detail: 'fp_snapshots_service_only USING (false)' },
  { table: 'aspirations', closure: 'policyFalse', probeColumn: 'id', detail: 'aspirations_service_only USING (false)' },
];

export type Verdict = { kind: 'holds' } | { kind: 'opened'; rows: number } | { kind: 'changed'; detail: string };

/**
 * A withheld column should fail with 42501. A false or service-only policy
 * should succeed with a count of 0. Anything else means the map no longer
 * describes the table.
 */
export function verdict(entry: ClosedEntry, probe: Loaded<number>): Verdict {
  if (entry.closure === 'columns') {
    if (!probe.ok) {
      return probe.failure.code === INSUFFICIENT_PRIVILEGE ? { kind: 'holds' } : { kind: 'changed', detail: describe(probe.failure) };
    }
    return { kind: 'opened', rows: probe.value };
  }
  if (!probe.ok) return { kind: 'changed', detail: describe(probe.failure) };
  return probe.value > 0 ? { kind: 'opened', rows: probe.value } : { kind: 'holds' };
}

function describe(f: Failure): string {
  return f.code ? `${f.code}, ${f.message}` : f.message;
}
