import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not configured');
    }

    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendOtpSms(phone: string, code: string): Promise<void> {
    const messagingServiceSid = this.configService.get<string>(
      'TWILIO_MESSAGING_SERVICE_SID',
    );
    const fromPhone = this.configService.get<string>('TWILIO_FROM_PHONE');

    if (!messagingServiceSid && !fromPhone) {
      throw new Error(
        'Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_PHONE must be configured',
      );
    }

    const message = `Your verification code is: ${code}`;

    try {
      const messageOptions: {
        to: string;
        body: string;
        messagingServiceSid?: string;
        from?: string;
      } = {
        to: phone,
        body: message,
      };

      if (messagingServiceSid) {
        messageOptions.messagingServiceSid = messagingServiceSid;
      } else {
        messageOptions.from = fromPhone;
      }

      const result = await this.twilioClient.messages.create(messageOptions);

      this.logger.log(
        `SMS sent successfully to ${phone}. Message SID: ${result.sid}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phone}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
