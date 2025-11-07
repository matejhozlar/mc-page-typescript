import type { AssistantConfig } from "@/types/ai/assistant";

const config = {
  model: "gpt-3.5-turbo",
  temperature: 0.5,
  maxTokens: 500,
  systemPromptPath: "assistantPrompt.txt",
  fallbackPrompt:
    "You are CreateringtonAI, the official assistant for the Createrington Minecraft server. Do NOT answer anything unrelated to this server. Only answer based on provided commands, ranks, or server features.",
} satisfies AssistantConfig;

export default config;
