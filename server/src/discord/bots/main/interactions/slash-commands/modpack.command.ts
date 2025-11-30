import config from "@/config";
import { ButtonComponents } from "@/discord/components/buttons";
import { EmbedPresets } from "@/discord/embeds";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("modpack")
  .setDescription(
    `Get the modpack for ${config.minecraft.server.serverName} server`
  );

export const prodOnly = false;

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = EmbedPresets.commands.modpack();
  const button = ButtonComponents.openCurseForge();

  await interaction.reply({
    embeds: [embed.build()],
    components: [button],
    flags: MessageFlags.Ephemeral,
  });
}
