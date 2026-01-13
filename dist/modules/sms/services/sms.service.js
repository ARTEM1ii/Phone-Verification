"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = __importDefault(require("twilio"));
let SmsService = SmsService_1 = class SmsService {
    configService;
    logger = new common_1.Logger(SmsService_1.name);
    twilioClient;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken) {
            throw new Error('Twilio credentials are not configured');
        }
        this.twilioClient = (0, twilio_1.default)(accountSid, authToken);
    }
    async sendOtpSms(phone, code) {
        const messagingServiceSid = this.configService.get('TWILIO_MESSAGING_SERVICE_SID');
        const fromPhone = this.configService.get('TWILIO_FROM_PHONE');
        if (!messagingServiceSid && !fromPhone) {
            throw new Error('Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_PHONE must be configured');
        }
        const message = `Your verification code is: ${code}`;
        try {
            const messageOptions = {
                to: phone,
                body: message,
            };
            if (messagingServiceSid) {
                messageOptions.messagingServiceSid = messagingServiceSid;
            }
            else {
                messageOptions.from = fromPhone;
            }
            const result = await this.twilioClient.messages.create(messageOptions);
            this.logger.log(`SMS sent successfully to ${phone}. Message SID: ${result.sid}`);
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${phone}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map