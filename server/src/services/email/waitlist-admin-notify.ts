import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
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
} from "@/types/services/waitlist";

const { LIME_GREEN } = config.Colors;

/**
 * Sends an email notification to the admin about new waitlist submissions
 */
async function sendAdminEmail(submission: WaitlistSubmission): Promise<void> {
  const { id, email, discord_name } = submission;

  const mailOptions = {
    from: `"Createrington" <${process.env.EMAIL_ADDRESS}>`,
    to: process.env.NOTIFY_ADMIN_EMAIL,
    subject: `📥 New Waitlist Submission: ${discord_name}`,
    text: `New waitlist entry:\nDiscord: ${discord_name}\nEmail: ${email}`,
    html: `
      <p><strong>New waitlist submission received!</strong></p>
      <ul>
        <li><strong>ID:</strong> ${id}</li>
        <li><strong>Discord:</strong> ${discord_name}</li>
        <li><strong>Email:</strong> ${email}</li>
      </ul>
    `,
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    logger.info("Admin notified on new waitlist entry:", email);
  } catch (error) {
    logger.error("Failed to notify admin by email:", error);
    throw error;
  }
}

/**
 * Creates an embed for waitlist notifications
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
      { name: "Discord", value: discord_name, inline: false },
      { name: "Email", value: email, inline: false }
    )
    .setColor(color)
    .setTimestamp();
}

/**
 * Creates action row with Accept/Decline buttons
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
 * Creates action row with Admin Panel link
 */
function createAdminPanelLink(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Open Admin Panel")
      .setStyle(ButtonStyle.Link)
      .setURL(config.Links.ADMIN_PANEL)
  );
}

/**
 * Sends a Discord notification to the admin channel
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

    if (!channel?.isTextBased()) {
      logger.warn("Admin channel not text-based or not found.");
      return;
    }

    const embed = createWaitlistEmbed(submission);
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    if (includeActionButtons) {
      components.push(createActionButtons(submission.id));
    }
    components.push(createAdminPanelLink());

    await (channel as TextChannel).send({ embeds: [embed], components });
    logger.info(
      `Discord admin channel notified of waitlist:`,
      submission.email
    );
  } catch (error) {
    logger.error("Failed to send Discord notification", error);
    throw error;
  }
}

/**
 * Notifies the admin via email and Discord about a new waitlist submission.
 *
 * @param submission - The waitlist submission details
 * @param client - The Discord.js client instance
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
 * Auto-sends an invite to the user and notifies admins via a Discord embed
 * without Accept/Decline buttons—only an Admin Panel link. The embed states
 * that the user was auto-invited.
 *
 * @param submission - Waitlist submission details
 * @param client - Discord.js client instance
 * @returns Result of the auto-invite operation
 */
export async function autoInviteAndNotify(
  submission: WaitlistSubmission,
  client: Client
): Promise<AutoInviteResult> {
  const { id, discord_name } = submission;

  let inviteResult: AutoInviteResult;
  try {
    const result = await sendInviteById(id);
    inviteResult = {
      ok: result.ok,
      msg: result.msg,
      token: result.token,
    };
  } catch (error) {
    logger.error("Auto-invite failed:", error);
    inviteResult = {
      ok: false,
      msg: error instanceof Error ? error.message : "Auto-invite error",
    };
  }

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const channel = await guild.channels.fetch(
      process.env.DISCORD_ADMIN_CHAT_CHANNEL_ID
    );

    if (!channel?.isTextBased()) {
      logger.warn("Admin channel not text-based or not found");
    } else {
      const success = inviteResult.ok;
      const botMention =
        guild.members.me?.toString() || `<@${client.user?.id}>`;
      const embedColor = success ? LIME_GREEN : 0xff0000;
      const embed = createWaitlistEmbed(submission, embedColor);

      const components = [createAdminPanelLink()];

      await (channel as TextChannel).send({
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
    logger.error("Failed to send Discord auto-invite notification:", error);
  }

  return inviteResult;
}
