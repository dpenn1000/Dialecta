// MCP server (stdio) that moves research reading, summarizing, embedding, and search
// onto a local Ollama instance. Claude Code picks it up through the repo root .mcp.json.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { embed, generate, isUp, listModels, hasModel, EMBED_MODEL, CHAT_MODEL, OLLAMA_HOST, SETUP_HINT } from './ollama.mjs';
import { buildIndex, loadIndex, indexStats, ROOT, INDEX_FILE } from './index.mjs';

// Every seat, and where each one's notes live. This list said three names until 2026-09-20:
// treasurer, designer, philosopher. It had never been updated for security or legal, and it had
// never known the working bench existed at all, so `research_file` refused eight of eleven seats
// and `research_search` could only filter to three. index.mjs already walked both families, so
// the index held every seat's notes and the tools in front of it could not reach most of them.
// Found when a builder sprint reported that research_file would not accept its own name.
const SEATS = {
  treasurer: 'council/treasurer/research',
  designer: 'council/designer/research',
  philosopher: 'council/philosopher/research',
  security: 'council/security/research',
  legal: 'council/legal/research',
  builder: 'team/builder/knowledge',
  reviewer: 'team/reviewer/knowledge',
  'voice-editor': 'team/voice-editor/knowledge',
  migrator: 'team/migrator/knowledge',
  'spec-reader': 'team/spec-reader/knowledge',
  decider: 'team/decider/knowledge',
};
const ADVISORS = Object.keys(SEATS);
const MAX_FETCH_CHARS = 60_000;

const SUMMARIZE_SYSTEM =
  'Summarize for a research file. Output: Citation line, 5 to 8 sentence summary, ' +
  "then 'Implies for Dialecta:' with 2 to 4 bullets addressing the focus. No em dashes.";

function text(s) {
  return { content: [{ type: 'text', text: String(s) }] };
}

function errorText(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return text(msg.startsWith('ERROR:') ? msg : `ERROR: ${msg}`);
}

/** Wraps a tool handler so failures come back as text starting with "ERROR:" instead of throwing. */
function safe(fn) {
  return async (args, extra) => {
    try {
      return await fn(args || {}, extra);
    } catch (err) {
      return errorText(err);
    }
  };
}

async function requireOllama() {
  if (!(await isUp())) throw new Error(SETUP_HINT);
}

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|br|li|h[1-6]|tr|section|article|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

async function fetchUrlText(url) {
  let res;
  try {
    res = await fetch(url, { headers: { 'user-agent': 'dialecta-local-research/0.1', accept: 'text/html,text/plain,*/*' } });
  } catch (err) {
    throw new Error(`could not fetch ${url}: ${err.message}`);
  }
  if (!res.ok) throw new Error(`fetch ${url} returned ${res.status}`);
  const body = await res.text();
  const type = res.headers.get('content-type') || '';
  const plain = type.includes('html') || /<html[\s>]/i.test(body.slice(0, 2000)) ? stripHtml(body) : body;
  return plain.slice(0, MAX_FETCH_CHARS);
}

function titleFromCitation(citation) {
  // Take the part before the first period that ends a title, or the whole line if short.
  const clean = citation.trim().replace(/\s+/g, ' ');
  const quoted = clean.match(/["“]([^"”]+)["”]/);
  if (quoted) return quoted[1].trim().replace(/[.,;:]$/, '');
  if (clean.length <= 90) return clean.replace(/\.$/, '');
  const cut = clean.search(/\.\s/);
  return (cut > 20 ? clean.slice(0, cut) : clean.slice(0, 90)).trim();
}

function slugOk(slug) {
  return /^[a-z0-9][a-z0-9-]{1,120}$/.test(slug);
}

const server = new McpServer({ name: 'dialecta-local-research', version: '0.1.0' });

server.registerTool(
  'research_search',
  {
    description:
      'Semantic search across every seat\'s filed notes, both benches: council/*/research/*.md and ' +
      'team/*/knowledge/*.md, using local embeddings. Rebuilds the index if it is missing. ' +
      'Returns the top k chunks with seat, file, and cosine score. Search here before searching the ' +
      'web: another seat may have already filed what you are about to go find.',
    inputSchema: {
      query: z.string().min(1).describe('What to look for'),
      advisor: z.enum(ADVISORS).optional().describe('Limit to one seat, either bench'),
      k: z.number().int().min(1).max(50).default(8).describe('How many chunks to return'),
    },
  },
  safe(async ({ query, advisor, k = 8 }) => {
    await requireOllama();
    let index = await loadIndex();
    if (!index || index.model !== EMBED_MODEL) {
      await buildIndex({ force: !!index });
      index = await loadIndex();
    }
    if (!index || index.chunks.length === 0) {
      return text(
        `No notes indexed yet. Nothing under ${path.join(ROOT, 'council')}/*/research/*.md or ` +
          `${path.join(ROOT, 'team')}/*/knowledge/*.md apart from index.md.`,
      );
    }
    const [qv] = await embed([query]);
    const pool = advisor ? index.chunks.filter((c) => c.advisor === advisor) : index.chunks;
    const ranked = pool
      .map((c) => ({ c, score: cosine(qv, c.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    if (ranked.length === 0) return text(`No chunks for advisor "${advisor}".`);
    const lines = ranked.map(({ c, score }, i) =>
      `[${i + 1}] advisor: ${c.advisor} | file: ${c.file} | chunk: ${c.chunk} | score: ${score.toFixed(4)}\n${c.text}`,
    );
    return text(`${ranked.length} result(s) for "${query}" (index: ${index.chunks.length} chunks, model ${index.model})\n\n${lines.join('\n\n---\n\n')}`);
  }),
);

server.registerTool(
  'research_summarize',
  {
    description:
      'Summarize a text or a URL with the local chat model, in the shape a council research file wants: ' +
      'citation line, 5 to 8 sentence summary, then "Implies for Dialecta:" bullets addressing the focus.',
    inputSchema: {
      text: z.string().optional().describe('Source text to summarize'),
      url: z.string().url().optional().describe('URL to fetch and summarize (tags stripped, capped at 60k characters)'),
      focus: z.string().min(1).describe('What the implications should address, for example a Dialecta surface or decision'),
    },
  },
  safe(async ({ text: body, url, focus }) => {
    if (!body && !url) return text('ERROR: provide text or url.');
    await requireOllama();
    let source = body || '';
    if (url) {
      const fetched = await fetchUrlText(url);
      source = body ? `${body}\n\n${fetched}` : fetched;
    }
    source = source.slice(0, MAX_FETCH_CHARS);
    if (!source.trim()) return text('ERROR: the source was empty after stripping tags.');
    const prompt =
      `Focus for the implications: ${focus}\n` +
      (url ? `Source URL: ${url}\n` : '') +
      `\nSource text:\n\n${source}`;
    const out = await generate(prompt, { system: SUMMARIZE_SYSTEM });
    return text(out || 'ERROR: the model returned an empty response.');
  }),
);

server.registerTool(
  'research_file',
  {
    description:
      'File a note into the calling seat\'s own notes tree from a citation, summary, and implications, ' +
      'and append a row to that tree\'s index.md. Routes to council/<seat>/research/ for an advisor ' +
      'and team/<seat>/knowledge/ for a practitioner. Refuses unknown seats and never overwrites.',
    inputSchema: {
      advisor: z.enum(ADVISORS).describe('Your seat name, either bench'),
      slug: z.string().describe('File name without .md, lowercase, digits and hyphens, for example 2024-smith-reward-loops'),
      citation: z.string().min(1).describe('Full citation line'),
      summary: z.string().min(1).describe('Summary paragraph(s)'),
      implies: z.string().min(1).describe('"Implies for Dialecta" section body, bullets or prose'),
      source_url: z.string().optional().describe('Link to the source, if any'),
    },
  },
  safe(async ({ advisor, slug, citation, summary, implies, source_url }) => {
    if (!SEATS[advisor]) return text(`ERROR: seat must be one of ${ADVISORS.join(', ')}; got "${advisor}".`);
    if (!slugOk(slug)) return text('ERROR: slug must be lowercase letters, digits, and hyphens, 2 to 121 characters.');
    // Each bench keeps notes in its own place. Hardcoding council/<name>/research/ here is what
    // made this tool unusable for the six working seats even once their names were accepted.
    const dir = path.join(ROOT, ...SEATS[advisor].split('/'));
    const file = path.join(dir, `${slug}.md`);
    const indexMd = path.join(dir, 'index.md');
    try {
      await fs.access(file);
      return text(`ERROR: ${path.relative(ROOT, file)} already exists. Pick a different slug or edit the file directly.`);
    } catch {
      // does not exist, continue
    }
    await fs.mkdir(dir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const title = titleFromCitation(citation);
    const sourceLine = source_url ? `${citation.trim()} ${source_url.trim()}` : citation.trim();
    const implTrim = implies.trim();
    const implBody = /^[-*]\s/m.test(implTrim) ? implTrim : implTrim.split(/\n+/).map((l) => `- ${l.trim()}`).join('\n');
    const content =
      `# ${title}\n\n` +
      `**Source:** ${sourceLine}\n\n` +
      `## Summary\n\n${summary.trim()}\n\n` +
      `## Implies for Dialecta\n\n${implBody}\n\n` +
      `*Filed ${date}*\n`;
    await fs.writeFile(file, content, 'utf8');

    let index = '';
    try { index = await fs.readFile(indexMd, 'utf8'); } catch { index = ''; }
    if (!index.trim()) {
      index = '# Research index\n\n| File | Source | Implies for |\n| --- | --- | --- |\n';
    }
    const cell = (s) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    const firstImpl = implBody.split('\n')[0].replace(/^[-*]\s*/, '');
    const row = `| [${slug}.md](${slug}.md) | ${cell(sourceLine)} | ${cell(firstImpl).slice(0, 160)} |`;
    if (!index.endsWith('\n')) index += '\n';
    await fs.writeFile(indexMd, `${index}${row}\n`, 'utf8');
    return text(`Wrote ${path.relative(ROOT, file)} and appended a row to ${path.relative(ROOT, indexMd)}. Run npm -w tools/local-research run index (or research_search) to embed it.`);
  }),
);

server.registerTool(
  'local_generate',
  {
    description: 'Raw call to the local chat model, for bulk drafting. Returns the model text.',
    inputSchema: {
      prompt: z.string().min(1),
      system: z.string().optional(),
    },
  },
  safe(async ({ prompt, system }) => {
    await requireOllama();
    const out = await generate(prompt, { system });
    return text(out || 'ERROR: the model returned an empty response.');
  }),
);

server.registerTool(
  'local_status',
  {
    description: 'Reports whether Ollama is up, which models are present, and the research index size and age.',
    inputSchema: {},
  },
  safe(async () => {
    const up = await isUp();
    const lines = [`Ollama host: ${OLLAMA_HOST}`, `Ollama up: ${up ? 'yes' : 'no'}`];
    if (up) {
      let models = [];
      try { models = await listModels(); } catch (err) { lines.push(`Model list failed: ${err.message}`); }
      lines.push(`Models present: ${models.length ? models.join(', ') : '(none)'}`);
      const missing = [EMBED_MODEL, CHAT_MODEL].filter((m) => !hasModel(models, m));
      lines.push(`Embed model: ${EMBED_MODEL}${hasModel(models, EMBED_MODEL) ? '' : ' (missing)'}`);
      lines.push(`Chat model: ${CHAT_MODEL}${hasModel(models, CHAT_MODEL) ? '' : ' (missing)'}`);
      if (missing.length) lines.push(`Pull missing models with: ${missing.map((m) => `ollama pull ${m}`).join(' && ')}`);
    } else {
      lines.push(SETUP_HINT);
    }
    const st = await indexStats();
    if (st.exists) {
      const ageMin = Math.round(st.ageMs / 60000);
      lines.push(`Index: ${st.chunks} chunks from ${st.files} files, model ${st.model}, built ${st.builtAt} (${ageMin} min ago) at ${INDEX_FILE}`);
    } else {
      lines.push(`Index: not built yet (run npm -w tools/local-research run index, or call research_search once Ollama is up)`);
    }
    lines.push(`Repo root: ${ROOT}`);
    return text(lines.join('\n'));
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
