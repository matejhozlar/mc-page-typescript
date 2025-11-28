export interface MinecraftPlayer {
  name: string;
  uuid: string;
}

export interface MinecraftStatus {
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  players: MinecraftPlayer[];
  motd: string;
  version: string;
  lastUpdated: Date;
}
