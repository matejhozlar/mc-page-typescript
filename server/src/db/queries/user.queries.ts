import type { Pool } from "pg";
import type { User } from "@/types/models/user.types";
import logger from "@/logger";

type UserCriteria = { discordId: string } | { uuid: string } | { name: string };

export class UserQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a user by various criteria
   * Returns null if not found
   *
   * @param criteria - Object with discordId, uuid, or name
   * @returns Promise resolving to the User or null
   */
  async find(criteria: UserCriteria): Promise<User | null> {
    let query: string;
    let params: string[];

    if ("discordId" in criteria) {
      query = "SELECT * FROM users WHERE discord_id = $1 LIMIT 1";
      params = [criteria.discordId];
    } else if ("uuid" in criteria) {
      query = "SELECT * FROM users WHERE uuid = $1 LIMIT 1";
      params = [criteria.uuid];
    } else if ("name" in criteria) {
      query = "SELECT * FROM users WHERE name = $1 LIMIT 1";
      params = [criteria.name];
    } else {
      throw new Error("Invalid search criteria");
    }

    try {
      const result = await this.db.query<User>(query, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find user:", error);
      throw error;
    }
  }

  /**
   * Retrieves a user by various criteria
   * Throws an error if not found
   *
   * @param criteria - Object with discordId, uuid, or name
   * @returns Promise resolving to the User
   * @throws Error if user is not found
   */
  async get(criteria: UserCriteria): Promise<User> {
    const user = await this.find(criteria);

    if (!user) {
      const criteriaStr = Object.entries(criteria)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      throw new Error(`User not found with ${criteriaStr}`);
    }

    return user;
  }

  /**
   * Check if a user exists
   *
   * @param criteria - Object with discordId, uuid, or name
   * @returns Promise resolving to true if user exists, false otherwise
   */
  async exists(criteria: UserCriteria): Promise<boolean> {
    let query: string;
    let params: string[];

    if ("discordId" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM users WHERE discord_id = $1)";
      params = [criteria.discordId];
    } else if ("uuid" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM users WHERE uuid = $1)";
      params = [criteria.uuid];
    } else if ("name" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM users WHERE name = $1)";
      params = [criteria.name];
    } else {
      throw new Error("Invalid user search criteria");
    }

    try {
      const result = await this.db.query<{ exists: boolean }>(query, params);
      return Boolean(result.rows[0].exists);
    } catch (error) {
      logger.error("Failed to check user existence:", error);
      throw error;
    }
  }

  /**
   * Retrieves a Minecraft username for a user
   *
   * @param criteria - Object with discordId, uuid, or name
   * @returns Promise resolving to the Minecraft username
   * @throws Error if user is not found
   */
  async name(criteria: UserCriteria): Promise<string> {
    const user = await this.get(criteria);
    return user.name;
  }

  /**
   * Retrieves the total number of registered users in the database
   *
   * @returns Promise resolving to the count of users
   */
  async count(): Promise<number> {
    try {
      const result = await this.db.query<{ count: string }>(
        `SELECT COUNT(*) FROM users`
      );

      return parseInt(result.rows[0]?.count ?? "0", 10);
    } catch (error) {
      logger.error("Failed to get user count:", error);
      throw error;
    }
  }
}
