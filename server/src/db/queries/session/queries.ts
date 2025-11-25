import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Session, SessionCreate, SessionRow, SessionType } from "./types";
import crypto from "node:crypto";

type Identifier = { id: number } | { sessionToken: string };

type Filters = {
  discordId: string;
  sessionType: SessionType;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date;
};

type Update = {
  sessionToken: string;
  discordId: string;
  sessionType: SessionType;
  expiresAt: Date;
  lastUsedAt: string;
};

export class SessionQueries extends BaseQueries<{
  Entity: Session;
  DbEntity: SessionRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: SessionCreate;
}> {
  protected readonly table = "sessions";

  private readonly sessionDuration;

  constructor(db: Pool, sessionDuration: number = 24 * 60 * 60 * 1000) {
    super(db);
    this.sessionDuration = sessionDuration;
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
