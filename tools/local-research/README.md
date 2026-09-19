# local-research

An MCP server (stdio, Node 22, ESM) that lets Claude Code agents use a local Ollama instance on the studio workstation for research work: semantic search over `council/*/research/*.md`, summarizing pages and texts, filing research notes, and bulk drafting on the local GPU.

## One-time setup on Windows

1. Install Ollama: `winget install Ollama.Ollama`, or run the installer from https://ollama.com/download.
2. Pull the two default models:
   ```
   ollama pull nomic-embed-text
   ollama pull qwen2.5:14b
   ```
3. Make sure it is running: `ollama serve` (the desktop app also starts it in the tray). It listens on `http://127.0.0.1:11434`.

The studio-pc GPU has room for a larger chat model. Pull `qwen2.5:32b` or `llama3.3:70b` and point the server at it with an env var, either in your shell or in the `env` block of `.mcp.json`:

```
OLLAMA_CHAT_MODEL=qwen2.5:32b
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_HOST=http://127.0.0.1:11434
DIALECTA_ROOT=C:\Dialecta          (optional; defaults to two levels above this folder)
```

Changing the embed model invalidates the index; the next search rebuilds it.

## Build the index

```
npm install
npm -w tools/local-research run index
```

Walks `council/*/research/*.md`, chunks each file at about 800 characters on paragraph boundaries, embeds the chunks, and writes `tools/local-research/.index/index.json` (gitignored). Re-runs are incremental: unchanged files (same mtime and size) are skipped. `--force` re-embeds everything.

## How Claude Code picks it up

`.mcp.json` at the repo root registers `dialecta-local-research` with `node tools/local-research/server.mjs`. Open Claude Code in the repo and the tools appear:

| Tool | What it does |
| --- | --- |
| `research_search` | Embeds a query, cosine ranks the index, returns the top k chunks with advisor, file, score |
| `research_summarize` | Fetches a URL or takes text, runs the local chat model, returns citation, summary, and "Implies for Dialecta" bullets for a focus |
| `research_file` | Writes `council/<advisor>/research/<slug>.md` and appends a row to that advisor's `index.md`. Advisors: treasurer, designer, philosopher. Never overwrites |
| `local_generate` | Raw prompt to the local chat model for bulk drafting |
| `local_status` | Ollama reachability, models present, index size and age |

Every tool answers with plain text. Failures come back as text starting with `ERROR:`, and when Ollama is down the message says to run `ollama serve` and which models to pull.

`npm -w tools/local-research test` starts the server as a child process, lists the tools, and calls `local_status`. It passes with or without Ollama running.

## The honest limit

Claude Code's agents themselves still run on Claude models; this server does not replace them. What it moves onto the local GPU is the reading, summarizing, embedding, and search that would otherwise burn Claude context on raw source text. Use it to pre-digest sources and to find prior research, then let the Claude agent reason over the short results.
