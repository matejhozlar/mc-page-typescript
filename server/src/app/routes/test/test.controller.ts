import type { Request, Response } from "express";
import type { AppDependencies } from "@/types/app/routes/dependencies";

interface TestRouteResponse {
  timestamp: string;
  msg: string;
}

export function createTestController(deps: AppDependencies) {
  return {
    async getTest(req: Request, res: Response): Promise<void> {
      const responseData: TestRouteResponse = {
        timestamp: new Date().toISOString(),
        msg: "Hello from the test route",
      };

      res.json(responseData);
    },

    async getDbTest(req: Request, res: Response): Promise<void> {
      const users = await deps.db.query("SELECT COUNT(*) FROM users");

      res.json({
        timestamp: new Date().toISOString(),
        userCount: users.rows[0].count,
      });
    },
  };
}
