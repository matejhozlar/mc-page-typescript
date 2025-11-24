import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "@/config";

/**
 * Creates action row with a link to the Admin Panel
 */
export function createAdminPanelLink(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Open Admin Panel")
      .setStyle(ButtonStyle.Link)
      .setURL(config.links.adminPanel)
  );
}

/**
 * Creates action row with Accept/Decline buttons for waitlist
 */
export function createWaitlistActionButtons(
  submissionId: number
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`waitlist:accept:${submissionId}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`waitlist:decline:${submissionId}`)
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger)
  );
}
