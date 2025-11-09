import type { Client } from "discord.js";
import logger from "@/logger";
import { requireProduction } from "@/utils/guard/run-guard";
import { isSendableChannel } from "@/discord/utils/channel-guard";

/**
 * Sends a daily reminder message to the configured Minecraft channel
 * Only runs in production environment
 *
 * @param webBot - The Discord client instance
 */
export async function sendDailyReminder(webBot: Client): Promise<void> {
  if (!requireProduction()) return;

  const message: string =
    "💡 Don't forget to do /daily for rewards and complete quests to earn PLC token!";
  const channelId = process.env.DISCORD_MINECRAFT_CHAT_CHANNEL_ID;

  try {
    const channel = await webBot.channels.fetch(channelId);
    if (channel && isSendableChannel(channel)) {
      await channel.send(message);
      logger.info("Sent daily reminder to channel:", channelId);
    } else {
      logger.warn(`Channel ${channelId} not text-based or found`);
    }
  } catch (error) {
    logger.error("Failed to send daily reminder:", error);
  }
}
