// Builds a local embedding index over council/*/research/*.md.
// Output: tools/local-research/.index/index.json
//   { version, model, builtAt, files: { [relPath]: { mtimeMs, size } }, chunks: [{ advisor, file, chunk, text, vector }] }
// Incremental: files whose mtime and size match the stored record are not re-embedded.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { embed, EMBED_MODEL } from './ollama.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(process.env.DIALECTA_ROOT || path.join(HERE, '..', '..'));
export const INDEX_DIR = path.join(HERE, '.index');
export const INDEX_FILE = path.join(INDEX_DIR, 'index.json');
export const CHUNK_SIZE = 800;
const INDEX_VERSION = 1;

/** Splits text into chunks of roughly CHUNK_SIZE characters on paragraph boundaries. */
export function chunkText(text, size = CHUNK_SIZE) {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = [];
  let current = '';
  for (const p of paragraphs) {
    if (p.length > size * 1.5) {
      // A single oversized paragraph: flush what we have, then split it on sentence ends.
      if (current) { chunks.push(current); current = ''; }
      let piece = '';
      for (const sentence of p.split(/(?<=[.!?])\s+/)) {
        if (piece && piece.length + sentence.length + 1 > size) { chunks.push(piece); piece = ''; }
        piece = piece ? `${piece} ${sentence}` : sentence;
      }
      if (piece) chunks.push(piece);
      continue;
    }
    if (current && current.length + p.length + 2 > size) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Lists research markdown files as { advisor, rel, abs } excluding each advisor's index.md. */
export async function listResearchFiles(root = ROOT) {
  const councilDir = path.join(root, 'council');
  const out = [];
  let advisors = [];
  try {
    advisors = (await fs.readdir(councilDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return out;
  }
  for (const advisor of advisors) {
    const dir = path.join(councilDir, advisor, 'research');
    let entries = [];
    try { entries = await fs.readdir(dir); } catch { continue; }
    for (const name of entries.sort()) {
      if (!name.endsWith('.md') || name.toLowerCase() === 'index.md') continue;
      const abs = path.join(dir, name);
      out.push({ advisor, rel: path.relative(root, abs).split(path.sep).join('/'), abs });
    }
  }
  return out;
}

export async function loadIndex() {
  try {
    const data = JSON.parse(await fs.readFile(INDEX_FILE, 'utf8'));
    if (data && data.version === INDEX_VERSION && Array.isArray(data.chunks)) return data;
  } catch {
    // missing or unreadable index
  }
  return null;
}

export async function indexStats() {
  try {
    const st = await fs.stat(INDEX_FILE);
    const data = await loadIndex();
    return {
      exists: true,
      chunks: data ? data.chunks.length : 0,
      files: data ? Object.keys(data.files).length : 0,
      model: data ? data.model : null,
      builtAt: data ? data.builtAt : null,
      ageMs: Date.now() - st.mtimeMs,
    };
  } catch {
    return { exists: false, chunks: 0, files: 0, model: null, builtAt: null, ageMs: null };
  }
}

/**
 * Builds or refreshes the index. Returns { indexed, skipped, removed, chunks }.
 * Pass { force: true } to re-embed everything (needed after changing the embed model).
 */
export async function buildIndex({ force = false, log = () => {} } = {}) {
  const previous = (!force && (await loadIndex())) || null;
  const sameModel = previous && previous.model === EMBED_MODEL;
  const prevFiles = sameModel ? previous.files : {};
  const prevChunks = sameModel ? previous.chunks : [];

  const files = await listResearchFiles();
  const next = { version: INDEX_VERSION, model: EMBED_MODEL, builtAt: new Date().toISOString(), files: {}, chunks: [] };
  let indexed = 0;
  let skipped = 0;

  for (const f of files) {
    const st = await fs.stat(f.abs);
    const record = { mtimeMs: st.mtimeMs, size: st.size };
    const prev = prevFiles[f.rel];
    if (prev && prev.mtimeMs === record.mtimeMs && prev.size === record.size) {
      next.files[f.rel] = record;
      next.chunks.push(...prevChunks.filter((c) => c.file === f.rel));
      skipped += 1;
      continue;
    }
    const text = await fs.readFile(f.abs, 'utf8');
    const pieces = chunkText(text);
    if (pieces.length === 0) { next.files[f.rel] = record; continue; }
    log(`embedding ${f.rel} (${pieces.length} chunks)`);
    const vectors = await embed(pieces);
    pieces.forEach((piece, i) => {
      next.chunks.push({ advisor: f.advisor, file: f.rel, chunk: i, text: piece, vector: vectors[i] });
    });
    next.files[f.rel] = record;
    indexed += 1;
  }

  const removed = Object.keys(prevFiles).filter((rel) => !(rel in next.files)).length;
  await fs.mkdir(INDEX_DIR, { recursive: true });
  await fs.writeFile(INDEX_FILE, JSON.stringify(next));
  return { indexed, skipped, removed, chunks: next.chunks.length, files: files.length };
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) {
  const force = process.argv.includes('--force');
  buildIndex({ force, log: (m) => console.error(m) })
    .then((r) => {
      console.log(`Indexed ${r.indexed} file(s), skipped ${r.skipped} unchanged, removed ${r.removed}. ${r.chunks} chunks from ${r.files} files.`);
      console.log(`Wrote ${INDEX_FILE}`);
    })
    .catch((err) => {
      console.error(`ERROR: ${err.message}`);
      process.exit(1);
    });
}
