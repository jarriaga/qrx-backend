import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { nanoid } from 'nanoid';
@Injectable()
export class CheckoutService {
    private stripe: Stripe;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-11-20.acacia',
        });
    }

    async createPaymentIntent(createOrderDto: CreateOrderDto) {
        try {
            const orderNumber = `ORD-${nanoid(6).toUpperCase()}`;

            // Create a payment intent with Stripe
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: createOrderDto.total,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    orderNumber,
                },
            });

            // Create order in database using Prisma transaction
            const order = await this.prisma.$transaction(async (prisma) => {
                const order = await prisma.order.create({
                    data: {
                        orderNumber,
                        email: createOrderDto.address.email,
                        firstName: createOrderDto.address.firstName,
                        lastName: createOrderDto.address.lastName,
                        address: createOrderDto.address.address,
                        city: createOrderDto.address.city,
                        state: createOrderDto.address.state,
                        zipCode: createOrderDto.address.zipCode,
                        country: createOrderDto.address.country,
                        phone: createOrderDto.address.phone,
                        shippingMethod: createOrderDto.shippingMethod,
                        subtotal: createOrderDto.subtotal,
                        shipping: createOrderDto.shipping,
                        total: createOrderDto.total,
                        paymentIntentId: paymentIntent.id,
                        items: {
                            create: createOrderDto.items.map((item) => ({
                                productId: item.product.id,
                                productTitle: item.product.title,
                                variantId: item.variant.id.toString(),
                                variantTitle: item.variant.title,
                                price: item.variant.price,
                                quantity: item.quantity,
                            })),
                        },
                    },
                    include: {
                        items: true,
                    },
                });

                return order;
            });

            return {
                clientSecret: paymentIntent.client_secret,
                orderNumber: order.orderNumber,
            };
        } catch (error) {
            throw new Error(`Error creating payment intent: ${error.message}`);
        }
    }

    async confirmOrder(paymentIntentId: string) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { paymentIntentId },
                include: { items: true },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // Verify payment status with Stripe
            const paymentIntent =
                await this.stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                const updatedOrder = await this.prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'paid' },
                    include: { items: true },
                });

                return updatedOrder;
            } else {
                throw new Error('Payment not confirmed');
            }
        } catch (error) {
            throw new Error(`Error confirming order: ${error.message}`);
        }
    }

    async getOrder(orderNumber: string) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { orderNumber },
                include: { items: true },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            return order;
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`);
        }
    }

    async handleStripeWebhook(signature: string, payload: Buffer) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.configService.get('STRIPE_WEBHOOK_SECRET'),
            );

            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.confirmOrder(event.data.object.id);
                    break;
                case 'payment_intent.payment_failed':
                    await this.prisma.order.update({
                        where: { paymentIntentId: event.data.object.id },
                        data: { status: 'failed' },
                    });
                    break;
            }

            return { received: true };
        } catch (error) {
            throw new Error(`Webhook Error: ${error.message}`);
        }
    }
}
