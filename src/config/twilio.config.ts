import { registerAs } from '@nestjs/config';

export default registerAs('twilio', () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromPhone: process.env.TWILIO_FROM_PHONE,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
}));
