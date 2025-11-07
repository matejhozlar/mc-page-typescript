import type { JWTUserPayload } from "@/app/middleware/verify-jwt";

declare global {
  namespace Express {
    interface Request {
      signedCookies?: {
        user_session?: string;
        admin_session?: string;
      };

      user?: JWTUserPayload;
    }
  }
}

export {};
