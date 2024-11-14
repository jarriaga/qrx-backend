import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
    imports: [ConfigModule],
    controllers: [CheckoutController],
    providers: [CheckoutService],
})
export class CheckoutModule {}
