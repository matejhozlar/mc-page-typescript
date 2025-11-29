import config from "@/config";

export const EmbedColors = {
  Success: config.colors.GREEN,
  Error: config.colors.RED,
  Warning: config.colors.ORANGE,
  Info: config.colors.BLUE,
  Loading: config.colors.GRAY,
  Moderation: config.colors.DARK_RED,
  System: config.colors.PURPLE,
  Premium: config.colors.GOLD,
} as const;
