import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PhoneOtpEntity } from '../entities/phone-otp.entity';

@Injectable()
export class OtpService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly COOLDOWN_SECONDS = 60;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 15;

  constructor(
    @InjectRepository(PhoneOtpEntity)
    private readonly otpRepository: Repository<PhoneOtpEntity>,
    private readonly configService: ConfigService,
  ) {}

  generateOtp(): string {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  hashOtp(code: string): string {
    const pepper = this.configService.get<string>('OTP_PEPPER') || 'default-pepper';
    return createHmac('sha256', pepper).update(code).digest('hex');
  }

  verifyOtp(code: string, codeHash: string): boolean {
    const hashedCode = this.hashOtp(code);
    return hashedCode === codeHash;
  }

  async createOrUpdateOtpSession(phone: string): Promise<{
    code: string;
    nextAllowedAt: Date | null;
  }> {
    const existingSession = await this.otpRepository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    const nextAllowedAt = new Date(now.getTime() + this.COOLDOWN_SECONDS * 1000);

    if (existingSession) {
      if (existingSession.nextAllowedAt && existingSession.nextAllowedAt > now) {
        return {
          code: '',
          nextAllowedAt: existingSession.nextAllowedAt,
        };
      }

      if (existingSession.lockedUntil && existingSession.lockedUntil > now) {
        throw new Error('OTP session is locked. Please try again later.');
      }

      const code = this.generateOtp();
      const codeHash = this.hashOtp(code);

      await this.otpRepository.update(existingSession.id, {
        codeHash,
        expiresAt,
        nextAllowedAt,
        attempts: 0,
        lockedUntil: null,
      });

      return {
        code,
        nextAllowedAt,
      };
    }

    const code = this.generateOtp();
    const codeHash = this.hashOtp(code);

    const newSession = this.otpRepository.create({
      phone,
      codeHash,
      expiresAt,
      nextAllowedAt,
      attempts: 0,
      lockedUntil: null,
    });

    await this.otpRepository.save(newSession);

    return {
      code,
      nextAllowedAt,
    };
  }

  async verifyOtpCode(phone: string, code: string): Promise<boolean> {
    const session = await this.otpRepository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    if (!session) {
      return false;
    }

    const now = new Date();

    if (session.lockedUntil && session.lockedUntil > now) {
      throw new Error('OTP session is locked. Please request a new code.');
    }

    if (session.expiresAt < now) {
      return false;
    }

    const isValid = this.verifyOtp(code, session.codeHash);

    if (!isValid) {
      const newAttempts = session.attempts + 1;

      if (newAttempts >= this.MAX_ATTEMPTS) {
        const lockedUntil = new Date(
          now.getTime() + this.LOCK_DURATION_MINUTES * 60 * 1000,
        );

        await this.otpRepository.update(session.id, {
          attempts: newAttempts,
          lockedUntil,
        });

        throw new Error(
          `Too many failed attempts. Account locked for ${this.LOCK_DURATION_MINUTES} minutes.`,
        );
      }

      await this.otpRepository.update(session.id, {
        attempts: newAttempts,
      });

      return false;
    }

    await this.otpRepository.delete(session.id);

    return true;
  }

  async getOtpSession(phone: string): Promise<PhoneOtpEntity | null> {
    return this.otpRepository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });
  }
}
