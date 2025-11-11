import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("UserQueries - count Test", () => {
  let mockDb: Pool;
  let userQueries: UserQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    userQueries = new UserQueries(mockDb);
  });

  describe("count", () => {
    it("should return user count as number when query succeeds", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "42" }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.count();

      expect(result).toBe(42);
      expect(typeof result).toBe("number");
      expect(mockDb.query).toHaveBeenCalledWith("SELECT COUNT(*) FROM users");
    });

    it("should return 0 when count is null", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: null }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.count();

      expect(result).toBe(0);
    });

    it("should return 0 when count is undefined", async () => {
      const mockResult = MockFactory.createMockQueryResult([{}]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.count();

      expect(result).toBe(0);
    });

    it("should return 0 when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.count();

      expect(result).toBe(0);
    });

    it("should log and rethrow error when query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(userQueries.count()).rejects.toThrow(dbError);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to get user count:",
        dbError
      );
    });

    it("should handle large count values correctly", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { count: "999999" },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.count();

      expect(result).toBe(999999);
    });
  });
});
