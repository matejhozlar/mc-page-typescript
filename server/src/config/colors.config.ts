import { ColorResolvable } from "discord.js";

export interface ColorsConfig {
  ORANGE: ColorResolvable;
  GREEN: ColorResolvable;
  GOLD: ColorResolvable;
  PURPLE: ColorResolvable;
  LIME_GREEN: ColorResolvable;
  EMERALD_GREEN: ColorResolvable;
  DARK_GRAY: ColorResolvable;
  RED: ColorResolvable;
  BLUE: ColorResolvable;
}

const config = {
  ORANGE: "#F39C12",
  GREEN: "#27AE60",
  GOLD: "#FFD700",
  PURPLE: "#9B59B6",
  LIME_GREEN: "#00FF4C",
  EMERALD_GREEN: "#2ECC71",
  DARK_GRAY: "#2F3136",
  RED: "#FF4D4F",
  BLUE: "#3498DB",
} satisfies ColorsConfig;

export default config;
