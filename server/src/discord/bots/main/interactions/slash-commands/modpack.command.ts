import config from "@/config";
import { ButtonComponents } from "@/discord/components/buttons";
import { EmbedPresets } from "@/discord/embeds";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Slash command configuration for the /modpack command
 * Displays Minecraft server modpack link
 */
export const data = new SlashCommandBuilder()
  .setName("modpack")
  .setDescription(
    `Get the modpack for ${config.minecraft.server.serverName} server`
  );

/**
 * Whether this command should only be available in production environment
 */
export const prodOnly = false;

/**
 * Execute the /modpack command
 *
 * Creates a Discord embed showing:
 * - Link to the modpack
 *
 * @param interaction - The Discord slash command interaction
 * @returns Promise resolving when the reply has been sent
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = EmbedPresets.commands.modpack();
  const button = ButtonComponents.openCurseForge();

  await interaction.reply({
    embeds: [embed.build()],
    components: [button],
    flags: MessageFlags.Ephemeral,
  });
}
