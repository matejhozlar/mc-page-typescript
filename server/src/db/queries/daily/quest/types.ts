import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the daily_shared_quests table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface DailyQuestRow {
  id: number;
  quest_date: Date;
  quest_type: string;
  quest_key: string;
  target_count: number;
  progress_count: number;
  description: string | null;
  discord_message_id: string | null;
}

export type DailyQuest = CamelCaseKeys<DailyQuestRow>;

export interface DailyQuestCreate {
  questType: string;
  questKey: string;
  targetCount: number;
  progressCount: number;
  description: string;
  discordMessageId: string;
}
