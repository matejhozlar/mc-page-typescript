import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CryptoToken, CryptoTokenCreate, CryptoTokenRow } from "./types";
import { CryptoTokenAlertQueries } from "./alert";
import { CryptoTokenMetricQueries } from "./metric";
import { CryptoTokenTransactionQueries } from "./transaction";
import logger from "@/logger";
import { createNotFoundError } from "@/db/utils/query-helpers";
import { CryptoTokenHistoryQueries } from "./history";

type Identifier = { id: number } | { symbol: string };

type Filters = {
  name: string;
  description: string;
  totalSupply: string;
  availableSupply: string;
  pricePerUnit: string;
  isMemecoin: boolean;
  crashed: Date;
};

type Update = Filters;

export class CryptoTokenQueries extends BaseQueries<{
  Entity: CryptoToken;
  DbEntity: CryptoTokenRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CryptoTokenCreate;
}> {
  protected readonly table = "crypto_tokens";

  private _alert?: CryptoTokenAlertQueries;

  private _metric?: CryptoTokenMetricQueries;

  private _transaction?: CryptoTokenTransactionQueries;

  private _history?: CryptoTokenHistoryQueries;

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Marks a coin as crashed by setting its price to zero and recording the crash timestamp
   *
   * @param identifier - The unique identifier of the token to crash
   * @returns Promise resolving when the crash is recorded
   * @throws Error if the token is not found or the operation fails
   */
  async crash(identifier: Identifier): Promise<void> {
    const isIdBased = "id" in identifier;
    const column = isIdBased ? "id" : "symbol";
    const value = isIdBased ? identifier.id : identifier.symbol;

    const result = await this.db.query(
      `UPDATE ${this.table} SET price_per_unit = 0, crashed = NOW() WHERE ${column} = $1`,
      [value]
    );

    if (result.rowCount === 0) {
      throw createNotFoundError(this.table, identifier);
    }

    const identifierStr = isIdBased ? `ID: ${value}` : `symbol: ${value}`;
    logger.info(
      `Token ${identifierStr} auto-crashed due to price below threshold`
    );
  }

  /**
   * Cleans up crashed tokens from the database that have been in the crashed state for more than 24 hours
   *
   * @returns Promise resolving to the count of deleted records
   * @throws Error if the database operation fails
   */
  async cleanup(): Promise<number> {
    try {
      const { rowCount } = await this.db.query(
        `DELETE FROM crypto_tokens
            WHERE is_memecoin = true
            AND crashed IS NOT NULL
            AND crashed < NOW() - INTERVAL '24 hours'`
      );

      if (rowCount && rowCount > 0) {
        logger.info(
          `Deleted ${rowCount} crashed memecoin(s) older than 24 hours`
        );
      }

      return rowCount ?? 0;
    } catch (error) {
      logger.error("Failed to delete crashed tokens:", error);
      throw error;
    }
  }

  get alert(): CryptoTokenAlertQueries {
    if (!this._alert) {
      this._alert = new CryptoTokenAlertQueries(this.db);
    }
    return this._alert;
  }

  get metric(): CryptoTokenMetricQueries {
    if (!this._metric) {
      this._metric = new CryptoTokenMetricQueries(this.db);
    }
    return this._metric;
  }

  get transaction(): CryptoTokenTransactionQueries {
    if (!this._transaction) {
      this._transaction = new CryptoTokenTransactionQueries(this.db);
    }
    return this._transaction;
  }

  get history(): CryptoTokenHistoryQueries {
    if (!this._history) {
      this._history = new CryptoTokenHistoryQueries(this.db);
    }
    return this._history;
  }
}
