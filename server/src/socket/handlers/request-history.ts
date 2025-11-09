import type { Socket } from "socket.io";
import type { Client, Message } from "discord.js";
import logger from "@/logger";
import { isTextChannel } from "@/discord/utils/channel-guard";

/**
 * Message format sent to Socket.IO clients
 */
interface ChatHistoryMessage {
  text: string;
  image: string | null;
  authorType: "discord" | "web" | "minecraft";
}

/**
 * Fetches and sends chat history to a connected client
 *
 * Retrieves the last 100 messages from the Minecraft chat Discord channel,
 * filters them appropriately, and sends them to the requesting client.
 *
 * Filters:
 * - All non-bot messages
 * - Messages from the web bot
 * - Bot messages matching Minecraft-style format: `<Username>`
 *
 * @param socket - Socket.IO connection requesting history
 * @param client - Discord client for accessing the chat channel
 */
export default async function requestHistoryHandler(
  socket: Socket,
  client: Client
): Promise<void> {
  try {
    const channelId = process.env.DISCORD_MINECRAFT_CHAT_CHANNEL_ID;

    if (!channelId) {
      logger.error("DISCORD_MINECRAFT_CHAT_CHANNEL_ID not configured");
      return;
    }

    const channel = await client.channels.fetch(channelId);

    if (!channel || !isTextChannel(channel)) {
      logger.error("Channel not text-based or not found");
      return;
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    const clientId = client.user?.id;

    const filtered: ChatHistoryMessage[] = [...messages.values()]
      .reverse()
      .filter((msg: Message) => {
        if (!msg.author.bot) return true;
        if (msg.author.id === clientId) return true;
        return msg.content.match(/^`<[^<>]+>`/);
      })
      .map((msg: Message): ChatHistoryMessage => {
        const isWebBot = msg.author.id === clientId;
        const name = msg.member?.displayName || msg.author.username;
        const image = msg.attachments.first()?.url || null;

        let authorType: "discord" | "web" | "minecraft" = "discord";
        if (isWebBot) {
          authorType = "web";
        } else if (msg.content.match(/^`<[^<>]+>`/)) {
          authorType = "minecraft";
        }

        const text =
          isWebBot || authorType === "minecraft"
            ? msg.content
            : `[${name}]: ${msg.content}`;

        return { text, image, authorType };
      });

    logger.info(`Sending ${filtered.length} messages to client`);
    socket.emit("chatHistory", filtered);
  } catch (error) {
    logger.error("Failed to fetch chat history:", error);
  }
}
