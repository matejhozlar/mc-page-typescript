import type { Socket } from "socket.io";
import type { Server as SocketIOServer } from "socket.io";
import type { Client } from "discord.js";
import chatMessageHandler from "./chat-message";
import requestHistoryHandler from "./request-history";
import disconnectHandler from "./disconnect";
import { clearCooldown } from "./chat-message";

/**
 * Context object containing shared resources for socket handlers
 */
interface SocketHandlerContext {
  io: SocketIOServer;
  mainBot: Client;
  webBot: Client;
}

/**
 * Registers all Socket.IO event handlers for a client connection
 *
 * @param socket - The conntected socket client
 * @param context - Shared resources (Socket.IO server, Discord clients)
 */
export function registerSocketHandlers(
  socket: Socket,
  context: SocketHandlerContext
): void {
  const { io, webBot } = context;

  socket.on("sendChatMessage", (data) => {
    chatMessageHandler(socket, data, io, webBot);
  });

  socket.on("requestChatHistory", () => requestHistoryHandler(socket, webBot));

  socket.on("disconnect", () => {
    clearCooldown(socket);
    disconnectHandler(socket);
  });
}
