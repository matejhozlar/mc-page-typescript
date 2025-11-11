import type { Pool } from "pg";
import logger from "@/logger";
import { Admin } from "@/types/models/admin.types";

type AdminCriteria = { id: number } | { discordId: string };

export class AdminQueries {
  constructor(private db: Pool) {}

  /**
   * Finds an admin by various criteria
   * Returns null if not found
   *
   * @param criteria - Object with id or discordId
   * @returns Promise resolving to the Admin or null
   */
  async find(criteria: AdminCriteria): Promise<Admin | null> {
    let query: string;
    let params: any[];

    if ("id" in criteria) {
      query = "SELECT * FROM admins WHERE id = $1 LIMIT 1";
      params = [criteria.id];
    } else if ("discordId" in criteria) {
      query = "SELECT * FROM admins WHERE discord_id = $1 LIMIT 1";
      params = [criteria.discordId];
    } else {
      throw new Error("Invalid search criteria");
    }

    try {
      const result = await this.db.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find admin:", error);
      throw error;
    }
  }

  /**
   * Retrieves an admin by various criteria
   * Throws an error if not found
   *
   * @param criteria - Object with id or discordId
   * @returns Promise resolving to the Admin
   * @throws Error if admin is not found
   */
  async get(criteria: AdminCriteria): Promise<Admin> {
    const admin = await this.find(criteria);

    if (!admin) {
      const criteriaStr = Object.entries(criteria)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      throw new Error(`Admin not found with ${criteriaStr}`);
    }

    return admin;
  }

  /**
   * Check if an admin exists
   *
   * @param criteria - Object with id or discordId
   * @returns Promise resolving to true if user exists, false otherwise
   */
  async exists(criteria: AdminCriteria): Promise<boolean> {
    let query: string;
    let params: any[];

    if ("id" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM admins WHERE id = $1)";
      params = [criteria.id];
    } else if ("discordId" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM admins WHERE discord_id = $1)";
      params = [criteria.discordId];
    } else {
      throw new Error("Invalid search criteria");
    }

    try {
      const result = await this.db.query<{ exists: boolean }>(query, params);
      return Boolean(result.rows[0].exists);
    } catch (error) {
      logger.error("Failed to check admin existence:", error);
      throw error;
    }
  }
}
