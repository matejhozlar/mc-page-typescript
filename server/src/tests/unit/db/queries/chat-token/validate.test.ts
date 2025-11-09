import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { ChatTokenQueries } from "@/db/queries/chat-token.queries";
import type { ChatToken } from "@/types/models/chat-token.types";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("ChatTokenQueries - validate", () => {
  let mockDb: Pool;
  let chatTokenQueries: ChatTokenQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    chatTokenQueries = new ChatTokenQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("validate", () => {
    const validToken: ChatToken = {
      token: "valid-token-123",
      discord_id: "123456789",
      discord_name: "TestUser",
      expires_at: new Date("2025-12-31T23:59:59Z"),
    };

    it("should return chat token when token is valid and not expired", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("valid-token-123");

      expect(result).toEqual(validToken);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM chat_tokens"),
        ["valid-token-123"]
      );
    });

    it("should return null when token does not exist", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("non-existent-token");

      expect(result).toBeNull();
    });

    it("should return null when token is expired", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("expired-token");

      expect(result).toBeNull();
    });

    it("should return null when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("some-token");

      expect(result).toBeNull();
    });

    it("should return null when rows[0] is undefined", async () => {
      const mockResult = { rows: [], rowCount: 0 };
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("some-token");

      expect(result).toBeNull();
    });

    it("should include expires_at > NOW() filter in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("valid-token-123");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/expires_at\s*>\s*NOW\(\)/i);
    });

    it("should filter by token in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("valid-token-123");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+token\s*=\s*\$1/i);
    });

    it("should pass correct token parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("test-token-456");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "test-token-456",
      ]);
    });

    it("should handle empty string token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("");

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [""]);
    });

    it("should handle very long token string", async () => {
      const longToken = "a".repeat(1000);
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate(longToken);

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        longToken,
      ]);
    });

    it("should handle token with special characters", async () => {
      const specialToken = "token-!@#$%^&*()_+-=";
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate(specialToken);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        specialToken,
      ]);
    });

    it("should handle token with unicode characters", async () => {
      const unicodeToken = "token-你好-🎮";
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate(unicodeToken);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        unicodeToken,
      ]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousToken = "token'; DROP TABLE chat_tokens; --";
      await chatTokenQueries.validate(maliciousToken);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousToken,
      ]);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        chatTokenQueries.validate("valid-token-123")
      ).rejects.toThrow("Connection timeout");
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(
        chatTokenQueries.validate("valid-token-123")
      ).rejects.toThrow("ECONNREFUSED");
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("valid-token-123");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should return complete ChatToken object with all fields", async () => {
      const completeToken: ChatToken = {
        token: "complete-token",
        discord_id: "987654321",
        discord_name: "CompleteUser",
        expires_at: new Date("2025-12-31T23:59:59Z"),
      };

      const mockResult = MockFactory.createMockQueryResult([completeToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("complete-token");

      expect(result).toEqual(completeToken);
      expect(result?.token).toBe("complete-token");
      expect(result?.discord_id).toBe("987654321");
      expect(result?.discord_name).toBe("CompleteUser");
      expect(result?.expires_at).toBeInstanceOf(Date);
    });

    it("should handle token with whitespace", async () => {
      const tokenWithSpaces = "  token-with-spaces  ";
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate(tokenWithSpaces);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        tokenWithSpaces,
      ]);
    });

    it("should verify SQL query uses SELECT *", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("valid-token-123");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SELECT\s+\*\s+FROM\s+chat_tokens/i);
    });

    it("should handle concurrent validation calls", async () => {
      const token1: ChatToken = { ...validToken, token: "token-1" };
      const token2: ChatToken = { ...validToken, token: "token-2" };

      const mockResult1 = MockFactory.createMockQueryResult([token1], 1);
      const mockResult2 = MockFactory.createMockQueryResult([token2], 1);

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const [result1, result2] = await Promise.all([
        chatTokenQueries.validate("token-1"),
        chatTokenQueries.validate("token-2"),
      ]);

      expect(result1?.token).toBe("token-1");
      expect(result2?.token).toBe("token-2");
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should handle token case-sensitivity", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("Token-123");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "Token-123",
      ]);
    });

    it("should handle null-like string token values", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate("null");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ["null"]);
    });

    it("should handle token with newlines", async () => {
      const tokenWithNewlines = "token\nwith\nnewlines";
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await chatTokenQueries.validate(tokenWithNewlines);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        tokenWithNewlines,
      ]);
    });

    it("should handle token that looks like UUID", async () => {
      const uuidToken = "550e8400-e29b-41d4-a716-446655440000";
      const tokenData: ChatToken = { ...validToken, token: uuidToken };
      const mockResult = MockFactory.createMockQueryResult([tokenData], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate(uuidToken);

      expect(result?.token).toBe(uuidToken);
    });

    it("should verify token is used as primary key", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("valid-token-123");

      expect(result?.token).toBe("valid-token-123");
    });

    it("should have exactly 4 fields in ChatToken", async () => {
      const mockResult = MockFactory.createMockQueryResult([validToken], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await chatTokenQueries.validate("valid-token-123");

      expect(Object.keys(result!)).toHaveLength(4);
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("discord_id");
      expect(result).toHaveProperty("discord_name");
      expect(result).toHaveProperty("expires_at");
    });
  });
});
