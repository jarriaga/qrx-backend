import {
    Controller,
    Post,
    Body,
    Headers,
    Get,
    Param,
    RawBodyRequest,
    Req,
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

    @Get('order/:orderNumber')
    getOrder(@Param('orderNumber') orderNumber: string) {
        return this.checkoutService.getOrder(orderNumber);
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
