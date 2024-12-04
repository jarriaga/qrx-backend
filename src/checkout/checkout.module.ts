import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [ConfigModule, EmailModule],
    controllers: [CheckoutController],
    providers: [CheckoutService],
})
export class CheckoutModule {}
