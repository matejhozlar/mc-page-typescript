import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";

describe("User Queries - getNameByDiscordId", () => {
  let mockDb: Pool;
  let userQueries: UserQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    userQueries = new UserQueries(mockDb);
  });

  describe("getNameByDiscordId", () => {
    it("should return username when user exists", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ name: "Steve" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.getNameByDiscordId("123456789");

      expect(result).toBe("Steve");
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT name FROM users WHERE discord_id = $1",
        ["123456789"]
      );
    });

    it("should throw error when user not found (null rowCount)", async () => {
      const mockResult = MockFactory.createMockQueryResult([], null);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(userQueries.getNameByDiscordId("99999999")).rejects.toThrow(
        "User not found"
      );
    });

    it("should handle special character username", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ name: "Player_123" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.getNameByDiscordId("123456789");

      expect(result).toBe("Player_123");
    });

    it("should handle unicode characters in username", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ name: "玩家_Player" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.getNameByDiscordId("123456789");

      expect(result).toBe("玩家_Player");
    });

    it("should throw error when rows array is empty despite rowCount", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockRejectedValue(mockResult);

      await expect(userQueries.getNameByDiscordId("1")).rejects.toThrow();
    });

    it("should handle name being null in database", async () => {
      const mockResult = MockFactory.createMockQueryResult([{ name: null }], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.getNameByDiscordId("1");

      expect(result).toBeNull();
    });

    it("should pass correct discord_id parameter to query", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ name: "TestUser" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.getNameByDiscordId("1");

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ["1"]);
    });

    it("should handle empty string discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 0);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(userQueries.getNameByDiscordId("")).rejects.toThrow(
        "User not found"
      );
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult(
        [{ name: "TestUser" }],
        1
      );
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.getNameByDiscordId("1");

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });
});
