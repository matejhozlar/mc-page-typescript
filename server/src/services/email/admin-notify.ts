import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { Client, TextChannel } from "discord.js";
import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import logger from "@/logger";
import config from "@/config";
import { createTransporter } from "./transporter";
import type {
  PendingCompanyNotification,
  CompanyEditNotification,
  PendingShopNotification,
  ShopEditNotification,
  AdminNoticeParams,
} from "@/types/services/admin-notify";

const { BLUE } = config.Colors;

/**
 * Escapes HTML special characters
 */
function escapeHtml(str = ""): string {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Creates the admin panel button row
 */
function createAdminPanelButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Open Admin Panel")
      .setStyle(ButtonStyle.Link)
      .setURL(config.Links.ADMIN_PANEL)
  );
}

/**
 * Sends both email and Discord notification to admins
 */
async function sendAdminNotice(params: AdminNoticeParams): Promise<void> {
  const { subject, plain, html, embed, client } = params;

  try {
    const trasporter = createTransporter();
    const mailOptions = {
      from: `"Createrington" <${config.Maintainer.EMAIL}>`,
      to: process.env.NOTIFY_ADMIN_EMAIL,
      subject,
      text: plain,
      html,
    };

    await trasporter.sendMail(mailOptions);
    logger.info(`Admin email sent: ${subject}`);
  } catch (error) {
    logger.error("Failed to send admin email:", error);
  }

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const channel = await guild.channels.fetch(
      process.env.DISCORD_ADMIN_CHAT_CHANNEL_ID
    );

    if (!channel?.isTextBased()) {
      logger.warn("Admin channel not text-based or not found.");
      return;
    }

    await (channel as TextChannel).send(embed);
    logger.info("Discord admin channel notified:", subject);
  } catch (error) {
    logger.error("Failed to send Discord notification:", error);
  }
}

/**
 * Notify admins that a NEW company was submitted and awaits approval
 */

export async function notifyAdminPendingCompany(
  data: PendingCompanyNotification,
  client: Client
): Promise<void> {
  const { id, name, founder_uuid, short_description } = data;

  const subject = `🏢 New Company Submission Pending Approval: ${name}`;

  const plain = [
    `A new company is awaiting approval:`,
    `ID: ${id}`,
    `Name: ${name}`,
    `Founder UUID: ${founder_uuid}`,
    short_description ? `Short Description: ${short_description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><strong>New company submission pending approval</strong></p>
    <ul>
      <li><strong>ID:</strong> ${id}</li>
      <li><strong>Name:</strong> ${escapeHtml(name)}</li>
      <li><strong>Founder UUID:</strong> ${founder_uuid}</li>
      ${
        short_description
          ? `<li><strong>Short Description:</strong> ${escapeHtml(
              short_description
            )}</li>`
          : ""
      }
    </ul>
  `;

  const embedBuilder = new EmbedBuilder()
    .setTitle("🏢 New Company Submission (Pending Approval)")
    .addFields(
      { name: "Company ID", value: String(id), inline: false },
      { name: "Name", value: name || "Unknown", inline: false },
      { name: "Founder UUID", value: founder_uuid || "Unknown", inline: false },
      ...(short_description
        ? [
            {
              name: "Short Description",
              value: short_description,
              inline: false,
            },
          ]
        : [])
    )
    .setColor(BLUE)
    .setTimestamp();

  const row = createAdminPanelButton();
  const embed = { embeds: [embedBuilder], components: [row] };

  await sendAdminNotice({ subject, plain, html, embed, client });
}

/**
 * Notify admins that a COMPANY EDIT request was submitted and awaits approval.
 */
export async function notifyAdminCompanyEdit(
  data: CompanyEditNotification,
  client: Client
): Promise<void> {
  const { edit_id, company_id, editor_uuid, name, short_description } = data;

  const subject = `✏️ Company Edit Pending Review: Company ${company_id}`;

  const plain = [
    `A company edit is awaiting review:`,
    `Edit ID: ${edit_id}`,
    `Company ID: ${company_id}`,
    name ? `Proposed Name: ${name}` : null,
    `Editor UUID: ${editor_uuid}`,
    short_description ? `Short Description: ${short_description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><strong>Company edit pending review</strong></p>
    <ul>
      <li><strong>Edit ID:</strong> ${edit_id}</li>
      <li><strong>Company ID:</strong> ${company_id}</li>
      ${
        name
          ? `<li><strong>Proposed Name:</strong> ${escapeHtml(name)}</li>`
          : ""
      }
      <li><strong>Editor UUID:</strong> ${editor_uuid}</li>
      ${
        short_description
          ? `<li><strong>Short Description:</strong> ${escapeHtml(
              short_description
            )}</li>`
          : ""
      }
    </ul>
  `;

  const embedBuilder = new EmbedBuilder()
    .setTitle("📝 Company Edit Request (Pending Review)")
    .addFields(
      { name: "Edit ID", value: String(edit_id), inline: false },
      { name: "Company ID", value: String(company_id), inline: false },
      ...(name ? [{ name: "Proposed Name", value: name, inline: false }] : []),
      { name: "Editor UUID", value: editor_uuid || "Unknown", inline: false },
      ...(short_description
        ? [
            {
              name: "Short Description",
              value: short_description,
              inline: false,
            },
          ]
        : [])
    )
    .setColor(BLUE)
    .setTimestamp();

  const row = createAdminPanelButton();
  const embed = { embeds: [embedBuilder], components: [row] };

  await sendAdminNotice({ subject, plain, html, embed, client });
}

/**
 * Notify admins that a NEW shop was submitted and awaits approval.
 */
export async function notifyAdminPendingShop(
  data: PendingShopNotification,
  client: Client
): Promise<void> {
  const {
    id,
    name,
    company_id,
    company_name,
    founder_uuid,
    short_description,
  } = data;

  const subject = `🛒 New Shop Submission Pending Approval: ${name}`;

  const plain = [
    `A new shop is awaiting approval:`,
    `Shop ID: ${id}`,
    `Shop Name: ${name}`,
    `Company ID: ${company_id}`,
    company_name ? `Company Name: ${company_name}` : null,
    `Founder UUID: ${founder_uuid}`,
    short_description ? `Short Description: ${short_description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><strong>New shop submission pending approval</strong></p>
    <ul>
      <li><strong>Shop ID:</strong> ${id}</li>
      <li><strong>Shop Name:</strong> ${escapeHtml(name)}</li>
      <li><strong>Company ID:</strong> ${company_id}</li>
      ${
        company_name
          ? `<li><strong>Company Name:</strong> ${escapeHtml(
              company_name
            )}</li>`
          : ""
      }
      <li><strong>Founder UUID:</strong> ${founder_uuid}</li>
      ${
        short_description
          ? `<li><strong>Short Description:</strong> ${escapeHtml(
              short_description
            )}</li>`
          : ""
      }
    </ul>
  `;

  const embedBuilder = new EmbedBuilder()
    .setTitle("🛒 New Shop Submission (Pending Approval)")
    .addFields(
      { name: "Shop ID", value: String(id), inline: false },
      { name: "Shop Name", value: name || "Unknown", inline: false },
      { name: "Company ID", value: String(company_id), inline: false },
      ...(company_name
        ? [{ name: "Company Name", value: company_name, inline: false }]
        : []),
      { name: "Founder UUID", value: founder_uuid || "Unknown", inline: false },
      ...(short_description
        ? [
            {
              name: "Short Description",
              value: short_description,
              inline: false,
            },
          ]
        : [])
    )
    .setColor(BLUE)
    .setTimestamp();

  const row = createAdminPanelButton();
  const embed = { embeds: [embedBuilder], components: [row] };

  await sendAdminNotice({ subject, plain, html, embed, client });
}

/**
 * Notify admins that a NEW shop edit was submitted and awaits approval.
 */
export async function notifyAdminShopEdit(
  data: ShopEditNotification,
  client: Client
): Promise<void> {
  const { edit_id, shop_id, company_id, editor_uuid, name, short_description } =
    data;

  const subject = `✏️ Shop Edit Pending Review: Shop ${shop_id}`;

  const plain = [
    `A shop edit is awaiting review:`,
    `Edit ID: ${edit_id}`,
    `Shop ID: ${shop_id}`,
    `Company ID: ${company_id}`,
    name ? `Proposed Name: ${name}` : null,
    `Editor UUID: ${editor_uuid}`,
    short_description ? `Short Description: ${short_description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><strong>Shop edit pending review</strong></p>
    <ul>
      <li><strong>Edit ID:</strong> ${edit_id}</li>
      <li><strong>Shop ID:</strong> ${shop_id}</li>
      <li><strong>Company ID:</strong> ${company_id}</li>
      ${
        name
          ? `<li><strong>Proposed Name:</strong> ${escapeHtml(name)}</li>`
          : ""
      }
      <li><strong>Editor UUID:</strong> ${editor_uuid}</li>
      ${
        short_description
          ? `<li><strong>Short Description:</strong> ${escapeHtml(
              short_description
            )}</li>`
          : ""
      }
    </ul>
  `;

  const embedBuilder = new EmbedBuilder()
    .setTitle("✏️ Shop Edit Request (Pending Review)")
    .addFields(
      { name: "Edit ID", value: String(edit_id), inline: false },
      { name: "Shop ID", value: String(shop_id), inline: false },
      { name: "Company ID", value: String(company_id), inline: false },
      ...(name ? [{ name: "Proposed Name", value: name, inline: false }] : []),
      { name: "Editor UUID", value: editor_uuid || "Unknown", inline: false },
      ...(short_description
        ? [
            {
              name: "Short Description",
              value: short_description,
              inline: false,
            },
          ]
        : [])
    )
    .setColor(BLUE)
    .setTimestamp();

  const row = createAdminPanelButton();
  const embed = { embeds: [embedBuilder], components: [row] };

  await sendAdminNotice({ subject, plain, html, embed, client });
}
