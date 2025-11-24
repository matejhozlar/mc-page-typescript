import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  MessageFlags,
  MessageActionRowComponentBuilder,
  ComponentType,
} from "discord.js";
import logger from "@/logger";
import { admins } from "@/db";
import { sendInvite } from "@/services/email/invites";
import { requireProduction } from "@/utils/guard/run-guard";
import { memberHasRole } from "@/discord/utils/roles";

/**
 * Handle waitlist button interactions: waitlist:accept:<id>, waitlist:decline:<id>
 *
 * @param interaction - The button interaction from Discord
 * @returns True if the interactio was handled, false otherwise
 */
export async function handleWaitlistButton(
  interaction: ButtonInteraction
): Promise<boolean> {
  if (!requireProduction()) return false;

  const [ns, action, rawId] = (interaction.customId || "").split(":");
  if (ns !== "waitlist") return false;

  const ADMIN_ROLE_ID = process.env.DISCORD_ADMIN_ROLE_ID;

  const hasRole = ADMIN_ROLE_ID
    ? memberHasRole(interaction, ADMIN_ROLE_ID)
    : false;

  let inDb = false;
  try {
    inDb = await admins.exists({ discordId: interaction.user.id });
  } catch (error) {
    logger.error("Error checking admin status:", error);
  }

  if (!hasRole && !inDb) {
    await interaction.reply({
      content: "You must be an admin to do that.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (!interaction.replied && !interaction.deferred) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  }

  /**
   * Disable all non-link buttons in the message components
   */
  const disableNonLinkButtons =
    (): ActionRowBuilder<MessageActionRowComponentBuilder>[] => {
      return interaction.message.components
        .filter((row) => row.type === ComponentType.ActionRow)
        .map((row) => {
          const newRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>();
          if ("components" in row) {
            row.components.forEach((component) => {
              if (component.type === ComponentType.Button) {
                const btn = ButtonBuilder.from(component);
                if (btn.data.style !== ButtonStyle.Link) {
                  btn.setDisabled(true);
                }
                newRow.addComponents(btn);
              }
            });
          }

          return newRow;
        });
    };

  try {
    if (action === "accept") {
      const result = await sendInvite(parseInt(rawId));

      if (!result.ok) {
        await interaction.editReply(
          `Could not send invite: ${result?.msg || "Uknown error"}`
        );
        return true;
      }

      await interaction.message.edit({
        components: disableNonLinkButtons(),
        content: `✅ Accepted by <@${interaction.user.id}>`,
        embeds: interaction.message.embeds,
      });

      await interaction.editReply("Invite was sent successfully");
      return true;
    }

    if (action === "decline") {
      await interaction.message.edit({
        components: disableNonLinkButtons(),
        content: `❌ Declined by <@${interaction.user.id}>`,
        embeds: interaction.message.embeds,
      });

      await interaction.editReply("Declined.");
      return true;
    }

    await interaction.editReply("Unknown action.");
    return true;
  } catch (error) {
    logger.error("Waitlist button handler error:", error);

    try {
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply("There was an error handling that action.");
      }
    } catch (error) {
      logger.error("Error sending error reply:", error);
    }

    return true;
  }
}
