import { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

/**
 * Creates a transporter instace from nodemailer
 *
 * @returns Transporter
 */
export function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}
