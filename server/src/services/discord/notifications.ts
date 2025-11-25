import type { Client } from "discord.js";
import { DiscordNotificationService } from "./discord-notification.service";
import {
  createWaitlistEmbed,
  createCompanySubmissionEmbed,
  createCompanyEditEmbed,
  createShopSubmissionEmbed,
  createShopEditEmbed,
} from "./embeds";
import {
  createAdminPanelLink,
  createWaitlistActionButtons,
} from "./components";

/**
 * Notifies admin about a new waitlist submission
 */
export async function notifyAdminWaitlistSubmission(
  data: {
    id: number;
    discordName: string;
    email: string;
  },
  client: Client,
  includeActionButtons: boolean = true
): Promise<void> {
  const service = new DiscordNotificationService(client);

  try {
    const embed = createWaitlistEmbed(data);
    const components = [];

    if (includeActionButtons) {
      components.push(createWaitlistActionButtons(data.id));
    }
    components.push(createAdminPanelLink());

    await service.sendToAdmin([embed], components);
    logger.info(`Admin notified of waitlist submission: ${data.email}`);
  } catch (error) {
    logger.error("Failed to send Discord waitlist notification:", error);
    throw error;
  }
}

/**
 * Notifies admin about a new company submission
 */
export async function notifyAdminCompanySubmission(
  data: {
    id: number;
    name: string;
    founderUuid: string;
    shortDescription?: string;
  },
  client: Client
): Promise<void> {
  const service = new DiscordNotificationService(client);

  try {
    const embed = createCompanySubmissionEmbed(data);
    const components = [createAdminPanelLink()];

    await service.sendToAdmin([embed], components);
    logger.info(`Admin notified of company submission: ${data.name}`);
  } catch (error) {
    logger.error("Failed to send Discord company notification:", error);
    throw error;
  }
}

/**
 * Notifies admin about a company edit request
 */
export async function notifyAdminCompanyEdit(
  data: {
    editId: number;
    companyId: number;
    editorUuid: string;
    name?: string;
    shortDescription?: string;
  },
  client: Client
): Promise<void> {
  const service = new DiscordNotificationService(client);

  try {
    const embed = createCompanyEditEmbed(data);
    const components = [createAdminPanelLink()];

    await service.sendToAdmin([embed], components);
    logger.info(`Admin notified of company edit: Company ${data.companyId}`);
  } catch (error) {
    logger.error("Failed to send Discord company edit notification:", error);
    throw error;
  }
}

/**
 * Notifies admin about a new shop submission
 */
export async function notifyAdminShopSubmission(
  data: {
    id: number;
    name: string;
    companyId: number;
    companyName?: string;
    founderUuid: string;
    shortDescription?: string;
  },
  client: Client
): Promise<void> {
  const service = new DiscordNotificationService(client);

  try {
    const embed = createShopSubmissionEmbed(data);
    const components = [createAdminPanelLink()];

    await service.sendToAdmin([embed], components);
    logger.info(`Admin notified of shop submission: ${data.name}`);
  } catch (error) {
    logger.error("Failed to send Discord shop notification:", error);
    throw error;
  }
}

/**
 * Notifies admin about a shop edit request
 */
export async function notifyAdminShopEdit(
  data: {
    editId: number;
    shopId: number;
    companyId: number;
    editorUuid: string;
    name?: string;
    shortDescription?: string;
  },
  client: Client
): Promise<void> {
  const service = new DiscordNotificationService(client);

  try {
    const embed = createShopEditEmbed(data);
    const components = [createAdminPanelLink()];

    await service.sendToAdmin([embed], components);
    logger.info(`Admin notified of shop edit: Shop ${data.shopId}`);
  } catch (error) {
    logger.error("Failed to send Discord shop edit notification:", error);
    throw error;
  }
}
