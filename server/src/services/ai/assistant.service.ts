import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import config from "@/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Service for interacting with OpenAI's chat completion API to provide
 * Minecraft server-specific assistance through a custom system prompt
 */
export class AssistantService {
  private openai: OpenAI;
  private systemPrompt: string;
  private promptLoaded: Promise<void>;

  constructor(
    private readonly apiKey: string = process.env.OPENAI_API_KEY || "",
    private readonly promptPath: string = path.join(
      __dirname,
      "assistantPrompt.txt"
    )
  ) {
    this.openai = new OpenAI({ apiKey: this.apiKey });
    this.systemPrompt =
      "You are CreateringtonAI, the official assistant for the Createrington Minecraft server. " +
      "Do NOT answer anything unrelated to this server. Only answer based on provided commands, ranks, or server features.";
    this.promptLoaded = this.loadSystemPrompt();
  }

  /**
   * Loads the system prompt from the file system and updates the instance prompt
   * Falls back to the default prompt if the file cannot be read
   *
   * @returns Promise resolving when the prompt is loaded or fallback is applied
   */
  private async loadSystemPrompt(): Promise<void> {
    try {
      this.systemPrompt = await fs.readFile(this.promptPath, "utf-8");
      logger.info("Assistant system prompt loaded successfully");
    } catch (error) {
      logger.warn("Could not load assistant prompt file, using fallback");
    }
  }

  /**
   * Waits for the system prompt to finish loading before allowing further operations
   *
   * @returns Promise resolving when the prompt is ready for use
   */
  private async ensureReady(): Promise<void> {
    await this.promptLoaded;
  }

  /**
   * Sends a user question to the OpenAI API and retrieves the assistant's response
   *
   * @param question - The user's question about the Minecraft server
   * @param options - Optional configuration including context, model, temperature, and maxTokens
   * @returns Promise resolving to the assistant's trimmed text response
   * @throws Error if the OpenAI API calls fails or returns no content
   */
  async ask(
    question: string,
    options?: {
      context?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    await this.ensureReady();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt },
      ...(options?.context
        ? [{ role: "assistant" as const, content: options.context }]
        : []),
      { role: "user", content: question },
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: options?.model ?? config.services.ai.model,
        messages,
        temperature: options?.temperature ?? config.services.ai.temperature,
        max_tokens: options?.maxTokens ?? config.services.ai.maxTokens,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      return content.trim();
    } catch (error) {
      logger.error("Failed to get assistant response:", error);
      throw new Error("Failed to communicate with AI assistant");
    }
  }

  /**
   * Retrieves the currently loaded system prompt text
   *
   * @returns The current system prompt string
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * Reloads the system prompt from the file system, updating the instance with fresh content
   *
   * @returns Promise resolving when the prompt has been reloaded
   */
  async reloadSystemPrompt(): Promise<void> {
    await this.loadSystemPrompt();
  }
}
