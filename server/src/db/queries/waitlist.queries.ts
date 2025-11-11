import type { Pool } from "pg";
import logger from "@/logger";
import { Waitlist } from "@/types/models/waitlist.types";

type WaitlistCriteria =
  | { id: number }
  | { email: string }
  | { token: string }
  | { discordName: string };

type WaitlistUpdate = {
  email?: string;
  token?: string;
  discordName?: string;
};

export class WaitlistQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a waitlist entry by various criteria
   * Returns null if not found
   *
   * @param criteria - Object with id, email, token, or discord_name
   * @returns Promise resolving to the Waitlist or null
   */
  async find(criteria: WaitlistCriteria): Promise<Waitlist | null> {
    let query: string;
    let params: any[];

    if ("id" in criteria) {
      query = "SELECT * FROM waitlist_emails WHERE id = $1 LIMIT 1";
      params = [criteria.id];
    } else if ("email" in criteria) {
      query = "SELECT * FROM waitlist_emails WHERE email = $1 LIMIT 1";
      params = [criteria.email];
    } else if ("token" in criteria) {
      query = "SELECT * FROM waitlist_emails WHERE token = $1 LIMIT 1";
      params = [criteria.token];
    } else if ("discordName" in criteria) {
      query = "SELECT * FROM waitlist_emails WHERE discord_name = $1 LIMIT 1";
      params = [criteria.discordName];
    } else {
      throw new Error("Invalid search criteria");
    }

    try {
      const result = await this.db.query<Waitlist>(query, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find waitlist:", error);
      throw error;
    }
  }

  /**
   * Retrieves a waitlist by various criteria
   * Throws an error if not found
   *
   * @param criteria - Object with id, email, token, or discord_name
   * @returns Promise resolving to the Waitlist
   * @throws Error if waitlist is not found
   */
  async get(criteria: WaitlistCriteria): Promise<Waitlist> {
    const waitlist = await this.find(criteria);

    if (!waitlist) {
      const criteriaStr = Object.entries(criteria)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      throw new Error(`Waitlist not found with ${criteriaStr}`);
    }

    return waitlist;
  }

  /**
   * Check if a waitlist exists
   *
   * @param criteria - Object with id, email, token, or discord_name
   * @returns Promise resolving to true if waitlist exists, false otherwise
   */
  async exists(criteria: WaitlistCriteria): Promise<boolean> {
    let query: string;
    let params: any[];

    if ("id" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE id = $1)";
      params = [criteria.id];
    } else if ("email" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE email = $1)";
      params = [criteria.email];
    } else if ("token" in criteria) {
      query = "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE token = $1)";
      params = [criteria.token];
    } else if ("discordName" in criteria) {
      query =
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE discord_name = $1)";
      params = [criteria.discordName];
    } else {
      throw new Error("Invalid search criteria");
    }

    try {
      const result = await this.db.query<{ exists: boolean }>(query, params);
      return Boolean(result.rows[0].exists);
    } catch (error) {
      logger.error("Failed to check waitlist existence:", error);
      throw error;
    }
  }

  /**
   * Updates a waitlist by various criteria
   *
   * @param identifier - Object with id, email, token, or discord_name
   * @param toUpdate - Object with id, email, token, or discord_name
   * @returns Promise resolving when the update is complete
   * @throws Error if no waitlist entry is found with the specified identifier or update fails
   */
  async update(
    identifier: WaitlistCriteria,
    updates: WaitlistUpdate
  ): Promise<void> {
    const updateEntries = Object.entries(updates);

    if (updateEntries.length === 0) {
      throw new Error("No fields to update");
    }

    const columnMap: Record<string, string> = {
      email: "email",
      token: "token",
      discordName: "discord_name",
    };

    const setClauses = updateEntries.map(([key], index) => {
      const dbColumn = columnMap[key];
      return `${dbColumn} = $${index + 2}`;
    });

    const updateValues = updateEntries.map(([_, value]) => value);

    let whereClause: string;
    let whereValue: any;

    if ("id" in identifier) {
      whereClause = "id = $1";
      whereValue = identifier.id;
    } else if ("email" in identifier) {
      whereClause = "email = $1";
      whereValue = identifier.email;
    } else if ("token" in identifier) {
      whereClause = "token = $1";
      whereValue = identifier.token;
    } else if ("discordName" in identifier) {
      whereClause = "discord_name = $1";
      whereValue = identifier.discordName;
    } else {
      throw new Error("Invalid identifier criteria");
    }

    const query = `
    UPDATE waitlist_emails
    SET ${setClauses.join(", ")}
    WHERE ${whereClause}
    `;

    const params = [whereValue, ...updateValues];

    try {
      const result = await this.db.query(query, params);

      if (result.rowCount === 0) {
        const identifierStr = Object.entries(identifier).map(
          ([k, v]) => `${k}: ${v}`
        );
        throw new Error(`Waitlist entry not found with ${identifierStr}`);
      }

      logger.info("Waitlist entry updated successfully");
    } catch (error) {
      logger.error("Failed to update waitlist entry:", error);
      throw error;
    }
  }
}
