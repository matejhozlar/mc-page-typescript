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

  static createMockQueryResult<T extends QueryResultRow>(
    rows: T[]
  ): QueryResult<T> {
    return {
      rows,
      command: "SELECT",
      rowCount: rows.length,
      oid: 0,
      fields: [],
    } as QueryResult<T>;
  }
}
