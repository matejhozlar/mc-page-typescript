import type { Server as SocketIOServer } from "socket.io";
import type { Client } from "discord.js";
import { registerSocketHandlers } from "./handlers";
import relayDiscordMessages from "./relay-discord-messages";
import logger from "@/logger";

/**
 * Sets up Socket.IO event handling and Discord message relay
 *
 * Initializes Socket.IO connection handling and sets up real-time message
 * relay from Discord to connected web clients
 *
 * @param io - The Socket.IO server instance
 * @param mainBot - The Discord client instance
 * @param webBot - The Discord client instance for relaying messages
 */
export function setupSocketIO(
  io: SocketIOServer,
  mainBot: Client,
  webBot: Client
): void {
  relayDiscordMessages(mainBot, webBot, io);

  io.on("connection", (socket) => {
    logger.info("New socket connected:", socket.id);
    registerSocketHandlers(socket, { io, mainBot, webBot });
  });
}
