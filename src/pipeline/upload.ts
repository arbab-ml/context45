/**
 * Context45 Vector Upload Script
 *
 * Reads processed JSON chunks from .processed/ and uploads them to Upstash Vector.
 * Upstash handles embedding automatically (bge-small-en-v1.5).
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Index } from "@upstash/vector";
import { config } from "dotenv";
import type { DocChunk, VectorMetadata } from "../types.js";

config(); // Load .env

// ─── Config ────────────────────────────────────────────────────

const PROCESSED_DIR = join(import.meta.dirname, "../../.processed");
const BATCH_SIZE = 50; // Upstash recommends batches

// ─── Upstash Client ────────────────────────────────────────────

function getVectorClient(): Index<VectorMetadata> {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    console.error("❌ Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN in .env");
    console.error("   Create an index at https://console.upstash.com (recommended: bge-m3)");
    process.exit(1);
  }

  return new Index<VectorMetadata>({ url, token });
}

// ─── Upload ────────────────────────────────────────────────────

async function uploadChunks(index: Index<VectorMetadata>, chunks: DocChunk[]) {
  // Upsert in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const vectors = batch.map((chunk) => ({
      id: chunk.id,
      data: `${chunk.libraryId}: ${chunk.title}\n${chunk.section}\n${chunk.content}`, // Upstash embeds this text
      metadata: {
        libraryId: chunk.libraryId,
        title: chunk.title,
        content: chunk.content,
        section: chunk.section,
        type: chunk.type,
      },
    }));

    await index.upsert(vectors);

    console.log(`  📤 Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} vectors)`);
  }
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("📤 Context45 Vector Uploader\n");

  if (!existsSync(PROCESSED_DIR)) {
    console.error(`❌ No processed docs found at ${PROCESSED_DIR}`);
    console.error("   Run 'npm run process-docs' first.");
    process.exit(1);
  }

  const files = readdirSync(PROCESSED_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("❌ No .json files found in .processed/");
    process.exit(1);
  }

  const index = getVectorClient();

  console.log(`Found ${files.length} processed libraries\n`);

  let totalUploaded = 0;

  for (const file of files) {
    const libraryId = file.replace(".json", "");
    console.log(`📚 Uploading: ${libraryId}`);

    const chunks: DocChunk[] = JSON.parse(readFileSync(join(PROCESSED_DIR, file), "utf-8"));

    await uploadChunks(index, chunks);

    console.log(`  ✅ ${chunks.length} vectors uploaded\n`);
    totalUploaded += chunks.length;
  }

  // Verify
  const info = await index.info();
  console.log("─".repeat(50));
  console.log(`✅ Done! ${totalUploaded} vectors uploaded`);
  console.log(`📊 Index stats: ${info.vectorCount} total vectors, ${info.pendingVectorCount} pending`);
}

main().catch((err) => {
  console.error("❌ Upload failed:", err);
  process.exit(1);
});
