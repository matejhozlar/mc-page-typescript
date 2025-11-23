import type { Socket } from "socket.io";
import type { Server as SocketIOServer } from "socket.io";
import type { Client } from "discord.js";
import logger from "@/logger";
import { sendMessage } from "@/discord/utils/send-to-channel";
import { chat } from "@/db";

const COOLDOWN_MS = 10_000;

/**
 * Map to track message cooldowns per socket connection
 */
const cooldowns = new Map<string, number>();

/**
 * Data structure for incoming chat messages from web clients
 */
interface ChatMessageData {
  message: string;
  token: string;
  authorName?: string;
}

/**
 * Handles a chat message sent from a web client
 *
 * Validates the token, applies rate limiting, and relays the message to
 * Minecraft chat via Discord and broadcasts to all connected Socket.IO clients
 *
 * @param socket - The Socket.IO instance that sent the message
 * @param data - Message data including content, token, and optional authorName
 * @param io - Socket.IO server instance for broadcasting
 * @param webBot - Discord client for sending to Minecraft chat channel
 */
export default async function chatMessageHandler(
  socket: Socket,
  data: ChatMessageData,
  io: SocketIOServer,
  webBot: Client
): Promise<void> {
  const { message, token, authorName } = data;
  const now = Date.now();
  const lastSent = cooldowns.get(socket.id) || 0;

  if (!message || !token) return;

  if (now - lastSent < COOLDOWN_MS) return;

  cooldowns.set(socket.id, now);

  try {
    let displayName = authorName || "web";

    if (token !== "admin" && token !== "user") {
      displayName = await chat.token.validate(token);
    }

    const formattedMessage = `<${displayName}> ${message}`;
    logger.info(`${displayName}: ${message}`);

    await sendMessage(
      webBot,
      process.env.DISCORD_MINECRAFT_CHAT_CHANNEL_ID,
      formattedMessage
    );

    io.emit("chatMessage", {
      text: formattedMessage,
      image: null,
      authorType: "web",
    });
  } catch (error) {
    logger.error("Error sending chat message:", error);
  }
}

/**
 * Clears the message cooldown for a socket conection
 *
 * @param socket - The socket connection to clear cooldown for
 */
export function clearCooldown(socket: Socket): void {
  cooldowns.delete(socket.id);
}
