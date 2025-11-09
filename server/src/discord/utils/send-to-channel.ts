import type { Client } from "discord.js";
import { isSendableChannel } from "./channel-guard";
import logger from "@/logger";

/**
 * Sends a message to a Discord channel using a bot client
 *
 * @param client - The Discord client instance
 * @param channelId - The Discord channelId, where the message will be sent
 * @param message - The message content to send to the channel
 *
 * @returns Promise that resolves when message is sent
 */
export const sendMessage = async (
  client: Client,
  channelId: string,
  message: string
): Promise<void> => {
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId);

    if (isSendableChannel(channel)) {
      await channel.send(message);
    }
  } catch (error) {
    logger.error(`Failed to send a message to channel ID:${channelId}:`, error);
  }
};
