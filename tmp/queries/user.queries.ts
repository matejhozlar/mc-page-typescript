import type { Pool } from "pg";
import type {
  User,
  UserFunds,
  UserProfile,
  UserCreateParams,
  UserUpdateParams,
  UserStats,
  UserPlaytimeRanking,
} from "@/types/models/user";
import logger from "@/logger";

export class UserQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a user by UUID
   */
  async findByUuid(uuid: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users WHERE uuid = $1`,
        [uuid]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find user by UUID:", error);
      throw error;
    }
  }

  /**
   * Finds a user by Discord ID
   */
  async findByDiscordId(discordId: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users WHERE discord_id = $1 LIMIT 1`,
        [discordId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find user by Discord ID:", error);
      throw error;
    }
  }

  /**
   * Finds a user by username
   */
  async findByName(name: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users WHERE name = $1 LIMIT 1`,
        [name]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find user by name:", error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users ORDER BY first_joined DESC`
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get all users:", error);
      throw error;
    }
  }

  /**
   * Gets all online users
   */
  async getOnlineUsers(): Promise<User[]> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users WHERE online = true ORDER BY name ASC`
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get online users:", error);
      throw error;
    }
  }

  /**
   * Gets all ofline users
   */
  async getOfflineUsers(): Promise<User[]> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users WHERE online = false ORDER BY name ASC`
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get offline users:", error);
      throw error;
    }
  }

  /**
   * Creates a new user
   */
  async create(params: UserCreateParams): Promise<User> {
    try {
      const result = await this.db.query<User>(
        `INSERT INTO users (uuid, name, discord_id)
         VALUES($1, $2, $3)
         RETURNING *`,
        [params.uuid, params.name, params.discord_id]
      );

      logger.info(`User created: ${params.name} (${params.uuid})`);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create user:", error);
      throw error;
    }
  }

  /**
   * Creats a user or does nothing if they already exist (by UUID)
   */
  async createIfNotExists(params: UserCreateParams): Promise<User> {
    try {
      const result = await this.db.query<User>(
        `INSERT INTO users (uuid, name, discord_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (uuid) DO NOTHING
         RETURNING *`,
        [params.uuid, params.name, params.discord_id]
      );

      if (result.rows[0]) {
        logger.info(`User created: ${params.name} (${params.uuid})`);
        return result.rows[0];
      }

      const existing = await this.findByUuid(params.uuid);
      return existing!;
    } catch (error) {
      logger.error("Failed to create user if not exist:", error);
      throw error;
    }
  }

  /**
   * Updates a user
   */
  async update(uuid: string, updates: UserUpdateParams): Promise<User | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.online !== undefined) {
        fields.push(`online = $${paramCount++}`);
        values.push(updates.online);
      }
      if (updates.discord_id !== undefined) {
        fields.push(`discord_id = $${paramCount++}`);
        values.push(updates.discord_id);
      }
      if (updates.playtime_seconds !== undefined) {
        fields.push(`play_time_seconds = $${paramCount++}`);
        values.push(updates.playtime_seconds);
      }

      if (fields.length === 0) {
        return this.findByUuid(uuid);
      }

      values.push(uuid);

      const result = await this.db.query<User>(
        `UPDATE users SET ${fields.join(
          ", "
        )} WHERE uuid = $${paramCount} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update user:", error);
      throw error;
    }
  }

  /**
   * Updates user's online status
   */
  async updateOnlineStatus(
    uuid: string,
    online: boolean
  ): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `UPDATE users
         SET online = $2,
             last_seen = CASE WHEN $2 = false THEN NOW() ELSE last_seen END,
             session_start = CASE WHEN $2 = true THEN NOW() ELSE NULL END
         WHERE uuid = $1
         RETURNING *`,
        [uuid, online]
      );

      if (result.rows[0]) {
        logger.info(`User ${uuid} is not ${online ? "online" : "offline"}`);
      }

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update user online status:", error);
      throw error;
    }
  }

  /**
   * Links a Discord ID to a user
   */
  async linkDiscordId(uuid: string, discordId: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `UPDATE users
         SET discord_id = $2
         WHERE uuid = $1
         RETURNING *`,
        [uuid, discordId]
      );

      if (result.rows[0]) {
        logger.info(`Discord ID ${discordId} linked to user ${uuid}`);
      }

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to link Discord ID:", error);
      throw error;
    }
  }

  /**
   * Unlinks a Discord ID from a user
   */
  async unlinkDiscordId(uuid: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `UPDATE users
         SET discord_id = NULL
         WHERE uuid = $1
         RETURNING *`,
        [uuid]
      );

      if (result.rows[0]) {
        logger.info("Discord ID unlinked from user", uuid);
      }

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to unlink Discord ID:", error);
      throw error;
    }
  }

  /**
   * Adds a playtime to a user
   */
  async addPlaytime(uuid: string, seconds: number): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `UPDATE users
         SET play_time_seconds = play_time_seconds + $2
         WHERE uuid = $1
         RETURNING *`,
        [uuid, seconds]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to add playtime:", error);
      throw error;
    }
  }
}
