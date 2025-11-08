import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import logger from "@/logger";
import config from "@/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * OpenAI client instance configured with API key
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt for the Createrington AI assistant
 * Loaded from assistantPrompt.txt or uses fallback
 */
let assistantSystemPrompt =
  "You are CreateringtonAI, the official assistant for the Createrington Minecraft server. Do NOT answer anything unrelated to this server. Only answer based on provided commands, ranks, or server features.";

const filepath = path.join(__dirname, "assistantPrompt.txt");

(async () => {
  try {
    assistantSystemPrompt = await fs.readFile(filepath, "utf-8");
  } catch (error) {
    logger.warn("Could now load assistant prompt file, using fallback");
  }
})();

/**
 * Sends a question to the Createrington AI assistant and returns the response
 *
 * Uses OpenAI to answer questions about the Createrington Minecraft server
 * Optionally accepts prior assistant context to maintain conversation continuity
 *
 * @param question - The user's question related to the Createrington Minecraft server
 * @param context - Optional prior assistant message context to help inform the reply
 * @returns The assistant's textual response
 * @throws Error if OpenAI call fails
 */
export async function askAssistant(
  question: string,
  context: string = ""
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: assistantSystemPrompt },
    ...(context ? [{ role: "assistant" as const, content: context }] : []),
    { role: "user", content: question },
  ];

  const response = await openai.chat.completions.create({
    model: config.services.ai.model,
    messages,
    temperature: config.services.ai.temperature,
    max_tokens: config.services.ai.maxTokens,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response content from OpenAI");
  }

  return content.trim();
}
