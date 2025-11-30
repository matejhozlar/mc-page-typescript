import type { MinecraftStatus } from "@/services/minecraft-status";
import type { DiscordEmbedBuilder } from "../embed-builder";

export function addStatusField(
  embed: DiscordEmbedBuilder,
  status?: MinecraftStatus
): void {
  if (!status) return;
  if (status.online) {
    embed.fields([
      {
        name: "Status",
        value: "🟢 Online",
        inline: true,
      },
      {
        name: "Players",
        value: `${status.playerCount}/${status.maxPlayers}`,
        inline: true,
      },
      {
        name: "Version",
        value: status.version || "Unknown",
        inline: true,
      },
    ]);
  } else {
    embed.field("Status", "🔴 Offline", true);
  }
}
