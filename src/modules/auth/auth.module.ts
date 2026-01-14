import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { OtpService } from './services/otp.service';
import { PhoneOtpEntity } from './entities/phone-otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneOtpEntity])],
  controllers: [AuthController],
  providers: [OtpService],
  exports: [OtpService],
})
export class AuthModule {}
