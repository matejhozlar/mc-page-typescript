import { describe, it, expect, beforeEach } from "vitest";
import type { Pool } from "pg";
import { UserQueries } from "@/db/queries";
import { MockFactory } from "@/tests/helpers/mock-factory";
import type { User } from "@/types/models/user.types";

describe("UserQueries - get Test", () => {
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

  describe("successful retrieval", () => {
    it("should return user when found by discordId", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.get({ discordId: "123456789012345678" });

      expect(result).toEqual(mockUser);
    });

    it("should return user when found by uuid", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.get({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result).toEqual(mockUser);
    });

    it("should return user when found by name", async () => {
      const mockResult = MockFactory.createMockQueryResult([mockUser]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.get({ name: "TestPlayer" });

      expect(result).toEqual(mockUser);
    });
  });

  describe("error handling - user not found", () => {
    it("should throw error with correct message when user not found by discordId", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        userQueries.get({ discordId: "999999999999999999" })
      ).rejects.toThrow("User not found with discordId: 999999999999999999");
    });

    it("should throw error with correct message when user not found by uuid", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        userQueries.get({ uuid: "00000000-0000-0000-0000-000000000000" })
      ).rejects.toThrow(
        "User not found with uuid: 00000000-0000-0000-0000-000000000000"
      );
    });

    it("should throw error with correct message when user not found by name", async () => {
      const mockResult = MockFactory.createMockQueryResult([]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      await expect(
        userQueries.get({ name: "NonExistentPlayer" })
      ).rejects.toThrow("User not found with name: NonExistentPlayer");
    });
  });

  describe("error propagation from find", () => {
    it("should propagate database errors from find method", async () => {
      const dbError = new Error("Database connection failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      await expect(
        userQueries.get({ discordId: "123456789012345678" })
      ).rejects.toThrow(dbError);
    });

    it("should propagate invalid criteria errors from find method", async () => {
      await expect(userQueries.get({} as any)).rejects.toThrow(
        "Invalid search criteria"
      );
    });
  });

  describe("edge cases", () => {
    it("should return user with null fields correctly", async () => {
      const userWithNulls: User = {
        ...mockUser,
        last_seen: null,
        play_time_seconds: null,
        session_start: null,
      };
      const mockResult = MockFactory.createMockQueryResult([userWithNulls]);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const result = await userQueries.get({ discordId: "123456789012345678" });

      expect(result).toEqual(userWithNulls);
    });
  });
});
