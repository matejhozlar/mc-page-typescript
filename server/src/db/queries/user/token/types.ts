import { CamelCaseKeys } from "@/types/common";

export interface UserTokenRow {
  /** Foreing key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_id: number;
  amount: string;
  price_at_purchase: string | null;
}

export interface UserTokenWithPriceRow extends UserTokenRow {
  price_per_unit: string;
}

export type UserToken = CamelCaseKeys<UserTokenRow>;

export interface UserTokenCreate {
  discordId: string;
  tokenId: number;
  amount: string;
  priceAtPurchase?: string;
}

export type UserTokenWithPrice = CamelCaseKeys<UserTokenWithPriceRow>;
