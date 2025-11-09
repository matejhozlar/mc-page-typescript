import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries/ticket.queries";
import type { TicketCreateParams } from "@/types/models/ticket.types";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("TicketQueries - create", () => {
  let mockDb: Pool;
  let ticketQueries: TicketQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    ticketQueries = new TicketQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("create", () => {
    const validParams: TicketCreateParams = {
      ticket_number: 1234,
      discord_id: "123456789",
      mc_name: "TestPlayer",
      channel_id: "987654321",
    };

    it("should insert ticket successfully", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.create(validParams);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO tickets"),
        [1234, "123456789", "TestPlayer", "987654321"]
      );
    });

    it("should use correct column names in INSERT", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.create(validParams);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/ticket_number/i);
      expect(callArgs[0]).toMatch(/discord_id/i);
      expect(callArgs[0]).toMatch(/mc_name/i);
      expect(callArgs[0]).toMatch(/channel_id/i);
    });

    it("should pass parameters in correct order", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ticket_number: 5678,
        discord_id: "111222333",
        mc_name: "Player2",
        channel_id: "444555666",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        5678,
        "111222333",
        "Player2",
        "444555666",
      ]);
    });

    it("should handle ticket_number 1", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        ticket_number: 1,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([1])
      );
    });

    it("should handle large ticket_number", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        ticket_number: 99999,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([99999])
      );
    });

    it("should handle zero ticket_number (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        ticket_number: 0,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([0])
      );
    });

    it("should handle mc_name with special characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        mc_name: "Player_123",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["Player_123"])
      );
    });

    it("should handle mc_name with unicode characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        mc_name: "Player_你好",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["Player_你好"])
      );
    });

    it("should handle empty string discord_id (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        discord_id: "",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([""])
      );
    });

    it("should handle empty string mc_name (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        mc_name: "",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([""])
      );
    });

    it("should handle empty string channel_id (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        channel_id: "",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([""])
      );
    });

    it("should handle very long discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const longId = "1".repeat(100);
      const params: TicketCreateParams = {
        ...validParams,
        discord_id: longId,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([longId])
      );
    });

    it("should handle very long mc_name", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const longName = "A".repeat(100);
      const params: TicketCreateParams = {
        ...validParams,
        mc_name: longName,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([longName])
      );
    });

    it("should handle very long channel_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const longChannel = "9".repeat(100);
      const params: TicketCreateParams = {
        ...validParams,
        channel_id: longChannel,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([longChannel])
      );
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ticket_number: 1234,
        discord_id: "123'; DROP TABLE tickets; --",
        mc_name: "Player'; DELETE FROM tickets; --",
        channel_id: "999'; TRUNCATE tickets; --",
      };

      await ticketQueries.create(params);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toContain("$1");
      expect(callArgs[0]).toContain("$2");
      expect(callArgs[0]).toContain("$3");
      expect(callArgs[0]).toContain("$4");
    });

    it("should throw error when database insert fails", async () => {
      const dbError = new Error("Unique constraint violation");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(ticketQueries.create(validParams)).rejects.toThrow(
        "Unique constraint violation"
      );
    });

    it("should throw error on duplicate ticket_number", async () => {
      const duplicateError = new Error(
        "duplicate key value violates unique constraint"
      );
      (mockDb.query as any).mockRejectedValue(duplicateError);

      await expect(ticketQueries.create(validParams)).rejects.toThrow(
        "duplicate key value"
      );
    });

    it("should throw error on duplicate channel_id", async () => {
      const duplicateError = new Error(
        "duplicate key value violates unique constraint"
      );
      (mockDb.query as any).mockRejectedValue(duplicateError);

      await expect(ticketQueries.create(validParams)).rejects.toThrow(
        "duplicate key value"
      );
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(ticketQueries.create(validParams)).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should throw error when connection refused", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(ticketQueries.create(validParams)).rejects.toThrow(
        "ECONNREFUSED"
      );
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.create(validParams);

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL uses INSERT statement", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.create(validParams);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/INSERT\s+INTO\s+tickets/i);
    });

    it("should verify SQL uses VALUES clause", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.create(validParams);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/VALUES\s*\(\$1,\s*\$2,\s*\$3,\s*\$4\)/i);
    });

    it("should handle concurrent ticket creations", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params1: TicketCreateParams = {
        ticket_number: 1,
        discord_id: "111111111",
        mc_name: "Player1",
        channel_id: "111111111",
      };

      const params2: TicketCreateParams = {
        ticket_number: 2,
        discord_id: "222222222",
        mc_name: "Player2",
        channel_id: "222222222",
      };

      await Promise.all([
        ticketQueries.create(params1),
        ticketQueries.create(params2),
      ]);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should handle whitespace in string fields", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ticket_number: 1234,
        discord_id: "  123456789  ",
        mc_name: "  TestPlayer  ",
        channel_id: "  987654321  ",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1234,
        "  123456789  ",
        "  TestPlayer  ",
        "  987654321  ",
      ]);
    });

    it("should handle special characters in all string fields", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ticket_number: 1234,
        discord_id: "id-!@#$%",
        mc_name: "Player-!@#$%",
        channel_id: "chan-!@#$%",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1234,
        "id-!@#$%",
        "Player-!@#$%",
        "chan-!@#$%",
      ]);
    });

    it("should handle null-like string values", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ticket_number: 1234,
        discord_id: "null",
        mc_name: "undefined",
        channel_id: "null",
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1234,
        "null",
        "undefined",
        "null",
      ]);
    });

    it("should handle negative ticket_number (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: TicketCreateParams = {
        ...validParams,
        ticket_number: -1,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([-1])
      );
    });

    it("should handle maximum 32-bit integer ticket_number", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const maxInt = 2147483647;
      const params: TicketCreateParams = {
        ...validParams,
        ticket_number: maxInt,
      };

      await ticketQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([maxInt])
      );
    });
  });
});
