/**
 * A library registered in Context45
 */
export interface Library {
  id: string; // e.g. "openai" or "claude"
  name: string; // e.g. "OpenAI API" or "Claude API"
  description: string;
  version: string;
}

/**
 * A processed documentation chunk ready for vector storage.
 * Each chunk is a small, essential piece of documentation (~200-400 tokens).
 */
export interface DocChunk {
  id: string; // unique ID: "openai/chat-completions-create"
  libraryId: string; // e.g. "openai"
  title: string; // e.g. "chat.completions.create"
  content: string; // the actual compressed doc content
  section: string; // e.g. "Chat Completions"
  type: "signature" | "example" | "parameter" | "guide";
}

/**
 * Metadata stored alongside vectors in Upstash
 */
export interface VectorMetadata {
  [key: string]: string;
  libraryId: string;
  title: string;
  content: string;
  section: string;
  type: string;
}

/**
 * Registry of all available libraries
 */
export const LIBRARIES: Library[] = [
  {
    id: "openai",
    name: "OpenAI API",
    description:
      "OpenAI API reference — models, chat completions, embeddings, images, assistants, and more.",
    version: "latest",
  },
  {
    id: "claude",
    name: "Claude API",
    description:
      "Anthropic Claude API reference — messages, models, vision, tool use, streaming, and more.",
    version: "latest",
  },
];
