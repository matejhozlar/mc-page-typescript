import { Pool } from "pg";
import { CryptoTokenQueries } from "./token";
import { CryptoTaxQueries } from "./tax";

export class Crypto {
  private _token?: CryptoTokenQueries;

  private _tax?: CryptoTaxQueries;

  constructor(protected db: Pool) {}

  get token(): CryptoTokenQueries {
    if (!this._token) {
      this._token = new CryptoTokenQueries(this.db);
    }
    return this._token;
  }

  get tax(): CryptoTaxQueries {
    if (!this._tax) {
      this._tax = new CryptoTaxQueries(this.db);
    }
    return this._tax;
  }
}
