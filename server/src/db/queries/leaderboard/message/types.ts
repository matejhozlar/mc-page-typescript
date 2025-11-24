import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the leaderboard_messages table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface LeaderboardMessageRow {
  id: number;
  type: string;
  channel_id: string;
  message_id: string;
}

export type LeaderboardMessage = CamelCaseKeys<LeaderboardMessageRow>;

export interface LeaderboardMessageCreate {
  type: string;
  channelId: string;
  messageId: string;
}
