import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    private readonly twilioClient;
    constructor(configService: ConfigService);
    sendOtpSms(phone: string, code: string): Promise<void>;
}
