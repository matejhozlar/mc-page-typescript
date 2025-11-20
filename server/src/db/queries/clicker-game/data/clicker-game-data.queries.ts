import type { Pool } from "pg";
import { ClickerGameData } from "./clicker-game-data.types";

type ClickerGameDataIdentifier = { discordId: string };

type ClickerGameDataFilters =
  | { points: number }
  | { tool: string }
  | { inventory: string[] }
  | { materials: Object }
  | { autoClickLevel: number }
  | { updatedAt: Date }
  | { furnaceLevel: number }
  | { coalReserve: string }
  | { smeltingQueue: Object }
  | { lastLogoutAt: Date }
  | { smeltAmounts: Object }
  | { offlineEarningsLevel: number };

type ClickerGameDataUpdate = ClickerGameDataFilters;
