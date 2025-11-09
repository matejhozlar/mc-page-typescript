import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { TicketQueries } from "@/db/queries/ticket.queries";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("TicketQueries - getNext", () => {
  let mockDb: Pool;
  let ticketQueries: TicketQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    ticketQueries = new TicketQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("getNext", () => {
    it("should return incremented ticket number", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 1235 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(1235);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE ticket_counter"),
        []
      );
    });

    it("should return first ticket number (1) when counter starts at 0", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 1 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(1);
    });

    it("should return large ticket number", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 99999 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(99999);
    });

    it("should throw error when ticket_counter row not found (rowCount = 0)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.getNext()).rejects.toThrow(
        "Failed to get next ticket number"
      );
    });

    it("should throw error when rowCount is null", async () => {
      const mockResult = MockFactory.createMockQueryResult([], null);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.getNext()).rejects.toThrow(
        "Failed to get next ticket number"
      );
    });

    it("should throw error when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(ticketQueries.getNext()).rejects.toThrow();
    });

    it("should use atomic UPDATE with RETURNING", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/UPDATE\s+ticket_counter/i);
      expect(callArgs[0]).toMatch(
        /SET\s+last_number\s*=\s*last_number\s*\+\s*1/i
      );
      expect(callArgs[0]).toMatch(/RETURNING\s+last_number/i);
    });

    it("should filter by id = 1 in query", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+id\s*=\s*1/i);
    });

    it("should pass empty parameters array", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), []);
    });

    it("should return number type not string", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 42 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(typeof result).toBe("number");
      expect(result).toBe(42);
    });

    it("should throw error when database update fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(ticketQueries.getNext()).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should throw error when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(ticketQueries.getNext()).rejects.toThrow("ECONNREFUSED");
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent calls atomically", async () => {
      const mockResult1 = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      const mockResult2 = MockFactory.createMockQueryResult(
        [{ last_number: 101 }],
        1
      );
      const mockResult3 = MockFactory.createMockQueryResult(
        [{ last_number: 102 }],
        1
      );

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2)
        .mockResolvedValueOnce(mockResult3);

      const [result1, result2, result3] = await Promise.all([
        ticketQueries.getNext(),
        ticketQueries.getNext(),
        ticketQueries.getNext(),
      ]);

      expect(result1).toBe(100);
      expect(result2).toBe(101);
      expect(result3).toBe(102);
      expect(mockDb.query).toHaveBeenCalledTimes(3);
    });

    it("should increment sequentially when called multiple times", async () => {
      const mockResult1 = MockFactory.createMockQueryResult(
        [{ last_number: 50 }],
        1
      );
      const mockResult2 = MockFactory.createMockQueryResult(
        [{ last_number: 51 }],
        1
      );

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const first = await ticketQueries.getNext();
      const second = await ticketQueries.getNext();

      expect(first).toBe(50);
      expect(second).toBe(51);
    });

    it("should handle last_number as different number types", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: "1234" as any }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe("1234" as any);
    });

    it("should verify no SQL injection possible (no parameters)", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[1]).toEqual([]);
    });

    it("should handle zero as ticket number", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 0 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(0);
    });

    it("should handle negative ticket number (edge case)", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: -1 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(-1);
    });

    it("should verify UPDATE increments by 1", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/last_number\s*\+\s*1/i);
      expect(callArgs[0]).not.toMatch(/last_number\s*\+\s*2/i);
    });

    it("should use single WHERE clause (id = 1 only)", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 100 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await ticketQueries.getNext();

      const callArgs = (mockDb.query as any).mock.calls[0];
      const whereMatches = callArgs[0].match(/WHERE/gi);
      expect(whereMatches).toHaveLength(1);
    });

    it("should return value from RETURNING clause", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: 777 }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(777);
    });

    it("should handle very large ticket numbers (boundary test)", async () => {
      const largeNumber = 2147483647;
      const mockResult = MockFactory.createMockQueryResult(
        [{ last_number: largeNumber }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await ticketQueries.getNext();

      expect(result).toBe(largeNumber);
    });
  });
});
