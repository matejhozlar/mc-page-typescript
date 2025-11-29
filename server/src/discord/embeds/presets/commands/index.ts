import { createEmbed } from "../../embed-builder";
import { EmbedColors } from "../../colors";
import type { MinecraftStatus } from "@/services/minecraft-status";
import { addSupportTicketField } from "../../helpers";

export const CommandEmbedPresets = {
  ip(status: MinecraftStatus, serverName: string, serverDomain: string) {
    const embed = createEmbed()
      .title(`${serverName}`)
      .color(status.online ? EmbedColors.Success : EmbedColors.Error);

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

    embed.field("Server Address", `\`\`\`${serverDomain}\`\`\``, false);

    if (status.online && status.motd.trim() !== "") {
      const motd =
        status.motd.length > 1024
          ? status.motd.substring(0, 1021) + "..."
          : status.motd;

      embed.field("Message of the Day", motd, false);
    }

    addSupportTicketField(embed);

    embed.timestamp(Date.now());

    return embed;
  },
};
