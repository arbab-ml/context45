import fs from "node:fs";
import path from "node:path";

export interface TOCItem {
  depth: number;
  text: string;
  slug: string;
}

export function getProcessedMd(libraryId: string): string {
  const mdPath = path.join(process.cwd(), "docs", libraryId, "_processed.md");
  return fs.readFileSync(mdPath, "utf-8");
}

export function extractTOC(markdown: string): TOCItem[] {
  return [...markdown.matchAll(/^(#{2,3})\s+(.+)/gm)].map((m) => ({
    depth: m[1].length,
    text: m[2].replace(/`/g, ""),
    slug: m[2]
      .toLowerCase()
      .replace(/`/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  }));
}
