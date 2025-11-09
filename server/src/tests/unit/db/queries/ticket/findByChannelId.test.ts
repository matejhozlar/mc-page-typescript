import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries/ticket.queries";
import type { Ticket } from "@/types/models/ticket.types";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("TicketQueries - findByChannelId", () => {
  let mockDb: Pool;
  let ticketQueries: TicketQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    ticketQueries = new TicketQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("findByChannelId", () => {
    const ticket: Ticket = {
      id: 1,
      ticket_number: 1234,
      discord_id: "123456789",
      mc_name: "TestPlayer",
      channel_id: "987654321",
      status: "open",
      created_at: new Date("2025-01-01T00:00:00Z"),
      updated_at: new Date("2025-01-02T00:00:00Z"),
      admin_message_id: "111222333",
    };

    it("should return ticket when channel_id exists", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result).toEqual(ticket);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM tickets"),
        ["987654321"]
      );
    });

    it("should return null when channel_id does not exist", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("999999999");

      expect(result).toBeNull();
    });

    it("should return null when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result).toBeNull();
    });

    it("should return null when rows[0] is undefined", async () => {
      const mockResult = { rows: [], rowCount: 0 };
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result).toBeNull();
    });

    it("should filter by channel_id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+channel_id\s*=\s*\$1/i);
    });

    it("should use LIMIT 1 in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/LIMIT\s+1/i);
    });

    it("should pass correct channel_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId("111222333");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "111222333",
      ]);
    });

    it("should handle empty string channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("");

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [""]);
    });

    it("should return ticket with status open", async () => {
      const openTicket: Ticket = { ...ticket, status: "open" };
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.status).toBe("open");
    });

    it("should return ticket with status closed", async () => {
      const closedTicket: Ticket = { ...ticket, status: "closed" };
      const mockResult = MockFactory.createMockQueryResult([closedTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.status).toBe("closed");
    });

    it("should return ticket with status deleted", async () => {
      const deletedTicket: Ticket = { ...ticket, status: "deleted" };
      const mockResult = MockFactory.createMockQueryResult([deletedTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.status).toBe("deleted");
    });

    it("should return ticket with null status", async () => {
      const nullStatusTicket: Ticket = { ...ticket, status: null };
      const mockResult = MockFactory.createMockQueryResult(
        [nullStatusTicket],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.status).toBeNull();
    });

    it("should return ticket with null created_at", async () => {
      const nullCreatedTicket: Ticket = { ...ticket, created_at: null };
      const mockResult = MockFactory.createMockQueryResult(
        [nullCreatedTicket],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.created_at).toBeNull();
    });

    it("should return ticket with null updated_at", async () => {
      const nullUpdatedTicket: Ticket = { ...ticket, updated_at: null };
      const mockResult = MockFactory.createMockQueryResult(
        [nullUpdatedTicket],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.updated_at).toBeNull();
    });

    it("should return ticket with null admin_message_id", async () => {
      const nullAdminMsgTicket: Ticket = { ...ticket, admin_message_id: null };
      const mockResult = MockFactory.createMockQueryResult(
        [nullAdminMsgTicket],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.admin_message_id).toBeNull();
    });

    it("should return complete Ticket object with all fields", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result).toEqual(ticket);
      expect(result?.id).toBe(1);
      expect(result?.ticket_number).toBe(1234);
      expect(result?.discord_id).toBe("123456789");
      expect(result?.mc_name).toBe("TestPlayer");
      expect(result?.channel_id).toBe("987654321");
      expect(result?.status).toBe("open");
      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
      expect(result?.admin_message_id).toBe("111222333");
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maliciousInput = "123'; DROP TABLE tickets; --";
      await ticketQueries.findByChannelId(maliciousInput);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousInput,
      ]);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(ticketQueries.findByChannelId("987654321")).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(ticketQueries.findByChannelId("987654321")).rejects.toThrow(
        "ECONNREFUSED"
      );
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId("987654321");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL query uses SELECT *", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId("987654321");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SELECT\s+\*\s+FROM\s+tickets/i);
    });

    it("should handle concurrent calls for different channels", async () => {
      const ticket1: Ticket = { ...ticket, channel_id: "111111111" };
      const ticket2: Ticket = { ...ticket, channel_id: "222222222" };

      const mockResult1 = MockFactory.createMockQueryResult([ticket1], 1);
      const mockResult2 = MockFactory.createMockQueryResult([ticket2], 1);

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const [result1, result2] = await Promise.all([
        ticketQueries.findByChannelId("111111111"),
        ticketQueries.findByChannelId("222222222"),
      ]);

      expect(result1?.channel_id).toBe("111111111");
      expect(result2?.channel_id).toBe("222222222");
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should handle special characters in channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId("test@#$%");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "test@#$%",
      ]);
    });

    it("should handle very long channel_id", async () => {
      const longChannelId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId(longChannelId);

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        longChannelId,
      ]);
    });

    it("should return only first ticket when multiple exist (LIMIT 1)", async () => {
      const ticket1: Ticket = { ...ticket, id: 1 };
      const mockResult = MockFactory.createMockQueryResult([ticket1], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.id).toBe(1);
    });

    it("should handle ticket with large ticket_number", async () => {
      const largeNumberTicket: Ticket = { ...ticket, ticket_number: 9999 };
      const mockResult = MockFactory.createMockQueryResult(
        [largeNumberTicket],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.ticket_number).toBe(9999);
    });

    it("should handle ticket with unicode in mc_name", async () => {
      const unicodeTicket: Ticket = { ...ticket, mc_name: "Player_你好" };
      const mockResult = MockFactory.createMockQueryResult([unicodeTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.mc_name).toBe("Player_你好");
    });

    it("should handle whitespace in channel_id", async () => {
      const channelWithSpaces = "  987654321  ";
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findByChannelId(channelWithSpaces);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        channelWithSpaces,
      ]);
    });

    it("should find ticket regardless of status (no status filter)", async () => {
      const deletedTicket: Ticket = { ...ticket, status: "deleted" };
      const mockResult = MockFactory.createMockQueryResult([deletedTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(result?.status).toBe("deleted");
    });

    it("should have exactly 9 fields in Ticket", async () => {
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findByChannelId("987654321");

      expect(Object.keys(result!)).toHaveLength(9);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("ticket_number");
      expect(result).toHaveProperty("discord_id");
      expect(result).toHaveProperty("mc_name");
      expect(result).toHaveProperty("channel_id");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
      expect(result).toHaveProperty("admin_message_id");
    });
  });
});
