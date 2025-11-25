import axios from "axios";
import { DiscordUser, OAuthConfig } from "./types";

export class OAuthService {
  /**
   * Exchange authorization code for access token and fetch user info
   */
  async exchange(code: string, config: OAuthConfig): Promise<DiscordUser> {
    try {
      const tokenRes = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const accessToken = tokenRes.data.access_token;

      const userRes = await axios.get<DiscordUser>(
        "https://discord.com/api/users/@me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const user = userRes.data;
      logger.info(`Fetched Discord user: ${user.username} (${user.id})`);

      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error("OAuth error:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        logger.error("OAuth error:", error);
      }
      throw new Error("OAuth authentication failed");
    }
  }
}

export const oauthService = new OAuthService();
