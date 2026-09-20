// The roster, derived from disk, so there is exactly one of it.
//
// Four files carried their own copy until 2026-09-20 and two of them were wrong. The local
// research server's list said treasurer, designer, philosopher and had never been updated for
// security or legal, let alone for the working bench, so `research_file` refused eight of eleven
// seats and `research_search` could filter to three. The index underneath had been covering
// every seat the whole time. Nobody noticed until a builder sprint reported that the tool would
// not accept its own name, and went to the web instead.
//
// Adding `circulation` the same day meant editing four lists again, which is when a fifth would
// have been missed. So the list is now the filesystem: a seat exists because its folder exists.
// A new seat is created by making its directory, and no consumer can drift from another.
//
// A seat is a directory under council/ or team/ holding a charter.md or a brief.md. That rules
// out council/log/, which is a debate archive rather than a seat, without needing a deny list
// that would itself have to be maintained.

import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** @type {{bench:'advisory'|'working', dir:string, notes:string, standing:string, noun:string, blurb:string}[]} */
const BENCH_SPEC = [
  {
    bench: 'advisory',
    dir: 'council',
    notes: 'research',
    standing: 'positions.md',
    noun: 'position',
    blurb: 'Advisors hold positions, argue them, and write no code. A position is contested by design.',
  },
  {
    bench: 'working',
    dir: 'team',
    notes: 'knowledge',
    standing: 'practices.md',
    noun: 'practice',
    blurb: 'Practitioners do the work and hold practices. A practice is settled until evidence moves it.',
  },
];

function seatsIn(dir) {
  const base = join(ROOT, dir);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((n) => existsSync(join(base, n, 'charter.md')) || existsSync(join(base, n, 'brief.md')))
    .sort();
}

export const BENCHES = Object.fromEntries(
  BENCH_SPEC.map((b) => [b.bench, { ...b, seats: seatsIn(b.dir) }]),
);

export const COUNCIL = BENCHES.advisory.seats;
export const TEAM = BENCHES.working.seats;
export const ALL = [...COUNCIL, ...TEAM];

/** seat name -> the path its notes live at, relative to the repo root. */
export const SEATS = Object.fromEntries(
  BENCH_SPEC.flatMap((b) => seatsIn(b.dir).map((n) => [n, `${b.dir}/${n}/${b.notes}`])),
);

/** Which bench a seat sits on, or null if the name is not a seat. */
export const benchOf = (name) =>
  COUNCIL.includes(name) ? 'advisory' : TEAM.includes(name) ? 'working' : null;
