import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries/ticket.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("TicketQueries - markAsDeleted", () => {
  let mockDb: Pool;
  let ticketQueries: TicketQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    ticketQueries = new TicketQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("markAsDeleted", () => {
    it("should mark ticket as deleted successfully", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tickets"),
        ["987654321"]
      );
    });

    it("should log success message after marking as deleted", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      expect(logger.info).toHaveBeenCalledWith(
        "Ticket marked as deleted:",
        "987654321"
      );
    });

    it("should set status to 'deleted' in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SET\s+status\s*=\s*'deleted'/i);
    });

    it("should set updated_at to NOW() in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/updated_at\s*=\s*NOW\(\)/i);
    });

    it("should filter by channel_id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+channel_id\s*=\s*\$1/i);
    });

    it("should throw error when ticket not found (rowCount = 0)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.markAsDeleted("999999999")).rejects.toThrow(
        "Ticket not found with channel_id: 999999999"
      );
    });

    it("should throw error when rowCount is null", async () => {
      const mockResult = MockFactory.createMockQueryResult([], null);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.markAsDeleted("987654321")).rejects.toThrow(
        "Ticket not found with channel_id: 987654321"
      );
    });

    it("should not log success when ticket not found", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.markAsDeleted("999999999")).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should not log success when database error occurs", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(ticketQueries.markAsDeleted("987654321")).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should pass correct channel_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("123456789");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
      ]);
    });

    it("should handle empty string channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.markAsDeleted("")).rejects.toThrow(
        "Ticket not found with channel_id: "
      );
    });

    it("should handle very long channel_id", async () => {
      const longChannelId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted(longChannelId);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        longChannelId,
      ]);
    });

    it("should handle special characters in channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("chan-!@#$%");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "chan-!@#$%",
      ]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousInput = "123'; DROP TABLE tickets; --";
      await ticketQueries.markAsDeleted(maliciousInput);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousInput,
      ]);
    });

    it("should throw error when database update fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(ticketQueries.markAsDeleted("987654321")).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(ticketQueries.markAsDeleted("987654321")).rejects.toThrow(
        "ECONNREFUSED"
      );
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL uses UPDATE statement", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/UPDATE\s+tickets/i);
    });

    it("should update both status and updated_at fields", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/status\s*=\s*'deleted'/i);
      expect(callArgs[0]).toMatch(/updated_at\s*=\s*NOW\(\)/i);
    });

    it("should handle concurrent deletions for different tickets", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await Promise.all([
        ticketQueries.markAsDeleted("channel-1"),
        ticketQueries.markAsDeleted("channel-2"),
      ]);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it("should handle marking same ticket as deleted multiple times", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      await ticketQueries.markAsDeleted("987654321");

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it("should include channel_id in error message", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.markAsDeleted("specific-channel-123")
      ).rejects.toThrow("specific-channel-123");
    });

    it("should handle whitespace in channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("  987654321  ");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "  987654321  ",
      ]);
    });

    it("should handle unicode characters in channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("chan-你好-🎮");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "chan-你好-🎮",
      ]);
    });

    it("should succeed when rowCount is greater than 1 (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 2);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.markAsDeleted("987654321")
      ).resolves.not.toThrow();

      expect(logger.info).toHaveBeenCalled();
    });

    it("should handle null-like string channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("null");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ["null"]);
    });

    it("should use single SET clause with comma separation", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      const setMatches = callArgs[0].match(/SET/gi);
      expect(setMatches).toHaveLength(1);
    });

    it("should use NOW() function for updated_at timestamp", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/NOW\(\)/i);
      expect(callArgs[1]).toHaveLength(1);
    });

    it("should handle ticket with any existing status", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).not.toMatch(/WHERE.*status/i);
    });

    it("should verify only one parameter ($1 for channel_id)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.markAsDeleted("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toContain("$1");
      expect(callArgs[0]).not.toContain("$2");
      expect(callArgs[1]).toHaveLength(1);
    });
  });
});
