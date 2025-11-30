import config from "@/config";
import { EmbedPresets } from "@/discord/embeds";
import { MinecraftStatusManager } from "@/services/minecraft-status";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

/**
 * Slash command configuration for the /list command
 * Displays Minecraft server player list
 */
export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription(
    `Shows the list of players currently online on ${config.minecraft.server.serverName} server`
  );

/**
 * Whether this command should only be available in production environment
 */
export const prodOnly = false;

/**
 * Execute the /list command
 *
 * Creates a Discord embed showing:
 * - Minecraft Server Status (if available)
 * - Minecraft Server player list
 *
 * @param interaction - The Discord slash command interaction
 * @returns Promise resolving when the reply has been sent
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const statusManager = MinecraftStatusManager.getInstance();
  const status = statusManager.getStatus();

  if (!status) {
    await interaction.editReply({
      content: "Unable to fetch server status. Please try again later",
    });
    return;
  }

  const embed = EmbedPresets.commands.list(status);

  await interaction.editReply({ embeds: [embed.build()] });
}
