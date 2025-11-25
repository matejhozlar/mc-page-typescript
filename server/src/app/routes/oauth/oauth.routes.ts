import express, { Request, Response } from "express";
import { admins, sessions, users } from "@/db";
import { SessionType } from "@/db/queries/session";
import { OAuthConfig, oauthService } from "@/services/oauth";

/**
 * OAuth authentication routes for Discord login
 * Handles callback endpoints for different applications
 * and session management (logout, logout-all)
 */

export function createOAuthRoutes() {
  const router = express.Router();

  /**
   * Constructs the redirect URI based on environment
   *
   *
   * @param keyBase - Base environment variable key name
   * @returns The redirect URI from environment variables
   * @throws Error if the environment variable is not set
   */
  function getRedirectUri(keyBase: string): string {
    const isDev = process.env.NODE_ENV !== "production";
    const fullKey = isDev ? keyBase : `${keyBase}_PRODUCTION`;
    const uri = process.env[fullKey];

    if (!uri) {
      throw new Error(`Missing environment variable: ${fullKey}`);
    }

    return uri;
  }

  /**
   * Generic OAuth callback handler for Discord authentication
   * Exchanges authorization code for user data, validates user, and creates session
   *
   * @param req - Express request object containing authorization code in body
   * @param res - Express response object
   * @param config - OAuth configuration (clientId, clientSecret, redirectUri)
   * @param sessionType - Type of session to create ('user' or 'admin')
   * @param cookieName - Name of the session cookie to set
   * @param validateUser - Async function to validate if Discord user is authorized
   * @returns Promise resolving when callback is handled
   * @throws 400 if authorization code is missing
   * @throws 403 if user is not authorized for the application
   * @throws 500 if authentication fails
   */
  async function handleCallback(
    req: Request,
    res: Response,
    config: OAuthConfig,
    sessionType: SessionType,
    cookieName: string,
    validateUser: (discordId: string) => Promise<boolean>
  ) {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
      const discordUser = await oauthService.exchange(code, config);

      const isValid = await validateUser(discordUser.id);

      if (!isValid) {
        return res
          .status(403)
          .json({ error: "Not authorized for this application" });
      }

      const sessionToken = await sessions.start({
        discordId: discordUser.id,
        sessionType,
      });

      res.cookie(cookieName, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
        signed: true,
      });

      logger.info(
        `${sessionType} session started for ${discordUser.username} (${discordUser.id})`
      );

      res.status(200).json({
        success: true,
        username: discordUser.username,
      });
    } catch (error) {
      logger.error(`OAuth callback error (${sessionType}):`, error);
      res.status(500).json({ error: "Authentication failed" });
    }
  }
  /**
   * POST /auth/discord/callback-crypto
   * OAuth callback for cryptocurrency trading application
   * Validates that user exists in the users table before allowing login
   */
  router.post(
    "/discord/callback-crypto",
    async (req: Request, res: Response) => {
      await handleCallback(
        req,
        res,
        {
          clientId: process.env.CRYPTO_LOGIN_CLIENT_ID!,
          clientSecret: process.env.CRYPTO_LOGIN_CLIENT_SECRET!,
          redirectUri: getRedirectUri("CRYPTO_LOGIN_CLIENT_URI"),
        },
        "user",
        "user_session",
        async (discordId) => {
          const exists = await users.exists({ discordId });
          return exists;
        }
      );
    }
  );
  /**
   * POST /auth/discord/callback-game
   * OAuth callback for game application
   * Validates that user exists in the users table before allowing login
   */
  router.post("/discord/callback-game", async (req: Request, res: Response) => {
    await handleCallback(
      req,
      res,
      {
        clientId: process.env.GAME_LOGIN_CLIENT_ID!,
        clientSecret: process.env.GAME_LOGIN_CLIENT_SECRET!,
        redirectUri: getRedirectUri("GAME_LOGIN_REDIRECT_URI"),
      },
      "user",
      "user_session",
      async (discordId) => {
        const exists = await users.exists({ discordId });
        return exists;
      }
    );
  });
  /**
   * POST /auth/discord/callback-market
   *
   * OAuth callback for marketplace application
   * Validates that user exists in the users table before allowing login
   */
  router.post(
    "/discord/callback-market",
    async (req: Request, res: Response) => {
      await handleCallback(
        req,
        res,
        {
          clientId: process.env.CRYPTO_LOGIN_CLIENT_ID!,
          clientSecret: process.env.CRYPTO_LOGIN_CLIENT_SECRET!,
          redirectUri: getRedirectUri("CRYPTO_LOGIN_REDIRECT_URI"),
        },
        "user",
        "user_session",
        async (discordId) => {
          const exists = await users.exists({ discordId });
          return exists;
        }
      );
    }
  );

  /**
   * POST /auth/discord/callback
   * OAuth callback for admin panel access
   * Validates that user exists in the admins table before allowing login
   */
  router.post("/discord/callback", async (req: Request, res: Response) => {
    await handleCallback(
      req,
      res,
      {
        clientId: process.env.ADMIN_LOGIN_CLIENT_ID!,
        clientSecret: process.env.ADMIN_LOGIN_CLIENT_SECRET!,
        redirectUri: getRedirectUri("ADMIN_LOGIN_REDIRECT_URI"),
      },
      "admin",
      "admin_session",
      async (discordId) => {
        const exists = await admins.exists({ discordId });
        return exists;
      }
    );
  });
  /**
   * POST /auth/logout
   * Logs out the current user session
   * Invalidates the session token and clears both user and admin cookies
   * Works for both authenticated and unauthenticated requests
   */
  router.post("/logout", async (req: Request, res: Response) => {
    const sessionToken =
      req.signedCookies.user_session || req.signedCookies.admin_session;

    if (sessionToken) {
      await sessions.invalidate(sessionToken);
    }

    res.clearCookie("user_session");
    res.clearCookie("admin_session");

    res.status(200).json({ success: true, message: "Logged out" });
  });
  /**
   * POST /auth/logout-all
   * Logs out all sessions for the current user across all devices
   * Requires active authentication to identify the user
   * Invalidates all sessions associated with the user's Discord ID
   *
   * @throws 401 if no valid session token is provided
   */
  router.post("/logout-all", async (req: Request, res: Response) => {
    const sessionToken =
      req.signedCookies.user_session || req.signedCookies.admin_session;

    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await sessions.validate(sessionToken);

    if (session) {
      await sessions.invalidateAll(session.discordId);
    }

    res.clearCookie("user_session");
    res.clearCookie("admin_session");

    res
      .status(200)
      .json({ success: true, message: "Logged out from all devices" });
  });

  return router;
}
