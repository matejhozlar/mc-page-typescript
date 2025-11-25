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
  sessionType: SessionType;
  created_at: Date;
  expires_at: Date;
  last_used_at: Date | null;
}

export type Session = CamelCaseKeys<SessionRow>;

export interface SessionCreate {
  sessionToken: string;
  discordId: string;
  sessionType: SessionType;
  expiresAt: Date;
}

export interface SessionStart {
  discordId: string;
  sessionType: SessionType;
}

export interface SessionStats {
  total: number;
  active: number;
  expired: number;
  byType: Record<SessionType, number>;
}
