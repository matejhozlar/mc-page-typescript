import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { WaitlistQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("WaitlistQueries - exists Test", () => {
  let mockDb: Pool;
  let waitlistQueries: WaitlistQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    waitlistQueries = new WaitlistQueries(mockDb);
  });

  describe("exists by id", () => {
    it("should return true when waitlist exists by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 1 });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE id = $1)",
        [1]
      );
    });

    it("should return false when waitlist does not exist by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 999 });

      expect(result).toBe(false);
    });

    it("should handle id of 0", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 0 });

      expect(result).toBe(false);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE id = $1)",
        [0]
      );
    });

    it("should handle large id values", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 999999 });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE id = $1)",
        [999999]
      );
    });
  });

  describe("exists by email", () => {
    it("should return true when waitlist exists by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({
        email: "test@example.com",
      });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE email = $1)",
        ["test@example.com"]
      );
    });

    it("should return false when waitlist does not exist by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({
        email: "nonexistent@example.com",
      });

      expect(result).toBe(false);
    });

    it("should handle email with special characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({
        email: "test+special@example.co.uk",
      });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE email = $1)",
        ["test+special@example.co.uk"]
      );
    });

    it("should handle empty string email", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ email: "" });

      expect(result).toBe(false);
    });
  });

  describe("exists by token", () => {
    it("should return true when waitlist exists by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ token: "abc123token" });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE token = $1)",
        ["abc123token"]
      );
    });

    it("should return false when waitlist does not exist by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ token: "invalidtoken" });

      expect(result).toBe(false);
    });

    it("should handle empty string token", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ token: "" });

      expect(result).toBe(false);
    });
  });

  describe("exists by discordName", () => {
    it("should return true when waitlist exists by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({
        discordName: "TestUser#1234",
      });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE discord_name = $1)",
        ["TestUser#1234"]
      );
    });

    it("should return false when waitlist does not exist by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: false }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({
        discordName: "NonExistent#0000",
      });

      expect(result).toBe(false);
    });

    it("should handle discord names without discriminator", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ discordName: "TestUser" });

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE discord_name = $1)",
        ["TestUser"]
      );
    });
  });

  describe("edge cases", () => {
    it("should throw error for invalid search criteria", async () => {
      await expect(waitlistQueries.exists({} as any)).rejects.toThrow(
        "Invalid search criteria"
      );
    });

    it("should handle truthy values correctly with Boolean conversion", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { exists: 1 as any },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 1 });

      expect(result).toBe(true);
    });

    it("should handle falsy values correctly with Boolean conversion", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { exists: 0 as any },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 999 });

      expect(result).toBe(false);
    });

    it("should handle undefined exists value", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { exists: undefined as any },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 1 });

      expect(result).toBe(false);
    });

    it("should handle null exists value", async () => {
      const mockResult = MockFactory.createMockQueryResult([
        { exists: null as any },
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.exists({ id: 1 });

      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should log and rethrow error when query fails", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(waitlistQueries.exists({ id: 1 })).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to check waitlist existence:",
        dbError
      );
    });

    it("should handle query timeout error", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(
        waitlistQueries.exists({ email: "test@example.com" })
      ).rejects.toThrow(timeoutError);
    });

    it("should handle syntax error in query", async () => {
      const syntaxError = new Error("Syntax error in SQL query");
      (mockDb.query as any).mockRejectedValue(syntaxError);

      await expect(waitlistQueries.exists({ token: "abc123" })).rejects.toThrow(
        syntaxError
      );
    });

    it("should throw error when result is undefined", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(waitlistQueries.exists({ id: 1 })).rejects.toThrow();
    });
  });

  describe("query construction", () => {
    it("should use correct SQL and parameters for id search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.exists({ id: 42 });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE id = $1)",
        [42]
      );
    });

    it("should use correct SQL and parameters for email search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.exists({ email: "search@example.com" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE email = $1)",
        ["search@example.com"]
      );
    });

    it("should use correct SQL and parameters for token search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.exists({ token: "searchtoken" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE token = $1)",
        ["searchtoken"]
      );
    });

    it("should use correct SQL and parameters for discordName search", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ exists: true }]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.exists({ discordName: "User#5678" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT EXISTS(SELECT 1 FROM waitlist_emails WHERE discord_name = $1)",
        ["User#5678"]
      );
    });
  });
});
