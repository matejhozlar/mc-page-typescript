import config from "@/config";
import { ButtonComponents } from "@/discord/components/buttons";
import { EmbedPresets } from "@/discord/embeds";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Slash command configuration for the /map command
 * Displays Minecraft server live map link
 */
export const data = new SlashCommandBuilder()
  .setName("map")
  .setDescription(
    `View the live map for ${config.minecraft.server.serverName} server`
  );

/**
 * Whether this command should only be available in production environment
 */
export const prodOnly = false;

/**
 * Execute the /map command
 *
 * Creates a Discord embed showing:
 * - Link to the live web map
 *
 * @param interaction - The Discord slash command interaction
 * @returns Promise resolving when the reply has been sent
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = EmbedPresets.commands.map();
  const button = ButtonComponents.openMap();

  await interaction.reply({
    embeds: [embed.build()],
    components: [button],
    flags: MessageFlags.Ephemeral,
  });
}
