/**
 * Database row type for the job_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface JobHistory {
  id: number;
  job_name: string;
  last_run: Date;
}

export interface JobHistoryCreate {
  job_name: string;
  last_run: Date;
}
