import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface AssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPromptPath: string;
  fallbackPrompt: string;
}

export interface AssistantMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AssistantResponse {
  content: string;
  model: string;
  tokensUsed?: string;
}

export type AssistantMessageParam = ChatCompletionMessageParam;
