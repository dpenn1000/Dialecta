#!/usr/bin/env node
// PreToolUse hook (Edit|Write|MultiEdit): specs under docs/ are hand-tended.
// Blocks edits to docs/*.md except the paths agents are allowed to keep current.
// Override for a deliberate spec session: set SPEC_EDIT=1 in the environment.
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const p = (input.tool_input?.file_path || '').replace(/\\/g, '/');
const rel = p.replace(/^.*?\/Dialecta\//, '');

const allowed = [
  /^docs\/handoffs\//,
  /^docs\/reviews\//,
  /^docs\/plans\//,
  /^docs\/decisions\//,
  /^docs\/Dialecta_Project_Index\.md$/,
];

// Council charters are Dan's mandate statements, same rule as specs.
if (/^council\/[^/]+\/charter\.md$/.test(rel) && process.env.SPEC_EDIT !== '1') {
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: `${rel} is an advisor charter, written by Dan. Advisors change positions.md and research/, not their mandate. SPEC_EDIT=1 to edit deliberately.`,
    }),
  );
  process.exit(0);
}

if (rel.startsWith('docs/') && !allowed.some((r) => r.test(rel)) && process.env.SPEC_EDIT !== '1') {
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason:
        `${rel} is a canonical spec. Specs are edited by Dan in a dedicated session, not by builders. ` +
        `Surface the discrepancy in your report instead. To edit deliberately, start the session with SPEC_EDIT=1.`,
    }),
  );
  process.exit(0);
}
process.exit(0);
