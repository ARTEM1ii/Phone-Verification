"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('twilio', () => ({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromPhone: process.env.TWILIO_FROM_PHONE,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
}));
//# sourceMappingURL=twilio.config.js.map