declare global {
  namespace Express {
    interface Request {
      user?: {
        uuid: string;
        name: string;
        discordId: string;
      };
    }
  }
}
