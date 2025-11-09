import type { ButtonInteraction, Client } from "discord.js";
import createTicket from "./create";
import startCloseTicket from "./start-close";
import confirmCloseTicket from "./confirm-close";
import cancelCloseTicket from "./cancel-close";
import reopenTicket from "./reopen";
import deleteTicket from "./delete";
import transcriptTicket from "./transcript";

/**
 * Type for ticket handler functions
 */
type TicketHandler = (
  interaction: ButtonInteraction,
  mainBot: Client
) => Promise<void>;

/**
 * Map of ticket action custom IDs to their handler function
 */
export const ticketHandlers = new Map<string, TicketHandler>([
  ["create_ticket", createTicket],
  ["start_close_ticket", startCloseTicket],
  ["confirm_close_ticket", confirmCloseTicket],
  ["cancel_close_ticket", cancelCloseTicket],
  ["reopen_ticket", reopenTicket],
  ["delete_ticket", deleteTicket],
  ["ticket_transcript", transcriptTicket],
]);
