import { CommandEmbedPresets } from "./command-presets";
import { CommonEmbedPresets } from "./common-presets";

export const EmbedPresets = {
  ...CommonEmbedPresets,
  commands: CommandEmbedPresets,
};
