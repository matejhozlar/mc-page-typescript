import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import path from "path";
import { fileURLToPath } from "url";
import logger from "@/logger";
import fs from "fs/promises";
import type { AssistantConfig } from "@/types/ai/assistant";
import configuration from "@/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AssistantService {
  private openai: OpenAI;
  private systemPrompt: string;
  private config: AssistantConfig;

  constructor(config: Partial<AssistantConfig> = {}) {
    this.config = { ...configuration.Ai, ...config };
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.systemPrompt = this.config.fallbackPrompt;
  }

  async initialize(): Promise<void> {
    try {
      const filepath = path.join(__dirname, this.config.systemPromptPath);
      this.systemPrompt = await fs.readFile(filepath, "utf-8");
      logger.info("Assistant system prompt loaded successfully");
    } catch (error) {
      logger.warn("Could not load assistant prompt file, using fallback.");
    }
  }

  async ask(question: string, context: string = ""): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt },
      ...(context ? [{ role: "assistant" as const, content: context }] : []),
      { role: "user", content: question },
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI assistant");
      }

      return content.trim();
    } catch (error) {
      logger.error("OpenAI assistant error:", error);
      throw new Error("Failed to get response from assistant");
    }
  }
}

export const assistantService = new AssistantService();

await assistantService.initialize();

export async function askAssistant(
  question: string,
  context: string = ""
): Promise<string> {
  return assistantService.ask(question, context);
}
