import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { EmailModule } from 'src/email/email.module';
import { PrintifyModule } from 'src/printify/printify.module';
import { QrcodeService } from 'src/qrcode/qrcode.service';

@Module({
    imports: [ConfigModule, EmailModule, PrintifyModule],
    controllers: [CheckoutController],
    providers: [CheckoutService, QrcodeService],
})
export class CheckoutModule {}
