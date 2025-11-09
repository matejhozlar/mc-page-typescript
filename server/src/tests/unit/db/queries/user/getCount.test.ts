import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("UserQueries - getCount Test", () => {
  let mockDb: Pool;
  let userQueries: UserQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    userQueries = new UserQueries(mockDb);
  });

  describe("getCount", () => {
    it("should return user count when query succeeds", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "42" }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.getCount();

      expect(result).toBe("42");
      expect(mockDb.query).toHaveBeenCalledWith("SELECT COUNT(*) FROM users");
    });

    it("should throw error when count is null", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: null }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(userQueries.getCount()).rejects.toThrow("No data found");
    });

    it("should throw error when count is undefined", async () => {
      const mockResult = MockFactory.createMockQueryResult([{}]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(userQueries.getCount()).rejects.toThrow("No data found");
    });

    it("should log and rethrow error when query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(userQueries.getCount()).rejects.toThrow(dbError);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to get user count:",
        dbError
      );
    });

    it("should throw error when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(userQueries.getCount()).rejects.toThrow();
    });
  });
});
