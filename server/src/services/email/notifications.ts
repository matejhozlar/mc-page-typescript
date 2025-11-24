import logger from "@/logger";
import { emailService } from "./email-service";
import config from "@/config";

/**
 * Email notification types for admin alerts
 */
export type AdminNotificationType =
  | "waitlist-submission"
  | "company-submission"
  | "company-edit"
  | "shop-submission"
  | "shop-edit";

/**
 * Configuration for admin email notification
 */
export interface AdminNotificationConfig {
  type: AdminNotificationType;
  subject: string;
  variables: Record<string, any>;
}

/**
 * Sends a unified email notification to the admin
 * Uses template based emails with consistent formatting
 *
 * @param config - Notification configuration with type, subject, and variables
 */
export async function notifyAdmin(
  notificationConfig: AdminNotificationConfig
): Promise<void> {
  const { type, subject, variables } = notificationConfig;

  try {
    await emailService.sendTemplate({
      to: process.env.NOTIFY_ADMIN_EMAIL,
      subject,
      template: type,
      variables: {
        ...variables,
        adminPanelUrl: config.links.adminPanel,
      },
    });

    logger.info("Admin notified:", type);
  } catch (error) {
    logger.error(`Failed to send admin notification (${type}):`, error);
    throw error;
  }
}

export const adminNotifications = {
  waitlistSubmission: (data: {
    id: number;
    name: string;
    founderUuid: string;
    shortDescription?: string;
  }) =>
    notifyAdmin({
      type: "company-submission",
      subject: `🏢 New Company Submission Pending: ${data.name}`,
      variables: data,
    }),

  companyEdit: (data: {
    editId: number;
    companyId: number;
    editorUuid: string;
    name: string;
    shortDescription?: string;
  }) => {
    notifyAdmin({
      type: "company-edit",
      subject: `✏️ Company Edit Pending Review: Company ${data.companyId}`,
      variables: data,
    });
  },

  shopSubmission: (data: {
    id: number;
    name: string;
    companyId: number;
    companyName: string;
    founderUuid: string;
    shortDescription?: string;
  }) => {
    notifyAdmin({
      type: "shop-submission",
      subject: `🛒 New Shop Submission Pending: ${data.name}`,
      variables: data,
    });
  },

  shopEdit: (data: {
    editId: number;
    shopId: number;
    companyId: number;
    editorUuid: string;
    name?: string;
    shortDescription?: string;
  }) =>
    notifyAdmin({
      type: "shop-edit",
      subject: `✏️ Shop Edit Pending Review: Shop ${data.shopId}`,
      variables: data,
    }),
};
