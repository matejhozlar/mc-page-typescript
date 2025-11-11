import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";
import type { User } from "@/types/models/user.types";

describe("UserQueries - find Test", () => {
  let mockDb: Pool;
  let userQueries: UserQueries;
  let mockUser: User;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    userQueries = new UserQueries(mockDb);

    mockUser = {
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      name: "TestPlayer",
      online: true,
      last_seen: new Date("2025-11-10T12:00:00Z"),
      discord_id: "123456789012345678",
      play_time_seconds: "3600",
      session_start: new Date("2025-11-10T11:00:00Z"),
      first_joined: new Date("2025-01-01T00:00:00Z"),
    };
  });

  describe("find by discordId", () => {
    it("should return user when found by discordId", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({
        discordId: "123456789012345678",
      });

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE discord_id = $1 LIMIT 1",
        ["123456789012345678"]
      );
    });

    it("should return null when user not found by discordId", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({
        discordId: "999999999999999999",
      });

      expect(result).toBeNull();
    });
  });

  describe("find by uuid", () => {
    it("should return user when found by uuid", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE uuid = $1 LIMIT 1",
        ["550e8400-e29b-41d4-a716-446655440000"]
      );
    });

    it("should return null when user not found by uuid", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({
        uuid: "00000000-0000-0000-0000-000000000000",
      });

      expect(result).toBeNull();
    });
  });

  describe("find by name", () => {
    it("should return user when found by name", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({ name: "TestPlayer" });

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE name = $1 LIMIT 1",
        ["TestPlayer"]
      );
    });

    it("should return null when user not found by name", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({ name: "NonExistentPlayer" });

      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle user with null fields correctly", async () => {
      const userWithNulls: User = {
        ...mockUser,
        last_seen: null,
        play_time_seconds: null,
        session_start: null,
      };
      const mockResult = MockFactory.createMockQueryResult([userWithNulls]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({
        discordId: "123456789012345678",
      });

      expect(result).toEqual(userWithNulls);
      expect(result?.last_seen).toBeNull();
      expect(result?.play_time_seconds).toBeNull();
      expect(result?.session_start).toBeNull();
    });

    it("should handle offline user correctly", async () => {
      const offlineUser: User = {
        ...mockUser,
        online: false,
        session_start: null,
      };
      const mockResult = MockFactory.createMockQueryResult([offlineUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.find({ uuid: mockUser.uuid });

      expect(result).toEqual(offlineUser);
      expect(result?.online).toBe(false);
    });

    it("should throw error for invalid search criteria", async () => {
      await expect(userQueries.find({} as any)).rejects.toThrow(
        "Invalid search criteria"
      );
    });
  });

  describe("error handling", () => {
    it("should log and rethrow error when query fails", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        userQueries.find({ discordId: "123456789012345678" })
      ).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to find user:",
        dbError
      );
    });

    it("should handle query timeout error", async () => {
      const timeoutError = new Error("Query timeout");
      (mockDb.query as any).mockRejectedValue(timeoutError);

      await expect(
        userQueries.find({ uuid: "550e8400-e29b-41d4-a716-446655440000" })
      ).rejects.toThrow(timeoutError);
    });
  });

  describe("query construction", () => {
    it("should use correct SQL and parameters for discordId search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.find({ discordId: "test-discord-id" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE discord_id = $1 LIMIT 1",
        ["test-discord-id"]
      );
    });

    it("should use correct SQL and parameters for uuid search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.find({ uuid: "test-uuid" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE uuid = $1 LIMIT 1",
        ["test-uuid"]
      );
    });

    it("should use correct SQL and parameters for name search", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await userQueries.find({ name: "test-name" });

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE name = $1 LIMIT 1",
        ["test-name"]
      );
    });
  });
});
