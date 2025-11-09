import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries/ticket.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("TicketQueries - updateAdminPanelId", () => {
  let mockDb: Pool;
  let ticketQueries: TicketQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    ticketQueries = new TicketQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("updateAdminPanelId", () => {
    it("should update admin_message_id successfully", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "111222333");

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tickets"),
        ["111222333", "987654321"]
      );
    });

    it("should log success message after update", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "111222333");

      expect(logger.info).toHaveBeenCalledWith(
        "Admin panel message ID updated for ticket channel:",
        "987654321"
      );
    });

    it("should throw error when ticket not found (rowCount = 0)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.updateAdminPanelId("999999999", "111222333")
      ).rejects.toThrow(
        "Failed to update admin panel message ID for ticket with channel_id: 999999999"
      );
    });

    it("should throw error when rowCount is null", async () => {
      const mockResult = MockFactory.createMockQueryResult([], null);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.updateAdminPanelId("987654321", "111222333")
      ).rejects.toThrow("Failed to update admin panel message ID");
    });

    it("should not log success when update fails", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.updateAdminPanelId("987654321", "111222333")
      ).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should set admin_message_id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "111222333");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SET\s+admin_message_id\s*=\s*\$1/i);
    });

    it("should filter by channel_id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "111222333");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+channel_id\s*=\s*\$2/i);
    });

    it("should pass parameters in correct order", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("channel-123", "message-456");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "message-456",
        "channel-123",
      ]);
    });

    it("should handle empty string admin_message_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "",
        "987654321",
      ]);
    });

    it("should handle empty string channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.updateAdminPanelId("", "111222333")
      ).rejects.toThrow("Failed to update admin panel message ID");
    });

    it("should handle very long admin_message_id", async () => {
      const longMessageId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", longMessageId);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        longMessageId,
        "987654321",
      ]);
    });

    it("should handle very long channel_id", async () => {
      const longChannelId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId(longChannelId, "111222333");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "111222333",
        longChannelId,
      ]);
    });

    it("should handle special characters in admin_message_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "msg-!@#$%");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "msg-!@#$%",
        "987654321",
      ]);
    });

    it("should handle special characters in channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("chan-!@#$%", "111222333");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "111222333",
        "chan-!@#$%",
      ]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousChannel = "123'; DROP TABLE tickets; --";
      const maliciousMessage = "456'; DELETE FROM tickets; --";

      await ticketQueries.updateAdminPanelId(
        maliciousChannel,
        maliciousMessage
      );

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousMessage,
        maliciousChannel,
      ]);
    });

    it("should throw error when database update fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        ticketQueries.updateAdminPanelId("987654321", "111222333")
      ).rejects.toThrow("Connection timeout");
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(
        ticketQueries.updateAdminPanelId("987654321", "111222333")
      ).rejects.toThrow("ECONNREFUSED");
    });

    it("should not log when database error occurs", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        ticketQueries.updateAdminPanelId("987654321", "111222333")
      ).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "111222333");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL query is UPDATE statement", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "111222333");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/UPDATE\s+tickets/i);
    });

    it("should handle concurrent updates for different tickets", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await Promise.all([
        ticketQueries.updateAdminPanelId("channel-1", "message-1"),
        ticketQueries.updateAdminPanelId("channel-2", "message-2"),
      ]);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it("should handle updating same ticket multiple times", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "message-1");
      await ticketQueries.updateAdminPanelId("987654321", "message-2");

      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should include channel_id in error message", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.updateAdminPanelId("specific-channel-123", "111222333")
      ).rejects.toThrow("specific-channel-123");
    });

    it("should handle whitespace in admin_message_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "  message-123  ");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "  message-123  ",
        "987654321",
      ]);
    });

    it("should handle whitespace in channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("  channel-123  ", "111222333");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "111222333",
        "  channel-123  ",
      ]);
    });

    it("should handle unicode characters in admin_message_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("987654321", "msg-你好-🎮");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "msg-你好-🎮",
        "987654321",
      ]);
    });

    it("should succeed when rowCount is greater than 1 (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 2);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        ticketQueries.updateAdminPanelId("987654321", "111222333")
      ).resolves.not.toThrow();

      expect(logger.info).toHaveBeenCalled();
    });

    it("should handle null-like string values", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.updateAdminPanelId("null", "undefined");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "undefined",
        "null",
      ]);
    });
  });
});
