export interface Admin {
  id: number;
  discord_id: string;
  created_at: Date;
  vanished: boolean;
}

export interface AdminInsertParams {
  discord_id: string;
  vanished?: boolean;
}

export interface AdminUpdateParams {
  discord_id: string;
  vanished: boolean;
}
