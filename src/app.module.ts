import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ActivationModule } from './activation/activation.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { QrcodeService } from './qrcode/qrcode.service';
import { UserController } from './user/user.controller';
import { PrintifyModule } from './printify/printify.module';
import { CheckoutModule } from './checkout/checkout.module';
import { EmailModule } from './email/email.module';
@Module({
    imports: [
        PrismaModule,
        CheckoutModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ActivationModule,
        AuthModule,
        PrintifyModule,
        EmailModule,
    ],
    controllers: [AppController, UserController],
    providers: [AppService, UserService, QrcodeService],
})
export class AppModule {}
