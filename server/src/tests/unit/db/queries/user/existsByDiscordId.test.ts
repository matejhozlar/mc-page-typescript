import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries/user.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("UserQueries - existsByDiscordId", () => {
  let mockDb: Pool;
  let userQueries: UserQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    userQueries = new UserQueries(mockDb);
  });

  describe("existsByDiscordId", () => {
    it("should return true when user exists", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: true }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("123456789");

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT EXISTS"),
        ["123456789"]
      );
    });

    it("should return false when user does not exist", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: false }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("999999999");

      expect(result).toBe(false);
    });

    it("should return false when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("123456789");

      expect(result).toBe(false);
    });

    it("should return false when exists property is undefined", async () => {
      const mockResult = MockFactory.createMockQueryResult([{}], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("123456789");

      expect(result).toBe(false);
    });

    it("should return false when exists property is null", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: null }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("123456789");

      expect(result).toBe(false);
    });

    it("should handle numeric 1 as true", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: 1 }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("123456789");

      expect(result).toBe(true);
    });

    it("should handle numeric 0 as false", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: 0 }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("123456789");

      expect(result).toBe(false);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(userQueries.existsByDiscordId("123456789")).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should pass correct discord_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: true }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.existsByDiscordId("987654321");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "987654321",
      ]);
    });

    it("should handle empty string discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: false }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId("");

      expect(result).toBe(false);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [""]);
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: true }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.existsByDiscordId("123456789");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: false }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousInput = "123'; DROP TABLE users; --";
      await userQueries.existsByDiscordId(maliciousInput);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousInput,
      ]);
    });

    it("should verify SQL query contains EXISTS clause", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: true }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.existsByDiscordId("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SELECT\s+EXISTS/i);
      expect(callArgs[0]).toMatch(/WHERE\s+discord_id\s*=\s*\$1/i);
    });

    it("should handle very long discord_id string", async () => {
      const longDiscordId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: false }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId(longDiscordId);

      expect(result).toBe(false);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        longDiscordId,
      ]);
    });

    it("should handle special characters in discord_id", async () => {
      const specialDiscordId = "test@#$%^&*()";
      const mockResult = MockFactory.createMockQueryResult(
        [{ exists: true }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.existsByDiscordId(specialDiscordId);

      expect(result).toBe(true);
    });
  });
});
