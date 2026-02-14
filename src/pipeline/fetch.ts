/**
 * Context45 Raw Documentation Fetcher
 *
 * Downloads raw llms.txt and llms-full.txt files from documentation providers.
 * These are stored for reference only — the pipeline only processes _processed.md files.
 *
 * Usage: npx tsx src/pipeline/fetch.ts [library]
 * Example: npx tsx src/pipeline/fetch.ts claude
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// ─── Config ────────────────────────────────────────────────────

const DOCS_DIR = join(import.meta.dirname, "../../docs");

interface DocSource {
  id: string;
  name: string;
  urls: { filename: string; url: string }[];
}

const SOURCES: DocSource[] = [
  {
    id: "claude",
    name: "Anthropic Claude API",
    urls: [
      {
        filename: "_raw-llms.txt",
        url: "https://docs.anthropic.com/llms.txt",
      },
      {
        filename: "_raw-llms-full.txt",
        url: "https://docs.anthropic.com/llms-full.txt",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI API",
    urls: [
      {
        filename: "_raw-llms.txt",
        url: "https://platform.openai.com/llms.txt",
      },
      {
        filename: "_raw-llms-full.txt",
        url: "https://platform.openai.com/llms-full.txt",
      },
    ],
  },
];

// ─── Fetch ────────────────────────────────────────────────────

async function fetchSource(source: DocSource) {
  const outDir = join(DOCS_DIR, source.id);

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  console.log(`📚 ${source.name}`);

  for (const { filename, url } of source.urls) {
    try {
      console.log(`  ⬇️  Fetching ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        console.log(`  ⚠️  ${filename}: HTTP ${response.status} (skipped)`);
        continue;
      }

      const text = await response.text();
      const outPath = join(outDir, filename);
      writeFileSync(outPath, text);

      const lines = text.split("\n").length;
      const chars = text.length;
      console.log(`  ✅ ${filename}: ${lines} lines, ${chars} chars`);
    } catch (err) {
      console.log(`  ❌ ${filename}: ${(err as Error).message}`);
    }
  }

  console.log();
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("⬇️  Context45 Raw Documentation Fetcher\n");
  console.log("Note: These files are for reference only.");
  console.log("The pipeline only processes _processed.md files.\n");

  const target = process.argv[2]; // optional: specific library

  const sources = target
    ? SOURCES.filter((s) => s.id === target)
    : SOURCES;

  if (sources.length === 0) {
    console.error(`❌ Unknown library: ${target}`);
    console.error(`   Available: ${SOURCES.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  for (const source of sources) {
    await fetchSource(source);
  }

  console.log("✅ Done! Raw files saved to docs/<library>/");
  console.log("   These are for reference — create _processed.md manually for the pipeline.");
}

main().catch((err) => {
  console.error("❌ Fetch failed:", err);
  process.exit(1);
});
