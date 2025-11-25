import { MessageFlags } from "discord.js";
import type {
  Client,
  Interaction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";
import type { Pool } from "pg";
import db from "@/db";
import { handleWaitlistButton } from "./waitlist-buttons";
import type { CommandModule } from "@/discord/loader/main/command-loader";

/**
 * Ticket button handler function signature
 */
export type TicketHandler = (
  interaction: ButtonInteraction,
  mainBot: Client,
  db: Pool
) => Promise<void>;

/**
 * Registers the main interaction handler for chat commands, buttons, and tickets
 *
 * @param mainBot - The Discord client instance
 * @param commandHandlers - Collection of slash command handlers
 * @param ticketHandlers - Map of ticket button handlers
 */
export default function registerClientInteractionHandler(
  mainBot: Client,
  commandHandlers: Collection<string, CommandModule>,
  ticketHandlers: Map<string, TicketHandler>
): void {
  mainBot.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleChatCommand(interaction, commandHandlers);
      return;
    }

    if (interaction.isButton()) {
      await handleButtonInteraction(interaction, mainBot, ticketHandlers);
    }
  });
}

/**
 * Handles slash command interactions
 *
 * @param interaction - The chat input interaction
 * @param commandHandlers - Handlers for commands
 */
async function handleChatCommand(
  interaction: ChatInputCommandInteraction,
  commandHandlers: Collection<string, CommandModule>
): Promise<void> {
  const command = commandHandlers.get(interaction.commandName);

  if (!command) {
    logger.warn(`Unknown command received /${interaction.commandName}`);
    return;
  }

  logger.info(
    `${interaction.user.tag} (${interaction.user.id}) ran /${interaction.commandName}`
  );

  try {
    await command.execute(interaction, db);
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);

    const replyMethod =
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply;

    await replyMethod.call(interaction, {
      content: "❌ Command failed.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

/**
 * Handles button interactions (waitlist and tickets)
 *
 * @param interaction - The button interaction
 * @param mainBot - The Discord client instance
 * @param ticketHandlers - Handlers for tickets
 */
async function handleButtonInteraction(
  interaction: ButtonInteraction,
  mainBot: Client,
  ticketHandlers: Map<string, TicketHandler>
): Promise<void> {
  const handled = await handleWaitlistButton(interaction);
  if (handled) return;

  const handler = ticketHandlers.get(interaction.customId);
  if (!handler) return;

  try {
    await handler(interaction, mainBot, db);
  } catch (error) {
    logger.error(`Error handling button "${interaction.customId}":`, error);

    const replyMethod =
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply;

    await replyMethod.call(interaction, {
      content: "❌ Something went wrong.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
