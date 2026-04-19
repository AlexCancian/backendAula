import { Resend } from 'resend';
import "dotenv/config";

export class MailProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendMail(to: string, subject: string, body: string) {
    const { data, error } = await this.resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [to],
      subject: subject,
      html: body,
    });

    if (error) {
      console.error("Error sending email via Resend:", error);
      throw new Error("Failed to send email");
    }

    return data;
  }
}
