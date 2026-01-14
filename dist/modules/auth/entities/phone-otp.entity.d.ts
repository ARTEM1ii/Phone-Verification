export declare class PhoneOtpEntity {
    id: string;
    phone: string;
    codeHash: string;
    expiresAt: Date;
    nextAllowedAt: Date | null;
    attempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
