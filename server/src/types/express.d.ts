import { SessionType } from "@/db/queries/session";

declare global {
  namespace Express {
    interface Request {
      session?: {
        id: number;
        discordId: string;
        sessionType: SessionType;
      };
    }
  }
}
