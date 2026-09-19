// Smoke test: start the server over stdio, list tools, call local_status.
// Does not require Ollama; local_status reports either way.

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { chunkText } from './index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXPECTED = ['research_search', 'research_summarize', 'research_file', 'local_generate', 'local_status'];

// Pure unit check on the chunker.
{
  const para = 'Sentence one. '.repeat(20).trim();
  const chunks = chunkText([para, para, para, para].join('\n\n'), 800);
  assert.ok(chunks.length >= 2, 'chunker splits long input');
  assert.ok(chunks.every((c) => c.length <= 1300), 'chunks stay near the target size');
  assert.deepEqual(chunkText(''), [], 'empty input gives no chunks');
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(HERE, 'server.mjs')],
  env: { ...process.env },
  stderr: 'pipe',
});
const client = new Client({ name: 'local-research-test', version: '0.1.0' });

const timer = setTimeout(() => {
  console.error('FAIL: test timed out');
  process.exit(1);
}, 30_000);

try {
  await client.connect(transport);

  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  for (const name of EXPECTED) assert.ok(names.includes(name), `tool ${name} is exposed`);

  const result = await client.callTool({ name: 'local_status', arguments: {} });
  assert.ok(Array.isArray(result.content) && result.content.length > 0, 'local_status returns content');
  assert.equal(result.content[0].type, 'text', 'local_status returns a text block');
  assert.ok(result.content[0].text.includes('Ollama up:'), 'local_status reports Ollama state');

  // A refused write must come back as text, not a thrown error.
  const refused = await client.callTool({
    name: 'research_file',
    arguments: { advisor: 'nobody', slug: 'x', citation: 'c', summary: 's', implies: 'i' },
  });
  assert.ok(refused.content[0].text.startsWith('ERROR:'), 'unknown advisor is refused with ERROR: text');

  console.log(`ok: ${names.length} tools listed, local_status and refusal path answered`);
  console.log(result.content[0].text);
} finally {
  clearTimeout(timer);
  await client.close().catch(() => {});
}
process.exit(0);
