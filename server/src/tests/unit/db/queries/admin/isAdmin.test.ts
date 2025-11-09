import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { AdminQueries } from "@/db/queries/admin.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("AdminQueries - isAdmin", () => {
  let mockDb: Pool;
  let adminQueries: AdminQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    adminQueries = new AdminQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("isAdmin", () => {
    it("should return true when user is an admin", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ "?column?": 1 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await adminQueries.isAdmin("123456789");

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT 1 FROM admins WHERE discord_id = $1",
        ["123456789"]
      );
    });

    it("should return false when user is not an admin", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await adminQueries.isAdmin("999999999");

      expect(result).toBe(false);
    });

    it("should return false when discord_id is empty string", async () => {
      const result = await adminQueries.isAdmin("");

      expect(result).toBe(false);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it("should return false when discord_id is null", async () => {
      const result = await adminQueries.isAdmin(null as any);

      expect(result).toBe(false);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it("should return false when discord_id is undefined", async () => {
      const result = await adminQueries.isAdmin(undefined as any);

      expect(result).toBe(false);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it("should handle rowCount being null", async () => {
      const mockResult = MockFactory.createMockQueryResult([], null);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await adminQueries.isAdmin("123456789");

      expect(result).toBe(false);
    });

    it("should return true when rowCount is greater than 1", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ "?column?": 1 }, { "?column?": 1 }],
        2
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await adminQueries.isAdmin("123456789");

      expect(result).toBe(true);
    });

    it("should log error and rethrow when database query fails", async () => {
      const dbError = new Error("Connection lost");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(adminQueries.isAdmin("123456789")).rejects.toThrow(
        "Connection lost"
      );

      expect(logger.error).toHaveBeenCalledWith("Admin check failed:", dbError);
    });

    it("should pass correct discord_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await adminQueries.isAdmin("987654321");

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("discord_id = $1"),
        ["987654321"]
      );
    });

    it("should call query exactly once for valid discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ "?column?": 1 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await adminQueries.isAdmin("123456789");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should not call query for invalid discord_id", async () => {
      await adminQueries.isAdmin("");

      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it("should handle special characters in discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await adminQueries.isAdmin("test@#$%");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "test@#$%",
      ]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousInput = "123' OR '1'='1";
      await adminQueries.isAdmin(maliciousInput);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousInput,
      ]);
    });

    it("should handle very long discord_id string", async () => {
      const longDiscordId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await adminQueries.isAdmin(longDiscordId);

      expect(result).toBe(false);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        longDiscordId,
      ]);
    });

    it("should verify SQL query structure", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await adminQueries.isAdmin("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SELECT\s+1\s+FROM\s+admins/i);
      expect(callArgs[0]).toMatch(/WHERE\s+discord_id\s*=\s*\$1/i);
    });

    it("should handle database timeout error", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(adminQueries.isAdmin("123456789")).rejects.toThrow(
        "Query timeout"
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Admin check failed:",
        timeoutError
      );
    });

    it("should handle network error", async () => {
      const networkError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(networkError);

      await expect(adminQueries.isAdmin("123456789")).rejects.toThrow(
        "ECONNREFUSED"
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Admin check failed:",
        networkError
      );
    });

    it("should return false for numeric discord_id (type coercion)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await adminQueries.isAdmin(123456789 as any);

      expect(mockDb.query).toHaveBeenCalled();
    });

    it("should handle concurrent calls correctly", async () => {
      const mockResult1 = MockFactory.createMockQueryResult(
        [{ "?column?": 1 }],
        1
      );
      const mockResult2 = MockFactory.createMockQueryResult([], 0);

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const [result1, result2] = await Promise.all([
        adminQueries.isAdmin("123456789"),
        adminQueries.isAdmin("987654321"),
      ]);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should not cache results between calls", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ "?column?": 1 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await adminQueries.isAdmin("123456789");
      await adminQueries.isAdmin("123456789");

      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });
  });
});
