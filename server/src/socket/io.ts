import type { Server as HTTPServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

let ioInstance: SocketIOServer | null = null;

/**
 * Initializes and stores a singleton Socket.IO serve instance
 *
 * Binds Socket.IO to the provided HTTP server with CORS enabled for all origins
 * Should only be called once during application startup
 *
 * @param httpServer - The HTTP server to bind Socket.IO to
 * @returns The intialized Socket.IO instance
 * @throws Error if Socket.IO has already been initialized
 */
export function initIO(httpServer: HTTPServer): SocketIOServer {
  if (ioInstance) {
    throw new Error("Socket.IO has already been initialized");
  }

  ioInstance = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  return ioInstance;
}

/**
 * Retrieves the existing Socket.IO server instance
 *
 * @returns The current Socket.IO instance
 * @throws Error if Socket.IO has not been initialized yet
 */
export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error(
      "Socket.IO instance has not been initialized. Call initIO() first"
    );
  }

  return ioInstance;
}

/**
 * Resets the Socket.IO instance (primarily for testing)
 *
 * @internal
 */
export function resetIO(): void {
  if (ioInstance) {
    ioInstance.close();
    ioInstance = null;
  }
}
