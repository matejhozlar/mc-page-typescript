import { createUser } from "@/app/middleware/auth.middleware";
import { sessions, users } from "@/db";
import { Router, Request, Response } from "express";

export function createUserRoutes() {
  const router = Router();

  const requireUser = createUser();

  router.get("/user/validate", async (req: Request, res: Response) => {
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

      if (!user) {
        return res.status(401).json({ valid: false });
      }

      res.json({ valid: true, name: user.name, discordId: user.discordId });
    } catch (error) {
      logger.error("Error validating user session:", error);
    }
  });
}
