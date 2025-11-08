import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "@/config";

/**
 * Creates action row with a link to the Admin Panel
 *
 * @returns Action row with the admin button
 */
export function createAdminPanelLink(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Open Admin Panel")
      .setStyle(ButtonStyle.Link)
      .setURL(config.links.adminPanel)
  );
}
