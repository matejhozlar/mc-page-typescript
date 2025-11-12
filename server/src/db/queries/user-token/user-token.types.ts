export interface UserToken {
  /** Foreing key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_id: number;
  amount: string;
  price_at_purchase: string | null;
}

export interface UserTokenCreate {
  discord_id: string;
  token_id: number;
  amount: string;
  price_at_purchase: string;
}
