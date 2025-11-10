import cron from "node-cron";
import { tokenPriceHistoryQueries, cryptoTokenQueries } from "@/db";

/**
 * Schedules all cleanup and maintenance cron jobs for the application
 */
export function scheduleCleanupJobs() {
  // Every 3 hours — Clean up old minute-level token price history
  cron.schedule("0 */3 * * *", () =>
    tokenPriceHistoryQueries.cleanup("token_price_history_minutes", 144, 20)
  );

  // Daily at 01:00 — Clean up old hourly token price history
  cron.schedule("0 1 * * *", () =>
    tokenPriceHistoryQueries.cleanup("token_price_history_hourly", 168, 20)
  );

  // On the 1st and 15th of each month at 03:00 — Clean up old daily price history
  cron.schedule("0 3 1,15 * *", () =>
    tokenPriceHistoryQueries.cleanup("token_price_history_daily", 90, 10)
  );

  // On the 1st of each month at 05:00 — Clean up weekly price history
  cron.schedule("0 5 1 * *", () =>
    tokenPriceHistoryQueries.cleanup("token_price_history_weekly", 104, 5)
  );

  // Every 30 minutes — Delete memecoins that have crashed or expired
  cron.schedule(
    "*/30 * * * *",
    () => cryptoTokenQueries.deleteCrashedMemecoins(),
    {
      timezone: "Europe/Berlin",
    }
  );
}
