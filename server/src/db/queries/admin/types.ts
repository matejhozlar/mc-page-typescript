import { CamelCaseKeys } from "@/types/common";
/**
 * Database row type for the admins table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface AdminRow {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  created_at: Date;
  vanished: boolean;
}

export type Admin = CamelCaseKeys<AdminRow>;

export interface AdminCreate {
  discordId: string;
}
