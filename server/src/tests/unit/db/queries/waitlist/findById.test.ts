import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { WaitlistQueries } from "@/db/queries/waitlist.queries";
import type { Waitlist } from "@/types/models/waitlist.types";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("WaitlistQueries - findById", () => {
  let mockDb: Pool;
  let waitlistQueries: WaitlistQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    waitlistQueries = new WaitlistQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("findById", () => {
    const waitlistEntry: Waitlist = {
      id: 1,
      email: "test@example.com",
      submitted_at: new Date("2025-01-01T00:00:00Z"),
      token: "abc123xyz",
      discord_name: "TestUser",
    };

    it("should return waitlist entry when id exists", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result).toEqual(waitlistEntry);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT id, email, submitted_at, token, discord_name"
        ),
        [1]
      );
    });

    it("should return null when id does not exist", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(999);

      expect(result).toBeNull();
    });

    it("should return null when rows array is empty", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result).toBeNull();
    });

    it("should return null when rows[0] is undefined", async () => {
      const mockResult = { rows: [], rowCount: 0 };
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result).toBeNull();
    });

    it("should filter by id in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(1);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE\s+id\s*=\s*\$1/i);
    });

    it("should use LIMIT 1 in query", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(1);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/LIMIT\s+1/i);
    });

    it("should pass correct id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(42);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [42]);
    });

    it("should handle id = 0", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(0);

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [0]);
    });

    it("should handle negative id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(-1);

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [-1]);
    });

    it("should handle very large id", async () => {
      const largeId = 2147483647;
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(largeId);

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [largeId]);
    });

    it("should handle waitlist entry with null submitted_at", async () => {
      const entry: Waitlist = { ...waitlistEntry, submitted_at: null };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.submitted_at).toBeNull();
    });

    it("should handle waitlist entry with null token", async () => {
      const entry: Waitlist = { ...waitlistEntry, token: null };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.token).toBeNull();
    });

    it("should handle waitlist entry with null discord_name", async () => {
      const entry: Waitlist = { ...waitlistEntry, discord_name: null };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.discord_name).toBeNull();
    });

    it("should return complete Waitlist object with all fields", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result).toEqual(waitlistEntry);
      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
      expect(result?.submitted_at).toBeInstanceOf(Date);
      expect(result?.token).toBe("abc123xyz");
      expect(result?.discord_name).toBe("TestUser");
    });

    it("should log error and rethrow when database query fails", async () => {
      const dbError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(waitlistQueries.findById(1)).rejects.toThrow(
        "Connection timeout"
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to find waitlist entry by ID:",
        dbError
      );
    });

    it("should log error and rethrow when database connection is lost", async () => {
      const connectionError = new Error("ECONNREFUSED");
      (mockDb.query as any).mockRejectedValue(connectionError);

      await expect(waitlistQueries.findById(1)).rejects.toThrow("ECONNREFUSED");

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to find waitlist entry by ID:",
        connectionError
      );
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(1);

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL uses SELECT statement with all columns", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(1);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(
        /SELECT\s+id,\s*email,\s*submitted_at,\s*token,\s*discord_name/i
      );
    });

    it("should query from waitlist_emails table", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(1);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/FROM\s+waitlist_emails/i);
    });

    it("should handle concurrent calls for different ids", async () => {
      const entry1: Waitlist = { ...waitlistEntry, id: 1 };
      const entry2: Waitlist = { ...waitlistEntry, id: 2 };

      const mockResult1 = MockFactory.createMockQueryResult([entry1], 1);
      const mockResult2 = MockFactory.createMockQueryResult([entry2], 1);

      (mockDb.query as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const [result1, result2] = await Promise.all([
        waitlistQueries.findById(1),
        waitlistQueries.findById(2),
      ]);

      expect(result1?.id).toBe(1);
      expect(result2?.id).toBe(2);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should handle email with special characters", async () => {
      const entry: Waitlist = {
        ...waitlistEntry,
        email: "user+test@example.com",
      };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.email).toBe("user+test@example.com");
    });

    it("should handle discord_name with unicode characters", async () => {
      const entry: Waitlist = {
        ...waitlistEntry,
        discord_name: "User_你好",
      };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.discord_name).toBe("User_你好");
    });

    it("should handle long token string", async () => {
      const longToken = "a".repeat(500);
      const entry: Waitlist = {
        ...waitlistEntry,
        token: longToken,
      };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.token).toBe(longToken);
    });

    it("should use parameterized query (single parameter)", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.findById(1);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toContain("$1");
      expect(callArgs[0]).not.toContain("$2");
      expect(callArgs[1]).toHaveLength(1);
    });

    it("should have exactly 5 fields in Waitlist", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(Object.keys(result!)).toHaveLength(5);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("submitted_at");
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("discord_name");
    });

    it("should handle Date type for submitted_at", async () => {
      const mockResult = MockFactory.createMockQueryResult([waitlistEntry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.submitted_at).toBeInstanceOf(Date);
    });

    it("should return only first entry when multiple exist (LIMIT 1)", async () => {
      const entry1: Waitlist = { ...waitlistEntry, id: 1 };
      const mockResult = MockFactory.createMockQueryResult([entry1], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.id).toBe(1);
    });

    it("should not log error when entry not found (normal case)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(999);

      expect(result).toBeNull();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should handle waitlist entry with all nullable fields null", async () => {
      const entry: Waitlist = {
        id: 1,
        email: "test@example.com",
        submitted_at: null,
        token: null,
        discord_name: null,
      };
      const mockResult = MockFactory.createMockQueryResult([entry], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.findById(1);

      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
      expect(result?.submitted_at).toBeNull();
      expect(result?.token).toBeNull();
      expect(result?.discord_name).toBeNull();
    });
  });
});
