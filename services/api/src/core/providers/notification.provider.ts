import { Injectable, Logger } from "@nestjs/common";
import { NotificationProvider, NotificationPayload } from "@restovyn/types";

@Injectable()
export class SmtpNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(SmtpNotificationProvider.name);

  async sendPush(
    deviceToken: string,
    payload: NotificationPayload,
  ): Promise<void> {
    this.logger.log(
      `[Push Notification] To: ${deviceToken} - Title: ${payload.title} - Body: ${payload.body}`,
    );
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`[Email Dispatch] To: ${to} - Subject: ${subject}`);
  }

  async sendSMS(phone: string, text: string): Promise<void> {
    this.logger.log(`[SMS Dispatch] To: ${phone} - Text: ${text}`);
  }
}
