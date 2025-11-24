import { EmbedBuilder } from "discord.js";
import type { ColorResolvable } from "discord.js";
import config from "@/config";

const { BLUE, LIME_GREEN } = config.colors;

/**
 * Creates an embed for waitlist notifications
 */
export function createWaitlistEmbed(data: {
  id: number;
  discordName: string;
  email: string;
  color?: ColorResolvable;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("📥 New Waitlist Submission")
    .addFields(
      { name: "Submission ID", value: data.id.toString(), inline: false },
      { name: "Discord", value: data.discordName || "Unknown", inline: false },
      { name: "Email", value: data.email, inline: false }
    )
    .setColor(data.color || LIME_GREEN)
    .setTimestamp();
}

/**
 * Creates an embed for company submission notifications
 */
export function createCompanySubmissionEmbed(data: {
  id: number;
  name: string;
  founderUuid: string;
  shortDescription?: string;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🏢 New Company Submission (Pending Approval)")
    .addFields(
      { name: "Company ID", value: String(data.id), inline: false },
      { name: "Name", value: data.name || "Unknown", inline: false },
      {
        name: "Founder UUID",
        value: data.founderUuid || "Unknown",
        inline: false,
      }
    )
    .setColor(BLUE)
    .setTimestamp();

  if (data.shortDescription) {
    embed.addFields({
      name: "Short Description",
      value: data.shortDescription,
      inline: false,
    });
  }

  return embed;
}

/**
 * Creates an embed for company edit notifications
 */
export function createCompanyEditEmbed(data: {
  editId: number;
  companyId: number;
  editorUuid: string;
  name?: string;
  shortDescription?: string;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📝 Company Edit Request (Pending Review)")
    .addFields(
      { name: "Edit ID", value: String(data.editId), inline: false },
      { name: "Company ID", value: String(data.companyId), inline: false }
    )
    .setColor(BLUE)
    .setTimestamp();

  if (data.name) {
    embed.addFields({ name: "Proposed Name", value: data.name, inline: false });
  }

  embed.addFields({
    name: "Editor UUID",
    value: data.editorUuid || "Unknown",
    inline: false,
  });

  if (data.shortDescription) {
    embed.addFields({
      name: "Short Description",
      value: data.shortDescription,
      inline: false,
    });
  }

  return embed;
}

/**
 * Creates an embed for shop submission notifications
 */
export function createShopSubmissionEmbed(data: {
  id: number;
  name: string;
  companyId: number;
  companyName?: string;
  founderUuid: string;
  shortDescription?: string;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🛒 New Shop Submission (Pending Approval)")
    .addFields(
      { name: "Shop ID", value: String(data.id), inline: false },
      { name: "Shop Name", value: data.name || "Unknown", inline: false },
      { name: "Company ID", value: String(data.companyId), inline: false }
    )
    .setColor(BLUE)
    .setTimestamp();

  if (data.companyName) {
    embed.addFields({
      name: "Company Name",
      value: data.companyName,
      inline: false,
    });
  }

  embed.addFields({
    name: "Founder UUID",
    value: data.founderUuid || "Unknown",
    inline: false,
  });

  if (data.shortDescription) {
    embed.addFields({
      name: "Short Description",
      value: data.shortDescription,
      inline: false,
    });
  }

  return embed;
}

/**
 * Creates an embed for shop edit notifications
 */
export function createShopEditEmbed(data: {
  editId: number;
  shopId: number;
  companyId: number;
  editorUuid: string;
  name?: string;
  shortDescription?: string;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("✏️ Shop Edit Request (Pending Review)")
    .addFields(
      { name: "Edit ID", value: String(data.editId), inline: false },
      { name: "Shop ID", value: String(data.shopId), inline: false },
      { name: "Company ID", value: String(data.companyId), inline: false }
    )
    .setColor(BLUE)
    .setTimestamp();

  if (data.name) {
    embed.addFields({ name: "Proposed Name", value: data.name, inline: false });
  }

  embed.addFields({
    name: "Editor UUID",
    value: data.editorUuid || "Unknown",
    inline: false,
  });

  if (data.shortDescription) {
    embed.addFields({
      name: "Short Description",
      value: data.shortDescription,
      inline: false,
    });
  }

  return embed;
}
