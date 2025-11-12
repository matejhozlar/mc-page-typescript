import type { Pool } from "pg";
import type { User, UserCreate } from "./user.types";
import { BaseQueries } from "../base.queries";

type UserIdentifier =
  | { uuid: string }
  | { discordId: string }
  | { name: string };

type UserFilters =
  | { online: boolean }
  | { lastSeen: Date }
  | { playTimeSeconds: string }
  | { sessionStart: Date }
  | { first_joined: Date };

type UserUpdate =
  | { discordId: string }
  | { name: string }
  | { online: boolean }
  | { lastSeen: Date }
  | { playtimeSeconds: string }
  | { sessionStart: Date }
  | { firstJoined: Date };

export class UserQueries extends BaseQueries<
  User,
  UserIdentifier,
  UserFilters,
  UserUpdate,
  UserCreate
> {
  protected readonly table = "users";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Retrieves a Minecraft username for a user by various identifiers
   *
   * @param identifier - Object with discordId, uuid, or name
   * @returns Promise resolving to the Minecraft username
   * @throws Error if no user is found
   */
  async name(identifier: UserIdentifier): Promise<string> {
    const user = await this.get(identifier);
    return user.name;
  }

  /**
   * Retrieves a Discord ID for a user by various identifiers
   *
   * @param identifier - Object with discordId, uuid, or name
   * @returns Promise resolving to the Discord ID
   * @throws Error if no user is found
   */
  async discord(identifier: UserIdentifier): Promise<string> {
    const user = await this.get(identifier);
    return user.discord_id;
  }

  /**
   * Retrieves Minecraft uuid for a user by various identifiers
   *
   * @param identifier - Object with discordId, uuid, or name
   * @returns Promise resolving to the Minecraft uuid
   * @throws Error if no user is found
   */
  async uuid(identifier: UserIdentifier): Promise<string> {
    const user = await this.get(identifier);
    return user.uuid;
  }
}
