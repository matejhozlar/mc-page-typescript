import { EmbedPresets } from "@/discord/embeds/embed-presets";
import { MinecraftStatusManager } from "@/services/minecraft-status";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Slash command configuration for the /ip command
 * Displays Minecraft server connection information and current status
 */
export const data = new SlashCommandBuilder()
  .setName("ip")
  .setDescription(
    `Get connection details and status for ${process.env.SERVER_NAME} server`
  );

/**
 * Whether this command should only be available in production environment
 */
export const prodOnly = false;

/**
 * Execute the /ip command to display Minecraft server connection information
 *
 * Creates a Discord embed showing:
 * - Server status (online/offline)
 * - Server IP address and port
 * - Current player count vs max players
 * - Server version and mod loader
 * - Message of the day (MOTD)
 * - Support ticket link
 *
 * @param interaction - The Discord slash command interaction
 * @returns Promise resolving when the reply has been sent
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const statusManager = MinecraftStatusManager.getInstance();
  const status = statusManager.getStatus();

  if (!status) {
    const errorEmbed = EmbedPresets.error(
      "Status unavailable",
      "Unable to fetch server status, please try again later"
    ).build();

    await interaction.editReply({ embeds: [errorEmbed] });
    return;
  }

  const embed = EmbedPresets.minecraftServerInfo(status, {
    serverName: process.env.SERVER_NAME,
    serverDomain: process.env.SERVER_DOMAIN,
    guildId: interaction.guild?.id,
    ticketChannelId: process.env.DISCORD_TICKET_MESSAGE_CHANNEL_ID,
  }).build();

  await interaction.editReply({ embeds: [embed] });
}
