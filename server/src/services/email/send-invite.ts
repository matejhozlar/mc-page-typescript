import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import logger from "@/logger";
import { waitlistQueries } from "@/db";
import { createTransporter } from "./transporter";
import type { InviteResult } from "@/types/services/waitlist";
import config from "@/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generates the invite email HTML content
 */
function generateInviteEmail(discordName: string, token: string): string {
  return `
        <p>Hi <strong>${discordName}</strong>,</p>
        <p>Great news — a spot has just opened up on <strong>Createrington</strong>, and you're next in line! We’re excited to welcome you to the server and can't wait to see what you’ll create.</p>
      
        <h3>🌍 What is Createrington?</h3>
        <p>Createrington is a carefully curated Minecraft Create mod server focused on mechanical innovation, aesthetic building, and quality-of-life improvements. With a Vanilla+ feel and a vibrant, collaborative community, it’s the perfect place to bring your most imaginative ideas to life.</p>
      
        <h3>🛠️ Highlights of the Experience:</h3>
        <ul>
          <li>Advanced automation with Create & its add-ons</li>
          <li>Gorgeous builds using Macaw’s, Chipped, and Rechiseled</li>
          <li>Expanded food options with Farmer’s Delight and more</li>
          <li>Optimized performance and smooth visuals</li>
          <li>Seamless multiplayer with FTB Teams and Simple Voice Chat</li>
        </ul>
      
        <p>We’re currently running our latest modpack on CurseForge, built specifically to enhance both creativity and performance.</p>
      
        <h3>🔗 Next Steps:</h3>
        <p>To join, follow the instructions in the invite link below. If we don’t hear back within 48 hours, the spot may be offered to the next person in the queue.</p>
      
        <p><a href="https://discord.gg/7PAptNgqk2">Join our Discord</a></p>
        <p><em>Your verification token: <strong>${token}</strong></em></p>
      
        <p>Looking forward to seeing you in-game and watching your creations come to life!</p>

        <p>This is an automated message, please do not reply</p>

        <p>If you need help, contact me on Discord: matejhoz</p>
      
        <p>Best regards,<br />
        <strong>saunhardy</strong><br />
        Server Admin – Createrington<br />
        <a href="https://create-rington.com/">create-rington.com</a></p>
      
        <p><img src="cid:createrington-logo" alt="Createrington Logo" style="width: 200px; margin-top: 1rem;" /></p>
      `;
}

/**
 * Sends an invite email to a waitlist user by their ID
 */
export async function sendInviteById(id: number): Promise<InviteResult> {
  const logoPath = path.join(
    __dirname,
    "..",
    "..",
    "app",
    "routes",
    "assets",
    "logo.png"
  );

  try {
    const entry = await waitlistQueries.findById(id);

    if (!entry) {
      return { ok: false, code: 404, msg: "Waitlist entry not found" };
    }

    if (entry.token) {
      return { ok: false, code: 400, msg: "User already invited" };
    }

    const { email, discord_name } = entry;

    if (!discord_name) {
      return {
        ok: false,
        code: 400,
        msg: "Discord name is required to send invite",
      };
    }

    const newToken = uuidv4();

    const transporter = createTransporter();
    const mailOptions = {
      from: config.Maintainer.EMAIL,
      to: email,
      subject: "🎉 Your Invitation to Createrington is Ready!",
      html: generateInviteEmail(discord_name, newToken),
      attachments: [
        { filename: "logo.png", path: logoPath, cid: "createrington-logo" },
      ],
    };

    await transporter.sendMail(mailOptions);

    await waitlistQueries.updateToken(id, newToken);

    logger.info(`Invite sent to ${email} (${discord_name})`);
    return { ok: true, code: 200, token: newToken };
  } catch (error) {
    logger.error("Failed to send invite:", error);
    return { ok: false, code: 500, msg: "Failed to send invite email" };
  }
}
