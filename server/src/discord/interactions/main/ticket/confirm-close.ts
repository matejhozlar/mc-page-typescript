import type {
  ButtonInteraction,
  Client,
  PermissionOverwrites,
} from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import logger from "@/logger";
import { isTextChannel } from "@/discord/utils/channel-guard";
import { ticketQueries } from "@/db";

/**
 * Closes a support ticket by hiding the channel from the user and displaying
 * an admin control panel with transcript, reopen, and delete options
 *
 * Updates the ticket record in the database with the admin panel message ID
 *
 * @param interaction - The button interaction that triggered the close action
 * @param db - The PostgreSQL database connection pool
 */
export default async function confirmCloseTicket(
  interaction: ButtonInteraction
): Promise<void> {
  const user = interaction.user;
  const channel = interaction.channel;

  if (!channel || !isTextChannel(channel)) {
    logger.error("Channel not found or is not a text channel");
    await interaction.reply({
      content: "❌ Failed to close ticket: Invalid channel.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await interaction.message.delete().catch((error) => {
      logger.error("Failed to delete confirmation message:", error);
    });

    const memberId = channel.permissionOverwrites.cache.find(
      (po: PermissionOverwrites) =>
        po.allow.has(PermissionFlagsBits.ViewChannel) && po.type === 1
    )?.id;

    if (memberId) {
      await channel.permissionOverwrites.edit(memberId, {
        ViewChannel: false,
      });
    }

    const closedBy = `<@${user.id}>`;
    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setDescription(`Ticket Closed by ${closedBy}`);

    const adminRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_transcript")
        .setLabel("Transcript")
        .setEmoji("📄")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("reopen_ticket")
        .setLabel("Open")
        .setEmoji("🔓")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("delete_ticket")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger)
    );

    const adminPanelMessage = await channel.send({
      embeds: [embed],
      components: [adminRow],
    });

    await ticketQueries.updateAdminPanelId(channel.id, adminPanelMessage.id);
  } catch (error) {
    logger.error("Failed to close ticket:", error);
    await interaction.reply({
      content: "❌ Failed to close ticket.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
