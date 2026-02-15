# Context45 — Development Guide

## Setup

```bash
git clone https://github.com/arbab-ml/context45.git
cd context45
npm install
cp .env.example .env
# Add your Upstash Vector credentials to .env
```

Upstash Vector index should use the **bge-m3** embedding model (1024 dims, 8192 token sequence length).

## Project Structure

```
src/
  server/index.ts     # MCP server (resolve-library + get-docs tools)
  pipeline/
    fetch.ts           # Downloads raw llms-full.txt files (reference only)
    process.ts         # Chunks _processed.md files into vectors
    upload.ts          # Uploads chunks to Upstash Vector (cleans old vectors first)
  types.ts             # Shared types, library registry
scripts/
  reset-index.ts       # Nuke all vectors from Upstash
docs/
  claude/
    _processed.md      # Manually curated Claude API docs (committed)
    _raw-llms-full.txt # Raw download from platform.claude.com (gitignored)
  openai/
    _processed.md      # Manually curated OpenAI API docs (committed)
    _raw-llms-full.txt # Raw download from developers.openai.com (gitignored)
.processed/            # JSON chunks output (gitignored)
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run MCP server locally |
| `npm run build` | Compile TypeScript |
| | **Pipeline (in order)** |
| `npm run fetch-docs` | 1. Download raw llms-full.txt files (reference only) |
| | 2. **You** manually create `_processed.md` (see below) |
| `npm run chunk-docs` | 3. Split `_processed.md` by headings → `.processed/*.json` |
| `npm run upload-docs` | 4. Upload chunks to Upstash (deletes old vectors first) |
| `npm run pipeline` | Runs steps 3+4 together |
| | **Maintenance** |
| `npm run reset-index` | Nuke ALL vectors from Upstash |

## Adding a New Library

### Step 1: Fetch the raw docs

```bash
npm run fetch-docs
# or just one library:
npx tsx src/pipeline/fetch.ts openai
```

This saves `_raw-llms-full.txt` to `docs/<library>/` for reference.

### Step 2: Create the _processed.md

This is the key step — **manually curate** the documentation using an AI assistant. Open the raw file and use this prompt:

```
Now, looking at @docs/openai/_raw-llms-full.md file prepare core API documentation
in under 1000 lines of code which essentially lists how to do api calls, what are
all the models and all the core functionality needed to be able to use the api.
A lot of the content is just irrelevant so we dont need that. I need condensed
documentation, save it in docs/openai/_processed.md which basically gives everything
to be used by the people.
```

Adapt the paths/library name as needed. The goal: **under 1000 lines**, only core API usage, models, and essential patterns. Strip tutorials, marketing, migration guides, and niche features.

### Step 3: Run the pipeline

```bash
npm run pipeline
```

This will:
1. Chunk `_processed.md` by headings (## and ###), never splitting code blocks
2. **Delete all old vectors** for that library from Upstash (prevents zombies)
3. Upload fresh vectors

## Cleaning Old Vectors

**Per-library cleanup is automatic.** Every `npm run upload-docs` deletes all existing vectors for a library before uploading new ones. No zombie vectors.

**To nuke everything and start fresh:**

```bash
npm run reset-index     # deletes ALL vectors from Upstash
rm -rf .processed       # removes local JSON chunks
npm run pipeline        # re-process and re-upload everything
```

## Chunking Strategy

`process.ts` splits `_processed.md` files by markdown headings:

- Splits on `##` and `###` headings only
- Code blocks (``` fenced) are **never split** mid-block
- Each chunk becomes one vector with metadata: `libraryId`, `title`, `section`, `content`, `type`
- The `data` field sent to Upstash for embedding is: `{libraryId}: {title}\n{section}\n{content}`

## How the MCP Server Works

The server exposes two tools over stdio (JSON-RPC):

1. **`resolve-library`** — fuzzy matches a query against the `LIBRARIES` registry in `types.ts`
2. **`get-docs`** — queries Upstash Vector with `data` (auto-embedded) + `filter` by libraryId, returns top K results

When a user adds Context45 to their AI assistant (Claude Code, Cursor, etc.), the assistant auto-discovers these tools and calls them when the user says "use context45".

## Registering a New Library

Add it to the `LIBRARIES` array in `src/types.ts`:

```typescript
{
  id: "openai",
  name: "OpenAI API",
  description: "OpenAI API reference — models, chat completions, embeddings, ...",
  version: "latest",
}
```

Then add the source URLs in `src/pipeline/fetch.ts` and create the `_processed.md`.

## Testing Queries

Quick way to test search quality after uploading:

```bash
npx tsx -e "
import { Index } from '@upstash/vector';
import { config } from 'dotenv';
config();
const index = new Index({ url: process.env.UPSTASH_VECTOR_REST_URL, token: process.env.UPSTASH_VECTOR_REST_TOKEN });
async function q(query) {
  const r = await index.query({ data: query + ' Claude API', topK: 3, includeMetadata: true, filter: \"libraryId = 'claude'\" });
  const tokens = r.reduce((s, x) => s + (x.metadata?.content?.length || 0), 0) / 4;
  console.log(query, '→', Math.round(tokens), 'tokens');
  r.forEach(x => console.log('  [' + x.score?.toFixed(3) + ']', x.metadata?.title));
}
q('streaming');
"
```
