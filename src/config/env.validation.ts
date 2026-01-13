import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsOptional,
  validateSync,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

type EnvConfig = {
  [key: string]: string | undefined;
};

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  TWILIO_ACCOUNT_SID: string;

  @IsString()
  @IsNotEmpty()
  TWILIO_AUTH_TOKEN: string;

  @IsString()
  @IsOptional()
  TWILIO_FROM_PHONE?: string;

  @IsString()
  @IsOptional()
  TWILIO_MESSAGING_SERVICE_SID?: string;

  @IsString()
  @IsOptional()
  OTP_PEPPER?: string;
}

export function validate(config: EnvConfig) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
