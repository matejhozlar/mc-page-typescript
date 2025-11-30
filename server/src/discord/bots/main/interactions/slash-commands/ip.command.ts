import { EmbedPresets } from "@/discord/embeds";
import { MinecraftStatusManager } from "@/services/minecraft-status";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
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
 * Execute the /ip command
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
  let embed: EmbedBuilder;

  if (!status) {
    embed = EmbedPresets.commands.ip().build();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  embed = EmbedPresets.commands.ip(status).build();

  await interaction.editReply({ embeds: [embed] });
}
