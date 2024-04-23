import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ActivationModule } from './activation/activation.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { QrcodeService } from './qrcode/qrcode.service';
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ActivationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, QrcodeService],
})
export class AppModule { }
