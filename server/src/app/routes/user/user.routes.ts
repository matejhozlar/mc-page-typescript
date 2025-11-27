import { createUser } from "@/app/middleware/auth.middleware";
import { asyncHandler } from "@/app/middleware/error.middleware";
import { sessions, users } from "@/db";
import { Router, Request, Response } from "express";
import { NotFoundError } from "@/db/utils/errors";
/**
 * User-related routes
 * Handles session validation and user profile data retrieval
 * All routes except /validate require authentication via requireUser middleware
 */
export function createUserRoutes() {
  const router = Router();
  const requireUser = createUser();
  /**
   * GET /user/validate
   * Validates the current user session without requiring authentication middleware
   * Used for checking if a user is logged in (e.g., on page load)
   *
   * @returns 200 with user data if session is valid
   * @returns 401 if session is invalid, missing, or user is not found
   *
   * Note: This endpoint intentionally doesn't use requireUser middleware
   * to allow graceful validation without throwing errors
   */
  router.get(
    "/user/validate",
    asyncHandler(async (req: Request, res: Response) => {
      const sessionToken = req.signedCookies?.user_session;

      if (!sessionToken) {
        return res.status(401).json({ valid: false });
      }

      const session = await sessions.validate(sessionToken);

      if (!session) {
        res.clearCookie("user_session");
        return res.status(401).json({ valid: false });
      }

      try {
        const user = await users.get({ discordId: session.discordId });
        res.json({ valid: true, name: user.name, discordId: user.discordId });
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.clearCookie("user_session");
          return res.status(401).json({ valid: false });
        }

        throw error;
      }
    })
  );
  /**
   * GET /user/me
   * Returns basic user profile information
   * Requires authentication via requireUser middleware
   *
   * @requires Authentication - user_session cookie with valid session
   * @returns User object with basic profile data
   * @throws 401 if not authenticated
   * @throws 404 if user not found
   */
  router.get(
    "/user/me",
    requireUser,
    asyncHandler(async (req: Request, res: Response) => {
      const discordId = req.session!.discordId;

      const user = await users.get({ discordId });

      logger.info("/user/me data sent for:", discordId);
      res.json(user);
    })
  );
  /**
   * GET /user/full-profile
   * Returns a complete user profile including balance information
   * Required authentication via requireUser middleware
   *
   * @requires Authentication - user_session cookie with valid session
   * @returns User object merged with balance data
   * @throws 401 if not authenticated
   * @throws 404 if user not found
   */
  router.get(
    "/user/full-profile",
    requireUser,
    asyncHandler(async (req: Request, res: Response) => {
      const discordId = req.session!.discordId;

      const user = await users.get({ discordId });
      const userBalance = await users.balance.get({ discordId });

      res.json({ ...user, userBalance });
    })
  );

  return router;
}
