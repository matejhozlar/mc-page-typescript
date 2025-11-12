import type { Pool } from "pg";
import type { CryptoToken, CryptoTokenCreate } from "./crypto-token.types";
import { BaseQueries } from "../base.queries";

type CryptoTokenIdentifier = { id: number } | { symbol: string };

type CryptoTokenFilters =
  | { name: string }
  | { description: string }
  | { totalSupply: string }
  | { availableSupply: string }
  | { pricePerUnit: string }
  | { isMemecoin: boolean }
  | { crashed: Date };

type CryptoTokenUpdate =
  | { name: string }
  | { description: string }
  | { totalSupply: string }
  | { availableSupply: string }
  | { pricePerUnit: string }
  | { isMemecoin: string }
  | { crashed: Date };

export class CryptoTokenQueries extends BaseQueries<
  CryptoToken,
  CryptoTokenIdentifier,
  CryptoTokenFilters,
  CryptoTokenUpdate,
  CryptoTokenCreate
> {
  protected readonly table = "crypto_tokens";

  constructor(db: Pool) {
    super(db);
  }
}
