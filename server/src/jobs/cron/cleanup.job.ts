import cron from "node-cron";
import { crypto } from "@/db";
import { CryptoTokenHistoryTable } from "@/db/queries/crypto/token/history";

/**
 * Schedules all cleanup and maintenance cron jobs for the application
 */
export function scheduleCleanupJobs() {
  // Every 3 hours — Clean up old minute-level token price history
  cron.schedule(
    "0 */3 * * *",
    async () =>
      await crypto.token.history.cleanup(
        CryptoTokenHistoryTable.MINUTELY,
        144,
        20
      )
  );

  // Daily at 01:00 — Clean up old hourly token price history
  cron.schedule(
    "0 1 * * *",
    async () =>
      await crypto.token.history.cleanup(
        CryptoTokenHistoryTable.HOURLY,
        168,
        20
      )
  );

  // On the 1st and 15th of each month at 03:00 — Clean up old daily price history
  cron.schedule(
    "0 3 1,15 * *",
    async () =>
      await crypto.token.history.cleanup(CryptoTokenHistoryTable.DAILY, 90, 10)
  );

  // On the 1st of each month at 05:00 — Clean up weekly price history
  cron.schedule(
    "0 5 1 * *",
    async () =>
      await crypto.token.history.cleanup(CryptoTokenHistoryTable.WEEKLY, 104, 5)
  );

  // Every 30 minutes — Delete memecoins that have crashed or expired
  cron.schedule("*/30 * * * *", async () => crypto.token.cleanup(), {
    timezone: "Europe/Berlin",
  });
}
