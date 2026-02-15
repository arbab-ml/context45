export interface Library {
  id: string;
  name: string;
  description: string;
  version: string;
  source: string;
  sections: number;
}

export const LIBRARIES: Library[] = [
  {
    id: "claude",
    name: "Claude API",
    description:
      "Anthropic Claude API reference — messages, models, vision, tool use, streaming, and more.",
    version: "latest",
    source: "platform.claude.com",
    sections: 79,
  },
  {
    id: "openai",
    name: "OpenAI API",
    description:
      "OpenAI API reference — models, chat completions, embeddings, images, assistants, and more.",
    version: "latest",
    source: "developers.openai.com",
    sections: 67,
  },
];
