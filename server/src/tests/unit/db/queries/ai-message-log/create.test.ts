import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Pool } from "pg";
import { AiMessageLogQueries } from "@/db/queries/ai-message-log.queries";
import type { AiMessageLogCreateParams } from "@/types/models/ai-message-log.types";
import { MockFactory } from "@/tests/helpers/mock-factory";
import logger from "@/logger";

describe("AiMessageLogQueries - create", () => {
  let mockDb: Pool;
  let aiMessageLogQueries: AiMessageLogQueries;

  beforeEach(() => {
    mockDb = MockFactory.createMockPool();
    aiMessageLogQueries = new AiMessageLogQueries(mockDb);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should insert AI message log successfully", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "What is the server IP?",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO ai_message_log"),
        ["123456789", "What is the server IP?"]
      );
    });

    it("should log success message after insertion", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test message",
      };

      await aiMessageLogQueries.create(params);

      expect(logger.info).toHaveBeenCalledWith(
        "AI message logged for user:",
        "123456789"
      );
    });

    it("should handle long messages", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const longMessage = "A".repeat(1000);
      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: longMessage,
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        longMessage,
      ]);
    });

    it("should handle messages with special characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "Test with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?",
      ]);
    });

    it("should handle messages with unicode characters", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Hello 你好 こんにちは 🎮",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "Hello 你好 こんにちは 🎮",
      ]);
    });

    it("should handle messages with newlines", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Line 1\nLine 2\nLine 3",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "Line 1\nLine 2\nLine 3",
      ]);
    });

    it("should handle empty message string", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "",
      ]);
    });

    it("should handle whitespace-only message", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "   ",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "   ",
      ]);
    });

    it("should use parameterized query to prevent SQL injection", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123'; DROP TABLE ai_message_log; --",
        message: "Test'; DELETE FROM ai_message_log; --",
      };

      await aiMessageLogQueries.create(params);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toContain("$1");
      expect(callArgs[0]).toContain("$2");
      expect(callArgs[1]).toEqual([
        "123'; DROP TABLE ai_message_log; --",
        "Test'; DELETE FROM ai_message_log; --",
      ]);
    });

    it("should throw error when database insert fails", async () => {
      const dbError = new Error("Unique constraint violation");
      (mockDb.query as any).mockRejectedValue(dbError);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test message",
      };

      await expect(aiMessageLogQueries.create(params)).rejects.toThrow(
        "Unique constraint violation"
      );
    });

    it("should throw error when connection fails", async () => {
      const connectionError = new Error("Connection timeout");
      (mockDb.query as any).mockRejectedValue(connectionError);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test message",
      };

      await expect(aiMessageLogQueries.create(params)).rejects.toThrow(
        "Connection timeout"
      );
    });

    it("should not log success when insert fails", async () => {
      const dbError = new Error("Insert failed");
      (mockDb.query as any).mockRejectedValue(dbError);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test message",
      };

      await expect(aiMessageLogQueries.create(params)).rejects.toThrow();

      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should call query exactly once", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test message",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("should verify SQL INSERT statement structure", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Test message",
      };

      await aiMessageLogQueries.create(params);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[0]).toMatch(/INSERT\s+INTO\s+ai_message_log/i);
      expect(callArgs[0]).toMatch(/\(discord_id,\s*message\)/i);
      expect(callArgs[0]).toMatch(/VALUES\s*\(\$1,\s*\$2\)/i);
    });

    it("should handle params with correct order", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "987654321",
        message: "Another test",
      };

      await aiMessageLogQueries.create(params);

      const callArgs = (mockDb.query as any).mock.calls[0];
      expect(callArgs[1][0]).toBe("987654321");
      expect(callArgs[1][1]).toBe("Another test");
    });

    it("should handle concurrent inserts", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params1: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Message 1",
      };

      const params2: AiMessageLogCreateParams = {
        discord_id: "987654321",
        message: "Message 2",
      };

      await Promise.all([
        aiMessageLogQueries.create(params1),
        aiMessageLogQueries.create(params2),
      ]);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it("should handle very long discord_id", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "1".repeat(100),
        message: "Test message",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "1".repeat(100),
        "Test message",
      ]);
    });

    it("should handle message with SQL keywords", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "SELECT * FROM users WHERE id = 1 OR 1=1",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "SELECT * FROM users WHERE id = 1 OR 1=1",
      ]);
    });

    it("should handle null-like string values safely", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "null",
        message: "undefined",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "null",
        "undefined",
      ]);
    });

    it("should handle message with quotes", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: `He said "Hello" and 'Goodbye'`,
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        `He said "Hello" and 'Goodbye'`,
      ]);
    });

    it("should handle message with backslashes", async () => {
      const mockResult = MockFactory.createMockQueryResult([], 1);
      (mockDb.query as any).mockResolvedValue(mockResult);

      const params: AiMessageLogCreateParams = {
        discord_id: "123456789",
        message: "Path: C:\\Users\\Test\\file.txt",
      };

      await aiMessageLogQueries.create(params);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [
        "123456789",
        "Path: C:\\Users\\Test\\file.txt",
      ]);
    });
  });
});
