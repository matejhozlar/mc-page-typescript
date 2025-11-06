export interface WaitlistSubmission {
  id: number;
  email: string;
  discord_name: string;
}

export interface InviteResult {
  ok: boolean;
  code?: number;
  msg?: string;
  token?: string;
}

export interface AutoInviteResult {
  ok: boolean;
  msg?: string;
  token?: string;
}
