import type { Pool } from "pg";
import type { AiMessageLogCreateParams } from "@/types/models/ai-message-log.types";
import logger from "@/logger";

export class AiMessageLogQueries {
  constructor(private db: Pool) {}

  /**
   * Gets the count of the AI messages sent by the user today
   *
   * @param discordId - The Discord ID to look for
   * @returns Count of messages sent today
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
   * Logs an AI message from a user
   *
   * @param params - Message log creation parameters
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
