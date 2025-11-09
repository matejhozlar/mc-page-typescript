import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries/ticket.queries";
import type { Ticket } from "@/types/models/ticket.types";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("TicketQueries - findOpenByDiscordId", () => {
  let mockDb: Pool;
  let ticketQueries: TicketQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    ticketQueries = new TicketQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("findOpenByDiscordId", () => {
    const openTicket: Ticket = {
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

    it("should return ticket when user has an open ticket", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result).toEqual(openTicket);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM tickets"),
        ["123456789"]
      );
    });

    it("should return null when user has no tickets", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("999999999");

      expect(result).toBeNull();
    });

    it("should return null when user only has deleted tickets", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result).toBeNull();
    });

    it("should return null when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result).toBeNull();
    });

    it("should return null when rows[0] is undefined", async () => {
      const mockResult = { rows: [], rowCount: 0 };
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result).toBeNull();
    });

    it("should filter by discord_id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+discord_id\s*=\s*\$1/i);
    });

    it("should exclude deleted tickets in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/status\s*!=\s*'deleted'/i);
    });

    it("should use LIMIT 1 in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/LIMIT\s+1/i);
    });

    it("should pass correct discord_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("987654321");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "987654321",
      ]);
    });

    it("should handle empty string discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("");

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [""]);
    });

    it("should handle ticket with status open", async () => {
      const ticket: Ticket = { ...openTicket, status: "open" };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.status).toBe("open");
    });

    it("should handle ticket with status closed", async () => {
      const ticket: Ticket = { ...openTicket, status: "closed" };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.status).toBe("closed");
    });

    it("should handle ticket with null status", async () => {
      const ticket: Ticket = { ...openTicket, status: null };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.status).toBeNull();
    });

    it("should handle ticket with null created_at", async () => {
      const ticket: Ticket = { ...openTicket, created_at: null };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.created_at).toBeNull();
    });

    it("should handle ticket with null updated_at", async () => {
      const ticket: Ticket = { ...openTicket, updated_at: null };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.updated_at).toBeNull();
    });

    it("should handle ticket with null admin_message_id", async () => {
      const ticket: Ticket = { ...openTicket, admin_message_id: null };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.admin_message_id).toBeNull();
    });

    it("should return complete Ticket object with all fields", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result).toEqual(openTicket);
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
      await ticketQueries.findOpenByDiscordId(maliciousInput);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("$1"), [
        maliciousInput,
      ]);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        ticketQueries.findOpenByDiscordId("123456789")
      ).rejects.toThrow("Connection timeout");
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(
        ticketQueries.findOpenByDiscordId("123456789")
      ).rejects.toThrow("ECONNREFUSED");
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("123456789");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL query uses SELECT *", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("123456789");

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/SELECT\s+\*\s+FROM\s+tickets/i);
    });

    it("should handle concurrent calls for different users", async () => {
      const ticket1: Ticket = { ...openTicket, discord_id: "111111111" };
      const ticket2: Ticket = { ...openTicket, discord_id: "222222222" };

      const mockResult1 = MockFactory.createMockQueryResult([ticket1], 1);
      const mockResult2 = MockFactory.createMockQueryResult([ticket2], 1);

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const [result1, result2] = await Promise.all([
        ticketQueries.findOpenByDiscordId("111111111"),
        ticketQueries.findOpenByDiscordId("222222222"),
      ]);

      expect(result1?.discord_id).toBe("111111111");
      expect(result2?.discord_id).toBe("222222222");
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should handle special characters in discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.findOpenByDiscordId("test@#$%");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "test@#$%",
      ]);
    });

    it("should handle very long discord_id", async () => {
      const longDiscordId = "1".repeat(100);
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId(longDiscordId);

      expect(result).toBeNull();
    });

    it("should return only first ticket when multiple exist (LIMIT 1)", async () => {
      const ticket1: Ticket = { ...openTicket, id: 1 };
      const ticket2: Ticket = { ...openTicket, id: 2 };

      const mockResult = MockFactory.createMockQueryResult([ticket1], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.id).toBe(1);
    });

    it("should handle ticket with large ticket_number", async () => {
      const ticket: Ticket = { ...openTicket, ticket_number: 9999 };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.ticket_number).toBe(9999);
    });

    it("should handle ticket with unicode in mc_name", async () => {
      const ticket: Ticket = { ...openTicket, mc_name: "Player_你好" };
      const mockResult = MockFactory.createMockQueryResult([ticket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

      expect(result?.mc_name).toBe("Player_你好");
    });

    it("should have exactly 9 fields in Ticket", async () => {
      const mockResult = MockFactory.createMockQueryResult([openTicket], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.findOpenByDiscordId("123456789");

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
