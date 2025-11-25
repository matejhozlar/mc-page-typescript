import type { TextChannel } from "discord.js";
import type { Server as SocketIOServer } from "socket.io";
import { sendRconCommand } from "@/utils/rcon/send-rcon";
import { voteState } from "./utils/vote-state";
import { requireProduction } from "@/utils/guard/run-guard";
import config from "@/config";
import type { VoteDetails, VoteInitiator } from "@/types/discord/vote.types";

const VOTE_DURATION_MS = config.discord.listeners.votes.voteDurationMs;
const COOLDOWN_SUCCESS_MS = config.discord.listeners.votes.cooldown.successMs;
const COOLDOWN_FAIL_MS = config.discord.listeners.votes.cooldown.failMs;

/**
 * Starts a vote for a given command
 *
 * Initiates a timed vote where users can vote yes (1) or no (2). If the vote
 * passes, executes the specified RCON command on the Minecraft server.
 *
 * @param commandKey - Unique identifier for the vote type (e.g., "skipnight")
 * @param voteDetails - Details about the vote (description and RCON command)
 * @param messageChannel - Discord text channel to send vote messages to
 * @param io - Socket.IO server for broadcasting to frontend clients
 * @param initiator - Optional user who started the vote (auto-votes yes)
 * @returns True if vote was successfully started, false otherwise
 */
export function startVote(
  commandKey: string,
  voteDetails: VoteDetails,
  messageChannel: TextChannel,
  io: SocketIOServer,
  initiator?: VoteInitiator
): boolean {
  if (!requireProduction()) return false;

  if (voteState.active) return false;

  if (!commandKey || !voteDetails?.description || !voteDetails?.command) {
    logger.warn("Invalid vote command used:", commandKey);
    return false;
  }

  if (voteState.cooldownUntil > Date.now()) {
    return false;
  }

  voteState.active = true;
  voteState.counts = { yes: 0, no: 0 };
  voteState.voters.clear();

  if (initiator?.name) {
    voteState.counts.yes++;
    voteState.voters.add(initiator.name);
  }

  const voteMsg =
    `📢 **Vote to ${voteDetails.description} started!**\n` +
    `Reply with \`1\` for **yes**, \`2\` for **no**.\n` +
    `Voting ends in ${VOTE_DURATION_MS / 1000} seconds...`;

  messageChannel.send(voteMsg).catch((error) => {
    logger.error("Failed to send vote message:", error);
  });

  io.emit("chatMessage", { text: voteMsg, authorType: "web" });

  voteState.timeout = setTimeout(() => {
    void (async () => {
      const { yes, no } = voteState.counts;
      let resultMsg = "";
      const cooldown = no > yes ? COOLDOWN_FAIL_MS : COOLDOWN_SUCCESS_MS;

      try {
        if (yes > no) {
          resultMsg = `✅ Vote passed! Executing: ${voteDetails.command}`;
          await sendRconCommand(voteDetails.command);
        } else if (yes === no) {
          resultMsg = "🤝 It's a tie. Nothing changes.";
        } else {
          resultMsg = "❌ Vote failed.";
        }

        const finalMsg = `📊 Vote Results\nYes: ${yes} | No: ${no}\n${resultMsg}`;

        messageChannel.send(finalMsg).catch((error) => {
          logger.error("Failed to send vote result:", error);
        });

        io.emit("chatMessage", { text: finalMsg, authorType: "web" });
      } catch (error) {
        logger.error("Error during vote resolution:", error);

        const errorMsg = "⚠️ Failed to execute vote command.";
        messageChannel.send(errorMsg).catch(() => {});
        io.emit("chatMessage", { text: errorMsg, authorType: "web" });
      } finally {
        voteState.active = false;
        voteState.cooldownUntil = Date.now() + cooldown;
        voteState.timeout = null;
      }
    })();
  }, VOTE_DURATION_MS);

  return true;
}
