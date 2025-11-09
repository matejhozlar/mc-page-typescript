import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { WaitlistQueries } from "@/db/queries/waitlist.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("WaitlistQueries - updateToken", () => {
  let mockDb: Pool;
  let waitlistQueries: WaitlistQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    waitlistQueries = new WaitlistQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("updateToken", () => {
    it("should update token successfully", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE waitlist_emails"),
        [1, "abc123xyz"]
      );
    });

    it("should log success message after updating token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      expect(logger.info).toHaveBeenCalledWith(
        "Token updated for entry ID:",
        1
      );
    });

    it("should set token in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SET\s+token\s*=\s*\$2/i);
    });

    it("should filter by id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+id\s*=\s*\$1/i);
    });

    it("should pass parameters in correct order", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(42, "token-xyz");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        42,
        "token-xyz",
      ]);
    });

    it("should throw error when waitlist entry not found (rowCount = 0)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.updateToken(999, "abc123xyz")
      ).rejects.toThrow("Failed to update token for waitlist entry");
    });

    it("should throw error when rowCount is null", async () => {
      const mockResult = MockFactory.createMockQueryResult([], null);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(waitlistQueries.updateToken(1, "abc123xyz")).rejects.toThrow(
        "Failed to update token for waitlist entry"
      );
    });

    it("should not log success when entry not found", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.updateToken(999, "abc123xyz")
      ).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should not log success when database error occurs", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        waitlistQueries.updateToken(1, "abc123xyz")
      ).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should handle id = 0", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(0, "abc123xyz");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        0,
        "abc123xyz",
      ]);
    });

    it("should handle negative id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.updateToken(-1, "abc123xyz")
      ).rejects.toThrow("Failed to update token for waitlist entry");
    });

    it("should handle very large id", async () => {
      const largeId = 2147483647;
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(largeId, "abc123xyz");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        largeId,
        "abc123xyz",
      ]);
    });

    it("should handle empty string token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [1, ""]);
    });

    it("should handle very long token string", async () => {
      const longToken = "a".repeat(500);
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, longToken);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        longToken,
      ]);
    });

    it("should handle UUID-formatted token", async () => {
      const uuidToken = "550e8400-e29b-41d4-a716-446655440000";
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, uuidToken);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        uuidToken,
      ]);
    });

    it("should handle token with special characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "token-!@#$%^&*()");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "token-!@#$%^&*()",
      ]);
    });

    it("should handle token with unicode characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "token-你好-🎮");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "token-你好-🎮",
      ]);
    });

    it("should handle whitespace in token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "  token-123  ");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "  token-123  ",
      ]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousToken = "abc'; DROP TABLE waitlist_emails; --";
      await waitlistQueries.updateToken(1, maliciousToken);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$2"), [
        1,
        maliciousToken,
      ]);
    });

    it("should throw error when database update fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(waitlistQueries.updateToken(1, "abc123xyz")).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(waitlistQueries.updateToken(1, "abc123xyz")).rejects.toThrow(
        "ECONNREFUSED"
      );
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL uses UPDATE statement", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/UPDATE\s+waitlist_emails/i);
    });

    it("should handle concurrent updates for different entries", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await Promise.all([
        waitlistQueries.updateToken(1, "token-1"),
        waitlistQueries.updateToken(2, "token-2"),
      ]);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it("should handle updating same entry multiple times", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "first-token");
      await waitlistQueries.updateToken(1, "second-token");

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        "Token updated for entry ID:",
        1
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it("should succeed when rowCount is greater than 1 (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 2);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.updateToken(1, "abc123xyz")
      ).resolves.not.toThrow();

      expect(logger.info).toHaveBeenCalled();
    });

    it("should handle null-like string token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "null");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "null",
      ]);
    });

    it("should verify parameters use $1 and $2", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toContain("$1");
      expect(callArgs[0]).toContain("$2");
      expect(callArgs[0]).not.toContain("$3");
      expect(callArgs[1]).toHaveLength(2);
    });

    it("should log with correct entry ID", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(42, "abc123xyz");

      expect(logger.info).toHaveBeenCalledWith(
        "Token updated for entry ID:",
        42
      );
    });

    it("should handle token with newlines", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "token\nwith\nnewlines");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "token\nwith\nnewlines",
      ]);
    });

    it("should handle alphanumeric token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123XYZ789");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "abc123XYZ789",
      ]);
    });

    it("should handle base64-encoded token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const base64Token = "YWJjMTIzWFlaNzg5";
      await waitlistQueries.updateToken(1, base64Token);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        base64Token,
      ]);
    });

    it("should update waitlist_emails table", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.updateToken(1, "abc123xyz");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/waitlist_emails/i);
    });
  });
});
