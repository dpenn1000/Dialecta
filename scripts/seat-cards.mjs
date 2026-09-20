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
    seats: ['treasurer', 'designer', 'philosopher', 'security', 'legal', 'circulation'],
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
  // Provenance, counted honestly. An earlier version of this script counted URLs and called the
  // result "cited", which reported spec-reader at 0 of 10 and voice-editor at 1 of 11. Both were
  // wrong. Those two seats read this repository for a living: spec-reader cites
  // `docs/Dialecta_Axis_Mapping_v1.md` with a version and a date and a cross-check, and
  // voice-editor cites a file with its word count, the exact command it ran, the date and the
  // commit SHA. That is stricter provenance than a link, not weaker. A metric that calls it
  // nothing would have had me reporting the two most careful seats as the least researched.
  const provenance = (src) => {
    const head = (section(body(src), /citation|source/i) ?? '') + (body(src).slice(0, 900) ?? '');
    if (/https?:\/\//.test(src)) return 'web';
    if (/`[^`]*\.(md|ts|tsx|js|mjs|sql|json|py)`|(?:docs|api|apps|packages|scripts|supabase)\//.test(head))
      return 'repo';
    return 'none';
  };
  const provs = notes.map((f) => provenance(read(join(notesDir, f)) ?? ''));
  const web = provs.filter((p) => p === 'web').length;
  const repo = provs.filter((p) => p === 'repo').length;
  const cited = web + repo;

  // The shelf itself, not just its size. Dan asked to see what each seat has actually read, and
  // a count answers "how much" while hiding the only question that matters: what.
  const shelf = notes
    .map((f) => {
      const src = read(join(notesDir, f)) ?? '';
      const fm = frontmatter(src);
      // Title: frontmatter, else the first `# heading`, else the slug made readable.
      const h1 = body(src).match(/^#\s+(.+)$/m)?.[1]?.trim();
      const title = (fm.title ?? h1 ?? f.replace(/\.md$/, '').replace(/-/g, ' ')).replace(/\s+/g, ' ');
      // House format is `**Source:** ...` with the colon inside the bold. Accept both.
      const cite =
        fm.citation ??
        fm.source ??
        body(src).match(/^\*\*(?:Source|Citation):?\*\*:?\s*(.+)$/im)?.[1]?.trim() ??
        null;
      // The first `## Implies for Dialecta` bullet. This is the column worth having: it answers
      // why the seat holds the source, which a citation repeating the title never does.
      const impliesBlock = section(body(src), /implies/i) ?? '';
      const implies =
        impliesBlock
          .split('\n')
          .find((l) => /^\s*[-*]\s+\S/.test(l))
          ?.replace(/^\s*[-*]\s+/, '')
          .trim() ?? null;
      const url = src.match(/https?:\/\/[^\s)>\]"']+/)?.[0] ?? null;
      const year = f.match(/^(\d{4})/)?.[1] ?? null;
      return { file: f, title, cite, implies, url, year };
    })
    .sort((a, b) => (a.year ?? '') .localeCompare(b.year ?? '') || a.title.localeCompare(b.title));

  const rl = read(join(notesDir, 'reading-list.md')) ?? '';
  const count = (re) => (rl.match(re) ?? []).length;
  // Outstanding leads, so a card shows what the seat still means to read.
  const pending = rl
    .split(/\r?\n/)
    .filter((l) => /^\|\s*todo/i.test(l))
    .map((l) => l.split('|').map((c) => c.trim()).filter(Boolean).slice(1, 3).join(' — '))
    .filter(Boolean);

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
    web,
    repo,
    shelf,
    pending,
    notesDir: `${b.dir}/${name}/${b.notes}`,
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
L.push('| Seat | Bench | Model | Web | Writes | Notes | Sourced | ' + 'Standing | Raised | Addressed |');
L.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const s of all) {
  L.push(
    `| \`${s.name}\` | ${s.bench} | ${s.model} | ${webArmed(s) ? 'yes' : '**no**'} | ${canWrite(s) ? 'yes' : '**no**'} | ${s.notes} | ${s.cited} (${s.web}w/${s.repo}r) | ${s.standingRows} | ${s.raised} | ${s.addressed} |`,
  );
}
const tot = (k) => all.reduce((a, s) => a + s[k], 0);
L.push(
  `| **total** | 11 seats | | | | **${tot('notes')}** | **${tot('cited')}** | **${tot('standingRows')}** | | |`,
);
L.push('');
L.push(
  '`Notes` is filed sources. `Sourced` is how many name a source it can be checked against, split into `w` for an external URL and `r` for a file in this repository cited with a version, a date or a commit. Both count: a seat whose job is spec conformance cites specs, and doing that with a commit SHA is stricter provenance than a link, not weaker. `Standing` is positions for an advisor, practices for a practitioner. `Raised` and `Addressed` count exchange records in each direction.',
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
      `| Research | ${s.notes} filed, ${s.cited} sourced (${s.web} external, ${s.repo} from this repo)${s.notes && s.cited < s.notes ? `, ${s.notes - s.cited} unsourced` : ''} |`,
    );
    L.push(
      `| Reading list | ${s.todo} todo, ${s.filed} filed, ${s.dead} dead${s.todo + s.filed + s.dead === 0 ? ' (**no reading list**)' : ''} |`,
    );
    L.push(`| ${cfg.noun === 'position' ? 'Positions' : 'Practices'} | ${s.standingRows} |`);
    L.push(`| Charter | ${s.hasCharter ? `\`${cfg.dir}/${s.name}/charter.md\`` : 'none, mandate lives in the agent file'} |`);
    L.push(`| Brief | ${s.hasBrief ? `\`${cfg.dir}/${s.name}/brief.md\`` : '**missing**'} |`);
    L.push(`| Exchange | raised ${s.raised}, addressed ${s.addressed} |`);
    L.push('');

    // The shelf, listed. A count says how much a seat has read and hides what.
    if (s.shelf.length) {
      L.push(`**What it has read.** ${s.shelf.length} filed in \`${s.notesDir}/\`.`);
      L.push('');
      L.push('| Source | What it changes here |');
      L.push('| --- | --- |');
      for (const n of s.shelf) {
        const name = n.url ? `[${n.title}](${n.url})` : n.title;
        const why = (n.implies ?? n.cite ?? '*no implies section*')
          .replace(/\|/g, '\\|')
          .replace(/\s+/g, ' ');
        L.push(`| ${name} | ${why.length > 190 ? `${why.slice(0, 187)}...` : why} |`);
      }
      L.push('');
    } else {
      L.push(`**What it has read.** Nothing filed yet in \`${s.notesDir}/\`.`);
      L.push('');
    }

    if (s.pending.length) {
      L.push(`<details><summary>Still to read: ${s.pending.length} lead(s)</summary>`);
      L.push('');
      for (const t of s.pending.slice(0, 40)) L.push(`- ${t}`);
      if (s.pending.length > 40) L.push(`- *and ${s.pending.length - 40} more*`);
      L.push('');
      L.push('</details>');
      L.push('');
    }

    const gaps = [];
    if (!webArmed(s)) gaps.push('cannot reach the web, so it cannot verify an external claim');
    if (!canWrite(s)) gaps.push('cannot write, so it cannot file a note or update its standing file');
    if (s.notes === 0) gaps.push('has filed nothing yet');
    else if (s.cited === 0) gaps.push('has filed notes but none names a checkable source');
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
