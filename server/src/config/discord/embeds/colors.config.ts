import { ColorResolvable } from "discord.js";

export interface ColorsConfig {
  readonly GREEN: ColorResolvable;
  readonly RED: ColorResolvable;
  readonly BLUE: ColorResolvable;
  readonly GOLD: ColorResolvable;
  readonly PURPLE: ColorResolvable;
  readonly ORANGE: ColorResolvable;
  readonly YELLOW: ColorResolvable;
  readonly CYAN: ColorResolvable;
  readonly PINK: ColorResolvable;
  readonly DARK_BLUE: ColorResolvable;
  readonly DARK_GREEN: ColorResolvable;
  readonly DARK_RED: ColorResolvable;
  readonly DARK_PURPLE: ColorResolvable;
  readonly DARK_GOLD: ColorResolvable;
  readonly GRAY: ColorResolvable;
  readonly DARK_GRAY: ColorResolvable;
  readonly WHITE: ColorResolvable;
  readonly BLACK: ColorResolvable;
}

const config: ColorsConfig = {
  GREEN: 0x00ff00,
  RED: 0xff0000,
  BLUE: 0x0099ff,
  GOLD: 0xffd700,
  PURPLE: 0x9b59b6,
  ORANGE: 0xff8800,
  YELLOW: 0xffff00,
  CYAN: 0x00ffff,
  PINK: 0xff69b4,
  DARK_BLUE: 0x0066cc,
  DARK_GREEN: 0x008000,
  DARK_RED: 0x8b0000,
  DARK_PURPLE: 0x663399,
  DARK_GOLD: 0xb8860b,
  GRAY: 0x808080,
  DARK_GRAY: 0x404040,
  WHITE: 0xffffff,
  BLACK: 0x000000,
} as const;

export default config;
