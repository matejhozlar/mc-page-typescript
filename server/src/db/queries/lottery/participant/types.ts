/**
 * Database row type for the lottery_participants table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface LotteryParticipant {
  id: number;
  /** Foreign key to users table */
  uuid: string;
  name: string;
  amount: number;
  joined_at: Date;
}

export interface LotteryParticipantCreate {
  uuid: string;
  name: string;
  amount: number;
}
