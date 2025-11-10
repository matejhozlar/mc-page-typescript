import type { Pool } from "pg";
import type { AiMessageLogCreateParams } from "@/types/models/ai-message-log.types";
import logger from "@/logger";

export class AiMessageLogQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves the count of AI messages sent by a specific user to the current date
   *
   * @param discordId - The Discord user ID to search for
   * @returns Promise resolving to the number of messages sent
   * @throws Error if the database query fails or the user does not exist
   */
  async getToday(discordId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM ai_message_log
             WHERE discord_id = $1 AND created_at::date = CURRENT_DATE`,
      [discordId]
    );

    return parseInt(result.rows[0]?.count ?? "0", 10);
  }

  /**
   * Creates and persists a new AI message log entry for a user
   *
   * @param params - Object containing Discord ID and message content to log
   * @returns Promise resolving when the log entry is created
   */
  async create(params: AiMessageLogCreateParams): Promise<void> {
    await this.db.query(
      `INSERT INTO ai_message_log (discord_id, message)
         VALUES ($1, $2)`,
      [params.discord_id, params.message]
    );

    logger.info("AI message logged for user:", params.discord_id);
  }
}
