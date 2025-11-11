import type { ButtonInteraction, Client } from "discord.js";
import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import logger from "@/logger";
import { tickets, users } from "@/db";
import { TicketCreateParams } from "@/types/models/ticket.types";

/**
 * Creates a new support ticket channel for the user
 *
 * Ensures only one open ticket per user, assigns permissions to the user and
 * admin role, updates the database with ticket information, and sends a welcome
 * message with a close button
 *
 * @param interaction - The button interaction that triggered ticket creation
 * @param mainBot - The Discord client instance
 */
export default async function createTicket(
  interaction: ButtonInteraction,
  mainBot: Client
): Promise<void> {
  try {
    const guild = interaction.guild;
    const user = interaction.user;

    if (!guild) {
      await interaction.reply({
        content: "❌ This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    [
      {
        resource:
          "/c:/Users/matej/Projects/mc-page-typescript/server/src/db/queries/ticket.queries.ts",
        owner: "typescript",
        code: "2345",
        severity: 8,
        message:
          "Argument of type 'Status | undefined' is not assignable to parameter of type 'Status'.\n  Type 'undefined' is not assignable to type 'Status'.",
        source: "ts",
        startLineNumber: 110,
        startColumn: 46,
        endLineNumber: 110,
        endColumn: 52,
        origin: "extHost1",
      },
    ];
    const existingTicket = await tickets.find({ discordId: user.id });

    if (existingTicket) {
      await interaction.reply({
        content: `❌ You already have a ticket open: <#${existingTicket.channel_id}>`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const mcName = await users.name({ discordId: user.id });
    const ticketNumber = await tickets.next();
    const ticketName = `ticket-${ticketNumber.toString().padStart(4, "0")}`;

    if (!mainBot.user) {
      throw new Error("Client user is not initialized");
    }

    const ticketChannel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: mainBot.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: process.env.DISCORD_ADMIN_ROLE_ID,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
          ],
        },
      ],
    });

    const newTicket: TicketCreateParams = {
      ticket_number: ticketNumber,
      discord_id: user.id,
      mc_name: mcName,
      channel_id: ticketChannel.id,
    };

    await tickets.create(newTicket);

    const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
    const welcomeEmbed = new EmbedBuilder()
      .setDescription(
        `👋 Welcome <@${user.id}> (Minecraft: **${mcName}**)
        \nPlease describe your issue in detail and include any screenshots or videos.
        \nSupport will be with you shortly <@&${adminRoleId}>
        \nTo close this ticket, press the **Close** button below.`
      )
      .setColor(0x2f3136)
      .addFields({
        name: " ",
        value: "[Createrington](https://create-rington.com)",
      });

    const closeButton = new ButtonBuilder()
      .setCustomId("start_close_ticket")
      .setLabel("Close")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔒");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      closeButton
    );

    await ticketChannel.send({
      embeds: [welcomeEmbed],
      components: [row],
    });

    await interaction.reply({
      content: `✅ Your ticket has been created: ${ticketChannel}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error("Failed to create ticket:", error);
    await interaction.reply({
      content: "⚠️ Failed to create ticket. Please try again later.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
