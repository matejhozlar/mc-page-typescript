import type { Request, Response } from "express";
import { userQueries } from "@/db";

interface TestRouteResponse {
  timestamp: string;
  msg: string;
}

export function createTestController() {
  return {
    async getTest(req: Request, res: Response): Promise<void> {
      const responseData: TestRouteResponse = {
        timestamp: new Date().toISOString(),
        msg: "Hello from the test route",
      };

      res.json(responseData);
    },

    async getDbTest(req: Request, res: Response): Promise<void> {
      const count: number = await userQueries.getCount();

      res.json({
        timestamp: new Date().toISOString(),
        userCount: count,
      });
    },
  };
}
