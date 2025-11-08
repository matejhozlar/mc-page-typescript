import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { GuildMemberRoleManager as RoleManagerClass } from "discord.js";

/**
 * Union type for interactions that have guild members
 */
type GuildInteraction =
  | ButtonInteraction
  | ChatInputCommandInteraction
  | MessageContextMenuCommandInteraction
  | UserContextMenuCommandInteraction;

/**
 * Check if a guild member has a specified role
 * Handles both GuildMemberRoleManager (full guild context) and string[] (API/partial data)
 *
 * @param interaction - Discord interaction with member data
 * @param roleId - The role ID to check for
 * @returns True if the member has the role, false otherwise
 */
export function memberHasRole(
  interaction: GuildInteraction,
  roleId: string
): boolean {
  if (!roleId) return false;

  const roles = interaction.member?.roles;
  if (!roles) return false;

  if (roles instanceof RoleManagerClass) {
    return roles.cache.has(roleId);
  }

  if (Array.isArray(roles)) {
    return roles.includes(roleId);
  }

  return false;
}

/**
 * Check if a guid member has any of the specified roles
 *
 * @param interaction - Discord interaction with member data
 * @param roleIds - Array of role IDs to check for
 * @returns True if the member has at least one of the roles
 */
export function memberHasAnyRole(
  interaction: GuildInteraction,
  roleIds: string[]
): boolean {
  if (roleIds.length) return false;

  const roles = interaction.member?.roles;
  if (!roles) return false;

  if (roles instanceof RoleManagerClass) {
    return roleIds.some((roleId) => roles.cache.has(roleId));
  }

  if (Array.isArray(roles)) {
    return roleIds.some((roleId) => roles.includes(roleId));
  }

  return false;
}

/**
 * Check if a guild member has all of the specified roles
 *
 * @param interaction - Discord interaction woth member data
 * @param roleIds - Array of role IDs to check for
 * @returns True if the member has all of the roles
 */
export function memberHasAllRoles(
  interaction: GuildInteraction,
  roleIds: string[]
): boolean {
  if (!roleIds.length) return false;

  const roles = interaction.member?.roles;
  if (!roles) return false;

  if (roles instanceof RoleManagerClass) {
    return roleIds.every((roleId) => roles.cache.has(roleId));
  }

  if (Array.isArray(roles)) {
    return roleIds.every((roleId) => roles.includes(roleId));
  }

  return false;
}

/**
 * Get all role IDs from a guild member
 *
 * @param interaction - Discord interaction with member data
 * @returns Array of role IDs
 */
export function getMemberRoleIds(interaction: GuildInteraction): string[] {
  const roles = interaction.member?.roles;
  if (!roles) return [];

  if (roles instanceof RoleManagerClass) {
    return Array.from(roles.cache.keys());
  }

  if (Array.isArray(roles)) {
    return roles;
  }

  return [];
}
