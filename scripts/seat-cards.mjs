#!/usr/bin/env node
// Generate docs/COUNCIL.md: one card per seat, from the seat's own files.
//
//   node scripts/seat-cards.mjs            write docs/COUNCIL.md
//   node scripts/seat-cards.mjs --check    exit 1 if the file on disk is stale
//
// Why generated rather than written. A hand-written roster is accurate for about a day. Every
// number here moves when a seat runs a sprint, files a record or concedes a position, and a
// document that quietly stops matching the repository is worse than no document, because it
// still reads as true.
//
// Nothing in a card is this script's opinion. The mandate, the boundary and the working rules
// are the seat's own words, lifted from its agent definition and charter. The counts are
// measured. Where a seat has not written something, the card says so rather than filling in.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'COUNCIL.md');
const CHECK = process.argv.includes('--check');

const BENCHES = {
  advisory: {
    seats: ['treasurer', 'designer', 'philosopher', 'security', 'legal'],
    dir: 'council',
    notes: 'research',
    standing: 'positions.md',
    noun: 'position',
    blurb:
      'Advisors hold positions, argue them, and write no code. A position is contested by design.',
  },
  working: {
    seats: ['builder', 'reviewer', 'voice-editor', 'migrator', 'spec-reader', 'decider'],
    dir: 'team',
    notes: 'knowledge',
    standing: 'practices.md',
    noun: 'practice',
    blurb:
      'Practitioners do the work and hold practices. A practice is settled until evidence moves it.',
  },
};

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

/** Pull `key: value` out of a leading --- fenced block. */
function frontmatter(src) {
  const m = src?.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

/** Everything after the frontmatter, normalised to \n. */
const body = (src) => (src ? src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').replace(/\r\n/g, '\n') : '');

/** The first real paragraph. This is the seat's mandate in its own words. */
function firstPara(text) {
  for (const block of text.split(/\n\s*\n/)) {
    const t = block.trim();
    if (t && !t.startsWith('#') && !t.startsWith('|') && !t.startsWith('>')) {
      return t.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    }
  }
  return null;
}

/** The body of a named `## heading`, if the seat wrote one. */
function section(text, re) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => /^##\s+/.test(l) && re.test(l));
  if (i === -1) return null;
  const out = [];
  for (let j = i + 1; j < lines.length && !/^##\s+/.test(lines[j]); j++) out.push(lines[j]);
  const t = out.join('\n').trim();
  return t || null;
}

/** Count table rows, skipping the header and the --- separator. */
function rows(src) {
  if (!src) return 0;
  return src
    .split(/\r?\n/)
    .filter(
      (l) =>
        l.startsWith('| ') &&
        !/^\|\s*-/.test(l) &&
        !/^\|\s*(Position|Practice|What|Claim|Rule)\b/i.test(l),
    ).length;
}

function seatData(name, bench) {
  const b = BENCHES[bench];
  const agentSrc = read(join(ROOT, '.claude', 'agents', `${name}.md`));
  const fm = frontmatter(agentSrc);
  const agentBody = body(agentSrc);

  const home = join(ROOT, b.dir, name);
  const charter = read(join(home, 'charter.md'));
  const brief = read(join(home, 'brief.md'));
  const standing = read(join(home, b.standing));

  const notesDir = join(home, b.notes);
  let notes = [];
  if (existsSync(notesDir)) {
    notes = readdirSync(notesDir).filter(
      (f) => f.endsWith('.md') && !['index.md', 'reading-list.md'].includes(f),
    );
  }
  const cited = notes.filter((f) => /https?:\/\//.test(read(join(notesDir, f)) ?? '')).length;

  const rl = read(join(notesDir, 'reading-list.md')) ?? '';
  const count = (re) => (rl.match(re) ?? []).length;

  const ledger = read(join(ROOT, 'exchange', 'ledger.md')) ?? '';
  const raised = ledger.split(/\r?\n/).filter((l) => new RegExp(`\\|\\s*${name}\\s*->`).test(l)).length;
  const addressed = ledger
    .split(/\r?\n/)
    .filter((l) => new RegExp(`->[^|]*\\b${name}\\b`).test(l)).length;

  return {
    name,
    bench,
    model: fm.model ?? 'unset',
    tools: (fm.tools ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    description: fm.description ?? null,
    mandate: firstPara(agentBody),
    stops: section(agentBody, /where you stop|boundar/i),
    how: section(agentBody, /how you work|in debate/i),
    hasCharter: Boolean(charter),
    charterWhy: charter ? section(body(charter), /why|exists|purpose|mandate/i) : null,
    hasBrief: Boolean(brief),
    notes: notes.length,
    cited,
    standingRows: rows(standing),
    todo: count(/^\|\s*todo/gm),
    filed: count(/^\|\s*filed/gm),
    dead: count(/^\|\s*dead/gm),
    raised,
    addressed,
  };
}

const all = [];
for (const [bench, cfg] of Object.entries(BENCHES)) {
  for (const s of cfg.seats) all.push(seatData(s, bench));
}

const webArmed = (s) => s.tools.includes('WebSearch') || s.tools.includes('WebFetch');
const canWrite = (s) => s.tools.includes('Write') || s.tools.includes('Edit');

const L = [];
L.push('# The Council');
L.push('');
L.push(
  `*Generated by \`scripts/seat-cards.mjs\` on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand; edit the seat's own files and regenerate. Every mandate and boundary below is quoted from the seat, not written about it. Vocabulary: \`docs/GLOSSARY.md\`.*`,
);
L.push('');

// Roster table.
L.push('## Roster');
L.push('');
L.push('| Seat | Bench | Model | Web | Writes | Notes | Cited | ' + 'Standing | Raised | Addressed |');
L.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const s of all) {
  L.push(
    `| \`${s.name}\` | ${s.bench} | ${s.model} | ${webArmed(s) ? 'yes' : '**no**'} | ${canWrite(s) ? 'yes' : '**no**'} | ${s.notes} | ${s.cited} | ${s.standingRows} | ${s.raised} | ${s.addressed} |`,
  );
}
const tot = (k) => all.reduce((a, s) => a + s[k], 0);
L.push(
  `| **total** | 11 seats | | | | **${tot('notes')}** | **${tot('cited')}** | **${tot('standingRows')}** | | |`,
);
L.push('');
L.push(
  '`Notes` is filed sources. `Cited` is how many of those carry a URL, which is the honest measure of whether a seat read a primary source or wrote from priors. `Standing` is positions for an advisor, practices for a practitioner. `Raised` and `Addressed` count exchange records in each direction.',
);
L.push('');

for (const [bench, cfg] of Object.entries(BENCHES)) {
  L.push('---');
  L.push('');
  L.push(`## The ${bench} bench`);
  L.push('');
  L.push(`*${cfg.blurb} Files live under \`${cfg.dir}/<seat>/\`.*`);
  L.push('');
  for (const s of all.filter((x) => x.bench === bench)) {
    L.push(`### \`${s.name}\``);
    L.push('');
    if (s.description) {
      L.push(`**What it is for.** ${s.description}`);
      L.push('');
    }
    if (s.mandate) {
      L.push(`**How it understands the job**, in its own words from \`.claude/agents/${s.name}.md\`:`);
      L.push('');
      L.push(`> ${s.mandate}`);
      L.push('');
    }
    if (s.stops) {
      L.push('**Where it stops.**');
      L.push('');
      L.push(
        s.stops
          .split('\n')
          .map((l) => (l.trim() ? `> ${l}` : '>'))
          .join('\n'),
      );
      L.push('');
    }
    L.push('| | |');
    L.push('| --- | --- |');
    L.push(`| Model | ${s.model} |`);
    L.push(`| Tools | ${s.tools.length ? s.tools.map((t) => `\`${t}\``).join(', ') : '**none declared**'} |`);
    L.push(
      `| Research | ${s.notes} filed, ${s.cited} citing a source${s.notes && s.cited < s.notes ? `, ${s.notes - s.cited} without` : ''} |`,
    );
    L.push(
      `| Reading list | ${s.todo} todo, ${s.filed} filed, ${s.dead} dead${s.todo + s.filed + s.dead === 0 ? ' (**no reading list**)' : ''} |`,
    );
    L.push(`| ${cfg.noun === 'position' ? 'Positions' : 'Practices'} | ${s.standingRows} |`);
    L.push(`| Charter | ${s.hasCharter ? `\`${cfg.dir}/${s.name}/charter.md\`` : 'none, mandate lives in the agent file'} |`);
    L.push(`| Brief | ${s.hasBrief ? `\`${cfg.dir}/${s.name}/brief.md\`` : '**missing**'} |`);
    L.push(`| Exchange | raised ${s.raised}, addressed ${s.addressed} |`);
    L.push('');

    const gaps = [];
    if (!webArmed(s)) gaps.push('cannot reach the web, so it cannot verify an external claim');
    if (!canWrite(s)) gaps.push('cannot write, so it cannot file a note or update its standing file');
    if (s.notes === 0) gaps.push('has filed nothing yet');
    else if (s.cited === 0) gaps.push('has filed notes but none cites a source');
    if (!s.hasBrief) gaps.push('has no brief, so a fresh session starts without context');
    if (s.todo > s.filed * 2 && s.todo > 6) gaps.push(`reading list is ${s.todo} todo against ${s.filed} filed`);
    if (gaps.length) {
      L.push(`**Gaps.** ${gaps.join('. ')}.`);
      L.push('');
    }
  }
}

const out = L.join('\n') + '\n';

if (CHECK) {
  const cur = read(OUT);
  const strip = (t) => (t ?? '').replace(/\*Generated by[^\n]*\n/, '');
  if (strip(cur) === strip(out)) {
    process.stdout.write('seat-cards: docs/COUNCIL.md is current\n');
  } else {
    process.stdout.write('seat-cards: docs/COUNCIL.md is STALE. Run: node scripts/seat-cards.mjs\n');
    process.exitCode = 1;
  }
} else {
  writeFileSync(OUT, out, 'utf8');
  process.stdout.write(`seat-cards: wrote docs/COUNCIL.md, ${all.length} seats, ${out.split('\n').length} lines\n`);
  const unarmed = all.filter((s) => !webArmed(s) || !canWrite(s));
  if (unarmed.length) {
    process.stdout.write(`  WARNING: ${unarmed.length} seat(s) missing tools: ${unarmed.map((s) => s.name).join(', ')}\n`);
  }
}
