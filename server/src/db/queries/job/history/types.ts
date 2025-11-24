import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the job_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface JobHistoryRow {
  id: number;
  job_name: string;
  last_run: Date;
}

export type JobHistory = CamelCaseKeys<JobHistoryRow>;

export interface JobHistoryCreate {
  jobName: string;
  lastRun: Date;
}
