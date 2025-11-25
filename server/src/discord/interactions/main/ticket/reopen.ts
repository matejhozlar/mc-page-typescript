import type { ButtonInteraction } from "discord.js";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { tickets } from "@/db";
import { isTextChannel } from "@/discord/utils/channel-guard";

/**
 * Reopens a previously closed ticket by restoring user permissions and updating database status
 *
 * Deletes the admin panel message, grants the original ticket owner view/send permissions
 * and marks the ticket as open in the database
 *
 * @param interaction - The button interaction that triggered the reopening
 */
export default async function reopenTicket(
  interaction: ButtonInteraction
): Promise<void> {
  const channel = interaction.channel;

  if (!channel || !isTextChannel(channel)) {
    logger.error("Channel not found or is not a text channel");
    await interaction.reply({
      content: "❌ Failed to reopen ticket: Invalid channel.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const ticket = await tickets.find({ channelId: channel.id });

    if (!ticket) {
      await interaction.reply({
        content: "❌ Could not find ticket in the database.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { discordId: originalUserId, adminMessageId: adminMessageId } =
      ticket;

    if (adminMessageId) {
      const msg = await channel.messages
        .fetch(adminMessageId)
        .catch(() => null);
      if (msg) {
        await msg.delete().catch((error) => {
          logger.error("Failed to delete admin message:", error);
        });
      }
    }

    if (!originalUserId) {
      await interaction.reply({
        content: "❌ Could not find original ticket owner in the database.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await channel.permissionOverwrites.edit(originalUserId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    await tickets.open({ channelId: channel.id });

    await interaction.deferUpdate();

    const reopenedEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`✅ Ticket has been reopened for <@${originalUserId}>`);

    await channel.send({
      embeds: [reopenedEmbed],
    });
  } catch (error) {
    logger.error("Failed to reopen ticket:", error);
    await interaction.reply({
      content: "⚠️ Something went wrong while reopening the ticket.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
