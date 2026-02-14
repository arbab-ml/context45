/**
 * Context45 Documentation Processing Pipeline
 *
 * Takes raw markdown documentation and extracts only the essentials:
 * - Function/method signatures
 * - Parameters (name + type + one-liner)
 * - One short code example per concept
 * - Strips: prose, tutorials, marketing, "getting started" fluff
 *
 * Output: JSON chunks (~200-400 tokens each) ready for vector upload
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";
import type { DocChunk } from "../types.js";
import type { Root, Content, Heading, Code } from "mdast";

// ─── Config ────────────────────────────────────────────────────

const DOCS_DIR = join(import.meta.dirname, "../../docs");
const OUTPUT_DIR = join(import.meta.dirname, "../../.processed");

/** Max tokens (rough: 1 token ≈ 4 chars) per chunk */
const MAX_CHUNK_CHARS = 1200; // ~300 tokens

/** Sections to skip entirely */
const SKIP_SECTIONS = [
  "getting started",
  "introduction",
  "overview",
  "what is",
  "why use",
  "prerequisites",
  "installation",
  "quick start",
  "changelog",
  "migration guide",
  "contributing",
  "faq",
  "troubleshooting",
  "community",
  "support",
  "license",
  "table of contents",
];

// ─── Markdown Parser ───────────────────────────────────────────

const parser = unified().use(remarkParse);

interface Section {
  heading: string;
  depth: number;
  nodes: Content[];
}

/**
 * Split markdown AST into sections by headings
 */
function splitIntoSections(tree: Root): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = toString(node).trim();
      current = { heading, depth: (node as Heading).depth, nodes: [] };
      sections.push(current);
    } else if (current) {
      current.nodes.push(node);
    }
  }

  return sections;
}

/**
 * Check if a section should be skipped
 */
function shouldSkip(heading: string): boolean {
  const lower = heading.toLowerCase();
  return SKIP_SECTIONS.some((skip) => lower.includes(skip));
}

/**
 * Extract code blocks from AST nodes
 */
function extractCodeBlocks(nodes: Content[]): string[] {
  const blocks: string[] = [];

  function walk(node: Content) {
    if (node.type === "code") {
      const code = (node as Code).value.trim();
      if (code.length > 0 && code.length < 2000) {
        blocks.push(code);
      }
    }
    if ("children" in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child as Content);
      }
    }
  }

  for (const node of nodes) {
    walk(node);
  }

  return blocks;
}

/**
 * Extract text content from nodes, stripped of excessive prose.
 * Keeps: parameter lists, short descriptions, type info.
 * Strips: long paragraphs of explanation.
 */
function extractEssentialText(nodes: Content[]): string {
  const lines: string[] = [];

  for (const node of nodes) {
    const text = toString(node).trim();

    // Skip empty
    if (!text) continue;

    // Keep list items (usually parameters/options)
    if (node.type === "list") {
      lines.push(text);
      continue;
    }

    // Keep tables (parameter tables)
    if (node.type === "table") {
      lines.push(text);
      continue;
    }

    // Keep short paragraphs (likely descriptions), skip long prose
    if (node.type === "paragraph") {
      if (text.length <= 200) {
        lines.push(text);
      }
      // Skip long paragraphs — they're usually tutorial prose
      continue;
    }

    // Keep inline code / definitions
    if (node.type === "definition" || node.type === "html") {
      if (text.length <= 300) {
        lines.push(text);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Determine chunk type based on content
 */
function classifyChunk(heading: string, content: string, hasCode: boolean): DocChunk["type"] {
  const lower = heading.toLowerCase() + " " + content.toLowerCase().slice(0, 200);

  if (lower.includes("example") || lower.includes("usage") || (hasCode && content.length < 500)) {
    return "example";
  }
  if (lower.includes("parameter") || lower.includes("argument") || lower.includes("option")) {
    return "parameter";
  }
  if (
    lower.includes("endpoint") ||
    lower.includes("method") ||
    lower.includes("function") ||
    lower.includes("create") ||
    lower.includes("api")
  ) {
    return "signature";
  }
  return "guide";
}

/**
 * Create a slug from a string
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Process a single section into chunks
 */
function processSection(section: Section, libraryId: string): DocChunk[] {
  if (shouldSkip(section.heading)) return [];

  const codeBlocks = extractCodeBlocks(section.nodes);
  const essentialText = extractEssentialText(section.nodes);

  // Skip sections with no useful content
  if (!essentialText && codeBlocks.length === 0) return [];

  const chunks: DocChunk[] = [];
  const sectionSlug = slugify(section.heading);

  // Build chunk content: text + first code example
  let content = "";

  if (essentialText) {
    content += essentialText;
  }

  // Add only the first (shortest) code example
  if (codeBlocks.length > 0) {
    const shortest = codeBlocks.sort((a, b) => a.length - b.length)[0];
    if (content) content += "\n\n";
    content += "```\n" + shortest + "\n```";
  }

  // Skip if too small to be useful
  if (content.length < 30) return [];

  // Split into multiple chunks if too long
  if (content.length > MAX_CHUNK_CHARS) {
    // Split by double newline and regroup
    const parts = content.split(/\n\n+/);
    let currentContent = "";
    let partIndex = 0;

    for (const part of parts) {
      if (currentContent.length + part.length > MAX_CHUNK_CHARS && currentContent.length > 0) {
        chunks.push({
          id: `${libraryId}/${sectionSlug}-${partIndex}`,
          libraryId,
          title: section.heading,
          content: currentContent.trim(),
          section: section.heading,
          type: classifyChunk(section.heading, currentContent, currentContent.includes("```")),
        });
        partIndex++;
        currentContent = part;
      } else {
        currentContent += (currentContent ? "\n\n" : "") + part;
      }
    }

    // Remaining content
    if (currentContent.trim().length > 30) {
      chunks.push({
        id: `${libraryId}/${sectionSlug}-${partIndex}`,
        libraryId,
        title: section.heading,
        content: currentContent.trim(),
        section: section.heading,
        type: classifyChunk(section.heading, currentContent, currentContent.includes("```")),
      });
    }
  } else {
    chunks.push({
      id: `${libraryId}/${sectionSlug}`,
      libraryId,
      title: section.heading,
      content: content.trim(),
      section: section.heading,
      type: classifyChunk(section.heading, content, codeBlocks.length > 0),
    });
  }

  return chunks;
}

/**
 * Process a markdown file into chunks
 */
function processMarkdownFile(filePath: string, libraryId: string): DocChunk[] {
  const raw = readFileSync(filePath, "utf-8");
  const tree = parser.parse(raw) as Root;
  const sections = splitIntoSections(tree);

  const allChunks: DocChunk[] = [];
  for (const section of sections) {
    const chunks = processSection(section, libraryId);
    allChunks.push(...chunks);
  }

  return allChunks;
}

/**
 * Process all docs for a library (all .md files in its folder)
 */
function processLibrary(libraryId: string): DocChunk[] {
  const libDir = join(DOCS_DIR, libraryId);

  if (!existsSync(libDir)) {
    console.error(`❌ No docs found for library: ${libraryId} (expected at ${libDir})`);
    return [];
  }

  const files = readdirSync(libDir).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.error(`❌ No .md files found in ${libDir}`);
    return [];
  }

  const allChunks: DocChunk[] = [];

  for (const file of files) {
    console.log(`  📄 Processing ${file}...`);
    const chunks = processMarkdownFile(join(libDir, file), libraryId);
    allChunks.push(...chunks);
    console.log(`     → ${chunks.length} chunks extracted`);
  }

  return allChunks;
}

// ─── Main ──────────────────────────────────────────────────────

function main() {
  console.log("🔧 Context45 Documentation Processor\n");

  // Find all library folders in docs/
  const libraries = readdirSync(DOCS_DIR).filter((f) => {
    const p = join(DOCS_DIR, f);
    try {
      return readdirSync(p).some((file) => file.endsWith(".md"));
    } catch {
      return false;
    }
  });

  if (libraries.length === 0) {
    console.error("❌ No libraries found in docs/. Add markdown files to docs/<library-name>/");
    process.exit(1);
  }

  console.log(`Found ${libraries.length} libraries: ${libraries.join(", ")}\n`);

  // Ensure output dir exists
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
