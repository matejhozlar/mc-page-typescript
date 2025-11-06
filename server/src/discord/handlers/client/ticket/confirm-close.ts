import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import type { ButtonInteraction, Client, TextChannel } from "discord.js";
import { ticketQueries } from "@/db";
import logger from "@/logger";

/**
 * Handles the logic to close a ticket: hides the channel from the user,
 * posts an admin panel with options, and updates the ticket record in the database
 *
 * @param interaction - The button interaction that triggered the close
 * @param client - The discord client instance
 */
export default async function confirmCloseTicket(
  interaction: ButtonInteraction,
  client: Client
): Promise<void> {
  const user = interaction.user;
  const channel = interaction.channel as TextChannel;

  try {
    await interaction.message.delete().catch((error) => {
      logger.error("Failed to delete confirmation message:", error);
    });

    const memberId = channel.permissionOverwrites.cache.find(
      (po) => po.allow.has(PermissionFlagsBits.ViewChannel) && po.type === 1
    )?.id;

    if (!memberId) {
      logger.warn("Could not find ticket owner for channel:", channel.id);
    } else {
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

    const updatedTicket = await ticketQueries.updateAdminMessageId(
      channel.id,
      adminPanelMessage.id
    );

    if (!updatedTicket) {
      throw new Error(`Ticket not found for channel ${channel.id}`);
    }

    logger.info(`Ticket #${updatedTicket.ticket_number} closed by ${user.tag}`);
  } catch (error) {
    logger.error("Failed to close ticket:", error);

    const replyMethod =
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply;

    await replyMethod.call(interaction, {
      content: "❌ Failed to close ticket.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
