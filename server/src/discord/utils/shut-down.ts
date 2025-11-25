import type { Client } from "discord.js";
import { sendBotNotification } from "@/discord/notifiers/send-bot-notification";

/**
 * Options for gracefully shutting down a Discord bot
 */
interface ShutdownBotOptions {
  notify?: boolean;
  name?: string;
  message?: string;
}

/**
 * Gracefully shuts down a Discord bot and optionally sends a notification
 *
 * Destroys the bot client connection and logs the shutdown process
 * Can optionally send a notification message to a Discord channel before shutting down
 *
 * @param client - The Discord client instance to shut down
 * @param options - Shutdown configuration options
 */
export const shutdownBot = async (
  client: Client,
  options: ShutdownBotOptions = {}
): Promise<void> => {
  const { notify = false, name = "Bot", message = "" } = options;

  logger.info(`Shutting down ${name}...`);

  try {
    if (notify && message) {
      await sendBotNotification(client, message);
    }

    await client.destroy();
    logger.info(`${name} shut down successfully`);
  } catch (error) {
    logger.error(`Error during ${name} shutdown:`, error);
  }
};
