import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { WaitlistQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import type { Waitlist } from "@/types/models/waitlist.types";

describe("WaitlistQueries - get Test", () => {
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

  describe("successful retrieval", () => {
    it("should return waitlist entry when found by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.get({ id: 1 });

      expect(result).toEqual(mockWaitlist);
    });

    it("should return waitlist entry when found by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.get({ email: "test@example.com" });

      expect(result).toEqual(mockWaitlist);
    });

    it("should return waitlist entry when found by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.get({ token: "abc123token" });

      expect(result).toEqual(mockWaitlist);
    });

    it("should return waitlist entry when found by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockWaitlist]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.get({
        discordName: "TestUser#1234",
      });

      expect(result).toEqual(mockWaitlist);
    });
  });

  describe("error handling - waitlist not found", () => {
    it("should throw error with correct message when waitlist not found by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(waitlistQueries.get({ id: 999 })).rejects.toThrow(
        "Waitlist not found with id: 999"
      );
    });

    it("should throw error with correct message when waitlist not found by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.get({ email: "nonexistent@example.com" })
      ).rejects.toThrow(
        "Waitlist not found with email: nonexistent@example.com"
      );
    });

    it("should throw error with correct message when waitlist not found by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.get({ token: "invalidtoken" })
      ).rejects.toThrow("Waitlist not found with token: invalidtoken");
    });

    it("should throw error with correct message when waitlist not found by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.get({ discordName: "NonExistent#0000" })
      ).rejects.toThrow(
        "Waitlist not found with discordName: NonExistent#0000"
      );
    });
  });

  describe("error propagation from find", () => {
    it("should propagate database errors from find method", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(waitlistQueries.get({ id: 1 })).rejects.toThrow(dbError);
    });

    it("should propagate invalid criteria errors from find method", async () => {
      await expect(waitlistQueries.get({} as any)).rejects.toThrow(
        "Invalid search criteria"
      );
    });

    it("should propagate query timeout errors from find method", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(
        waitlistQueries.get({ email: "test@example.com" })
      ).rejects.toThrow(timeoutError);
    });
  });

  describe("edge cases", () => {
    it("should return waitlist entry with null fields correctly", async () => {
      const waitlistWithNulls: Waitlist = {
        id: 2,
        email: "minimal@example.com",
        submitted_at: null,
        token: null,
        discord_name: null,
      };
      const mockResult = MockFactory.createMockQueryResult([waitlistWithNulls]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.get({ id: 2 });

      expect(result).toEqual(waitlistWithNulls);
      expect(result.submitted_at).toBeNull();
      expect(result.token).toBeNull();
      expect(result.discord_name).toBeNull();
    });

    it("should handle email with special characters", async () => {
      const specialEmail = "test+special@example.co.uk";
      const waitlistWithSpecialEmail = { ...mockWaitlist, email: specialEmail };
      const mockResult = MockFactory.createMockQueryResult([
        waitlistWithSpecialEmail,
      ]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await waitlistQueries.get({ email: specialEmail });

      expect(result.email).toBe(specialEmail);
    });

    it("should throw error with correct format for id of 0", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(waitlistQueries.get({ id: 0 })).rejects.toThrow(
        "Waitlist not found with id: 0"
      );
    });
  });

  describe("error message formatting", () => {
    it("should format error message correctly for numeric id", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      try {
        await waitlistQueries.get({ id: 12345 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBe("Waitlist not found with id: 12345");
      }
    });

    it("should format error message correctly for string criteria", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      try {
        await waitlistQueries.get({ email: "notfound@example.com" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBe(
          "Waitlist not found with email: notfound@example.com"
        );
      }
    });
  });
});
