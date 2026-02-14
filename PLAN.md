# Context45 — Build Plan

> "All the docs. None of the bloat."

Minimal MCP server that gives AI assistants only the essential documentation context — targeting 100-300 tokens instead of Context7's 5,000-6,200.

## Architecture

```
YOU (one-time, per library)

  Full docs → Manually curate _processed.md → process.ts chunks it → upload.ts → Upstash Vector

USERS (every query, via MCP)

  AI assistant → server/index.ts → Upstash Vector → returns ~100-300 tokens
  "use context45"   (MCP server)   (semantic search)
```

## Pipeline

| Script | What | When |
|--------|------|------|
| `npm run process-docs` | Chunks _processed.md files into ~300 token pieces | After adding/updating a _processed.md |
| `npm run upload-docs` | Uploads chunks to Upstash Vector | After processing |
| `npm run pipeline` | Runs both above in sequence | After adding/updating a _processed.md |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (ES2022) |
| MCP Server | @modelcontextprotocol/sdk |
| Vector DB | Upstash Vector (bge-m3, 1024 dims, 8192 seq length) |
| Markdown Parsing | unified + remark |
| Website | Next.js on Vercel (context45.com) |
| Package | context45-mcp on npm |

## Build Steps

### Phase 1 — Core

- [x] Repo setup, tsconfig, package.json
- [x] Processing pipeline (markdown → chunks)
- [x] Upload script (chunks → Upstash Vector)
- [x] MCP server (resolve-library + get-docs)
- [x] Push to GitHub (github.com/arbab-ml/context45)
- [x] Claude _processed.md (manually curated)
- [x] Process + upload Claude docs (57 vectors)
- [x] Test queries (streaming: 146 tokens, tool use: 245 tokens, auth: 108 tokens)
- [ ] Publish to npm
- [ ] Build landing page (context45.com)
- [ ] Write README

### Phase 2 — Scale

- [ ] OpenAI _processed.md
- [ ] Add more libraries
- [ ] Remote MCP endpoint with auth
- [ ] Website with library browser

## Results

| Metric | Context7 | Context45 |
|--------|----------|-----------|
| Tokens per query | 5,000-6,200 | 100-300 |
| Input multiplier | 155-215x | 3-10x |
| Libraries (Phase 1) | 13,000+ | 1 (Claude) |
| Total vectors | millions | 57 |
