import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { UserQueries } from "@/db/queries/user.queries";
import { TestDatabase } from "@/tests/setup/test-db";

describe("UserQueries - Integration Tests", () => {
  let testDb: TestDatabase;
  let userQueries: UserQueries;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
    userQueries = new UserQueries(testDb.getPool());
  });

  beforeEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.tearDown();
  });

  describe("getCount", () => {
    it("should return 0 when no users exist", async () => {
      const count = await userQueries.getCount();
      expect(Number(count)).toBe(0);
    });

    it("should return correct count when users exist", async () => {
      await testDb.seedUsers(5);

      const count = await userQueries.getCount();
      expect(Number(count)).toBe(5);
    });

    it("should count users correctly after multiple inserts", async () => {
      await testDb.seedUsers(2);
      await testDb.seedUser({
        name: "CustomUser",
        discord_id: "custom_discord_123",
        online: true,
        play_time_seconds: 7200,
      });

      const count = await userQueries.getCount();
      expect(Number(count)).toBe(3);
    });
  });
});
