// Thin client over the Ollama HTTP API.
// Docs: https://github.com/ollama/ollama/blob/main/docs/api.md

export const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/+$/, '');
export const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
export const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:14b';

export const SETUP_HINT =
  `Ollama is not reachable at ${OLLAMA_HOST}. Start it with \`ollama serve\` (or launch the Ollama app), ` +
  `then make sure the models are present: \`ollama pull ${EMBED_MODEL}\` and \`ollama pull ${CHAT_MODEL}\`.`;

async function request(path, init = {}) {
  const url = `${OLLAMA_HOST}${path}`;
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const e = new Error(SETUP_HINT);
    e.code = 'OLLAMA_DOWN';
    e.cause = err;
    throw e;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const e = new Error(`Ollama ${init.method || 'GET'} ${path} failed with ${res.status}: ${body.slice(0, 500)}`);
    e.code = 'OLLAMA_HTTP';
    e.status = res.status;
    throw e;
  }
  return res.json();
}

function post(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Returns true when the Ollama server answers on the configured host. */
export async function isUp() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

/** GET /api/tags. Returns an array of model names, for example ["nomic-embed-text:latest"]. */
export async function listModels() {
  const data = await request('/api/tags');
  return (data.models || []).map((m) => m.name);
}

/** POST /api/embed. Returns one vector per input text. */
export async function embed(texts, model = EMBED_MODEL) {
  if (!Array.isArray(texts)) texts = [texts];
  if (texts.length === 0) return [];
  const data = await post('/api/embed', { model, input: texts });
  const vectors = data.embeddings || [];
  if (vectors.length !== texts.length) {
    throw new Error(`Ollama returned ${vectors.length} embeddings for ${texts.length} inputs`);
  }
  return vectors;
}

/** POST /api/generate with stream false. Returns the response text. */
export async function generate(prompt, { model = CHAT_MODEL, system, options } = {}) {
  const body = { model, prompt, stream: false };
  if (system) body.system = system;
  if (options) body.options = options;
  const data = await post('/api/generate', body);
  return (data.response || '').trim();
}

/** True when a model name (with or without a tag) appears in the installed list. */
export function hasModel(installed, name) {
  const bare = name.includes(':') ? name : `${name}:latest`;
  return installed.includes(name) || installed.includes(bare);
}
