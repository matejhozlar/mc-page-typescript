import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { WaitlistQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";
import type { Waitlist } from "@/types/models/waitlist.types";

describe("WaitlistQueries - find Test", () => {
  let mockDb: Pool;
  let waitlistQueries: WaitlistQueries;
  let mockWaitlist: Waitlist;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    waitlistQueries = new WaitlistQueries(mockDb);

    mockWaitlist = {
      id: 1,
      email: "test@example.com",
      submitted_at: new Date("2025-11-10T12:00:00Z"),
      token: "abc123token",
      discord_name: "TestUser#1234",
    };
  });

  describe("find by id", () => {
    it("should return waitlist entry when found by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ id: 1 });

      expect(result).toEqual(mockWaitlist);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE id = $1 LIMIT 1",
        [1]
      );
    });

    it("should return null when waitlist entry not found by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ id: 999 });

      expect(result).toBeNull();
    });

    it("should handle id of 0", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ id: 0 });

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE id = $1 LIMIT 1",
        [0]
      );
    });
  });

  describe("find by email", () => {
    it("should return waitlist entry when found by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ email: "test@example.com" });

      expect(result).toEqual(mockWaitlist);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE email = $1 LIMIT 1",
        ["test@example.com"]
      );
    });

    it("should return null when waitlist entry not found by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({
        email: "nonexistent@example.com",
      });

      expect(result).toBeNull();
    });

    it("should handle email with special characters", async () => {
      const specialEmail = "test+special@example.co.uk";
      const mockResult = MockFactory.createMockQueryResult([
        { ...mockWaitlist, email: specialEmail },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ email: specialEmail });

      expect(result?.email).toBe(specialEmail);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE email = $1 LIMIT 1",
        [specialEmail]
      );
    });
  });

  describe("find by token", () => {
    it("should return waitlist entry when found by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ token: "abc123token" });

      expect(result).toEqual(mockWaitlist);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE token = $1 LIMIT 1",
        ["abc123token"]
      );
    });

    it("should return null when waitlist entry not found by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ token: "invalidtoken" });

      expect(result).toBeNull();
    });
  });

  describe("find by discordName", () => {
    it("should return waitlist entry when found by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({
        discordName: "TestUser#1234",
      });

      expect(result).toEqual(mockWaitlist);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE discord_name = $1 LIMIT 1",
        ["TestUser#1234"]
      );
    });

    it("should return null when waitlist entry not found by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({
        discordName: "NonExistent#0000",
      });

      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle waitlist entry with null fields correctly", async () => {
      const waitlistWithNulls: Waitlist = {
        id: 2,
        email: "minimal@example.com",
        submitted_at: null,
        token: null,
        discord_name: null,
      };
      const mockResult = MockFactory.createMockQueryResult([waitlistWithNulls]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ id: 2 });

      expect(result).toEqual(waitlistWithNulls);
      expect(result?.submitted_at).toBeNull();
      expect(result?.token).toBeNull();
      expect(result?.discord_name).toBeNull();
    });

    it("should throw error for invalid search criteria", async () => {
      await expect(waitlistQueries.find({} as any)).rejects.toThrow(
        "Invalid search criteria"
      );
    });

    it("should handle empty string email", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ email: "" });

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE email = $1 LIMIT 1",
        [""]
      );
    });

    it("should handle empty string token", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.find({ token: "" });

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE token = $1 LIMIT 1",
        [""]
      );
    });
  });

  describe("error handling", () => {
    it("should log and rethrow error when query fails", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(waitlistQueries.find({ id: 1 })).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to find waitlist:",
        dbError
      );
    });

    it("should handle query timeout error", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(
        waitlistQueries.find({ email: "test@example.com" })
      ).rejects.toThrow(timeoutError);
    });

    it("should handle syntax error in query", async () => {
      const syntaxError = new Error("Syntax error in SQL query");
      (mockDb.query as any).mockRejectedValue(syntaxError);

      await expect(waitlistQueries.find({ token: "abc123" })).rejects.toThrow(
        syntaxError
      );
    });
  });

  describe("query construction", () => {
    it("should use correct SQL and parameters for id search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.find({ id: 42 });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE id = $1 LIMIT 1",
        [42]
      );
    });

    it("should use correct SQL and parameters for email search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.find({ email: "search@example.com" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE email = $1 LIMIT 1",
        ["search@example.com"]
      );
    });

    it("should use correct SQL and parameters for token search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.find({ token: "searchtoken" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE token = $1 LIMIT 1",
        ["searchtoken"]
      );
    });

    it("should use correct SQL and parameters for discordName search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.find({ discordName: "User#5678" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM waitlist_emails WHERE discord_name = $1 LIMIT 1",
        ["User#5678"]
      );
    });
  });
});
