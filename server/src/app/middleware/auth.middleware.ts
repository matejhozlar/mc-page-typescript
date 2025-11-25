import { Request, Response, NextFunction } from "express";
import { sessions } from "@/db";

/**
 * Authentication middleware factory functions for Express routes
 * Provides session validation for different access levels (any, admin, user)
 */
/**
 * Creates middleware that requires any valid session (user or admin)
 * Checks both user_session and admin_session cookies for authentication
 * Attaches session data to req.session on successful validation
 *
 * @returns Express middleware function
 * @throws 401 if no session token provided or session is invalid/expired
 */
export function createAuth() {
  /**
   * Middleware to required any valid session
   */
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken =
      req.signedCookies?.user_session || req.signedCookies.admin_session;

    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await sessions.validate(sessionToken);

    if (!session) {
      res.clearCookie("user_session");
      res.clearCookie("admin_session");
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.session = {
      id: session.id,
      discordId: session.discordId,
      sessionType: session.sessionType,
    };

    next();
  };
}

/**
 * Creates middleware that requires an admin session
 * Only accepts admin_session cookie and validates session type is 'admin'
 * Attaches session data to req.session on successful validation
 *
 * @returns Express middleware function
 * @throws 401 if no session token provided
 * @throws 403 if session exists but is not an admin session
 */
export function createAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = req.signedCookies?.admin_session;

    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await sessions.validate(sessionToken);

    if (!session || session.sessionType !== "admin") {
      res.clearCookie("admin_session");
      return res.status(403).json({ error: "Admin access required" });
    }

    req.session = {
      id: session.id,
      discordId: session.discordId,
      sessionType: session.sessionType,
    };

    next();
  };
}

/**
 * Creates middleware that requires a user session (non-admin)
 * Only accepts user_session cookie and rejects admin sessions
 * Attaches session data to req.session on successful validation
 *
 * @returns Express middleware function
 * @throws 401 if no session token provided, session is invalid, or session is admin type
 */
export function createUser() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = req.signedCookies?.user_session;

    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await sessions.validate(sessionToken);

    if (!session || session.sessionType === "admin") {
      res.clearCookie("user_session");
      return res.status(401).json({ error: "Invalid user session" });
    }

    req.session = {
      id: session.id,
      discordId: session.discordId,
      sessionType: session.sessionType,
    };

    next();
  };
}
