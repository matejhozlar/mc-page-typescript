import { createEmbed } from "./embed-builder";
import type { MinecraftStatus } from "@/services/minecraft-status";

export const EmbedColors = {
  Success: 0x00ff00,
  Error: 0xff0000,
  Warning: 0xffaa00,
  Info: 0x3498db,
  Minecraft: 0x00aa00,
  Primary: 0x5865f2,
};

export const EmbedPresets = {
  success(title: string, description?: string) {
    const embed = createEmbed().title(`✅ ${title}`).color(EmbedColors.Success);

    if (description) {
      embed.description(description);
    }

    return embed;
  },

  error(title: string, description?: string) {
    const embed = createEmbed().title(`❌ ${title}`).color(EmbedColors.Error);

    if (description) {
      embed.description(description);
    }

    return embed;
  },

  info(title: string, description?: string) {
    const embed = createEmbed().title(`ℹ️ ${title}`).color(EmbedColors.Info);

    if (description) {
      embed.description(description);
    }

    return embed;
  },

  minecraftServerInfo(
    status: MinecraftStatus,
    options: {
      serverName: string;
      serverDomain: string;
      guildId?: string;
      ticketChannelId?: string;
    }
  ) {
    const { serverName, serverDomain, guildId, ticketChannelId } = options;

    const embed = createEmbed()
      .title(`${serverName}`)
      .color(status.online ? EmbedColors.Minecraft : EmbedColors.Error);

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

    if (guildId && ticketChannelId) {
      embed.field(
        "❓ Need Help?",
        `[Open a support ticket](https://discord.com/channels/${guildId}/${ticketChannelId})`,
        false
      );
    }

    embed.timestamp(Date.now());

    return embed;
  },

  loading(message: string = " Processing...") {
    return createEmbed()
      .title("⏳ Please wait")
      .description(message)
      .color(EmbedColors.Info);
  },
};
