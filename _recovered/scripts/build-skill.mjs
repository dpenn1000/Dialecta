/**
 * scripts/build-skill.mjs
 *
 * Bundles skills/<name>/SKILL.md into api/_skills/<name>.js as a JS string
 * export so the skill content travels with the Vercel function deployment.
 * The .md file remains the human-editable source of truth; the .js wrapper
 * is generated and should not be hand-edited.
 *
 * Usage:
 *   node scripts/build-skill.mjs                     # all skills
 *   node scripts/build-skill.mjs opinion-mapper      # one skill
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const SKILLS_DIR = path.resolve(ROOT, 'skills');
const OUT_DIR    = path.resolve(ROOT, 'api', '_skills');

const args = process.argv.slice(2);
const onlyName = args[0] || null;

if (!fs.existsSync(SKILLS_DIR)) {
  console.error('skills/ directory not found at', SKILLS_DIR);
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function camelCaseName(name) {
  return name.split(/[-_]/).map((p, i) =>
    i === 0 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1).toUpperCase()
  ).join('_');
}

const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .filter((d) => !onlyName || d.name === onlyName)
  .map((d) => d.name);

if (dirs.length === 0) {
  console.error('No skill directories found' + (onlyName ? ` matching "${onlyName}"` : ''));
  process.exit(1);
}

for (const name of dirs) {
  const mdPath = path.resolve(SKILLS_DIR, name, 'SKILL.md');
  if (!fs.existsSync(mdPath)) {
    console.warn(`skip ${name}: no SKILL.md`);
    continue;
  }
  const content    = fs.readFileSync(mdPath, 'utf8');
  const constName  = camelCaseName(name) + '_SKILL';
  const outPath    = path.resolve(OUT_DIR, name + '.js');
  const header     = `// AUTO-GENERATED from skills/${name}/SKILL.md. Do not edit directly.\n// Edit the markdown source then run \`node scripts/build-skill.mjs ${name}\`\n// to regenerate this wrapper.\n\n`;
  const body       = `export const ${constName} = ${JSON.stringify(content)};\n`;
  fs.writeFileSync(outPath, header + body);
  console.log(`built ${name}: ${content.length} chars → ${path.relative(ROOT, outPath)}`);
}
