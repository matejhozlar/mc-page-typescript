import type {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";
import { isSendableChannel } from "@/discord/utils/channel-guard";

export interface DiscordNotificationConfig {
  channelId: string;
  embeds: EmbedBuilder[];
  components?: ActionRowBuilder<ButtonBuilder>[];
  content?: string;
}

/**
 * Discord notification service for sending messages to Discord channels
 */
export class DiscordNotificationService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Sends a notification to a specific Discord channel
   *
   * @param config - Notification configuration
   * @returns Promise resolving when the notification is sent
   */
  async send(config: DiscordNotificationConfig): Promise<void> {
    const { channelId, embeds, components, content } = config;

    try {
      const guild = await this.client.guilds.fetch(
        process.env.DISCORD_GUILD_ID
      );
      const channel = await guild.channels.fetch(channelId);

      if (!isSendableChannel(channel)) {
        throw new Error(`Channel ${channelId} is not a sendable channel`);
      }

      await channel.send({
        content,
        embeds,
        components,
      });

      logger.info(`Discord notification sent to channel ${channelId}`);
    } catch (error) {
      logger.error(
        `Failed to send Discord notification to ${channelId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Sends a notification to the admin channel
   *
   * @param embeds - Embeds to send
   * @param components - Optional components (buttons, etc.)
   * @param content - Optional content
   *
   * @returns Promise resolving when the notification is sent
   */
  async sendToAdmin(
    embeds: EmbedBuilder[],
    components?: ActionRowBuilder<ButtonBuilder>[],
    content?: string
  ): Promise<void> {
    await this.send({
      channelId: process.env.DISCORD_ADMIN_CHAT_CHANNEL_ID,
      embeds,
      components,
      content,
    });
  }
}
