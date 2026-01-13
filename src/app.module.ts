import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SmsModule } from './modules/sms/sms.module';
import { DatabaseModule } from './database/database.module';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';
import twilioConfig from './config/twilio.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig, twilioConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
