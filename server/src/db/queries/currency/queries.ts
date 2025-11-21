import { Pool } from "pg";
import { CurrencyTransactionQueries } from "./transaction";

export class CurrencyQueries {
  private _transaction?: CurrencyTransactionQueries;

  constructor(protected db: Pool) {}

  get transaction(): CurrencyTransactionQueries {
    if (!this._transaction) {
      this._transaction = new CurrencyTransactionQueries(this.db);
    }
    return this._transaction;
  }
}
