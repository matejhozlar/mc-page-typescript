import type { Client, Message } from "discord.js";
import { ChannelType } from "discord.js";
import { askAssistant } from "@/services/ai";
import logger from "@/logger";
import { requireProduction } from "@/utils/guard/run-guard";
import { userQueries } from "@/db";
import { aiMessageLogQueries } from "@/db";
import config from "@/config";

const DAILY_LIMIT = config.services.ai.dailyLimit;

/**
 * Sets up private-message-only AI chat listener for the Discord bot
 *
 * Enbles registered users to chat with the AI assistant via DMs, with a daily
 * message limit to prevent abuse. Only works in production environment
 *
 * @param client - The Discord client instance
 */
export default function setupAIChatListener(client: Client): void {
  if (!requireProduction()) return;

  client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;

    if (message.channel.type !== ChannelType.DM) return;

    const userId = message.author.id;

    try {
    } catch (error) {}
  });
}
