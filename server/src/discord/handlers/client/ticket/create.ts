import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import type { Interaction, Client, Guild, TextChannel } from "discord.js";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries";
import logger from "@/logger";
import { ticketQueries, userQueries } from "@/db";

interface TicketCounterResult {
  last_number: number;
}

interface UserNameResult {
  name: string;
}

/**
 * Handles creation of a new support ticket channel for the user
 * Ensures only one open ticket per user, assigns permissions,
 * updates database, and notifies user
 *
 * @param {Interaction} interaction - The interaction object triggered by the user
 * @param {Client} client - The Discord client instance
 * @param {Pool} db - PostgreSQL databse pool
 */
export default async function createTicket(
  interaction: Interaction,
  client: Client,
  db: Pool
): Promise<void> {
  if (!interaction.isButton()) return;

  try {
    const guild = interaction.guild as Guild;
    const user = interaction.user;

    const existing = await ticketQueries.hasTicketByDiscordId(user.id);

    if (existing) {
      await interaction.reply({
        content: `❌ You already have a ticket open: <#${existing.channel_id}>`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const userResult = await userQueries.findByDiscordId(user.id);
    const mcName = userResult?.name ?? "Unknown";

    const ticketNumber = await ticketQueries.nextTicketNumber();
    const ticketName = `ticket-${String(ticketNumber).padStart(4, "0")}`;

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
          id: client.user!.id,
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
  } catch (error) {}
}
