import type { Client } from "discord.js";
import { isSendableChannel } from "../utils/channel-guard";
import logger from "@/logger";

/**
 * Sends a notification message to a specific Discord channel using a bot client
 *
 * @param client - The Discord bot instance
 * @param message - The message content to send to the channel
 *
 * @returns Promise that resolves when message is sent
 */
export const sendBotNotification = async (
  client: Client,
  message: string
): Promise<void> => {
  if (process.env.NODE_ENV !== "production") return;

  const channelId = process.env.DISCORD_MINECRAFT_CHAT_CHANNEL_ID;
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId);

    if (isSendableChannel(channel)) {
      await channel.send(message);
    }
  } catch (error) {
    logger.error("Failed to send bot notification:", error);
  }
};
