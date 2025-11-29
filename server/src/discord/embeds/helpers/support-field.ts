export function addSupportTicketField(embed: any): void {
  if (process.env.DISCORD_TICKET_MESSAGE_CHANNEL_ID) {
    embed.field(
      "❓ Need Help?",
      `Open a support ticket in <#${process.env.DISCORD_TICKET_MESSAGE_CHANNEL_ID}>`,
      false
    );
  }
}
