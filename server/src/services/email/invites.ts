import { waitlists } from "@/db";
import { InviteResult } from "@/db/queries/waitlist";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import { InviteTemplate, TemplateEmailConfig } from "./types";
import { emailService } from "./email.service";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logoPath = path.join(__dirname, "..", "assets", "logo.png");

export async function sendInvite(id: number): Promise<InviteResult> {
  try {
    const entry = await waitlists.find({ id: id });

    if (!entry) {
      return { ok: false, code: 404, msg: "Waitlist entry not found" };
    }

    if (entry.token) {
      return { ok: false, code: 400, msg: "User already invited" };
    }

    const { email, discordName } = entry;

    if (!discordName) {
      return {
        ok: false,
        code: 400,
        msg: "Discord name is required to send invite",
      };
    }

    const newToken = uuidv4();

    const variables: InviteTemplate = {
      discordName: discordName,
      token: newToken,
    };

    const data: TemplateEmailConfig = {
      to: email,
      subject: "🎉 Your Invitation to Createrington is Ready!",
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "createrington-logo",
        },
      ],
      template: "invite",
      variables: variables,
    };

    await emailService.sendTemplate(data);
    return { ok: true, code: 200, token: newToken };
  } catch (error) {
    logger.error("Failed to send invite:", error);
    return { ok: false, code: 500, msg: "Failed to send invite email" };
  }
}
