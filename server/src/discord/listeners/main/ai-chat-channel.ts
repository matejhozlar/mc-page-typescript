import type { Client, Message } from "discord.js";
import { assistantService } from "@/services/ai";
import logger from "@/logger";
import { requireProduction } from "@/utils/guard/run-guard";
import { users, logs } from "@/db";
import { isDMChannel } from "@/discord/utils/channel-guard";
import type { LogAiCreate } from "@/db/queries/log/ai";
import config from "@/config";

const DAILY_LIMIT = config.services.ai.dailyLimit;

/**
 * Sets up private-message-only AI chat listener for the Discord bot
 *
 * Enbles registered users to chat with the AI assistant via DMs, with a daily
 * message limit to prevent abuse. Only works in production environment
 *
 * @param mainBot - The Discord client instance
 */
export default function setupAIChatListener(mainBot: Client): void {
  if (!requireProduction()) return;

  mainBot.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;

    if (!isDMChannel(message.channel)) return;

    const userId = message.author.id;

    try {
      const user = await users.exists({ discordId: userId });

      if (!user) {
        await message.reply(
          "❌ You are not registered with Createrington. Please apply at <https://create-rington.com>."
        );
        return;
      }

      const messageCount = await logs.ai.countToday(userId);

      if (messageCount >= DAILY_LIMIT) {
        await message.reply(
          `⛔ You've reached the **daily limit of ${DAILY_LIMIT} AI messages**. Try again tomorrow.`
        );
        return;
      }

      await message.channel.sendTyping();
      const response = await assistantService.ask(message.content);
      await message.reply(response);

      const params: LogAiCreate = {
        discord_id: userId,
        message: message.content,
      };

      await logs.ai.create(params);
    } catch (error) {
      logger.error("AI chat error:", error);
      await message.reply("⚠️ The assistant encountered an error.");
    }
  });
}
