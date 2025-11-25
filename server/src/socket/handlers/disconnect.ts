import type { Socket } from "socket.io";
/**
 * Handles socket disconnection events
 *
 * @param socket - The socket that disconnected
 */
export default function disconnectHandler(socket: Socket): void {
  logger.info("Socket disconnected:", socket.id);
}
