import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("UserQueries - exists Test", () => {
  let mockDb: Pool;
  let userQueries: UserQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    userQueries = new UserQueries(mockDb);
  });

  describe("exists by discordId", () => {
    it("should return true when user exists by discordId", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({
        discordId: "123456789012345678",
      });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM users WHERE discord_id = $1)",
        ["123456789012345678"]
      );
    });

    it("should return false when user does not exist by discordId", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({
        discordId: "999999999999999999",
      });

      expect(result).toBe(false);
    });
  });

  describe("exists by uuid", () => {
    it("should return true when user exists by uuid", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM users WHERE uuid = $1)",
        ["550e8400-e29b-41d4-a716-446655440000"]
      );
    });

    it("should return false when user does not exist by uuid", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({
        uuid: "00000000-0000-0000-0000-000000000000",
      });

      expect(result).toBe(false);
    });
  });

  describe("exists by name", () => {
    it("should return true when user exists by name", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({ name: "TestPlayer" });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM users WHERE name = $1)",
        ["TestPlayer"]
      );
    });

    it("should return false when user does not exist by name", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({ name: "NonExistentPlayer" });

      expect(result).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should throw error for invalid search criteria", async () => {
      await expect(userQueries.exists({} as any)).rejects.toThrow(
        "Invalid user search criteria"
      );
    });

    it("should handle truthy values correctly with Boolean conversion", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { exists: 1 as any },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({
        discordId: "123456789012345678",
      });

      expect(result).toBe(true);
    });

    it("should handle falsy values correctly with Boolean conversion", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { exists: 0 as any },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.exists({
        discordId: "999999999999999999",
      });

      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should log and rethrow error when query fails", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        userQueries.exists({ discordId: "123456789012345678" })
      ).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to check user existence:",
        dbError
      );
    });

    it("should handle query timeout error", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(
        userQueries.exists({ uuid: "550e8400-e29b-41d4-a716-446655440000" })
      ).rejects.toThrow(timeoutError);
    });

    it("should throw error when result is undefined", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        userQueries.exists({ discordId: "123456789012345678" })
      ).rejects.toThrow();
    });
  });

  describe("query construction", () => {
    it("should use correct SQL and parameters for discordId search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.exists({ discordId: "test-discord-id" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM users WHERE discord_id = $1)",
        ["test-discord-id"]
      );
    });

    it("should use correct SQL and parameters for uuid search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.exists({ uuid: "test-uuid" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM users WHERE uuid = $1)",
        ["test-uuid"]
      );
    });

    it("should use correct SQL and parameters for name search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.exists({ name: "test-name" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM users WHERE name = $1)",
        ["test-name"]
      );
    });
  });
});
