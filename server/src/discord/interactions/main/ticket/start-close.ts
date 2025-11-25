import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { isSendableChannel } from "@/discord/utils/channel-guard";

/**
 * Initiates the ticket close confirmation by sending a message with confirmation buttons
 *
 * @param interaction - The button interaction triggered by click the "Close" button
 */
export default async function startCloseTicket(
  interaction: ButtonInteraction
): Promise<void> {
  const channel = interaction.channel;

  if (!channel || !isSendableChannel(channel)) {
    logger.error("Channel not found or is not sendable");
    return;
  }

  try {
    const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_close_ticket")
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancel_close_ticket")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.deferUpdate();

    await channel.send({
      content: "⚠️ Are you sure you want to close this ticket?",
      components: [confirmRow],
    });
  } catch (error) {
    logger.error("Failed to start close ticket confirmation:", error);
  }
}
