import config from "@/config";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

const MODPACK_URL = config.links.modpack;
const MAP_URL = config.links.map;

export const ButtonComponents = {
  openMap() {
    const button = new ButtonBuilder()
      .setLabel("Open Map")
      .setStyle(ButtonStyle.Link)
      .setURL(MAP_URL);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  },
  openCurseForge() {
    const button = new ButtonBuilder()
      .setLabel("Open CurseForge")
      .setStyle(ButtonStyle.Link)
      .setURL(MODPACK_URL);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  },
};
