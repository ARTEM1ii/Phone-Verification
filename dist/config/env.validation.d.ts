type EnvConfig = {
    [key: string]: string | undefined;
};
export declare class EnvironmentVariables {
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_FROM_PHONE?: string;
    TWILIO_MESSAGING_SERVICE_SID?: string;
    OTP_PEPPER?: string;
}
export declare function validate(config: EnvConfig): EnvironmentVariables;
export {};
