export interface User {
  uuid: string;
  name: string;
  online: boolean;
  last_seen: Date | null;
  discord_id: string | null;
  play_time_seconds: number;
  session_start: Date | null;
  first_joined: Date;
}
