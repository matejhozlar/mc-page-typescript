import type { Client } from "discord.js";
import { ActivityType } from "discord.js";
import logger from "@/logger";
import { requireProduction } from "@/utils/guard/run-guard";

/**
 * Sets up rotating statuses for the Discord bot
 *
 * Cycles through a list of custom messages at a specified interval
 * Only runs in production environment
 *
 * @param client - The Discord client instance
 * @param statuses - Array of status strings to rotate through
 * @param intervalMs - Rotation interval in milliseconds (default: 60000ms / 1 minute)
 */
export default function setRotatingStatuses(
  client: Client,
  statuses: string[],
  intervalMs: number = 60000
): void {
  if (!requireProduction()) return;

  if (!Array.isArray(statuses) || statuses.length === 0) {
    logger.warn("No rotating statuses provided for setRotatingStatuses");
    return;
  }

  if (!client.user) {
    logger.error("Client user is not initialized");
    return;
  }

  let index = 0;

  setInterval(() => {
    if (!client.user) {
      logger.error("Client user became unavailable");
      return;
    }

    const status = statuses[index++ % statuses.length];

    client.user.setPresence({
      activities: [
        {
          type: ActivityType.Custom,
          name: "custom",
          state: status,
        },
      ],
      status: "online",
      afk: false,
    });
  }, intervalMs);
}
