import { createEmbed } from "../../embed-builder";
import { EmbedColors } from "../../colors";
import type { MinecraftStatus } from "@/services/minecraft-status";
import { addSupportTicketField } from "../../helpers";
import { addStatusField } from "../../helpers";
import config from "@/config";

const SERVER_NAME = config.minecraft.server.serverName;
const SERVER_DOMAIN = config.minecraft.server.serverDomain;
const MODPACK_URL = config.links.modpack;

export const CommandEmbedPresets = {
  ip(status?: MinecraftStatus) {
    const color = !status
      ? EmbedColors.Info
      : status.online
      ? EmbedColors.Success
      : EmbedColors.Error;

    const embed = createEmbed().title(`${SERVER_NAME}`).color(color);

    addStatusField(embed, status);

    embed.field("Server Address", `\`\`\`${SERVER_DOMAIN}\`\`\``, false);

    addSupportTicketField(embed);

    embed.timestamp(Date.now());

    return embed;
  },

  map() {
    const embed = createEmbed()
      .title("🗺️ Live Server Map")
      .description(`Explore the ${SERVER_NAME} world in real time`)
      .color(EmbedColors.Info)
      .url(config.links.map)
      .timestamp(Date.now());

    return embed;
  },

  modpack() {
    const embed = createEmbed()
      .title(`🛠 ${SERVER_NAME} modpack`)
      .description(
        `Download the ${SERVER_NAME} modpack through CurseForge with just 1 click`
      )
      .color(EmbedColors.Info)
      .url(MODPACK_URL)
      .timestamp(Date.now());

    return embed;
  },

  list(status?: MinecraftStatus) {
    const embed = createEmbed()
      .title("Minecraft Server Status")
      .color(status?.online ? EmbedColors.Success : EmbedColors.Error);

    if (!status?.online) {
      embed.description("Server is currently offline");
      return embed;
    }

    addStatusField(embed, status);

    if (status.players.length > 0) {
      const playerList = status.players.map((p) => `• ${p.name}`).join("\n");
      embed.field(
        `Online Players (${status.players.length})`,
        playerList.length > 1024
          ? playerList.substring(0, 1021) + "..."
          : playerList,
        false
      );
    } else if (status.playerCount > 0) {
      embed.field(
        "Players Online",
        `${status.playerCount} player(s) online\n*Player names not available*`,
        false
      );
    } else {
      embed.field("Players Online", "No players currently online", false);
    }

    embed.timestamp(Date.now());

    return embed;
  },
};
