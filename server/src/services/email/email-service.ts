import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Transporter } from "nodemailer";
import logger from "@/logger";
import { createTransporter } from "./utils/transporter";
import type { TemplateEmailConfig, DirectEmailConfig } from "./types";
import config from "@/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "templates");

type EmailConfig = TemplateEmailConfig | DirectEmailConfig;

/**
 * Email service class for handling all email operations
 * Provides template loading, variable interpolation, and sending functionality
 */
export class EmailService {
  private transporter: Transporter;
  private templateCache: Map<string, string> = new Map();

  constructor() {
    this.transporter = createTransporter();
  }

  /**
   * Loads an HTML email template from the templates directory
   * Uses caching to avoid repeated file reads
   *
   * @param templateName - Name of the template file (without .html extension)
   * @returns Promise resolving to the template content
   * @throws Error if template file cannot be read
   */
  private async load(templateName: string): Promise<string> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    try {
      const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
      const template = await fs.readFile(templatePath, "utf-8");

      this.templateCache.set(templateName, template);

      return template;
    } catch (error) {
      logger.error(`Failed to load email template: ${templateName}`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  /**
   * Replaces template variable with actual values
   * Supports nested object access using dot anotation (e.g., {{user.name}})
   *
   * @param template - The HTML template string
   * @param variables - Object containing variable values
   * @returns Template with variables replaced
   */
  private interpolate(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\s*[\w.]+\s*)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();

      const value = trimmedKey.split(".").reduce((obj: any, prop: string) => {
        return obj?.[prop];
      }, variables);

      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  /**
   * Escapes HTML special characters in a string
   * Use this for user-provided content to prevent XSS
   *
   * @param str - String to escape
   * @returns Escaped string safe for HTML
   */
  escapeHtml(str: string = ""): string {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /**
   * Generates plain text version from HTML
   * Strips HTML tags and converts common elements to text equivalents
   *
   * @param html - HTML content
   * @returns Plain text version
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  }

  /**
   * Sends an email with direct HTML content
   *
   * @param emailConfig - Email configuration with direct HTML
   * @returns Promise resolving when email is sent
   */
  async send(emailConfig: DirectEmailConfig): Promise<void> {
    const { to, subject, html, text, attachments } = emailConfig;

    try {
      const mailOptions = {
        from: `"Createrington" <${
          config.maintainer?.email || process.env.EMAIL_ADDRESS
        }`,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        text: text || this.htmlToText(html),
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${subject} to ${to}`);
    } catch (error) {
      logger.error(`Failed to send email: ${subject}`, error);
      throw error;
    }
  }

  /**
   * Sends an email using a template file
   *
   * @param emailConfig - Email configuration with template name and variables
   * @returns Promise resolving when the email is sent
   */
  async sendTemplate(emailConfig: TemplateEmailConfig): Promise<void> {
    const { to, subject, template, variables, attachments } = emailConfig;

    try {
      const templateContent = await this.load(template);
      const html = this.interpolate(templateContent, variables);
      const text = this.htmlToText(html);

      await this.send({
        to,
        subject,
        html,
        text,
        attachments,
      });
    } catch (error) {
      logger.error(`Failed to send template email: ${template}`, error);
      throw error;
    }
  }

  /**
   * Preloads commonly used templates into cache
   *
   * @param templateNames - Array of template names to preload
   */
  async preload(templateNames: string[]): Promise<void> {
    try {
      await Promise.all(templateNames.map((name) => this.load(name)));
      logger.info(`Preloaded ${templateNames.length} email templates`);
    } catch (error) {
      logger.error("Failed to preload email templates:", error);
    }
  }

  /**
   * Tests the email service configuration and connection
   * Verifies SMTP connection and optionally sends a test email
   *
   * @param options - Test configuration options
   * @returns Promise resolving to test results
   */
  async test(options?: {
    sendTestEmail?: boolean;
    to?: string;
    template?: string;
  }): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    const results: any = {
      config: {},
      connection: null,
      templateLoad: null,
      emailSend: null,
    };

    try {
      logger.info("Testing email service configuration...");
      results.config = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_ADDRESS,
        passwordSet: !!process.env.EMAIL_PASSWORD,
      };

      if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
        return {
          success: false,
          message:
            "Email configuration incomplete. Check EMAIL_HOST and EMAIL_PORT environment variables.",
          details: results,
        };
      }

      if (!process.env.EMAIL_ADDRESS || !process.env.EMAIL_PASSWORD) {
        return {
          success: false,
          message:
            "Email credentials missing. Check EMAIL_ADDRESS and EMAIL_PASSWORD environment variables.",
          details: results,
        };
      }

      logger.info("Configuration check passed");

      logger.info("Testing SMTP connection...");
      try {
        await this.transporter.verify();
        results.connection = "SUCCESS";
        logger.info("SMTP connection successful");
      } catch (error: any) {
        results.connection = `FAILED: ${error.message}`;
        return {
          success: false,
          message: `SMTP connection failed: ${error.message}`,
          details: results,
        };
      }

      if (options?.template) {
        logger.info(`Testing template loading: ${options.template}...`);
        try {
          await this.load(options.template);
          results.templateLoad = "SUCCESS";
          logger.info("Template loaded successfully");
        } catch (error: any) {
          results.templateLoad = `FAILED: ${error.message}`;
          return {
            success: false,
            message: `Template loading failed: ${error.message}`,
            details: results,
          };
        }
      }

      if (options?.sendTestEmail) {
        const testEmail = options.to || process.env.EMAIL_ADDRESS;

        if (!testEmail) {
          return {
            success: false,
            message:
              "No recipient specified for test email. Provide 'to' option or set EMAIL_ADDRESS.",
            details: results,
          };
        }

        logger.info(`Sending test email to ${testEmail}...`);

        try {
          if (options.template) {
            await this.sendTemplate({
              to: testEmail,
              subject: "Email Service Test (Template)",
              template: options.template,
              variables: {
                name: "Test User",
                token: "test-token-123",
                discordName: "TestDiscord",
              },
            });
          } else {
            await this.send({
              to: testEmail,
              subject: "Email Service Test",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #5865F2;">✅ Email Service Test Successful</h2>
                  <p>This is a test email from your Createrington email service.</p>
                  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                  <p><strong>Configuration:</strong></p>
                  <ul>
                    <li>Host: ${results.config.host}</li>
                    <li>Port: ${results.config.port}</li>
                    <li>From: ${results.config.user}</li>
                  </ul>
                  <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
                    If you received this email, your email service is configured correctly!
                  </p>
                </div>
              `,
            });
          }

          results.emailSend = "SUCCESS";
          logger.info("Test email sent successfully");
        } catch (error: any) {
          results.emailSend = `FAILED: ${error.message}`;
          return {
            success: false,
            message: `Failed to send test email: ${error.message}`,
            details: results,
          };
        }
      }

      return {
        success: true,
        message: "All email service tests passed successfully! ✓",
        details: results,
      };
    } catch (error: any) {
      logger.error("Email service test failed:", error);
      return {
        success: false,
        message: `Unexpected error during test: ${error.message}`,
        details: results,
      };
    }
  }
}

export const emailService = new EmailService();
