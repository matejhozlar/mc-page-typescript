import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import {
  Session,
  SessionCreate,
  SessionRow,
  SessionStart,
  SessionStats,
  SessionType,
} from "./types";
import crypto from "node:crypto";
import logger from "@/logger";

type Identifier =
  | { id: number }
  | { sessionToken: string }
  | { discordId: string };

type Filters = {
  discordId: string;
  sessionType: SessionType;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date;
};

type Update = {
  sessionToken: string;
  discordId: string;
  sessionType: SessionType;
  expiresAt: Date;
  lastUsedAt: Date;
};

/**
 * Session management queries for authentication and authorization
 * Handles session creation, validation, expiration, and lifecycle management
 */
export class SessionQueries extends BaseQueries<{
  Entity: Session;
  DbEntity: SessionRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: SessionCreate;
}> {
  protected readonly table = "sessions";
  private readonly sessionDuration: number;

  constructor(db: Pool, sessionDurationMs: number = 24 * 60 * 60 * 1000) {
    super(db);
    this.sessionDuration = sessionDurationMs;
  }

  /**
   * Generate a cryptographically secure random token
   * Uses 32 bytes of random data encoded as hexadecimal (64 characters)
   *
   * @returns 64-character hexadecimal string
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Creates and persists a new session with auto-generated token and expiration time
   *
   * @param data - Session initialization data (discordId and sessionType)
   * @returns - Promise resolving to the generated session token
   */
  async start(data: SessionStart): Promise<string> {
    const { discordId, sessionType } = data;
    const sessionToken = this.generateToken();
    const expiresAt = new Date(Date.now() + this.sessionDuration);

    const createData: SessionCreate = {
      sessionToken,
      discordId,
      sessionType,
      expiresAt,
    };

    await this.create(createData);

    logger.info(
      `Session created for Discord ID: ${discordId}, type: ${sessionType}`
    );
    return sessionToken;
  }

  /**
   * Validates a session token and updates its last_used_at timestamp
   * Returns null if session doesn't exist or has expired
   * Automatically refreshes the last_used_at field on successful validation
   *
   * @param sessionToken - Token to validate
   * @returns Promise resolving to the session entity or null if invalid/expired
   */
  async validate(sessionToken: string): Promise<Session | null> {
    try {
      const query = `
        SELECT * FROM ${this.table}
        WHERE session_token = $1 AND expires_at > NOW()`;

      const result = await this.db.query<SessionRow>(query, [sessionToken]);

      if (result.rowCount === 0) {
        return null;
      }

      await this.db.query(
        `UPDATE ${this.table} SET last_used_at = NOW() WHERE session_token = $1`,
        [sessionToken]
      );

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      logger.error("Session validation error:", error);
      throw error;
    }
  }

  /**
   * Invalidates a specific session by deleting it from the database
   * Used for user logout operations
   *
   * @param sessionToken - Token of the session to invalidate
   * @returns Promise resolving to true if successful, false otherwise
   */
  async invalidate(sessionToken: string): Promise<boolean> {
    try {
      await this.delete({ sessionToken });
      logger.info("Session invalidated:", sessionToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Invalidates all active sessions for a specific user
   * Useful for security operations like password resets or account compromise
   *
   * @param discordId - Discord ID of the user whose session to invalidate
   * @returns Promise resolving to the number of sessions invalidated
   */
  async invalidateAll(discordId: string): Promise<number> {
    try {
      const deletedCount = await this.deleteAll({ discordId });
      logger.info(`Invalidated ${deletedCount} sessions for user:`, discordId);
      return deletedCount;
    } catch (error) {
      logger.error("Error invalidating user sessions:", error);
      return 0;
    }
  }

  /**
   * Removes all expired sessions from the database
   *
   * @returns Promise resolving to the number of expired sessions removed
   */
  async cleanup(): Promise<number> {
    try {
      const query = `DELETE FROM ${this.table} WHERE expires_at < NOW()`;
      const result = await this.db.query(query);

      const count = result.rowCount || 0;
      if (count > 0) {
        logger.info(`Cleaned up ${count} expired sessions`);
      }
      return count;
    } catch (error) {
      logger.error("Error cleaning up expires sessions:", error);
      return 0;
    }
  }

  /**
   * Extends the expiration time of an active session
   * Updates both expires_at and last_used_at timestamps
   * Only works on sessions that haven't already expired
   *
   * @param sessionToken - Token of the session to extend
   * @returns Promise resolving to true if successful, false if session not found or expired
   */
  async extend(sessionToken: string): Promise<boolean> {
    try {
      const newExpiresAt = new Date(Date.now() + this.sessionDuration);

      const query = `
        UPDATE ${this.table}
        SET expires_at = $1, last_used_at = NOW()
        WHERE session_token = $2 AND expires_at > NOW()`;

      const result = await this.db.query(query, [newExpiresAt, sessionToken]);
      return (result.rowCount || 0) > 2;
    } catch (error) {
      logger.error("Error extending session:", error);
      return false;
    }
  }

  /**
   * Retrieves all active (non-expired) sessions for a specific user
   * Results are ordered by most recently used first
   *
   * @param discordId - Discord ID of the user
   * @returns Promise resolving to an array of active session entities
   */
  async getAllActive(discordId: string): Promise<Session[]> {
    try {
      const query = `
        SELECT * FROM ${this.table}
        WHERE discord_id = $1 AND expires_at > NOW()
        ORDER BY last_used_at DESC`;

      const result = await this.db.query<SessionRow>(query, [discordId]);
      return this.mapRowsToEntities(result.rows);
    } catch (error) {
      logger.error("Error fetching active sessions:", error);
      throw error;
    }
  }

  /**
   * Counts the number of active sessions for a specific user
   * Useful for enforcing concurrent session limits
   *
   * @param discordId - Discord ID of the user
   * @returns Promise resolving to the count of active sessions
   */
  async countActive(discordId: string): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM ${this.table}
        WHERE discord_id = $1 AND expires_at > NOW()`;

      const result = await this.db.query<{ count: string }>(query, [discordId]);
      return parseInt(result.rows[0]?.count || "0", 10);
    } catch (error) {
      logger.error("Error counting active sessions:", error);
      return 0;
    }
  }

  /**
   * Retrieves comperehensive statistics about all sessions in the system
   * Includes total, active, expired counts and breakdown by session type
   *
   * @returns Promise resolving to session statistics object
   */
  async getStats(): Promise<SessionStats> {
    try {
      const [totalResult, activeResult, expiredResult, byTypeResult] =
        await Promise.all([
          this.db.query(`SELECT COUNT(*) as count FROM ${this.table}`),
          this.db.query(
            `SELECT COUNT(*) as count FROM ${this.table} WHERE expires_at > NOW()`
          ),
          this.db.query(
            `SELECT COUNT(*) as count FROM ${this.table} WHERE expires_at <= NOW()`
          ),
          this.db.query(`
            SELECT session_type, COUNT(*) as count
            FROM ${this.table}
            WHERE expires_at > NOW()
            GROUP BY session_type
          `),
        ]);

      const byType: Record<SessionType, number> = {
        user: 0,
        admin: 0,
      };

      byTypeResult.rows.forEach((row: any) => {
        byType[row.session_type as SessionType] = parseInt(row.count, 10);
      });

      return {
        total: parseInt(totalResult.rows[0]?.count || "0", 10),
        active: parseInt(activeResult.rows[0]?.count || "0", 10),
        expired: parseInt(expiredResult.rows[0]?.count || "0", 10),
        byType,
      };
    } catch (error) {
      logger.error("Error fetching session stats:", error);
      return { total: 0, active: 0, expired: 0, byType: { user: 0, admin: 0 } };
    }
  }
}
