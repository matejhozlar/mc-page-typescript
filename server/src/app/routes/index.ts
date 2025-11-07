import type { Express } from "express";

import testRoutes from "./test/test.routes";
import { runInDevelopment } from "@/utils/guard/run-guard";

export default function registerRoutes(app: Express): void {
  runInDevelopment(() => {
    app.use("/api", testRoutes);
  });
}
