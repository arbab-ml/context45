# Context45

> All the docs. None of the bloat.

**Context45** is a minimal MCP server that gives AI assistants only the essential documentation context. Instead of flooding your context window with 5,000+ tokens of docs (like Context7), Context45 returns **100-300 tokens** of precisely what you need.

## The Problem

Tools like Context7 inject documentation into AI assistants, but they return way too much:

| | Context7 | **Context45** |
|-|----------|---------------|
| Tokens per query | 5,000-6,200 | **100-300** |
| Input multiplier | 155-215x | **3-10x** |

That's a 20x reduction in context usage while still giving you the right answer.

## Quick Start

### Claude Code

```bash
claude mcp add context45 -- npx context45-mcp
```

Then in your prompts, add **"use context45"** to fetch relevant docs.

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "context45": {
      "command": "npx",
      "args": ["context45-mcp"]
    }
  }
}
```

## Available Libraries

| Library | Status |
|---------|--------|
| Claude API (Anthropic) | ✅ Available |
| OpenAI API | 🔜 Coming soon |

## How It Works

1. Your AI assistant calls `resolve-library` to find the library
2. Then calls `get-docs` with your query (e.g., "how to stream responses")
3. Context45 does a semantic search over pre-compressed documentation
4. Returns only the most relevant 2-3 chunks (~100-300 tokens)

The documentation is **manually curated and compressed** — we strip tutorials, marketing, migration guides, and niche features. Only what 95% of developers actually need day-to-day survives.

## MCP Tools

### `resolve-library`

Find a library by name.

```
Input: { "query": "claude" }
Output: Found 1 matching library:
  - Claude API (id: claude): Anthropic Claude API reference...
```

### `get-docs`

Get minimal documentation for a specific query.

```
Input: { "libraryId": "claude", "query": "streaming" }
Output: ~146 tokens of streaming docs with code examples
```

Parameters:
- `libraryId` (required): Library ID from `resolve-library`
- `query` (required): What you need docs for
- `maxResults` (optional): Number of chunks to return (default: 3, max: 10)

## Development

### Prerequisites

- Node.js >= 18
- Upstash Vector index (with bge-m3 embedding model)

### Setup

```bash
git clone https://github.com/arbab-ml/context45.git
cd context45
npm install
cp .env.example .env
# Add your Upstash Vector credentials to .env
```

### Adding Documentation

1. Place a curated `_processed.md` file in `docs/<library>/`
2. Run the pipeline:

```bash
npm run pipeline
```

This chunks the markdown and uploads it to Upstash Vector.

### Standalone Testing

Test the MCP server directly without an AI assistant:

```bash
# Start the server and send a get-docs request
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-docs","arguments":{"libraryId":"claude","query":"streaming"}}}\n' | npx tsx src/server/index.ts 2>/dev/null
```

This sends JSON-RPC messages over stdin (the MCP stdio transport) and prints results to stdout.

### Development

See [README-dev.md](README-dev.md) for the full development guide — adding libraries, running the pipeline, cleaning vectors, etc.

## License

MIT
