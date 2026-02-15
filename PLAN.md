# Context45 — Build Plan

> "All the docs. None of the bloat."

Minimal MCP server that gives AI assistants only the essential documentation context — targeting 100-300 tokens instead of Context7's 5,000-6,200.

## Architecture

```
YOU (one-time, per library)

  Raw docs → You curate _processed.md → chunk.ts splits it → upload.ts → Upstash Vector

USERS (every query, via MCP)

  AI assistant → npx context45-mcp → Upstash Vector → returns ~100-300 tokens
  "use context45"   (runs locally)    (semantic search)
```

## Pipeline

| Script | What | When |
|--------|------|------|
| `npm run fetch-docs` | Downloads raw llms-full.txt files | Once per library |
| _(manual)_ | You curate `_processed.md` using Claude Code | Once per library |
| `npm run chunk-docs` | Splits `_processed.md` by headings → JSON | After updating `_processed.md` |
| `npm run upload-docs` | Deletes old vectors + uploads new chunks | After chunking |
| `npm run pipeline` | Runs chunk + upload together | After updating `_processed.md` |
| `npm run reset-index` | Nukes ALL vectors from Upstash | When starting fresh |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (ES2022) |
| MCP Server | @modelcontextprotocol/sdk |
| Vector DB | Upstash Vector (bge-m3, 1024 dims, 8192 seq length) |
| Chunking | Regex-based heading splitter (no AST deps) |
| Package | context45-mcp on npm |
| Website | TBD — context45.com |

## Build Steps

### Phase 1 — Core ✅

- [x] Repo setup, tsconfig, package.json
- [x] Chunking pipeline (markdown headings → JSON chunks)
- [x] Upload script (chunks → Upstash Vector, auto-cleans old vectors)
- [x] MCP server (resolve-library + get-docs)
- [x] Push to GitHub (github.com/arbab-ml/context45)
- [x] Claude `_processed.md` (manually curated, 71 chunks)
- [x] OpenAI `_processed.md` (manually curated, 60 chunks)
- [x] Embed read-only Upstash creds in server
- [x] Published to npm (`context45-mcp@0.1.0`, 6 KB)
- [x] Tested `npx context45-mcp` end-to-end
- [x] README + README-dev.md

### Phase 2 — Growth

- [ ] Build landing page (context45.com)
- [ ] Add more libraries (Vercel AI SDK, LangChain, etc.)
- [ ] Remote MCP endpoint (HTTP/SSE for web-based Claude)
- [ ] Website with library browser

## Results

| Metric | Context7 | Context45 |
|--------|----------|-----------|
| Tokens per query | 5,000-6,200 | 100-400 |
| Input multiplier | 155-215x | 3-10x |
| Libraries | 13,000+ | 2 (Claude, OpenAI) |
| Total vectors | millions | 131 |
| npm package size | ? | 6 KB |
