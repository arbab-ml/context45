#!/usr/bin/env node

/**
 * Context45 MCP Server
 *
 * Minimal documentation context for AI assistants.
 * "All the docs. None of the bloat."
 *
 * Tools:
 * - resolve-library: Find a library by name
 * - get-docs: Get minimal, essential documentation for a library
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Index } from "@upstash/vector";
import { config } from "dotenv";
import { LIBRARIES } from "../types.js";
import type { VectorMetadata } from "../types.js";

config();

// ─── Vector Client ─────────────────────────────────────────────

function getVectorClient(): Index<VectorMetadata> {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN. " +
        "Set them in your environment or .env file."
    );
  }

  return new Index<VectorMetadata>({ url, token });
}

// ─── Server Setup ──────────────────────────────────────────────

const server = new McpServer({
  name: "context45",
  version: "0.1.0",
});

let vectorIndex: Index<VectorMetadata>;

try {
  vectorIndex = getVectorClient();
} catch (e) {
  console.error(e);
  process.exit(1);
}

// ─── Tool: resolve-library ─────────────────────────────────────

server.tool(
  "resolve-library",
  "Find a documentation library by name. Returns matching library IDs that can be used with get-docs.",
  {
    query: z.string().describe("Library name to search for (e.g. 'openai', 'claude', 'anthropic')"),
  },
  async ({ query }) => {
    const lower = query.toLowerCase();

    const matches = LIBRARIES.filter(
      (lib) =>
        lib.id.includes(lower) ||
        lib.name.toLowerCase().includes(lower) ||
        lib.description.toLowerCase().includes(lower)
    );

    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No libraries found matching "${query}". Available libraries: ${LIBRARIES.map((l) => l.id).join(", ")}`,
          },
        ],
      };
    }

    const result = matches
      .map((lib) => `- **${lib.name}** (id: \`${lib.id}\`): ${lib.description}`)
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${matches.length} matching libraries:\n\n${result}\n\nUse the library id with the get-docs tool.`,
        },
      ],
    };
  }
);

// ─── Tool: get-docs ────────────────────────────────────────────

server.tool(
  "get-docs",
  "Get minimal, essential documentation for a library. Returns only the most relevant context (~500-1000 tokens) to save context window space.",
  {
    libraryId: z
      .string()
      .describe("Library ID from resolve-library (e.g. 'openai', 'claude')"),
    query: z
      .string()
      .describe("What you need docs for (e.g. 'chat completions', 'streaming', 'tool use')"),
    maxResults: z
      .number()
      .min(1)
      .max(10)
      .default(3)
      .describe("Max number of doc chunks to return (default: 3, max: 10)"),
  },
  async ({ libraryId, query, maxResults }) => {
    // Validate library exists
    const library = LIBRARIES.find((l) => l.id === libraryId);
    if (!library) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Library "${libraryId}" not found. Use resolve-library to find available libraries.`,
          },
        ],
      };
    }

    try {
      // Query Upstash Vector with metadata filter
      const results = await vectorIndex.query<VectorMetadata>({
        data: `${query} ${library.name}`,
        topK: maxResults,
        includeMetadata: true,
        filter: `libraryId = '${libraryId}'`,
      });

      if (!results || results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No documentation found for "${query}" in ${library.name}. The library may not have docs for this topic yet.`,
            },
          ],
        };
      }

      // Format results — minimal, dense, code-first
      const docs = results
        .filter((r) => r.metadata)
        .map((r) => {
          const meta = r.metadata!;
          return `### ${meta.title}\n${meta.content}`;
        })
        .join("\n\n---\n\n");

      const tokenEstimate = Math.round(docs.length / 4);

      return {
        content: [
          {
            type: "text" as const,
            text: `📖 **${library.name}** — "${query}" (~${tokenEstimate} tokens)\n\n${docs}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error querying docs: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  }
);

// ─── Start ─────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start Context45 MCP server:", err);
  process.exit(1);
});
