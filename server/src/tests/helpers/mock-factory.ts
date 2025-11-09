import { vi } from "vitest";
import type { Pool, QueryResult, QueryResultRow } from "pg";

export class MockFactory {
  static createMockPool(): Pool {
    return {
      query: vi.fn(),
      connect: vi.fn(),
      end: vi.fn(),
      on: vi.fn(),
    } as any;
  }

  static createMockQueryResult<T>(rows: T[], rowCount: number | null = null) {
    return {
      rows,
      rowCount: rowCount ?? rows.length,
      command: "SELECT",
      oid: 0,
      fields: [],
    };
  }
}
