import type { ButtonInteraction } from "discord.js";
import logger from "@/logger";

/**
 * Handles the cancellation of a ticket close operation
 * Deletes the confirmation message when user cancels closing a ticket
 *
 * @param interaction - The button interaction from Discord
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
