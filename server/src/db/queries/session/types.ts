import { CamelCaseKeys } from "@/types/common";

export const SessionType = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export interface SessionRow {
  id: number;
  session_token: string;
  discord_id: string;
  type: SessionType;
  created_at: Date;
  expires_at: Date;
  last_used_at: Date | null;
}

export type Session = CamelCaseKeys<SessionRow>;

export type SessionCreate = {
  sessionToken: string;
  discordId: string;
  type: SessionType;
  expiresAt: Date;
  lastUsedAt?: Date;
};
