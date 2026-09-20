#!/usr/bin/env node
// The committee, behind an HTTP call.
//
//   node tools/committee-api/server.mjs
//
// Put a question to one agent, to the council, or to the whole team, from anywhere that can
// reach this machine. A council run takes minutes, so every request is a job: POST returns an
// id, GET polls it. Nothing blocks.
//
// Security, because this endpoint runs a coding agent on Dan's machine:
//   - binds 127.0.0.1 unless COMMITTEE_HOST says otherwise
//   - every request needs `Authorization: Bearer <COMMITTEE_API_TOKEN>`, and the server
//     refuses to start without that variable set
//   - the question is passed to claude as an argv element, never through a shell
//   - one job at a time, and a hard timeout
//   - agents run with the same folder fence the land script enforces
//
// Reaching it from a phone is a tunnel question, not a server question. Bind localhost and put
// Cloudflare Tunnel or Tailscale in front; do not bind 0.0.0.0 and forward a port.

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// .env is the repo's convention for keys; read it without adding a dependency.
for (const line of existsSync(join(ROOT, '.env'))
  ? readFileSync(join(ROOT, '.env'), 'utf8').split('\n')
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const TOKEN = process.env.COMMITTEE_API_TOKEN;
const PORT = Number(process.env.COMMITTEE_PORT || 8787);
const HOST = process.env.COMMITTEE_HOST || '127.0.0.1';
const TIMEOUT_MS = Number(process.env.COMMITTEE_TIMEOUT_MS || 20 * 60 * 1000);

if (!TOKEN || TOKEN.length < 24) {
  process.stderr.write(
    'committee-api: set COMMITTEE_API_TOKEN in .env to at least 24 characters.\n' +
      '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n',
  );
  process.exit(1);
}

const COUNCIL = ['treasurer', 'designer', 'philosopher', 'security', 'legal'];
const TEAM = ['builder', 'reviewer', 'voice-editor', 'migrator', 'spec-reader', 'decider'];
const ALL = [...COUNCIL, ...TEAM];

const resolveAgents = (spec) => {
  if (!spec || spec === 'council') return COUNCIL;
  if (spec === 'team') return TEAM;
  if (spec === 'all') return ALL;
  const list = Array.isArray(spec) ? spec : [spec];
  const bad = list.filter((a) => !ALL.includes(a));
  if (bad.length) throw new Error(`unknown agent(s): ${bad.join(', ')}`);
  return list;
};

/** @type {Map<string, {id:string,state:string,question:string,agents:string[],started:string,finished:string|null,answers:Record<string,{state:string,output:string,code:number|null}>}>} */
const jobs = new Map();
let running = false;

const runAgent = (agent, question) =>
  new Promise((done) => {
    const prompt =
      `You are the \`${agent}\` agent in the Dialecta repo. Read your own files first: ` +
      `your mandate in \`.claude/agents/${agent}.md\` or \`council/${agent}/charter.md\`, ` +
      `your brief, and your standing positions or practices. Then answer the question below ` +
      `from your mandate, citing files you actually read.\n\n` +
      `Write nothing outside your own folder and \`exchange/\`. If the answer is worth keeping, ` +
      `file it as an exchange record and land it with \`node scripts/land.mjs --agent ${agent}\`. ` +
      `If it is not, answer and write nothing.\n\n` +
      `QUESTION\n${question}`;

    const child = spawn(
      'claude',
      ['-p', prompt, '--model', 'sonnet', '--permission-mode', 'acceptEdits', '--max-turns', '40'],
      { cwd: ROOT, shell: process.platform === 'win32', windowsHide: true },
    );
    let out = '';
    const cap = (b) => {
      out += b.toString();
      if (out.length > 400_000) out = out.slice(-400_000);
    };
    child.stdout.on('data', cap);
    child.stderr.on('data', cap);
    const timer = setTimeout(() => child.kill(), TIMEOUT_MS);
    child.on('close', (code) => {
      clearTimeout(timer);
      done({ state: code === 0 ? 'done' : 'failed', output: out.trim(), code });
    });
    child.on('error', (e) => {
      clearTimeout(timer);
      done({ state: 'failed', output: String(e), code: null });
    });
  });

async function runJob(job) {
  running = true;
  job.state = 'running';
  // Sequential on purpose. Parallel claude processes on one box contend for the same
  // worktree and the same rate limit, and a committee answer is not latency sensitive.
  for (const agent of job.agents) {
    job.answers[agent] = { state: 'running', output: '', code: null };
    job.answers[agent] = await runAgent(agent, job.question);
  }
  job.state = Object.values(job.answers).every((a) => a.state === 'done') ? 'done' : 'partial';
  job.finished = new Date().toISOString();
  running = false;
}

const json = (res, code, body) => {
  const b = JSON.stringify(body, null, 2);
  res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(b) });
  res.end(b);
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    return json(res, 200, { ok: true, running, jobs: jobs.size, agents: ALL });
  }

  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${TOKEN}`) return json(res, 401, { error: 'unauthorized' });

  if (url.pathname === '/ask' && req.method === 'POST') {
    if (running) return json(res, 429, { error: 'a job is already running', busy: true });
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 100_000) return json(res, 413, { error: 'question too large' });
    }
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return json(res, 400, { error: 'body must be JSON' });
    }
    const question = String(body.question || '').trim();
    if (!question) return json(res, 400, { error: 'question is required' });
    let agents;
    try {
      agents = resolveAgents(body.agents);
    } catch (e) {
      return json(res, 400, { error: String(e.message) });
    }
    const job = {
      id: randomUUID(),
      state: 'queued',
      question,
      agents,
      started: new Date().toISOString(),
      finished: null,
      answers: {},
    };
    jobs.set(job.id, job);
    runJob(job).catch((e) => {
      job.state = 'failed';
      job.error = String(e);
      running = false;
    });
    return json(res, 202, { id: job.id, agents, poll: `/jobs/${job.id}` });
  }

  const m = url.pathname.match(/^\/jobs\/([0-9a-f-]{36})$/);
  if (m && req.method === 'GET') {
    const job = jobs.get(m[1]);
    return job ? json(res, 200, job) : json(res, 404, { error: 'no such job' });
  }

  if (url.pathname === '/jobs' && req.method === 'GET') {
    return json(res, 200, {
      jobs: [...jobs.values()].map(({ id, state, question, agents, started, finished }) => ({
        id,
        state,
        agents,
        started,
        finished,
        question: question.slice(0, 120),
      })),
    });
  }

  return json(res, 404, { error: 'not found' });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`committee-api listening on http://${HOST}:${PORT}\n`);
  process.stdout.write(`  POST /ask       {"question":"...","agents":"council"}\n`);
  process.stdout.write(`  GET  /jobs/<id>\n`);
  process.stdout.write(`  GET  /health    (no token)\n`);
});
