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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const phone_otp_entity_1 = require("../entities/phone-otp.entity");
let OtpService = class OtpService {
    otpRepository;
    configService;
    OTP_LENGTH = 6;
    OTP_EXPIRY_MINUTES = 5;
    COOLDOWN_SECONDS = 60;
    MAX_ATTEMPTS = 5;
    LOCK_DURATION_MINUTES = 15;
    constructor(otpRepository, configService) {
        this.otpRepository = otpRepository;
        this.configService = configService;
    }
    generateOtp() {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
    hashOtp(code) {
        const pepper = this.configService.get('OTP_PEPPER') || 'default-pepper';
        return (0, crypto_1.createHmac)('sha256', pepper).update(code).digest('hex');
    }
    verifyOtp(code, codeHash) {
        const hashedCode = this.hashOtp(code);
        return hashedCode === codeHash;
    }
    async createOrUpdateOtpSession(phone) {
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
    async verifyOtpCode(phone, code) {
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
                const lockedUntil = new Date(now.getTime() + this.LOCK_DURATION_MINUTES * 60 * 1000);
                await this.otpRepository.update(session.id, {
                    attempts: newAttempts,
                    lockedUntil,
                });
                throw new Error(`Too many failed attempts. Account locked for ${this.LOCK_DURATION_MINUTES} minutes.`);
            }
            await this.otpRepository.update(session.id, {
                attempts: newAttempts,
            });
            return false;
        }
        await this.otpRepository.delete(session.id);
        return true;
    }
    async getOtpSession(phone) {
        return this.otpRepository.findOne({
            where: { phone },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(phone_otp_entity_1.PhoneOtpEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map