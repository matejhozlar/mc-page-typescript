/**
 * Database row type for the clicker_game_data table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ClickerGameData {
  /** Foreign key to users table */
  discord_id: string;
  points: number;
  tool: string;
  inventory: any;
  materials: any;
  auto_click_level: number;
  updated_at: Date | null;
  furnace_level: number | null;
  coal_reserve: any | null;
  smelting_queue: any | null;
  last_logout_at: Date | null;
  smelt_amounts: any;
  offline_earnings_level: number | null;
}
