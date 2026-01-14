import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PhoneOtpEntity } from '../entities/phone-otp.entity';
export declare class OtpService {
    private readonly otpRepository;
    private readonly configService;
    private readonly OTP_LENGTH;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly COOLDOWN_SECONDS;
    private readonly MAX_ATTEMPTS;
    private readonly LOCK_DURATION_MINUTES;
    constructor(otpRepository: Repository<PhoneOtpEntity>, configService: ConfigService);
    generateOtp(): string;
    hashOtp(code: string): string;
    verifyOtp(code: string, codeHash: string): boolean;
    createOrUpdateOtpSession(phone: string): Promise<{
        code: string;
        nextAllowedAt: Date | null;
    }>;
    verifyOtpCode(phone: string, code: string): Promise<boolean>;
    getOtpSession(phone: string): Promise<PhoneOtpEntity | null>;
}
