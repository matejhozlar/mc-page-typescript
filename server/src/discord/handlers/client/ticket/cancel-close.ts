import type { ButtonInteraction } from "discord.js";
import logger from "@/logger";

/**
 * Handles the cancel button for ticket closure confirmation
 * Deletes the confirmation message when the user cancels closing a ticket
 *
 * @param {ButtonInteraction} interaction - The button interaction from the cancel button
 */
export default async function cancelCloseTicket(
  interaction: ButtonInteraction
): Promise<void> {
  try {
    await interaction.message.delete().catch((error) => {
      logger.error("Failed to delete message:", error);
    });
  } catch (error) {
    logger.error("Failed to delete cancel confirmation message:", error);
  }
}
