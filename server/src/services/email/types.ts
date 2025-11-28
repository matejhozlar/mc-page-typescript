/**
 * Base configuration for all email types
 */
export interface BaseEmailConfig {
  to: string | string[];
  subject: string;
  attachments?: Array<{
    filename: string;
    path: string;
    cid?: string;
  }>;
}

/**
 * Configuration for emails with template variables
 */
export interface TemplateEmailConfig extends BaseEmailConfig {
  template: string;
  variables: Record<string, any>;
}

/**
 * Configuration for emails with direct HTML content
 */
export interface DirectEmailConfig extends BaseEmailConfig {
  html: string;
  text?: string;
}

export interface InviteTemplate {
  discordName: string;
  token: string;
}
