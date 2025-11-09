import type { Vote } from "@/types/discord/vote.types";

/**
 * Global state object for tracking the current vote
 * Used to prevent multiple overlapping votes, handle cooldowns,
 * and store vote progress in memory
 */
export const voteState: Vote = {
  active: false,
  cooldownUntil: 0,
  counts: { yes: 0, no: 0 },
  voters: new Set<string>(),
  timeout: null,
};
