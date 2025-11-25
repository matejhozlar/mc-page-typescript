import type { Client } from "discord.js";
import type { Server as SocketIOServer } from "socket.io";
import { scheduleCleanupJobs } from "./cleanup.job";
import { scheduleCryptoJobs } from "./crypto.job";

/**
 * Sets up all scheduled (cron) jobs required by the application,
 * such as reminders, cleanups, price updates, and quests
 *
 * @param mainBot - The Discord client instance
 * @param webBot - The Discord client instance
 * @param io - The Socket.IO server instance
 */
export function setupCronJobs(
  mainBot: Client,
  webBot: Client,
  io: SocketIOServer
): void {
  try {
    scheduleCleanupJobs();
  } catch (error) {
    logger.error("Failed to schedule cleanup jobs:", error);
  }

  try {
    scheduleCryptoJobs(mainBot, io);
  } catch (error) {
    logger.error("Failed to schedule crypto jobs:", error);
  }
}
