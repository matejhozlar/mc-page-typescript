import type { Client, ColorResolvable, TextChannel } from "discord.js";
import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import logger from "@/logger";
import config from "@/config";
import { sendInviteById } from "./send-invite";
import { createTransporter } from "./transporter";
import type {
  WaitlistSubmission,
  AutoInviteResult,
  InviteResult,
} from "@/db/queries/waitlist";
import { isSendableChannel } from "@/discord/utils/channel-guard";
import { createAdminPanelLink } from "./utils/button.utils";

const { LIME_GREEN } = config.colors;

/**
 * Creates and embed for waitlist notifications
 *
 * @param submission - The waitlist submission details
 * @param color - Color used for embed
 * @returns Embed
 */
function createWaitlistEmbed(
  submission: WaitlistSubmission,
  color: ColorResolvable = LIME_GREEN
): EmbedBuilder {
  const { id, discord_name, email } = submission;

  return new EmbedBuilder()
    .setTitle("📥 New Waitlist Submission")
    .addFields(
      { name: "Submission ID", value: id.toString(), inline: false },
      { name: "Discord", value: discord_name ?? "Unknown", inline: false },
      { name: "Email", value: email, inline: false }
    )
    .setColor(color)
    .setTimestamp();
}

/**
 * Creates action row with Accept/Declines buttons
 *
 * @param submissionId - ID of the submission
 * @returns ActionRow with buttons
 */
function createActionButtons(
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

/**
 * Sends a Discord notification to the admin channel
 *
 * @param client - The Discord client instance that will send the notification
 * @param submission - The waitlist submission details
 * @param includeActionButtons - (Optional) Whether to include action row buttons
 */
async function sendDiscordNotification(
  client: Client,
  submission: WaitlistSubmission,
  includeActionButtons: boolean = true
): Promise<void> {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const channel = await guild.channels.fetch(
      process.env.DISCORD_ADMIN_CHAT_CHANNEL_ID
    );

    const embed = createWaitlistEmbed(submission);
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    if (includeActionButtons) {
      components.push(createActionButtons(submission.id));
    }
    components.push(createAdminPanelLink());

    if (isSendableChannel(channel)) {
      await channel.send({ embeds: [embed], components });
    }
    logger.info(
      "Discord admin channel notified of waitlist:",
      submission.email
    );
  } catch (error) {
    logger.error("Failed to send Discord notification:", error);
    throw error;
  }
}

/**
 * Notifies the admin via email and Discord about new waitlist submission
 *
 * @param submission - The waitlist submission details
 * @param client - The Discord bot instance
 */
export async function notifyAdminWaitlist(
  submission: WaitlistSubmission,
  client: Client
): Promise<void> {
  sendAdminEmail(submission).catch((error) => {
    logger.error("Admin email notification failed:", error);
  });

  await sendDiscordNotification(client, submission, true);
}

/**
 * Auto-sends an invite to the user and notifies admins via Discord embed
 * without Accept/Decline buttons-only an Admin Panel link. The embed states
 * that the user was auto-invited
 *
 * @param submission - Waitlist submission details
 * @param client - The Discord client instance
 * @returns Result of the auto-invite operation
 */
export async function autoInviteAndNotify(
  submission: WaitlistSubmission,
  client: Client
): Promise<AutoInviteResult> {
  const { id, discord_name } = submission;

  const inviteResult: InviteResult = await sendInviteById(id);

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const channel = await guild.channels.fetch(
      process.env.DISCORD_ADMIN_CHAT_CHANNEL_ID
    );

    if (isSendableChannel(channel)) {
      const success = inviteResult.ok;
      const botMention =
        guild.members.me?.toString() || `<@${client.user?.id}>`;
      const embedColor = success ? LIME_GREEN : 0xff0000;
      const embed = createWaitlistEmbed(submission, embedColor);

      const components = [createAdminPanelLink()];

      await channel.send({
        content: success
          ? `✅ Accepted by ${botMention}`
          : "⚠️ Auto-invite attempted — please review.",
        embeds: [embed],
        components,
      });

      logger.info(
        `Admin notified of auto-invite for ${discord_name} (success=${success})`
      );
    }
  } catch (error) {
    logger.error("Failed to send Discord auto-invite notificaton:", error);
  }

  return inviteResult;
}
