import type { Pool } from "pg";
import type { ChatToken } from "@/types/models/chat-token.types";

export class ChatTokenQueries {
  constructor(private db: Pool) {}

  /**
   * Validates a token and cleans up expired tokens
   *
   * @param token - The token to validate
   * @returns The valid chat token or null if not found/expired
   */
  async validate(token: string): Promise<ChatToken | null> {
    const result = await this.db.query<ChatToken>(
      `SELECT * FROM chat_tokens
         WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    return result.rows[0] || null;
  }
}
