/**
 * Context45 Documentation Chunker
 *
 * Splits _processed.md files into chunks by heading (## and ###).
 * Code blocks are NEVER split — a section stays as one chunk even if large.
 *
 * Output: .processed/*.json — ready for vector upload
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { DocChunk } from "../types.js";

// ─── Config ────────────────────────────────────────────────────

const DOCS_DIR = join(import.meta.dirname, "../../docs");
const OUTPUT_DIR = join(import.meta.dirname, "../../.processed");

/** Sections to skip entirely */
const SKIP_HEADINGS = [
  "table of contents",
  "additional resources",
];

// ─── Markdown Section Splitter (regex-based, no AST) ──────────

interface MarkdownSection {
  heading: string;
  depth: number;
  content: string; // full raw markdown content including code blocks
}

/**
 * Split markdown into sections by headings (## and ###).
 * This is intentionally simple — no AST parsing — to preserve
 * code blocks exactly as they appear in the source.
 */
function splitBySections(markdown: string): MarkdownSection[] {
  const lines = markdown.split("\n");
  const sections: MarkdownSection[] = [];
  let currentHeading = "";
  let currentDepth = 0;
  let currentLines: string[] = [];

  for (const line of lines) {
    // Match ## or ### headings (not # which is the doc title)
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/);

    if (headingMatch) {
      // Save previous section
      if (currentHeading && currentLines.length > 0) {
        const content = currentLines.join("\n").trim();
        if (content.length > 0) {
          sections.push({
            heading: currentHeading,
            depth: currentDepth,
            content,
          });
        }
      }

      currentHeading = headingMatch[2].trim().replace(/`/g, "");
      currentDepth = headingMatch[1].length;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentHeading && currentLines.length > 0) {
    const content = currentLines.join("\n").trim();
    if (content.length > 0) {
      sections.push({
        heading: currentHeading,
        depth: currentDepth,
        content,
      });
    }
  }

  return sections;
}

/**
 * Check if a section should be skipped
 */
function shouldSkip(heading: string): boolean {
  const lower = heading.toLowerCase();
  return SKIP_HEADINGS.some((skip) => lower.includes(skip));
}

/**
 * Create a slug from a string
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Determine chunk type based on heading and content
 */
function classifyChunk(heading: string, content: string): DocChunk["type"] {
  const lower = (heading + " " + content.slice(0, 200)).toLowerCase();

  if (lower.includes("example") || lower.includes("usage") || lower.includes("quick start")) {
    return "example";
  }
  if (lower.includes("parameter") || lower.includes("request body") || lower.includes("argument")) {
    return "parameter";
  }
  if (
    lower.includes("endpoint") ||
    lower.includes("post /") ||
    lower.includes("get /") ||
    lower.includes("api")
  ) {
    return "signature";
  }
  return "guide";
}

/**
 * Find the parent ## heading for a ### section
 */
function getParentHeading(sections: MarkdownSection[], index: number): string {
  for (let i = index - 1; i >= 0; i--) {
    if (sections[i].depth === 2) {
      return sections[i].heading;
    }
  }
  return "";
}

/**
 * Process a _processed.md file into chunks
 */
function processFile(filePath: string, libraryId: string): DocChunk[] {
  const raw = readFileSync(filePath, "utf-8");
  const sections = splitBySections(raw);
  const chunks: DocChunk[] = [];
  const seenSlugs = new Set<string>();

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    if (shouldSkip(section.heading)) continue;
    if (section.content.length < 20) continue; // skip empty sections

    const parentHeading = section.depth === 3 ? getParentHeading(sections, i) : "";
    const sectionContext = parentHeading ? `${parentHeading} > ${section.heading}` : section.heading;

    // Generate unique slug
    let slug = slugify(section.heading);
    if (seenSlugs.has(slug)) {
      let suffix = 2;
      while (seenSlugs.has(`${slug}-${suffix}`)) suffix++;
      slug = `${slug}-${suffix}`;
    }
    seenSlugs.add(slug);

    chunks.push({
      id: `${libraryId}/${slug}`,
      libraryId,
      title: section.heading,
      content: section.content,
      section: sectionContext,
      type: classifyChunk(section.heading, section.content),
    });
  }

  return chunks;
}

/**
 * Process all docs for a library
 */
function processLibrary(libraryId: string): DocChunk[] {
  const libDir = join(DOCS_DIR, libraryId);

  if (!existsSync(libDir)) {
    console.error(`❌ No docs found for library: ${libraryId} (expected at ${libDir})`);
    return [];
  }

  // Only process _processed.md files
  const files = readdirSync(libDir).filter((f) => f.endsWith("_processed.md"));

  if (files.length === 0) {
    console.error(`❌ No _processed.md files found in ${libDir}`);
    return [];
  }

  const allChunks: DocChunk[] = [];

  for (const file of files) {
    const chunks = processFile(join(libDir, file), libraryId);
    allChunks.push(...chunks);
    console.log(`  📄 ${file} → ${chunks.length} chunks`);
  }

  return allChunks;
}

// ─── Main ──────────────────────────────────────────────────────

function main() {
  console.log("🔧 Context45 Documentation Chunker\n");

  const libraries = readdirSync(DOCS_DIR).filter((f) => {
    const p = join(DOCS_DIR, f);
    try {
      return readdirSync(p).some((file) => file.endsWith("_processed.md"));
    } catch {
      return false;
    }
  });

  if (libraries.length === 0) {
    console.error("❌ No libraries found. Add _processed.md files to docs/<library>/");
    process.exit(1);
  }

  console.log(`Found ${libraries.length} libraries: ${libraries.join(", ")}\n`);

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalChunks = 0;
  let totalChars = 0;

  for (const libraryId of libraries) {
    console.log(`📚 Processing: ${libraryId}`);
    const chunks = processLibrary(libraryId);

    if (chunks.length > 0) {
      const outFile = join(OUTPUT_DIR, `${libraryId}.json`);
      writeFileSync(outFile, JSON.stringify(chunks, null, 2));

      const chars = chunks.reduce((sum, c) => sum + c.content.length, 0);
      const approxTokens = Math.round(chars / 4);

      console.log(`  ✅ ${chunks.length} chunks → ${outFile}`);
      console.log(`  📊 ~${approxTokens} tokens total (${chars} chars)\n`);

      totalChunks += chunks.length;
      totalChars += chars;
    }
  }

  console.log("─".repeat(50));
  console.log(`✅ Done! ${totalChunks} total chunks across ${libraries.length} libraries`);
  console.log(`📊 ~${Math.round(totalChars / 4)} total tokens (${totalChars} chars)`);
  console.log(`📁 Output: ${OUTPUT_DIR}/`);
}

main();
