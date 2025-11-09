import type { ButtonInteraction, Client, GuildMember } from "discord.js";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import logger from "@/logger";
import { ticketQueries } from "@/db";
import {
  isTextChannel,
  isSendableChannel,
} from "@/discord/utils/channel-guard";

/**
 * Generates a transcript of the last 100 non-bot messages in a ticket channel
 * and sends it to the designated transcript channel
 *
 * Creates a text file with ticket metadata and message history, then posts it
 * to the transcript archive channel
 *
 * @param interaction - The button interaction that triggered transcript generation
 */
export default async function transcriptTicket(
  interaction: ButtonInteraction
): Promise<void> {
  const channel = interaction.channel;
  const guild = interaction.guild;

  if (!channel || !isTextChannel(channel)) {
    logger.error("Channel not found or is not a text channel");
    return;
  }

  if (!guild) {
    logger.error("Guild not found in interaction");
    return;
  }

  try {
    await interaction.deferUpdate();

    const transcriptChannelId = process.env.DISCORD_TRANSCRIPT_CHANNEL_ID;

    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = messages.reverse();
    const contentBody = sorted
      .filter((m) => !m.author.bot)
      .map(
        (m) =>
          `[${m.createdAt.toISOString()}] ${m.author.tag}: ${
            m.content || "[Embed/Attachment]"
          }`
      )
      .join("\n");

    const ticket = await ticketQueries.findByChannelId(channel.id);

    if (!ticket) {
      logger.error("Ticket not found in database");
      if (isSendableChannel(channel)) {
        await channel.send({
          content: "⚠️ Failed to generate transcript: Ticket not found.",
        });
      }
      return;
    }

    const member: GuildMember | null = await guild.members
      .fetch(ticket.discord_id)
      .catch(() => null);

    const displayName = member?.displayName || `Unknown (${ticket.discord_id})`;

    const transcriptHeader = `Ticket Transcript - ${
      channel.name
    }\n\nDiscord User: ${displayName} (${
      ticket.discord_id
    })\nMinecraft Username: ${ticket.mc_name || "Unknown"}\nTicket Number: ${
      ticket.ticket_number
    }\nStatus: ${ticket.status || "Unknown"}\nCreated At: ${
      ticket.created_at?.toISOString() || "Unknown"
    }\nUpdated At: ${
      ticket.updated_at?.toISOString() || "Unknown"
    }\n\n------------------------------------------------------------\n\n`;

    const fullTranscript = transcriptHeader + contentBody;
    const buffer = Buffer.from(fullTranscript, "utf-8");

    const transcriptFile = new AttachmentBuilder(buffer, {
      name: `transcript-${channel.name}.txt`,
    });

    const transcriptChannel = guild.channels.cache.get(transcriptChannelId);

    if (!transcriptChannel || !isSendableChannel(transcriptChannel)) {
      logger.warn("Transcript channel not found or is not sendable");
      if (isSendableChannel(channel)) {
        await channel.send({
          content:
            "⚠️ Failed to save transcript: Transcript channel not found.",
        });
      }
      return;
    }

    await transcriptChannel.send({
      content: `📄 Ticket transcript saved from **${channel.name}**`,
      files: [transcriptFile],
    });

    const transcriptEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`Transcript has been saved to <#${transcriptChannelId}>`);

    if (isSendableChannel(channel)) {
      await channel.send({
        embeds: [transcriptEmbed],
      });
    }
  } catch (error) {
    logger.error("Failed to save/send transcript:", error);
    if (channel && isSendableChannel(channel)) {
      await channel.send({
        content: "⚠️ Failed to generate transcript.",
      });
    }
  }
}
