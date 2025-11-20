/**
 * Database row type for the clicker_game_data table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ClickerGameData {
  /** Foreign key to users table */
  discord_id: string;
  points: number;
  tool: Tools;
  inventory: Tools[];
  materials: Materials;
  auto_click_level: number;
  updated_at: Date | null;
  furnace_level: number | null;
  coal_reserve: string | null;
  smelting_queue: any | null;
  last_logout_at: Date | null;
  smelt_amounts: any;
  offline_earnings_level: number | null;
}

export type Materials = {
  cobble_stone: number;
  copper_ore: number;
  iron_ore: number;
  gold_ore: number;
  diamond: number;
  netherite_ore: number;
  coal: number;
  copper_ingot: number;
  iron_ingot: number;
  gold_ingot: number;
  netherite_ingot: number;
};

export type Tools =
  | "hand"
  | "wooden"
  | "stone"
  | "copper"
  | "iron"
  | "gold"
  | "diamond"
  | "netherite"
  | "crimson_iron";
