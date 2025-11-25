import type { Client, Message } from "discord.js";
import type { Server as SocketIOServer } from "socket.io";

/**
 * Message format emitted to Socket.IO clients
 */
interface RelayedMessage {
  text: string;
  image: string | null;
  authorType?: "discord";
}

/**
 * Relays Discord messages to connected Socket.IO clients in real-time
 *
 * Listens for messages in the Minecraft chat Discord channel and broadcasts
 * them to all connected web clients. Filters out messages from the web bot
 * to prevent echo loops
 *
 * @param mainBot - The Discord client instance to listen for messages
 * @param webBot - The Discord client instance to filter messages from
 * @param io - Socket.IO server to broadcast messages to clients
 */
export default function relayDiscordMessages(
  mainBot: Client,
  webBot: Client,
  io: SocketIOServer
): void {
  const channelId = process.env.DISCORD_MINECRAFT_CHAT_CHANNEL_ID;

  if (!channelId) {
    logger.error("DISCORD_MINECRAFT_CHAT_CHANNEL_ID not configured");
    return;
  }

  mainBot.on("messageCreate", (message: Message) => {
    if (message.channelId !== channelId) return;

    if (message.author.id === webBot.user?.id) return;

    const displayName = message.member?.displayName || message.author.username;
    const text = `[${displayName}]: ${message.content}`;
    const image = message.attachments.first()?.url || null;

    const relayedMessage: RelayedMessage = {
      text,
      image,
      authorType: "discord",
    };

    io.emit("chatMessage", relayedMessage);
  });
}
