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
import { PrintfulModule } from './printful/printful.module';
import { CheckoutModule } from './checkout/checkout.module';
import { EmailModule } from './email/email.module';
@Module({
    imports: [
        PrismaModule,
        CheckoutModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ActivationModule,
        AuthModule,
        PrintfulModule,
        EmailModule,
    ],
    controllers: [AppController, UserController],
    providers: [AppService, UserService, QrcodeService],
})
export class AppModule {}
