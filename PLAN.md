# Context45 — Build Plan

> "All the docs. None of the bloat."

A minimal MCP server that gives AI assistants only the essential documentation context — targeting 500-1000 tokens instead of Context7's 5,000-6,200.

## Architecture

```
YOU (one-time, per library)

  Markdown docs → pipeline/process.ts → pipeline/upload.ts → Upstash Vector
  (paste/add)    "extract essentials"    "embed & store"      (cloud DB)

USERS (every query, via MCP)

  AI assistant → server/index.ts → Upstash Vector → returns ~500-1000 tokens
  "use context45"  (MCP server)    (semantic search)
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (ES2022) |
| MCP Server | @modelcontextprotocol/sdk |
| Vector DB | Upstash Vector (bge-small-en-v1.5, 384 dims) |
| Markdown Parsing | unified + remark |
| Website | Next.js on Vercel |
| Package | context45-mcp on npm |
| Transport | stdio (local only for Phase 1) |

## Build Steps

### Phase 1 — Core

- [x] Step 1: Set up repo, tsconfig, package.json
- [ ] Step 2: Build processing pipeline (markdown → essentials → chunks)
- [ ] Step 3: Upload script (chunks → Upstash Vector)
- [ ] Step 4: Process OpenAI + Claude docs through pipeline
- [ ] Step 5: Build MCP server (resolve-library + get-docs tools)
- [ ] Step 6: Test with Claude Code locally
- [ ] Step 7: Publish to npm
- [ ] Step 8: Build landing page + deploy to context45.com via Vercel
- [ ] Step 9: Write README, push to GitHub

### Phase 2 — Scale (later)

- [ ] Add more libraries (React, Next.js, Express, etc.)
- [ ] Web form to submit markdown docs
- [ ] Caching with Upstash Redis
- [ ] Remote MCP endpoint (hosted) with auth + API keys
- [ ] CLI tool

## Needs from User

- [ ] Upstash Vector index (bge-small-en-v1.5) → REST URL + Token
- [ ] GitHub username (for repo setup)
- [ ] npm account / package name preference
- [ ] Vercel account for website deployment

## Token Targets

| Metric | Context7 | Context45 |
|--------|----------|-----------|
| Tokens added | 5,000-6,200 | 500-1,000 |
| Input multiplier | 155-215x | 15-30x |
| Libraries (Phase 1) | 13,000+ | 2 (OpenAI, Claude) |
