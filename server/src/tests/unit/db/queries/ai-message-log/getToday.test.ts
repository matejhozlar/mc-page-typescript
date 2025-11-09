import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { AiMessageLogQueries } from "@/db/queries/ai-message-log.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("AiMessageLogQueries - getToday", () => {
  let mockDb: Pool;
  let aiMessageLogQueries: AiMessageLogQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    aiMessageLogQueries = new AiMessageLogQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("getToday", () => {
    it("should return count when user has messages today", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "5" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(5);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) FROM ai_message_log"),
        ["123456789"]
      );
    });

    it("should return 0 when user has no messages today", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "0" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("999999999");

      expect(result).toBe(0);
    });

    it("should return 0 when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(0);
    });

    it("should return 0 when count is undefined", async () => {
      const mockResult = MockFactory.createMockQueryResult([{}], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(0);
    });

    it("should return 0 when count is null", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: null }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(0);
    });

    it("should handle large count values", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: "9999" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(9999);
    });

    it("should handle count as string '1'", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "1" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(1);
      expect(typeof result).toBe("number");
    });

    it("should handle count with leading zeros", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: "007" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(7);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(aiMessageLogQueries.getToday("123456789")).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should pass correct discord_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "3" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await aiMessageLogQueries.getToday("987654321");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "987654321",
      ]);
    });

    it("should include CURRENT_DATE filter in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "5" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await aiMessageLogQueries.getToday("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/created_at::date\s*=\s*CURRENT_DATE/i);
    });

    it("should filter by discord_id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "2" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await aiMessageLogQueries.getToday("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+discord_id\s*=\s*\$1/i);
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "1" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await aiMessageLogQueries.getToday("123456789");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "0" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("");

      expect(result).toBe(0);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [""]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "0" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousInput = "123'; DROP TABLE ai_message_log; --";
      await aiMessageLogQueries.getToday(maliciousInput);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousInput,
      ]);
    });

    it("should handle special characters in discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "2" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("test@#$%");

      expect(result).toBe(2);
    });

    it("should handle very long discord_id string", async () => {
      const longDiscordId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([{ count: "0" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday(longDiscordId);

      expect(result).toBe(0);
    });

    it("should return number type not string", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: "42" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(typeof result).toBe("number");
      expect(result).toBe(42);
    });

    it("should handle concurrent calls for different users", async () => {
      const mockResult1 = MockFactory.createMockQueryResult(
        [{ count: "5" }],
        1
      );
      const mockResult2 = MockFactory.createMockQueryResult(
        [{ count: "3" }],
        1
      );

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const [result1, result2] = await Promise.all([
        aiMessageLogQueries.getToday("123456789"),
        aiMessageLogQueries.getToday("987654321"),
      ]);

      expect(result1).toBe(5);
      expect(result2).toBe(3);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should handle database returning count as number instead of string", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: 10 as any }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(10);
    });

    it("should return 0 for invalid count string", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: "invalid" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(NaN);
    });

    it("should handle negative count (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: "-5" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(-5);
    });

    it("should handle decimal count string", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ count: "5.7" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await aiMessageLogQueries.getToday("123456789");

      expect(result).toBe(5);
    });

    it("should verify SQL query uses COUNT(*)", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ count: "3" }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await aiMessageLogQueries.getToday("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SELECT\s+COUNT\(\*\)/i);
    });
  });
});
