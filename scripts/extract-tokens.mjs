#!/usr/bin/env node
/**
 * Regenerates apps/web/src/styles/tokens.css from design/dialecta-design-spec.html.
 *
 * The design spec is canonical (CLAUDE.md, "Visual language"). This script copies
 * its :root custom property block(s) verbatim, plus the canonical body background,
 * so the web app never carries hand-typed token values.
 *
 * Usage, from the repo root:
 *   node scripts/extract-tokens.mjs            # writes the file
 *   node scripts/extract-tokens.mjs --check    # exit 1 if the file is stale
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const specPath = resolve(root, 'design/dialecta-design-spec.html');
const outPath = resolve(root, 'apps/web/src/styles/tokens.css');

const html = readFileSync(specPath, 'utf8');

const versionMatch = html.match(/Design Specification v([\d.]+)/);
const version = versionMatch ? `v${versionMatch[1]}` : 'unknown version';

// Every top-level `:root { ... }` block inside <style>. The spec has no nested braces
// in these blocks, so a non-greedy match to the first closing brace is exact.
const rootBlocks = [...html.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]);
if (rootBlocks.length === 0) {
  console.error(`No :root block found in ${specPath}`);
  process.exit(1);
}

// The canonical page background lives on the body rule, not in :root. Lift the
// background value out so the app can use it as a token.
const bodyMatch = html.match(/body\s*\{[^}]*?background:\s*([^;]+);/);
const bodyBackground = bodyMatch ? bodyMatch[1].trim() : null;

function tidy(block) {
  return block
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
    // The spec's inline comments use em dashes. Property values never do, so this
    // only touches prose and keeps the repo free of em dashes (Editorial Voice).
    .replace(/\s\u2014\s/g, ', ')
    .replace(/\u2014/g, ',');
}

const header = `/*
 * GENERATED FILE. Do not edit by hand.
 * Source: design/dialecta-design-spec.html (${version}), the canonical style guide.
 * Regenerate from the repo root with:
 *   node scripts/extract-tokens.mjs
 * (also available as: npm run tokens)
 */
`;

const rootCss = rootBlocks.map((b) => `:root {\n${tidy(b)}\n}`).join('\n\n');

const extra = bodyBackground
  ? `\n\n/* Canonical page background, lifted from the spec's body rule. */\n:root {\n  --page-background: ${bodyBackground};\n}`
  : '';

const output = `${header}\n${rootCss}${extra}\n`;

if (process.argv.includes('--check')) {
  const current = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';
  if (current !== output) {
    console.error(`${outPath} is stale. Run: node scripts/extract-tokens.mjs`);
    process.exit(1);
  }
  console.log('tokens.css is current');
} else {
  writeFileSync(outPath, output);
  console.log(`Wrote ${outPath} (${rootBlocks.length} :root block(s), ${version})`);
}
