/**
 * Database row type for the leaderboard_messages table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface LeaderboardMessage {
  id: number;
  type: string;
  channel_id: string;
  message_id: string;
}
