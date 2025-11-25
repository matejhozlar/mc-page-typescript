import type { ButtonInteraction, Client } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { tickets } from "@/db";
import { isSendableChannel } from "@/discord/utils/channel-guard";

/**
 * Deletes a ticket channel after a 5-second delay and marks it as deleted in the database
 *
 * @param interaction - The button interaction that triggered the deletion
 */
export default async function deleteTicket(
  interaction: ButtonInteraction
): Promise<void> {
  const channel = interaction.channel;

  if (!channel) {
    logger.error("Channel not found in interaction");
    return;
  }

  try {
    await interaction.deferUpdate();

    const embed = new EmbedBuilder()
      .setDescription("Ticket will be deleted in a few seconds")
      .setColor(0xed4245);

    if (isSendableChannel(channel)) {
      await channel.send({ embeds: [embed] });
    }

    await tickets.close({ channelId: channel.id });

    setTimeout(() => {
      channel.delete().catch((error) => {
        logger.error("Failed to delete ticket channel:", error);
      });
    }, 5000);
  } catch (error) {
    logger.error("Failed to delete ticket:", error);
  }
}
