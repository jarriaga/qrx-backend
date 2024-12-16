import {
    Controller,
    Post,
    Body,
    Headers, RawBodyRequest,
    Req
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) {}

    @Post('create-payment-intent')
    createPaymentIntent(@Body() createOrderDto: CreateOrderDto) {
        return this.checkoutService.createPaymentIntent(createOrderDto);
    }

    @Post('order-information')
    getOrder(@Body('paymentIntentId') paymentIntentId: string) {
        return this.checkoutService.getOrderSecure(paymentIntentId);
    }

    @Post('order-status')
    getOrderStatus(@Body('email') email: string, @Body('orderNumber') orderNumber: string) {
        return this.checkoutService.getOrderStatus(email, orderNumber);
    }    

    @Post('webhook')
    handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: RawBodyRequest<Request>,
    ) {
        if (!request.rawBody) {
            throw new Error('No webhook payload received');
        }

        return this.checkoutService.handleStripeWebhook(
            signature,
            request.rawBody,
        );
    }
}
