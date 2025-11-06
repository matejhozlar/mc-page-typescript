export interface WaitlistEmail {
  id: number;
  email: string;
  submitted_at: Date;
  token: string | null;
  discord_name: string | null;
}

export interface WaitlistCreateParams {
  email: string;
  discord_name?: string;
}
export interface WaitlistEmailWithToken extends WaitlistEmail {
  token: string;
}
