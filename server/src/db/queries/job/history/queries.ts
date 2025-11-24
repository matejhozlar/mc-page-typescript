import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { JobHistory, JobHistoryCreate, JobHistoryRow } from "./types";

type Identifier = { id: number } | { jobName: string };

type Filters = { lastRun: Date };

type Update = Filters;

export class JobHistoryQueries extends BaseQueries<{
  Entity: JobHistory;
  DbEntity: JobHistoryRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: JobHistoryCreate;
}> {
  protected readonly table = "job_history";

  constructor(db: Pool) {
    super(db);
  }
}
