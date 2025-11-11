import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { WaitlistQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("WaitlistQueries - update Test", () => {
  let mockDb: Pool;
  let waitlistQueries: WaitlistQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    waitlistQueries = new WaitlistQueries(mockDb);
  });

  describe("successful updates", () => {
    it("should update email by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { id: 1 },
        { email: "newemail@example.com" }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE waitlist_emails"),
        [1, "newemail@example.com"]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET email = $2"),
        expect.any(Array)
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        expect.any(Array)
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Waitlist entry updated successfully"
      );
    });

    it("should update token by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { email: "test@example.com" },
        { token: "newtoken123" }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET token = $2"),
        ["test@example.com", "newtoken123"]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE email = $1"),
        expect.any(Array)
      );
    });

    it("should update discordName by token", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { token: "abc123" },
        { discordName: "NewUser#5678" }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET discord_name = $2"),
        ["abc123", "NewUser#5678"]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE token = $1"),
        expect.any(Array)
      );
    });

    it("should update email by discordName", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { discordName: "TestUser#1234" },
        { email: "updated@example.com" }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET email = $2"),
        ["TestUser#1234", "updated@example.com"]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE discord_name = $1"),
        expect.any(Array)
      );
    });

    it("should update multiple fields at once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { id: 1 },
        {
          email: "newemail@example.com",
          token: "newtoken123",
          discordName: "NewUser#9999",
        }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "SET email = $2, token = $3, discord_name = $4"
        ),
        [1, "newemail@example.com", "newtoken123", "NewUser#9999"]
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Waitlist entry updated successfully"
      );
    });

    it("should update two fields at once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { id: 1 },
        {
          email: "newemail@example.com",
          token: "newtoken123",
        }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET email = $2, token = $3"),
        [1, "newemail@example.com", "newtoken123"]
      );
    });
  });

  describe("validation errors", () => {
    it("should throw error when no fields to update", async () => {
      await expect(waitlistQueries.update({ id: 1 }, {})).rejects.toThrow(
        "No fields to update"
      );
    });

    it("should throw error for invalid identifier criteria", async () => {
      await expect(
        waitlistQueries.update({} as any, { email: "test@example.com" })
      ).rejects.toThrow("Invalid identifier criteria");
    });
  });

  describe("not found errors", () => {
    it("should throw error when no rows are updated (not found by id)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.update({ id: 999 }, { email: "new@example.com" })
      ).rejects.toThrow("Waitlist entry not found with id: 999");
    });

    it("should throw error when no rows are updated (not found by email)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.update(
          { email: "notfound@example.com" },
          { token: "newtoken" }
        )
      ).rejects.toThrow(
        "Waitlist entry not found with email: notfound@example.com"
      );
    });

    it("should throw error when no rows are updated (not found by token)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.update(
          { token: "invalidtoken" },
          { email: "new@example.com" }
        )
      ).rejects.toThrow("Waitlist entry not found with token: invalidtoken");
    });

    it("should throw error when no rows are updated (not found by discordName)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        waitlistQueries.update(
          { discordName: "NonExistent#0000" },
          { email: "new@example.com" }
        )
      ).rejects.toThrow(
        "Waitlist entry not found with discordName: NonExistent#0000"
      );
    });
  });

  describe("database error handling", () => {
    it("should log and rethrow database connection error", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        waitlistQueries.update({ id: 1 }, { email: "new@example.com" })
      ).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to update waitlist entry:",
        dbError
      );
    });

    it("should handle query timeout error", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(
        waitlistQueries.update({ id: 1 }, { email: "new@example.com" })
      ).rejects.toThrow(timeoutError);
    });

    it("should handle constraint violation error", async () => {
      const constraintError = new Error("Unique constraint violation");
      (mockDb.query as any).mockRejectedValue(constraintError);

      await expect(
        waitlistQueries.update({ id: 1 }, { email: "duplicate@example.com" })
      ).rejects.toThrow(constraintError);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to update waitlist entry:",
        constraintError
      );
    });
  });

  describe("query construction", () => {
    it("should construct correct query for single field update by id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 42 }, { email: "test@example.com" });

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/UPDATE waitlist_emails/);
      expect(callArgs[0]).toMatch(/SET email = \$2/);
      expect(callArgs[0]).toMatch(/WHERE id = \$1/);
      expect(callArgs[1]).toEqual([42, "test@example.com"]);
    });

    it("should construct correct query for single field update by email", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { email: "old@example.com" },
        { token: "newtoken" }
      );

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/WHERE email = \$1/);
      expect(callArgs[1]).toEqual(["old@example.com", "newtoken"]);
    });

    it("should construct correct query for multiple field update", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { id: 1 },
        {
          email: "new@example.com",
          token: "token123",
          discordName: "User#1234",
        }
      );

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(
        /SET email = \$2, token = \$3, discord_name = \$4/
      );
      expect(callArgs[1]).toEqual([
        1,
        "new@example.com",
        "token123",
        "User#1234",
      ]);
    });

    it("should handle parameter ordering correctly", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { token: "findtoken" },
        { email: "update1@example.com", discordName: "update2" }
      );

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[1][0]).toBe("findtoken");
      expect(callArgs[1][1]).toBe("update1@example.com");
      expect(callArgs[1][2]).toBe("update2");
    });
  });

  describe("edge cases", () => {
    it("should handle updating to empty string", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 1 }, { discordName: "" });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET discord_name = $2"),
        [1, ""]
      );
    });

    it("should handle updating with special characters in email", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update(
        { id: 1 },
        { email: "test+special@example.co.uk" }
      );

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "test+special@example.co.uk",
      ]);
    });

    it("should handle id of 0", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 0 }, { email: "test@example.com" });

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        0,
        "test@example.com",
      ]);
    });

    it("should handle discord name without discriminator", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 1 }, { discordName: "JustUsername" });

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        1,
        "JustUsername",
      ]);
    });
  });

  describe("field mapping", () => {
    it("should correctly map email field to database column", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 1 }, { email: "test@example.com" });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("email = $2"),
        expect.any(Array)
      );
    });

    it("should correctly map token field to database column", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 1 }, { token: "token123" });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("token = $2"),
        expect.any(Array)
      );
    });

    it("should correctly map discordName field to discord_name column", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await waitlistQueries.update({ id: 1 }, { discordName: "User#1234" });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("discord_name = $2"),
        expect.any(Array)
      );
    });
  });
});
